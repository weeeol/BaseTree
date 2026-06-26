import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, AlertCircle, AlertTriangle, X } from 'lucide-react';
import Sidebar from './components/Sidebar';
import FlowVisualization from './components/FlowVisualization';
import CommandPalette from './components/CommandPalette';
import useStore from './store/useStore';

function App() {
    const { 
        treeData, 
        isLoading, 
        error, 
        hasExperimentalLanguages,
        clearError
    } = useStore();

    const [isWarningDismissed, setIsWarningDismissed] = React.useState(false);

    useEffect(() => {
        if (treeData) setIsWarningDismissed(false);
    }, [treeData]);

    return (
        <div className="h-screen w-full flex bg-[#fafafa] text-black selection:bg-black selection:text-white font-sans overflow-hidden">
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
                                    className="inline-flex items-center gap-2 px-4 py-3 bg-red-400 border-3 border-black text-black text-sm brutalist-shadow pointer-events-auto font-bold pr-10 relative"
                                >
                                    <AlertCircle className="w-5 h-5 shrink-0" strokeWidth={3} />
                                    <span className="uppercase tracking-wider">{error}</span>
                                    <button 
                                        onClick={clearError}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-black hover:text-white border-2 border-transparent hover:border-black transition-colors"
                                    >
                                        <X className="w-4 h-4" strokeWidth={3} />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Command Palette Trigger & Modal */}
                    <CommandPalette />
                </div>

                <div className="absolute bottom-6 right-6 pointer-events-none z-20 flex flex-col gap-2 items-end">
                    <AnimatePresence>
                        {hasExperimentalLanguages && !error && !isWarningDismissed && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                                className="inline-flex items-start gap-3 px-5 py-4 bg-yellow-300 border-3 border-black text-black text-sm brutalist-shadow pointer-events-auto max-w-md relative pr-12"
                            >
                                <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" strokeWidth={3} />
                                <div>
                                    <span className="font-extrabold uppercase tracking-widest block mb-1">Experimental Parsing</span>
                                    <span className="font-medium leading-relaxed">Non-JS/TS languages detected. Their AST extraction is regex-based and may be inaccurate.</span>
                                </div>
                                <button 
                                    onClick={() => setIsWarningDismissed(true)}
                                    className="absolute right-3 top-3 p-1 hover:bg-black hover:text-yellow-300 border-2 border-transparent hover:border-black transition-colors"
                                >
                                    <X className="w-5 h-5" strokeWidth={3} />
                                </button>
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
                                className="w-full h-full flex flex-col items-center justify-center bg-white border-4 border-black brutalist-shadow"
                            >
                                <motion.div 
                                    animate={{ rotate: [0, -5, 5, -5, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="p-6 bg-cyan-300 border-4 border-black brutalist-shadow mb-8"
                                >
                                    <Network className="w-16 h-16 text-black" strokeWidth={2} />
                                </motion.div>
                                <h3 className="text-3xl font-black text-black uppercase tracking-widest bg-yellow-300 px-4 py-2 border-3 border-black brutalist-shadow-sm rotate-[-2deg]">No Architecture Loaded</h3>
                                <p className="text-black font-bold mt-6 max-w-sm text-center leading-relaxed text-lg bg-white border-2 border-black p-3 brutalist-shadow-sm rotate-[1deg]">Import a GitHub repository or upload a local ZIP file using the sidebar to generate a visual AST representation.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}

export default App;
