const express = require("express");
const cors = require("cors");
const AdmZip = require("adm-zip");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const multer = require("multer");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// --- PARSERS ---

function parseJS(code) {
  const imports = [];
  const functions = [];

  try {
    const ast = parser.parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript", "decorators-legacy", "classProperties"],
      errorRecovery: true, // Keep parsing even if syntax errors exist
    });

    traverse(ast, {
      ImportDeclaration(path) {
        if (path.node.source && path.node.source.value) {
          imports.push(path.node.source.value);
        }
      },
      FunctionDeclaration(path) {
        if (path.node.id && path.node.id.name) {
          functions.push(path.node.id.name);
        }
      },
      ArrowFunctionExpression(path) {
        // If the arrow function is assigned to a variable, we can extract the name
        if (path.parent.type === "VariableDeclarator" && path.parent.id.name) {
          functions.push(path.parent.id.name);
        } else if (
          path.parent.type === "ClassProperty" &&
          path.parent.key.name
        ) {
          functions.push(path.parent.key.name);
        }
      },
      ClassMethod(path) {
        if (path.node.key && path.node.key.name) {
          functions.push(path.node.key.name);
        }
      },
    });
  } catch (e) {
    console.warn("Babel parse error (ignoring):", e.message);
  }

  return { imports: [...new Set(imports)], functions: [...new Set(functions)] };
}

function parsePython(code) {
  const imports = [];
  const functions = [];

  const lines = code.split("\n");
  for (const line of lines) {
    const tline = line.trim();
    // Imports
    const importMatch = tline.match(/^import\s+([^\s]+)/);
    if (importMatch) imports.push(importMatch[1]);

    const fromMatch = tline.match(/^from\s+([^\s]+)\s+import/);
    if (fromMatch) imports.push(fromMatch[1]);

    // Functions and classes
    const defMatch = tline.match(/^def\s+([a-zA-Z0-9_]+)\s*\(/);
    if (defMatch) functions.push(defMatch[1]);

    const classMatch = tline.match(/^class\s+([a-zA-Z0-9_]+)/);
    if (classMatch) functions.push(classMatch[1]);
  }
  return { imports: [...new Set(imports)], functions: [...new Set(functions)] };
}

function parseJava(code) {
  const imports = [];
  const functions = [];

  const importRegex = /^import\s+([\w.]+);/gm;
  let match;
  while ((match = importRegex.exec(code)) !== null) {
    imports.push(match[1]);
  }

  const funcRegex =
    /(?:public|private|protected)\s+(?:static\s+)?(?:[\w<>\[\]]+\s+)+(\w+)\s*\(/gm;
  while ((match = funcRegex.exec(code)) !== null) {
    // Exclude common keywords that might match
    if (!["if", "for", "while", "catch", "switch"].includes(match[1])) {
      functions.push(match[1]);
    }
  }

  return { imports: [...new Set(imports)], functions: [...new Set(functions)] };
}

function parseGo(code) {
  const imports = [];
  const functions = [];

  // Basic regex for single and block imports
  const singleImportRegex = /import\s+"([^"]+)"/g;
  let match;
  while ((match = singleImportRegex.exec(code)) !== null) {
    imports.push(match[1]);
  }

  // Go func
  const funcRegex = /func\s+(?:\([^)]+\)\s*)?(\w+)\s*\(/g;
  while ((match = funcRegex.exec(code)) !== null) {
    functions.push(match[1]);
  }

  return { imports: [...new Set(imports)], functions: [...new Set(functions)] };
}

