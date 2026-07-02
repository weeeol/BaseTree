# BaseTree

**BaseTree** is a modern, premium web application designed to instantly parse, analyze, and visualize the architecture of any codebase. By combining the power of Abstract Syntax Tree (AST) parsing with React Flow interactive graphs, BaseTree gives you a high-level topographical map of repositories down to the individual functions and imports, complete with dependency tracking!

![BaseTree Dashboard Concept](https://img.shields.io/badge/Status-MVP-indigo.svg)

## ✨ Features

- **GitHub URL Parsing**: Paste any public GitHub repository URL, and BaseTree will automatically download the zipball, parse it entirely in memory, and visualize its structure.
- **Local ZIP Uploads**: Working on a private or local project? Simply upload your `.zip` archive to generate the exact same AST graph without needing a remote URL.
- **Deep AST Extraction & Edge Tracking**: Unlike standard file explorers, BaseTree uses the official **Tree-sitter** engine to peek inside your `.js`, `.ts`, `.py`, `.java`, `.go`, and `.cpp` files to map out critical **Functions** and **Imports**. It even performs a second pass to map the exact **Dependency Edges** showing which functions use which imports!
- **Infinite Canvas Dashboard**: A beautiful, neo-brutalist infinite canvas built with `React Flow` and Tailwind CSS.
- **Low-Token Context Export**: Instantly export any visual graph into a heavily compressed, indented `.txt` map. Perfect for feeding entire repository structures into LLM prompts without blowing out the context window.

## 🛠️ Tech Stack

### Frontend (Dashboard)
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS v4 (Neo-Brutalism design system)
- **Visualization**: `React Flow` with custom HTML Node renders and dynamic resizing

### Backend (AST Engine)
- **Server**: Python & FastAPI (Uvicorn)
- **Concurrency**: Fully asynchronous with heavy AST extraction offloaded to a thread pool
- **Zip Processing**: Native `zipfile` (in-memory buffer parsing, no local temp files)
- **Parsers**: `tree-sitter` native bindings for JS/TS, Python, Go, Java, and C++.

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed for the frontend, and [Python 3.10+](https://www.python.org/downloads/) installed for the backend.

### 1. Start the Backend API
The backend handles fetching repositories, parsing ZIP buffers, extracting ASTs, and resolving dependencies.

```bash
cd backend
pip install -r requirements.txt
python app.py
# Server runs on http://localhost:3001
```

### 2. Start the Frontend Dashboard
The frontend handles the interactive infinite canvas and file uploads.

```bash
cd frontend
npm install
npm run dev
# Vite runs on http://localhost:5173
```

## 🧠 Low-Token AST Map Example
When using the "Export Map" feature, BaseTree converts complex JSON into a clean, hierarchical view ideal for AI context:

```text
/src
  /components
    📄 App.jsx
      ↓ react
      ↓ ./Sidebar
      ƒ App
      ƒ handleFetch
```

## 📝 License
MIT License