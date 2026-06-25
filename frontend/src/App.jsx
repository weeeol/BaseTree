import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, AlertCircle, AlertTriangle } from 'lucide-react';
import Sidebar from './components/Sidebar';
import FlowVisualization from './components/FlowVisualization';
import CommandPalette from './components/CommandPalette';
import useStore from './store/useStore';

function App() {
    const { 
        treeData, 
        edges, 
        isLoading, 
        error, 
        searchQuery, 
        hasExperimentalLanguages,
        setSearchQuery,
        fetchTreeUrl,
        uploadZip
    } = useStore();

    return (
        <div className="h-screen w-full flex bg-[#0a0a0a] text-zinc-100 selection:bg-indigo-500/30 selection:text-indigo-200 font-sans overflow-hidden">
            <Sidebar />
            
            <main className="flex-1 relative flex flex-col">
                {/* Header for canvas context */}
                <div className="absolute top-0 left-0 w-full p-6 pointer-events-none z-20 flex justify-between items-start">
                    <div className="flex flex-col gap-2">
                        <AnimatePresence>
                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="inline-flex items-center gap-2 px-4 py-3 bg-red-950/90 border border-red-900/50 rounded-xl text-red-400 text-sm shadow-2xl backdrop-blur-xl pointer-events-auto"
                                >
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{error}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Command Palette Trigger & Modal */}
                    <CommandPalette />
                </div>

                <div className="absolute bottom-6 right-6 pointer-events-none z-20 flex flex-col gap-2 items-end">
                    <AnimatePresence>
                        {hasExperimentalLanguages && !error && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                                className="inline-flex items-start gap-3 px-5 py-4 bg-amber-950/90 border border-amber-900/50 rounded-xl text-amber-400 text-sm shadow-2xl backdrop-blur-xl pointer-events-auto max-w-md"
                            >
                                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-semibold block mb-1">Experimental Parsing</span>
                                    <span className="text-amber-500/90 leading-relaxed">Non-JS/TS languages detected. Their AST extraction is regex-based and may be inaccurate.</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex-1 w-full h-full p-6 relative z-10">
                    <AnimatePresence mode="wait">
                        {treeData ? (
                            <motion.div 
                                key="flow"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.3 }}
                                className="w-full h-full"
                            >
                                <FlowVisualization />
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="empty"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="w-full h-full flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-zinc-900/20 to-zinc-950/50 border border-zinc-800/30"
                            >
                                <motion.div 
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="p-6 bg-zinc-900/50 rounded-3xl shadow-2xl shadow-indigo-500/5 border border-zinc-800/80 mb-6"
                                >
                                    <Network className="w-16 h-16 text-zinc-700" strokeWidth={1} />
                                </motion.div>
                                <h3 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 to-zinc-500">No Architecture Loaded</h3>
                                <p className="text-zinc-500 mt-3 max-w-sm text-center leading-relaxed">Import a GitHub repository or upload a local ZIP file using the sidebar to generate a visual AST representation.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}

export default App;
