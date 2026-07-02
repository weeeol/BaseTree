from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import zipfile
import io
import httpx
import re
from fastapi.concurrency import run_in_threadpool
from parser import parse_file
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.post("/api/upload")
async def upload_zip(zipfile: UploadFile = File(...)):
    try:
        file_bytes = await zipfile.read()
        zip_obj = zipfile.ZipFile(io.BytesIO(file_bytes))
        
        tree, edges = await run_in_threadpool(build_tree, zip_obj)
        
        return {
            "tree": tree,
            "edges": edges
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class RepoRequest(BaseModel):
    url: str

@app.post("/api/tree")
async def fetch_tree(data: RepoRequest):
    url = data.url
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")
        
    match = re.match(r"^https://github\.com/([^/]+)/([^/?#]+)", url)
    if not match:
        raise HTTPException(status_code=400, detail="Invalid GitHub URL")
        
    owner = match.group(1)
    repo = match.group(2)
    
    zip_url = f"https://github.com/{owner}/{repo}/archive/refs/heads/main.zip"
    
    async with httpx.AsyncClient(follow_redirects=True) as client:
        try:
            response = await client.get(zip_url)
            response.raise_for_status()
            file_bytes = response.content
        except httpx.HTTPError:
            try:
                zip_url = f"https://github.com/{owner}/{repo}/archive/refs/heads/master.zip"
                response = await client.get(zip_url)
                response.raise_for_status()
                file_bytes = response.content
            except httpx.HTTPError as e:
                raise HTTPException(status_code=500, detail=f"Failed to download repository: {str(e)}")
            
    try:
        zip_obj = zipfile.ZipFile(io.BytesIO(file_bytes))
        tree, edges = await run_in_threadpool(build_tree, zip_obj)
        
        return {
            "tree": tree,
            "edges": edges
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == '__main__':
    uvicorn.run("app:app", host="127.0.0.1", port=3001, reload=True)
