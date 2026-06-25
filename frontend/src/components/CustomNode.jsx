import React from 'react';
import { Handle, Position } from '@xyflow/react';

const Icons = {
    folder: (
        <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
    ),
    file: (
        <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
    ),
    function: (
        <svg className="w-3 h-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
    ),
    import: (
        <svg className="w-3 h-3 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
    )
};

export default function CustomNode({ data }) {
    const { label, type, size, isMatch } = data;
    const isFolder = type === 'tree';
    const isFile = type === 'blob';
    const isFunction = type === 'function';
    const isImport = type === 'import';
    const isGroup = type === 'function_group' || type === 'import_group';

    const opacityClass = isMatch !== false ? 'opacity-100' : 'opacity-20 grayscale';

    let content = null;

    if (isFolder || isFile || isGroup) {
        content = (
            <div className={`flex items-center w-[220px] h-[48px] px-4 rounded-xl border shadow-lg transition-all duration-300 ${opacityClass} ${
                isFolder ? 'bg-zinc-900 border-indigo-500/30 hover:border-indigo-400 shadow-indigo-900/20' : 
                isGroup ? 'bg-zinc-800 border-zinc-700 hover:border-zinc-500 text-xs' :
                'bg-zinc-900 border-zinc-800 hover:border-zinc-600'
            }`}>
                <div className="flex-shrink-0 mr-3">
                    {isFolder ? Icons.folder : isGroup ? null : Icons.file}
                </div>
                <div className="flex flex-col truncate">
                    <span className={`font-semibold truncate ${isFolder ? 'text-indigo-100 text-sm' : isGroup ? 'text-zinc-400 uppercase tracking-widest text-[10px]' : 'text-zinc-200 text-sm'}`}>
                        {label}
                    </span>
                    {isFile && size > 0 && (
                        <span className="text-zinc-500 text-[10px] font-mono mt-0.5">
                            {(size / 1024).toFixed(2)} KB
                        </span>
                    )}
                </div>
            </div>
        );
    } else {
        content = (
            <div className={`flex items-center w-[180px] h-[36px] px-3 rounded-full border shadow-sm transition-all duration-300 ${opacityClass} ${
                isFunction ? 'bg-purple-950/30 border-purple-900/50 text-purple-200' : 
                'bg-amber-950/30 border-amber-900/50 text-amber-200'
            }`}>
                <div className="flex-shrink-0 mr-2">
                    {isFunction ? Icons.function : Icons.import}
                </div>
                <span className="font-mono text-xs truncate">
                    {label}
                </span>
            </div>
        );
    }

    return (
        <>
            <Handle type="target" position={Position.Left} className="w-2 h-2 bg-zinc-600 border-none" />
            {content}
            <Handle type="source" position={Position.Right} className="w-2 h-2 bg-indigo-500 border-none" />
        </>
    );
}
