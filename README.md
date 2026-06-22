# 🌳 BaseTree

> Instantly visualize any GitHub codebase as an interactive node tree.

BaseTree is a developer tool designed to make codebase onboarding and structural analysis frictionless. Instead of clicking through endless nested folders on GitHub, simply paste a repository URL into BaseTree and instantly get a bird's-eye view of the entire project architecture through an interactive, collapsible node graph.

## ✨ Features

* **Instant GitHub Integration:** Paste any public GitHub repository URL—no cloning or local setup required.
* **Interactive Visualization:** Pan, zoom, expand, and collapse directories to explore complex architectures without getting lost.
* **Lightweight & Fast:** Uses the GitHub Git Trees API to fetch repository structures instantly, avoiding heavy file downloads.
* **Smart Parsing:** Automatically distinguishes between files and folders, providing a clean visual hierarchy.

## 🛠️ Tech Stack

* **Frontend:** React.js / Vite
* **Visualization:** D3.js (or React Flow)
* **Backend:** Node.js / Express
* **API:** GitHub REST API (Git Trees)

## 🚀 Getting Started

To run BaseTree locally on your machine, follow these steps:

### Prerequisites
* Node.js (v16 or higher)
* npm or yarn
* A GitHub Personal Access Token (for increasing API rate limits)

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/yourusername/BaseTree.git](https://github.com/yourusername/BaseTree.git)
   cd BaseTree