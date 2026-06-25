import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    GitBranch, 
    Link, 
    UploadCloud, 
    FolderArchive, 
    Download, 
    TerminalSquare,
    Loader2
} from 'lucide-react';
import useStore from '../store/useStore';

export default function Sidebar() {
    const { fetchTreeUrl, uploadZip, isLoading, treeData } = useStore();
    const [activeTab, setActiveTab] = useState('url'); // 'url' or 'zip'
    const [url, setUrl] = useState('');
    const fileInputRef = useRef(null);

    const handleUrlSubmit = (e) => {
        e.preventDefault();
        if (url) fetchTreeUrl(url);
    };

    const handleZipUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            uploadZip(file);
        }
    };

    return (
        <div className="w-80 h-full bg-zinc-950/90 backdrop-blur-2xl border-r border-zinc-800/60 flex flex-col flex-shrink-0 z-20 shadow-2xl relative">
            <div className="p-6 border-b border-zinc-800/50">
                <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 rounded-xl border border-indigo-500/20 shadow-inner">
                        <TerminalSquare className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-400">
                            BaseTree
                        </h1>
                        <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest mt-0.5">Architecture Visualizer</p>
                    </div>
                </div>
            </div>

            <div className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto scrollbar-none">
                <div>
                    <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <GitBranch className="w-4 h-4 text-zinc-500" />
                        Import Source
                    </h2>
                    
                    {/* Animated Tabs */}
                    <div className="flex p-1 bg-zinc-900/50 rounded-xl mb-6 border border-zinc-800/80 relative">
                        {['url', 'zip'].map((tab) => (
                            <button 
                                key={tab}
                                className={`relative flex-1 py-2 text-xs font-medium rounded-lg transition-colors z-10 flex items-center justify-center gap-2 ${activeTab === tab ? 'text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {activeTab === tab && (
                                    <motion.div 
                                        layoutId="tab-indicator"
                                        className="absolute inset-0 bg-zinc-800 border border-zinc-700/50 rounded-lg shadow-sm"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-2">
                                    {tab === 'url' ? <Link className="w-3.5 h-3.5" /> : <FolderArchive className="w-3.5 h-3.5" />}
                                    {tab === 'url' ? 'GitHub' : 'Local ZIP'}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="relative min-h-[160px]">
                        <AnimatePresence mode="wait">
                            {activeTab === 'url' ? (
                                <motion.form 
                                    key="url-form"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    transition={{ duration: 0.2 }}
                                    onSubmit={handleUrlSubmit} 
                                    className="flex flex-col gap-3 absolute inset-0"
                                >
                                    <label className="text-xs font-medium text-zinc-400">Repository URL</label>
                                    <div className="relative">
                                        <input
                                            type="url"
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            placeholder="https://github.com/owner/repo"
                                            className="w-full bg-zinc-900/50 border border-zinc-700/80 text-zinc-200 text-sm pl-9 pr-3 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder-zinc-600 shadow-inner"
                                            required
                                        />
                                        <Link className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="mt-2 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm shadow-lg shadow-indigo-900/20"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Parsing AST...
                                            </>
                                        ) : 'Visualize Repository'}
                                    </button>
                                </motion.form>
                            ) : (
                                <motion.div 
                                    key="zip-form"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex flex-col gap-3 absolute inset-0"
                                >
                                    <label className="text-xs font-medium text-zinc-400">Project Archive</label>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isLoading}
                                        className="w-full h-32 border-2 border-dashed border-zinc-700/80 hover:border-indigo-500/50 bg-zinc-900/30 rounded-xl flex flex-col items-center justify-center gap-3 transition-all group disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                                    >
                                        {isLoading ? (
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                                                <span className="text-xs font-medium text-indigo-300">Extracting & Parsing...</span>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="p-3 bg-zinc-800/50 rounded-full group-hover:scale-110 group-hover:bg-indigo-500/10 transition-all duration-300">
                                                    <UploadCloud className="w-6 h-6 text-zinc-400 group-hover:text-indigo-400 transition-colors" />
                                                </div>
                                                <div className="flex flex-col items-center">
                                                    <span className="text-sm font-medium text-zinc-300 group-hover:text-indigo-200 transition-colors">Select .zip File</span>
                                                    <span className="text-[10px] text-zinc-500 mt-1">Max 50MB limit</span>
                                                </div>
                                            </>
                                        )}
                                    </button>
                                    <input 
                                        type="file" 
                                        accept=".zip" 
                                        className="hidden" 
                                        ref={fileInputRef}
                                        onChange={handleZipUpload}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Export Button */}
                <AnimatePresence>
                    {treeData && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-8 border-t border-zinc-800/50 pt-6"
                        >
                            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Download className="w-4 h-4 text-zinc-500" />
                                Export Map
                            </h2>
                            <p className="text-xs text-zinc-500 mb-4 leading-relaxed">Download a text representation of the graph, optimized for large LLM context windows.</p>
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
                                className="w-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/50 hover:border-zinc-500 font-medium px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg"
                            >
                                <Download className="w-4 h-4" />
                                Download TXT Map
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            <div className="p-4 border-t border-zinc-800/50 bg-zinc-950/50">
                <div className="flex items-center justify-between text-[10px] text-zinc-600 font-medium">
                    <span>Powered by @babel/parser</span>
                    <span className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Engine Ready
                    </span>
                </div>
            </div>
        </div>
    );
}
