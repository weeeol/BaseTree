import React, { useState } from 'react';

export default function InputComponent({ onFetchTree, isLoading }) {
    const [url, setUrl] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (url) {
            onFetchTree(url);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto mb-12">
            <form 
                onSubmit={handleSubmit} 
                className="relative flex items-center w-full bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/80 p-2 rounded-2xl shadow-2xl shadow-black/50 transition-all hover:border-zinc-700 focus-within:border-indigo-500/50 focus-within:ring-4 focus-within:ring-indigo-500/10"
            >
                <div className="absolute left-6 text-zinc-500 pointer-events-none">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                </div>
                <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Paste GitHub Repository URL..."
                    className="w-full bg-transparent text-zinc-100 pl-14 pr-4 py-3 outline-none placeholder-zinc-500 font-medium text-lg"
                    required
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-zinc-100 text-zinc-900 hover:bg-white font-semibold px-6 py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center min-w-[140px] shadow-sm shadow-white/10"
                >
                    {isLoading ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Parsing...
                        </span>
                    ) : (
                        'Visualize'
                    )}
                </button>
            </form>
        </div>
    );
}
