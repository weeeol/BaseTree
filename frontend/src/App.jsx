import React, { useState } from 'react';
import InputComponent from './components/InputComponent';
import TreeVisualization from './components/TreeVisualization';

function App() {
    const [treeData, setTreeData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFetchTree = async (url) => {
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await fetch('http://localhost:3001/api/tree', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch repository data');
            }

            setTreeData(data.tree);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 p-8 pt-16 selection:bg-indigo-500/30 selection:text-indigo-200 font-sans">
            <div className="max-w-6xl mx-auto relative z-10">
                <header className="mb-12 text-center flex flex-col items-center">
                    <div className="inline-flex items-center justify-center p-3 bg-zinc-900 border border-zinc-800 rounded-2xl mb-6 shadow-xl shadow-black/50">
                        <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight text-white">
                        Visualize your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">codebase.</span>
                    </h1>
                    <p className="text-zinc-400 text-lg max-w-2xl mx-auto font-medium">
                        Instantly map out repository architecture, dependencies, and internal file structures with AST precision.
                    </p>
                </header>

                <main>
                    <InputComponent onFetchTree={handleFetchTree} isLoading={isLoading} />
                    
                    {error && (
                        <div className="w-full max-w-2xl mx-auto mb-8 p-4 bg-red-950/30 border border-red-900/50 rounded-xl text-red-400 text-sm text-center shadow-lg">
                            {error}
                        </div>
                    )}

                    {treeData && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
                            <TreeVisualization data={treeData} />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default App;
