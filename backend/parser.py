import tree_sitter_javascript as ts_js
import tree_sitter_python as ts_py
import tree_sitter_go as ts_go
import tree_sitter_java as ts_java
import tree_sitter_cpp as ts_cpp
from tree_sitter import Language, Parser
import os

LANGUAGES = {
    ".js": Language(ts_js.language()),
    ".jsx": Language(ts_js.language()),
    ".ts": Language(ts_js.language()),
    ".tsx": Language(ts_js.language()),
    ".py": Language(ts_py.language()),
    ".go": Language(ts_go.language()),
    ".java": Language(ts_java.language()),
    ".cpp": Language(ts_cpp.language()),
    ".hpp": Language(ts_cpp.language()),
    ".c": Language(ts_cpp.language()),
    ".h": Language(ts_cpp.language()),
}

def parse_file(filename, code_bytes):
    ext = os.path.splitext(filename)[1].lower()
    if ext not in LANGUAGES:
        return [], []
    
    lang = LANGUAGES[ext]
    parser = Parser(lang)
    tree = parser.parse(code_bytes)

    extracted_nodes = []
    
    # Pass 1: Extract functions and imports
    def walk_extraction(node):
        type_name = node.type
        
        def get_node_text(n):
            text = code_bytes[n.start_byte:n.end_byte].decode('utf-8', errors='ignore').strip()
            text = " ".join(text.split())
            if len(text) > 60:
                text = text[:57] + "..."
            return text
            
        is_function = False
        name = "function"
        
        # Identify function nodes and get name
        if type_name in ("function_declaration", "arrow_function", "method_definition", "function", "function_definition", "method_declaration"):
            is_function = True
            name_node = node.child_by_field_name("name")
            if name_node:
                name = code_bytes[name_node.start_byte:name_node.end_byte].decode('utf-8', errors='ignore')
                
        # Identify imports
        is_import = False
        if type_name in ("import_statement", "import_declaration", "import_from_statement", "import_spec"):
            is_import = True
            
        if is_function:
            extracted_nodes.append({
                "type": "function",
                "name": name,
                "node": node,
                "path": f"{filename}#{name}_{node.start_byte}"
            })
        elif is_import:
            # We want to extract imported identifiers for Pass 2 to match against
            # A simple heuristic: all identifier nodes inside the import statement
            identifiers = set()
            def find_identifiers(n):
                if "identifier" in n.type or n.type == "name":
                    ident = code_bytes[n.start_byte:n.end_byte].decode('utf-8', errors='ignore')
                    identifiers.add(ident)
                for child in n.children:
                    find_identifiers(child)
            find_identifiers(node)
            
            extracted_nodes.append({
                "type": "import",
                "name": get_node_text(node),
                "identifiers": identifiers,
                "path": f"{filename}#import_{node.start_byte}"
            })
            
        for child in node.children:
            walk_extraction(child)

    walk_extraction(tree.root_node)
    
    functions = []
    imports = []
    
    import_map = {} 
    function_map = {} 
    
    for n in extracted_nodes:
        if n["type"] == "function":
            functions.append({
                "name": n["name"],
                "attributes": {"path": n["path"], "type": "function", "size": 0}
            })
            function_map[n["name"]] = n["path"]
        else:
            imports.append({
                "name": n["name"],
                "attributes": {"path": n["path"], "type": "import", "size": 0}
            })
            for ident in n["identifiers"]:
                import_map[ident] = n["path"]
                
    children = []
    if functions:
        children.append({
            "name": "Functions",
            "attributes": {"path": f"{filename}#funcs", "type": "function_group", "size": 0},
            "children": functions
        })
    if imports:
        children.append({
            "name": "Imports",
            "attributes": {"path": f"{filename}#imports", "type": "import_group", "size": 0},
            "children": imports
        })
        
    # Pass 2: Usage Analysis (Edges)
    edges = []
    for n in extracted_nodes:
        if n["type"] == "function":
            func_path = n["path"]
            func_node = n["node"]
            
            seen_edges = set()
            
            def walk_usage(child_node):
                if "identifier" in child_node.type or child_node.type == "name":
                    ident = code_bytes[child_node.start_byte:child_node.end_byte].decode('utf-8', errors='ignore')
                    
                    if ident in import_map:
                        target = import_map[ident]
                        edge_key = f"{target}->{func_path}"
                        if edge_key not in seen_edges:
                            # Draw edge from IMPORT to FUNCTION
                            edges.append({"source": target, "target": func_path, "type": "dependency"})
                            seen_edges.add(edge_key)
                            
                    if ident in function_map and function_map[ident] != func_path:
                        target = function_map[ident]
                        edge_key = f"{target}->{func_path}"
                        if edge_key not in seen_edges:
                            # Draw edge from CALLED FUNCTION to THIS FUNCTION
                            edges.append({"source": target, "target": func_path, "type": "dependency"})
                            seen_edges.add(edge_key)
                            
                for c in child_node.children:
                    walk_usage(c)
                    
            walk_usage(func_node)
            
    return children, edges
