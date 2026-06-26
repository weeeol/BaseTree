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
        <div className="w-80 h-full bg-[#f4f4f0] border-r-4 border-black flex flex-col flex-shrink-0 z-20 brutalist-shadow relative">
            <div className="p-6 border-b-4 border-black bg-cyan-300">
                <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 bg-white text-black border-3 border-black brutalist-shadow-sm">
                        <TerminalSquare className="w-8 h-8" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-black uppercase">
                            BaseTree
                        </h1>
                        <p className="text-[10px] text-black font-extrabold uppercase tracking-widest mt-1 bg-yellow-300 inline-block px-1 border border-black">Architecture Visualizer</p>
                    </div>
                </div>
            </div>

            <div className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto scrollbar-none">
                <div>
                    <h2 className="text-sm font-black text-black uppercase tracking-widest mb-4 flex items-center gap-2">
                        <GitBranch className="w-5 h-5 text-black" strokeWidth={3} />
                        Import Source
                    </h2>
                    
                    {/* Animated Tabs */}
                    <div className="flex p-1 bg-white mb-6 border-3 border-black brutalist-shadow-sm relative">
                        {['url', 'zip'].map((tab) => (
                            <button 
                                key={tab}
                                className={`relative flex-1 py-2 text-xs font-black rounded-none transition-colors z-10 flex items-center justify-center gap-2 uppercase tracking-widest ${activeTab === tab ? 'text-black' : 'text-gray-400 hover:text-black'}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {activeTab === tab && (
                                    <motion.div 
                                        layoutId="tab-indicator"
                                        className="absolute inset-0 bg-yellow-300 border-2 border-black"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-2">
                                    {tab === 'url' ? <Link className="w-4 h-4" strokeWidth={3} /> : <FolderArchive className="w-4 h-4" strokeWidth={3} />}
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
                                    <label className="text-sm font-black text-black uppercase tracking-widest">Repository URL</label>
                                    <div className="relative">
                                        <input
                                            type="url"
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            placeholder="https://github.com/owner/repo"
                                            className="w-full bg-white border-3 border-black text-black text-sm pl-10 pr-3 py-3 focus:outline-none focus:ring-0 focus:bg-yellow-100 transition-all placeholder-gray-400 font-bold brutalist-shadow-sm"
                                            required
                                        />
                                        <Link className="w-5 h-5 text-black absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={2.5} />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="mt-4 w-full bg-cyan-300 hover:bg-cyan-200 text-black font-black uppercase tracking-widest px-4 py-3 border-3 border-black brutalist-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2 text-sm"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" strokeWidth={3} />
                                                Parsing...
                                            </>
                                        ) : 'Visualize Repo'}
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
                                    <label className="text-sm font-black text-black uppercase tracking-widest">Project Archive</label>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isLoading}
                                        className="w-full h-32 mt-1 border-4 border-dashed border-black hover:bg-yellow-300 bg-white flex flex-col items-center justify-center gap-3 transition-all group disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                                    >
                                        {isLoading ? (
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <Loader2 className="w-8 h-8 text-black animate-spin" strokeWidth={3} />
                                                <span className="text-sm font-black text-black uppercase tracking-widest">Extracting...</span>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="p-3 bg-white border-3 border-black brutalist-shadow-sm group-hover:scale-110 transition-all duration-300">
                                                    <UploadCloud className="w-8 h-8 text-black" strokeWidth={2.5} />
                                                </div>
                                                <div className="flex flex-col items-center">
                                                    <span className="text-sm font-black text-black uppercase tracking-widest">Select .zip File</span>
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
                            className="mt-8 border-t-4 border-black pt-6"
                        >
                            <h2 className="text-sm font-black text-black uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Download className="w-5 h-5 text-black" strokeWidth={2.5} />
                                Export Map
                            </h2>
                            <p className="text-xs font-bold text-gray-700 mb-6 leading-relaxed">Download a markdown representation of the graph, optimized for large LLM context windows.</p>
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

                                        let suffix = '';
                                        if (type === 'tree') suffix = '/';
                                        
                                        text += `${indent}- ${node.name}${suffix}\n`;
                                        
                                        if (node.children) {
                                            text += node.children.map(c => generateTextMap(c, depth + 1)).join('');
                                        }
                                        return text;
                                    };

                                    const textContent = generateTextMap(treeData);
                                    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `${treeData.name}-ast-map.txt`;
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                    URL.revokeObjectURL(url);
                                }}
                                className="w-full bg-purple-400 hover:bg-purple-300 text-black font-black uppercase tracking-widest px-4 py-3 border-3 border-black brutalist-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-3 text-sm"
                            >
                                <Download className="w-5 h-5" strokeWidth={3} />
                                Download Markdown List
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            <div className="p-4 border-t-4 border-black bg-white">
                <div className="flex items-center justify-between text-xs text-black font-bold uppercase tracking-wider">
                    <span>Powered by @babel/parser</span>
                    <span className="flex items-center gap-2">
                        <div className="w-3 h-3 border-2 border-black bg-emerald-400" />
                        Ready
                    </span>
                </div>
            </div>
        </div>
    );
}
