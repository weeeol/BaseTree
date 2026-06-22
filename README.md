# BaseTree

**BaseTree** is a modern, premium web application designed to instantly parse, analyze, and visualize the architecture of any codebase. By combining the power of Abstract Syntax Tree (AST) parsing with D3.js interactive graphs, BaseTree gives you a high-level topographical map of repositories down to the individual functions and imports.

![BaseTree Dashboard Concept](https://img.shields.io/badge/Status-MVP-indigo.svg)

## ✨ Features

- **GitHub URL Parsing**: Paste any public GitHub repository URL, and BaseTree will automatically download the zipball, parse it entirely in memory, and visualize its structure.
- **Local ZIP Uploads**: Working on a private or local project? Simply upload your `.zip` archive to generate the exact same AST graph without needing a remote URL.
- **Deep AST Extraction**: Unlike standard file explorers, BaseTree uses `@babel/parser` and custom Regex analyzers to peek inside your `.js`, `.ts`, `.py`, `.java`, and `.go` files to map out critical **Functions** and **Imports**.
- **Infinite Canvas Dashboard**: A beautiful, Miro-like infinite canvas built with `react-d3-tree` and `<foreignObject>` Tailwind HTML cards.
- **Low-Token Context Export**: Instantly export any visual graph into a heavily compressed, indented `.txt` map. Perfect for feeding entire repository structures into LLM prompts without blowing out the context window.

## 🛠️ Tech Stack

### Frontend (Dashboard)
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS v4 (Inter font, dark mode, glassmorphism)
- **Visualization**: `react-d3-tree` with custom HTML Node renders

### Backend (AST Engine)
- **Server**: Node.js & Express
- **Zip Processing**: `adm-zip` & `multer` (in-memory buffer parsing, no local temp files)
- **Parsers**: `@babel/parser` and `@babel/traverse` for JavaScript/TypeScript.

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### 1. Start the Backend API
The backend handles fetching repositories, parsing ZIP buffers, and generating the AST JSON.

```bash
cd backend
npm install
npm run start
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
When using the "Export Map" feature, BaseTree converts complex D3 JSON into a clean, hierarchical view ideal for AI context:

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