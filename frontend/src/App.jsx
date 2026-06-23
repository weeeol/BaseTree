import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import TreeVisualization from './components/TreeVisualization';

function App() {
    const [treeData, setTreeData] = useState(null);
    const [edges, setEdges] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const handleFetchTreeUrl = async (url) => {
        setIsLoading(true);
        setError(null);
        setSearchQuery('');
        
        try {
            const response = await fetch('http://localhost:3001/api/tree', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to fetch repository data');
            setTreeData(data.tree);
            setEdges(data.edges || []);
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
        setSearchQuery('');

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
            setEdges(data.edges || []);
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
                <div className="absolute top-0 left-0 w-full p-6 pointer-events-none z-20 flex justify-between items-start">
                    <div>
                        {error && (
                            <div className="inline-block px-4 py-2 bg-red-950/80 border border-red-900/50 rounded-lg text-red-400 text-sm shadow-xl backdrop-blur-md pointer-events-auto">
                                [Error] {error}
                            </div>
                        )}
                    </div>

                    {/* Search Bar */}
                    {treeData && (
                        <div className="pointer-events-auto flex items-center bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/50 rounded-xl px-4 py-2.5 shadow-2xl shadow-black/50 w-80 focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                            <svg className="w-4 h-4 text-zinc-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input 
                                type="text"
                                placeholder="Search files, functions, etc..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-transparent border-none text-sm text-zinc-200 focus:outline-none w-full placeholder-zinc-500"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="text-zinc-500 hover:text-zinc-300 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex-1 w-full h-full p-6 relative z-10">
                    {treeData ? (
                        <div className="w-full h-full animate-in fade-in zoom-in-95 duration-500 ease-out">
                            {(() => {
                                const filterTree = (node, query) => {
                                    if (!node) return null;
                                    const isMatch = node.name.toLowerCase().includes(query.toLowerCase());
                                    
                                    if (node.children) {
                                        const filteredChildren = node.children
                                            .map(child => filterTree(child, query))
                                            .filter(Boolean);
                                            
                                        if (isMatch || filteredChildren.length > 0) {
                                            return {
                                                ...node,
                                                children: filteredChildren.length > 0 ? filteredChildren : undefined,
                                                // React-d3-tree reads this property to force expand
                                                __rd3t: { expanded: true }
                                            };
                                        }
                                        return null;
                                    }
                                    
                                    return isMatch ? node : null;
                                };

                                const displayData = (searchQuery && searchQuery.trim() !== '') 
                                    ? filterTree(treeData, searchQuery) 
                                    : treeData;

                                // If search is active but no results, we should handle that gracefully
                                // Or we just pass the filtered data
                                return displayData ? (
                                    <TreeVisualization 
                                        key={searchQuery ? 'searching' : 'idle'} // Force remount to apply expansion depth
                                        data={displayData} 
                                        edges={edges} 
                                        searchQuery={searchQuery} 
                                        isSearching={!!searchQuery}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-500">
                                        No matching files or functions found.
                                    </div>
                                );
                            })()}
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