function parseCpp(code) {
  const imports = [];
  const functions = [];

  const lines = code.split("\n");
  for (const line of lines) {
    const tline = line.trim();
    const importMatch = tline.match(/^#include\s+["<]([^">]+)[">]/);
    if (importMatch) imports.push(importMatch[1]);
  }

  // Simple C/C++ function matcher (returnType name(args))
  const funcRegex =
    /^[a-zA-Z_][a-zA-Z0-9_<>:*\s]+\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/gm;
  let match;
  while ((match = funcRegex.exec(code)) !== null) {
    if (
      !["if", "for", "while", "switch", "catch", "return"].includes(match[1])
    ) {
      functions.push(match[1]);
    }
  }

  return { imports: [...new Set(imports)], functions: [...new Set(functions)] };
}

function parseCSharp(code) {
  const imports = [];
  const functions = [];

  const importRegex = /^using\s+([\w.]+);/gm;
  let match;
  while ((match = importRegex.exec(code)) !== null) {
    imports.push(match[1]);
  }

  const funcRegex =
    /(?:public|private|protected|internal)\s+(?:static\s+|virtual\s+|override\s+|async\s+)?(?:[\w<>[\]]+\s+)+(\w+)\s*\(/gm;
  while ((match = funcRegex.exec(code)) !== null) {
    functions.push(match[1]);
  }

  return { imports: [...new Set(imports)], functions: [...new Set(functions)] };
}

function parseRust(code) {
  const imports = [];
  const functions = [];

  const importRegex = /^(?:pub\s+)?(?:use|mod)\s+([^;]+);/gm;
  let match;
  while ((match = importRegex.exec(code)) !== null) {
    imports.push(match[1]);
  }

  const funcRegex = /(?:pub\s+)?fn\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/gm;
  while ((match = funcRegex.exec(code)) !== null) {
    functions.push(match[1]);
  }

  return { imports: [...new Set(imports)], functions: [...new Set(functions)] };
}

function parsePhp(code) {
  const imports = [];
  const functions = [];

  const importRegex =
    /^(?:require|include|require_once|include_once)\s*\(?['"]([^'"]+)['"]\)?;/gm;
  let match;
  while ((match = importRegex.exec(code)) !== null) {
    imports.push(match[1]);
  }
  const useRegex = /^use\s+([^;]+);/gm;
  while ((match = useRegex.exec(code)) !== null) {
    imports.push(match[1]);
  }

  const funcRegex =
    /(?:public|private|protected\s+)?(?:static\s+)?function\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/gm;
  while ((match = funcRegex.exec(code)) !== null) {
    functions.push(match[1]);
  }

  return { imports: [...new Set(imports)], functions: [...new Set(functions)] };
}

function parseRuby(code) {
  const imports = [];
  const functions = [];

  const importRegex = /^(?:require|require_relative|load)\s+['"]([^'"]+)['"]/gm;
  let match;
  while ((match = importRegex.exec(code)) !== null) {
    imports.push(match[1]);
  }

  const funcRegex = /^def\s+([a-zA-Z_][a-zA-Z0-9_=!?]*)/gm;
  while ((match = funcRegex.exec(code)) !== null) {
    functions.push(match[1]);
  }

  return { imports: [...new Set(imports)], functions: [...new Set(functions)] };
}

function parseCodeContent(filename, codeBuffer) {
  const code = codeBuffer.toString("utf8");
  const ext = filename.split(".").pop().toLowerCase();

  if (["js", "jsx", "ts", "tsx"].includes(ext)) return parseJS(code);
  if (ext === "py") return parsePython(code);
  if (ext === "java") return parseJava(code);
  if (ext === "go") return parseGo(code);
  if (["c", "cpp", "h", "hpp"].includes(ext)) return parseCpp(code);
  if (ext === "cs") return parseCSharp(code);
  if (ext === "rs") return parseRust(code);
  if (ext === "php") return parsePhp(code);
  if (ext === "rb") return parseRuby(code);

  return { imports: [], functions: [] };
}

// --- DATA TRANSFORMATION ---

function resolveImportPath(currentFilePath, importString) {
  if (!importString.startsWith(".")) return null;
  const dir = path.posix.dirname(currentFilePath);
  return path.posix.join(dir, importString);
}

function buildGraphFromZipEntries(repoName, entries, isGithubZip = false) {
  const root = {
    name: repoName,
    attributes: { type: "tree", path: "" },
    children: [],
  };

  const pathMap = {};
  const edges = [];

  // First pass: create all nodes
  for (const entry of entries) {
    const parts = entry.entryName.split("/");

    if (isGithubZip) {
      // GitHub zips wrap everything in a single root folder (owner-repo-sha)
      if (parts.length <= 1) continue;
      parts.shift();
    } else {
      // For raw uploads, skip the empty root entries or macOS __MACOSX garbage
      if (parts[0] === "__MACOSX") continue;
      if (
        entry.entryName.endsWith("/") &&
        parts.length === 1 &&
        parts[0] === ""
      )
        continue;
    }

    const path = parts.join("/");
    if (!path) continue;

    const name = parts[parts.length - 1] || parts[parts.length - 2]; // handle trailing slashes
    const isFolder = entry.isDirectory;

    const node = {
      name: isFolder ? name : parts[parts.length - 1],
      attributes: { type: isFolder ? "tree" : "blob", path: path },
      children: [],
    };

    // Parse file contents if it's a file
    if (!isFolder && entry.getData) {
      const ext = node.name.split(".").pop().toLowerCase();
      const code = entry.getData().toString("utf8");

      if (["js", "jsx", "ts", "tsx"].includes(ext)) {
        const astData = parseJS(code);
        node.attributes.functions = astData.functions;
        node.attributes.imports = astData.imports;
        for (const imp of astData.imports) {
          const target = resolveImportPath(path, imp);
          if (target) edges.push({ source: path, target });
        }
      } else if (ext === "py") {
        const astData = parsePython(code);
        node.attributes.functions = astData.functions;
        node.attributes.imports = astData.imports;
        for (const imp of astData.imports) {
          const target = resolveImportPath(path, imp);
          if (target) edges.push({ source: path, target });
        }
      } else if (ext === "java") {
        const astData = parseJava(code);
        node.attributes.functions = astData.functions;
        node.attributes.imports = astData.imports;
        for (const imp of astData.imports) {
          const target = resolveImportPath(path, imp);
          if (target) edges.push({ source: path, target });
        }
      } else if (ext === "go") {
        const astData = parseGo(code);
        node.attributes.functions = astData.functions;
        node.attributes.imports = astData.imports;
        for (const imp of astData.imports) {
          const target = resolveImportPath(path, imp);
          if (target) edges.push({ source: path, target });
        }
      } else if (["c", "cpp", "h", "hpp"].includes(ext)) {
        const astData = parseCpp(code);
        node.attributes.functions = astData.functions;
        node.attributes.imports = astData.imports;
        for (const imp of astData.imports) {
          const target = resolveImportPath(path, imp);
          if (target) edges.push({ source: path, target });
        }
      } else if (ext === "cs") {
        const astData = parseCSharp(code);
        node.attributes.functions = astData.functions;
        node.attributes.imports = astData.imports;
        for (const imp of astData.imports) {
          const target = resolveImportPath(path, imp);
          if (target) edges.push({ source: path, target });
        }
      } else if (ext === "rs") {
        const astData = parseRust(code);
        node.attributes.functions = astData.functions;
        node.attributes.imports = astData.imports;
        for (const imp of astData.imports) {
          const target = resolveImportPath(path, imp);
          if (target) edges.push({ source: path, target });
        }
      } else if (ext === "php") {
        const astData = parsePhp(code);
        node.attributes.functions = astData.functions;
        node.attributes.imports = astData.imports;
        for (const imp of astData.imports) {
          const target = resolveImportPath(path, imp);
          if (target) edges.push({ source: path, target });
        }
      } else if (ext === "rb") {
        const astData = parseRuby(code);
        node.attributes.functions = astData.functions;
        node.attributes.imports = astData.imports;
        for (const imp of astData.imports) {
          const target = resolveImportPath(path, imp);
          if (target) edges.push({ source: path, target });
        }
      }

      const { imports, functions } = parseCodeContent(
        node.name,
        entry.getData(),
      );

      // Add AST metadata as child nodes
      if (imports.length > 0) {
        node.children.push({
          name: "Imports",
          attributes: { type: "import_group" },
          children: imports.map((imp) => ({
            name: imp,
            attributes: { type: "import" },
          })),
        });
      }
      if (functions.length > 0) {
        node.children.push({
          name: "Functions",
          attributes: { type: "function_group" },
          children: functions.map((fn) => ({
            name: fn,
            attributes: { type: "function" },
          })),
        });
      }
      node.attributes.size = entry.header.size;
    }

    // Standardize path without trailing slash for mapping
    const cleanPath = path.replace(/\/$/, "");
    pathMap[cleanPath] = node;
  }

  // Second pass: Link children to parents
  for (const path in pathMap) {
    const node = pathMap[path];
    const parts = path.split("/");
    parts.pop();
    const parentPath = parts.join("/");

    if (parentPath === "") {
      root.children.push(node);
    } else {
      if (pathMap[parentPath]) {
        pathMap[parentPath].children.push(node);
      } else {
        root.children.push(node);
      }
    }
  }

  // Cleanup empty children
  function cleanEmptyChildren(node) {
    if (node.children && node.children.length === 0) {
      delete node.children;
    } else if (node.children) {
      node.children.forEach(cleanEmptyChildren);
    }
  }
  cleanEmptyChildren(root);

  return { tree: root, edges };
}

// --- API ROUTES ---

app.post("/api/tree", async (req, res) => {
  try {
    const { url } = req.body;

    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) return res.status(400).json({ error: "Invalid GitHub URL" });

    const owner = match[1];
    const repo = match[2].replace(/\.git$/, "").split("/")[0];

    // Fetch repo info
    const repoUrl = `https://api.github.com/repos/${owner}/${repo}`;
    const repoRes = await fetch(repoUrl);
    if (!repoRes.ok) throw new Error("Repository not found");
    const repoData = await repoRes.json();
    const defaultBranch = repoData.default_branch;

    // Fetch Zipball
    const zipUrl = `https://api.github.com/repos/${owner}/${repo}/zipball/${defaultBranch}`;
    const zipRes = await fetch(zipUrl);
    if (!zipRes.ok) throw new Error("Failed to download repository contents");

    // Parse Zip in memory
    const buffer = await zipRes.arrayBuffer();
    const zip = new AdmZip(Buffer.from(buffer));
    const entries = zip.getEntries();

    // Build Graph
    const graphData = buildGraphFromZipEntries(repo, entries, true);

    return res.json({
      tree: graphData.tree,
      edges: graphData.edges,
      repoName: repo,
      owner: owner,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: error.message || "Internal server error" });
  }
});

app.post("/api/upload", upload.single("zipfile"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No zip file uploaded" });
    }

    // Parse Zip in memory
    const zip = new AdmZip(req.file.buffer);
    const entries = zip.getEntries();
    const repoName = req.file.originalname.replace(".zip", "");

    // Build Graph (isGithubZip = false)
    const graphData = buildGraphFromZipEntries(repoName, entries, false);

    return res.json({
      tree: graphData.tree,
      edges: graphData.edges,
      repoName: repoName,
      owner: "Local",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: error.message || "Internal server error while processing ZIP",
    });
  }
});

app.listen(PORT, () => {
  console.log(
    `Backend API with AST Parsing running on http://localhost:${PORT}`,
  );
});
