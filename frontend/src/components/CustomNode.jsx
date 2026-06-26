import React from 'react';
import { Handle, Position } from '@xyflow/react';

const Icons = {
    folder: (
        <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
    ),
    file: (
        <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
    ),
    function: (
        <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
    ),
    import: (
        <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
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
            <div className={`flex items-center min-w-[260px] max-w-[400px] w-max min-h-[64px] h-fit py-3 px-5 border-3 border-black brutalist-shadow-sm transition-all duration-300 bg-white ${opacityClass} ${
                isFolder ? 'bg-cyan-300' : 
                isGroup ? 'bg-yellow-300' :
                'bg-white'
            }`}>
                <div className="flex-shrink-0 mr-4">
                    {isFolder ? Icons.folder : isGroup ? null : Icons.file}
                </div>
                <div className="flex flex-col">
                    <span className={`font-black text-black uppercase tracking-widest whitespace-normal break-words pr-2 ${isFolder ? 'text-base' : isGroup ? 'text-xs' : 'text-sm'}`}>
                        {label}
                    </span>
                    {isFile && size > 0 && (
                        <span className="text-gray-600 text-[10px] font-bold mt-0.5">
                            {(size / 1024).toFixed(2)} KB
                        </span>
                    )}
                </div>
            </div>
        );
    } else {
        content = (
            <div className={`flex items-center min-w-[220px] max-w-[400px] w-max min-h-[44px] h-fit py-2 px-4 border-3 border-black brutalist-shadow-sm transition-all duration-300 ${opacityClass} ${
                isFunction ? 'bg-purple-300 text-black' : 
                'bg-green-300 text-black'
            }`}>
                <div className="flex-shrink-0 mr-3">
                    {isFunction ? Icons.function : Icons.import}
                </div>
                <span className="font-black text-sm uppercase tracking-widest whitespace-normal break-words pr-2">
                    {label}
                </span>
            </div>
        );
    }

    return (
        <>
            <Handle type="target" position={Position.Left} className="w-3 h-3 bg-black border-2 border-white rounded-none brutalist-shadow-sm" />
            {content}
            <Handle type="source" position={Position.Right} className="w-3 h-3 bg-white border-2 border-black rounded-none brutalist-shadow-sm" />
        </>
    );
}
