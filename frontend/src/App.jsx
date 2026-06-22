import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import TreeVisualization from './components/TreeVisualization';

function App() {
    const [treeData, setTreeData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFetchTreeUrl = async (url) => {
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await fetch('http://localhost:3001/api/tree', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to fetch repository data');
            setTreeData(data.tree);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUploadZip = async (file) => {
        setIsLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('zipfile', file);

            const response = await fetch('http://localhost:3001/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to process ZIP file');
            setTreeData(data.tree);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen w-full flex bg-[#0a0a0a] text-zinc-100 selection:bg-indigo-500/30 selection:text-indigo-200 font-sans overflow-hidden">
            <Sidebar 
                onFetchTreeUrl={handleFetchTreeUrl} 
                onUploadZip={handleUploadZip} 
                isLoading={isLoading} 
                treeData={treeData}
            />
            
            <main className="flex-1 relative flex flex-col">
                {/* Header for canvas context */}
                <div className="absolute top-0 left-0 w-full p-6 pointer-events-none z-10 flex justify-between items-start">
                    <div>
                        {error && (
                            <div className="inline-block px-4 py-2 bg-red-950/80 border border-red-900/50 rounded-lg text-red-400 text-sm shadow-xl backdrop-blur-md pointer-events-auto">
                                [Error] {error}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 w-full h-full p-6">
                    {treeData ? (
                        <div className="w-full h-full animate-in fade-in zoom-in-95 duration-500 ease-out">
                            <TreeVisualization data={treeData} />
                        </div>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-zinc-800/50 rounded-2xl bg-zinc-950/20">
                            <svg className="w-16 h-16 text-zinc-800 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                            <h3 className="text-xl font-medium text-zinc-400">No Codebase Loaded</h3>
                            <p className="text-zinc-600 mt-2">Use the sidebar to import a repository.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default App;
