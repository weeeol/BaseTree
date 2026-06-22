import React, { useState, useRef } from 'react';

export default function Sidebar({ onFetchTreeUrl, onUploadZip, isLoading, treeData }) {
    const [activeTab, setActiveTab] = useState('url'); // 'url' or 'zip'
    const [url, setUrl] = useState('');
    const fileInputRef = useRef(null);

    const handleUrlSubmit = (e) => {
        e.preventDefault();
        if (url) onFetchTreeUrl(url);
    };

    const handleZipUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            onUploadZip(file);
        }
    };

    return (
        <div className="w-80 h-full bg-zinc-950 border-r border-zinc-800 flex flex-col flex-shrink-0 z-20">
            <div className="p-6 border-b border-zinc-800/50">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
                        BaseTree
                    </h1>
                </div>
                <p className="text-xs text-zinc-500 font-medium">AST Codebase Visualizer</p>
            </div>

            <div className="p-6 flex-1 flex flex-col gap-6">
                <div>
                    <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-4">Import Codebase</h2>
                    
                    {/* Tabs */}
                    <div className="flex p-1 bg-zinc-900 rounded-lg mb-6 border border-zinc-800">
                        <button 
                            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'url' ? 'bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/50' : 'text-zinc-500 hover:text-zinc-300'}`}
                            onClick={() => setActiveTab('url')}
                        >
                            GitHub URL
                        </button>
                        <button 
                            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'zip' ? 'bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/50' : 'text-zinc-500 hover:text-zinc-300'}`}
                            onClick={() => setActiveTab('zip')}
                        >
                            Local ZIP
                        </button>
                    </div>

                    {/* Content */}
                    <div className="relative">
                        {activeTab === 'url' ? (
                            <form onSubmit={handleUrlSubmit} className="flex flex-col gap-3">
                                <label className="text-xs font-medium text-zinc-400">Public Repository URL</label>
                                <input
                                    type="url"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="https://github.com/owner/repo"
                                    className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 text-sm px-3 py-2.5 rounded-lg focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder-zinc-600"
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="mt-2 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center text-sm"
                                >
                                    {isLoading ? 'Processing...' : 'Visualize via URL'}
                                </button>
                            </form>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <label className="text-xs font-medium text-zinc-400">Upload Project Archive (.zip)</label>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isLoading}
                                    className="w-full h-32 border-2 border-dashed border-zinc-700 hover:border-indigo-500/50 bg-zinc-900/50 rounded-xl flex flex-col items-center justify-center gap-2 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg className="w-8 h-8 text-zinc-500 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <span className="text-sm font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">Select .zip File</span>
                                </button>
                                <input 
                                    type="file" 
                                    accept=".zip" 
                                    className="hidden" 
                                    ref={fileInputRef}
                                    onChange={handleZipUpload}
                                />
                                {isLoading && (
                                    <div className="mt-2 text-center text-xs font-medium text-indigo-400 animate-pulse">
                                        Uploading & Parsing AST...
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                {/* Export Button */}
                {treeData && (
                    <div className="mt-8 border-t border-zinc-800/50 pt-6">
                        <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-4">Export Map</h2>
                        <p className="text-xs text-zinc-500 mb-3">Download a low-token text representation of this AST for LLM context.</p>
                        <button
                            onClick={() => {
                                const generateTextMap = (node, depth = 0) => {
                                    if (!node) return '';
                                    let indent = '  '.repeat(depth);
                                    let text = '';
                                    
                                    const type = node.attributes?.type;
                                    if (type === 'function_group' || type === 'import_group') {
                                        return node.children ? node.children.map(c => generateTextMap(c, depth)).join('') : '';
                                    }

                                    let prefix = '';
                                    if (type === 'tree') prefix = '/';
                                    else if (type === 'function') prefix = 'ƒ ';
                                    else if (type === 'import') prefix = '↓ ';

                                    text += `${indent}${prefix}${node.name}\n`;
                                    
                                    if (node.children) {
                                        text += node.children.map(c => generateTextMap(c, depth + 1)).join('');
                                    }
                                    return text;
                                };

                                const textContent = generateTextMap(treeData);
                                const blob = new Blob([textContent], { type: 'text/plain' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `${treeData.name}-ast-map.txt`;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                            }}
                            className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-medium px-4 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 text-sm shadow-lg"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download TXT Map
                        </button>
                    </div>
                )}
            </div>
            
            <div className="p-6 border-t border-zinc-800/50 text-xs text-zinc-600 font-medium flex-shrink-0">
                Uses @babel/parser and adm-zip for AST extraction.
            </div>
        </div>
    );
}
