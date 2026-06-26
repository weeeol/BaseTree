from flask import Flask, request, jsonify
from flask_cors import CORS
import zipfile
import io
import urllib.request
import re
from parser import parse_file

app = Flask(__name__)
CORS(app)

MAX_FILE_SIZE = 1 * 1024 * 1024 # 1MB limit for parsing
MAX_TOTAL_SIZE = 200 * 1024 * 1024 # 200MB total uncompressed limit
MAX_FILES = 10000

def build_tree(zip_obj):
    root = {
        "name": "root",
        "attributes": {"path": "root", "type": "tree", "size": 0},
        "children": []
    }
    
    dirs = {"": root}
    all_edges = []
    
    file_list = zip_obj.namelist()
    
    total_size = 0
    file_count = 0
    
    for fpath in file_list:
        if file_count >= MAX_FILES:
            break
            
        if "/node_modules/" in fpath or "/.git/" in fpath:
            continue
            
        parts = [p for p in fpath.strip('/').split('/') if p]
        if not parts:
            continue
            
        curr_path = ""
        for i, part in enumerate(parts):
            is_file = (i == len(parts) - 1 and not fpath.endswith('/'))
            parent_path = curr_path
            
            if curr_path:
                curr_path += "/" + part
            else:
                curr_path = part
                
            if curr_path not in dirs:
                if is_file:
                    file_info = zip_obj.getinfo(fpath)
                    total_size += file_info.file_size
                    file_count += 1
                    
                    if total_size > MAX_TOTAL_SIZE:
                        raise Exception("ZIP Bomb detected: Uncompressed size exceeds 200MB limit.")

                    node = {
                        "name": part,
                        "attributes": {"path": curr_path, "type": "blob", "size": file_info.file_size}
                    }
                    
                    try:
                        if file_info.file_size <= MAX_FILE_SIZE:
                            file_bytes = zip_obj.read(fpath)
                            children, local_edges = parse_file(part, file_bytes)
                            all_edges.extend(local_edges)
                            if children:
                                node["children"] = children
                    except Exception as e:
                        print(f"Error parsing {fpath}: {e}")
                        pass
                        
                    if "children" not in dirs[parent_path]:
                        dirs[parent_path]["children"] = []
                    dirs[parent_path]["children"].append(node)
                else:
                    node = {
                        "name": part,
                        "attributes": {"path": curr_path, "type": "tree", "size": 0},
                        "children": []
                    }
                    dirs[curr_path] = node
                    if "children" not in dirs[parent_path]:
                        dirs[parent_path]["children"] = []
                    dirs[parent_path]["children"].append(node)

    def sort_tree(node):
        if "children" in node:
            def get_order(child):
                t = child.get("attributes", {}).get("type", "")
                if t == "tree": return 0
                if t == "blob": return 1
                if t == "class_group": return 2
                if t == "function_group": return 3
                if t == "import_group": return 4
                return 5
                
            node["children"].sort(key=lambda x: (get_order(x), x.get("name", "").lower()))
            for child in node["children"]:
                sort_tree(child)
                
    sort_tree(root)

    if len(root["children"]) == 1 and root["children"][0]["attributes"]["type"] == "tree":
        return root["children"][0], all_edges
        
    return root, all_edges

@app.route('/api/upload', methods=['POST'])
def upload_zip():
    if 'zipfile' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
        
    file = request.files['zipfile']
    try:
        file_bytes = file.read()
        zip_obj = zipfile.ZipFile(io.BytesIO(file_bytes))
        
        tree, edges = build_tree(zip_obj)
        
        return jsonify({
            "tree": tree,
            "edges": edges,
            "hasExperimentalLanguages": False
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/tree', methods=['POST'])
def fetch_tree():
    data = request.get_json()
    url = data.get('url')
    if not url:
        return jsonify({"error": "URL is required"}), 400
        
    match = re.match(r"^https://github\.com/([^/]+)/([^/?#]+)", url)
    if not match:
        return jsonify({"error": "Invalid GitHub URL"}), 400
        
    owner = match.group(1)
    repo = match.group(2)
    
    zip_url = f"https://github.com/{owner}/{repo}/archive/refs/heads/main.zip"
    
    try:
        req = urllib.request.Request(zip_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            file_bytes = response.read()
    except Exception:
        try:
            zip_url = f"https://github.com/{owner}/{repo}/archive/refs/heads/master.zip"
            req = urllib.request.Request(zip_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response:
                file_bytes = response.read()
        except Exception as e:
            return jsonify({"error": f"Failed to download repository: {str(e)}"}), 500
            
    try:
        zip_obj = zipfile.ZipFile(io.BytesIO(file_bytes))
        tree, edges = build_tree(zip_obj)
        
        return jsonify({
            "tree": tree,
            "edges": edges,
            "hasExperimentalLanguages": False
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=3001, debug=True)
