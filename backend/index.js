const express = require('express');
const cors = require('cors');
const AdmZip = require('adm-zip');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// --- PARSERS ---

function parseJS(code) {
    const imports = [];
    const functions = [];

    try {
        const ast = parser.parse(code, {
            sourceType: 'module',
            plugins: ['jsx', 'typescript', 'decorators-legacy', 'classProperties'],
            errorRecovery: true // Keep parsing even if syntax errors exist
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
                if (path.parent.type === 'VariableDeclarator' && path.parent.id.name) {
                    functions.push(path.parent.id.name);
                } else if (path.parent.type === 'ClassProperty' && path.parent.key.name) {
                    functions.push(path.parent.key.name);
                }
            },
            ClassMethod(path) {
                if (path.node.key && path.node.key.name) {
                    functions.push(path.node.key.name);
                }
            }
        });
    } catch (e) {
        console.warn('Babel parse error (ignoring):', e.message);
    }

    return { imports: [...new Set(imports)], functions: [...new Set(functions)] };
}

function parsePython(code) {
    const imports = [];
    const functions = [];

    const lines = code.split('\n');
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

    const funcRegex = /(?:public|private|protected)\s+(?:static\s+)?(?:[\w<>\[\]]+\s+)+(\w+)\s*\(/gm;
    while ((match = funcRegex.exec(code)) !== null) {
        // Exclude common keywords that might match
        if (!['if', 'for', 'while', 'catch', 'switch'].includes(match[1])) {
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

function parseCodeContent(filename, codeBuffer) {
    const code = codeBuffer.toString('utf8');
    const ext = filename.split('.').pop().toLowerCase();
    
    if (['js', 'jsx', 'ts', 'tsx'].includes(ext)) return parseJS(code);
    if (ext === 'py') return parsePython(code);
    if (ext === 'java') return parseJava(code);
    if (ext === 'go') return parseGo(code);

    return { imports: [], functions: [] };
}


// --- DATA TRANSFORMATION ---

function buildGraphFromZipEntries(repoName, entries) {
    const root = {
        name: repoName,
        attributes: { type: 'tree', path: '' },
        children: []
    };

    const pathMap = {};

    // First pass: create all nodes
    for (const entry of entries) {
        // Zip entries from GitHub look like: owner-repo-sha/src/App.jsx
        // We need to strip the root folder (owner-repo-sha)
        const parts = entry.entryName.split('/');
        if (parts.length <= 1) continue; // Skip root folder
        
        parts.shift(); // remove root folder
        const path = parts.join('/');
        if (!path) continue;
        
        const name = parts[parts.length - 1] || parts[parts.length - 2]; // handle trailing slashes
        const isFolder = entry.isDirectory;

        const node = {
            name: isFolder ? name : parts[parts.length - 1],
            attributes: { type: isFolder ? 'tree' : 'blob', path: path },
            children: []
        };

        // Parse file contents if it's a file
        if (!isFolder && entry.getData) {
            const { imports, functions } = parseCodeContent(node.name, entry.getData());
            
            // Add AST metadata as child nodes
            if (imports.length > 0) {
                node.children.push({
                    name: 'Imports',
                    attributes: { type: 'import_group' },
                    children: imports.map(imp => ({ name: imp, attributes: { type: 'import' } }))
                });
            }
            if (functions.length > 0) {
                node.children.push({
                    name: 'Functions',
                    attributes: { type: 'function_group' },
                    children: functions.map(fn => ({ name: fn, attributes: { type: 'function' } }))
                });
            }
            node.attributes.size = entry.header.size;
        }

        // Standardize path without trailing slash for mapping
        const cleanPath = path.replace(/\/$/, '');
        pathMap[cleanPath] = node;
    }

    // Second pass: Link children to parents
    for (const path in pathMap) {
        const node = pathMap[path];
        const parts = path.split('/');
        parts.pop();
        const parentPath = parts.join('/');

        if (parentPath === '') {
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

    return root;
}


// --- API ROUTES ---

app.post('/api/tree', async (req, res) => {
    try {
        const { url } = req.body;
        
        const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (!match) return res.status(400).json({ error: 'Invalid GitHub URL' });

        const owner = match[1];
        const repo = match[2].replace(/\.git$/, '').split('/')[0];

        // Fetch repo info
        const repoUrl = `https://api.github.com/repos/${owner}/${repo}`;
        const repoRes = await fetch(repoUrl);
        if (!repoRes.ok) throw new Error('Repository not found');
        const repoData = await repoRes.json();
        const defaultBranch = repoData.default_branch;

        // Fetch Zipball
        const zipUrl = `https://api.github.com/repos/${owner}/${repo}/zipball/${defaultBranch}`;
        const zipRes = await fetch(zipUrl);
        if (!zipRes.ok) throw new Error('Failed to download repository contents');

        // Parse Zip in memory
        const buffer = await zipRes.arrayBuffer();
        const zip = new AdmZip(Buffer.from(buffer));
        const entries = zip.getEntries();

        // Build Graph
        const nestedTree = buildGraphFromZipEntries(repo, entries);

        return res.json({ tree: nestedTree, repoName: repo, owner: owner });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend API with AST Parsing running on http://localhost:${PORT}`);
});
