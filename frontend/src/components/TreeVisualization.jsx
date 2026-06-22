import React from 'react';
import Tree from 'react-d3-tree';

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

const renderCustomNodeElement = ({ nodeDatum, toggleNode }) => {
    const type = nodeDatum.attributes?.type;
    const isFolder = type === 'tree';
    const isFile = type === 'blob';
    const isFunction = type === 'function';
    const isImport = type === 'import';
    const isGroup = type === 'function_group' || type === 'import_group';

    // Different sizing based on type
    const width = isFunction || isImport ? 180 : 220;
    const height = isFunction || isImport ? 36 : 48;
    const x = -width / 2;
    const y = -height / 2;

    let content = null;

    if (isFolder || isFile || isGroup) {
        content = (
            <div 
                className={`flex items-center w-full h-full px-4 rounded-xl border shadow-lg transition-colors cursor-pointer ${
                    isFolder ? 'bg-zinc-900 border-indigo-500/30 hover:border-indigo-400 shadow-indigo-900/20' : 
                    isGroup ? 'bg-zinc-800 border-zinc-700 hover:border-zinc-500 text-xs' :
                    'bg-zinc-900 border-zinc-800 hover:border-zinc-600'
                }`}
                onClick={toggleNode}
            >
                <div className="flex-shrink-0 mr-3">
                    {isFolder ? Icons.folder : isGroup ? null : Icons.file}
                </div>
                <div className="flex flex-col truncate">
                    <span className={`font-semibold truncate ${isFolder ? 'text-indigo-100 text-sm' : isGroup ? 'text-zinc-400 uppercase tracking-widest text-[10px]' : 'text-zinc-200 text-sm'}`}>
                        {nodeDatum.name}
                    </span>
                    {isFile && nodeDatum.attributes?.size > 0 && (
                        <span className="text-zinc-500 text-[10px] font-mono mt-0.5">
                            {(nodeDatum.attributes.size / 1024).toFixed(2)} KB
                        </span>
                    )}
                </div>
            </div>
        );
    } else {
        // Pills for functions and imports
        content = (
            <div 
                className={`flex items-center w-full h-full px-3 rounded-full border shadow-sm ${
                    isFunction ? 'bg-purple-950/30 border-purple-900/50 text-purple-200' : 
                    'bg-amber-950/30 border-amber-900/50 text-amber-200'
                }`}
            >
                <div className="flex-shrink-0 mr-2">
                    {isFunction ? Icons.function : Icons.import}
                </div>
                <span className="font-mono text-xs truncate">
                    {nodeDatum.name}
                </span>
            </div>
        );
    }

    return (
        <foreignObject width={width} height={height} x={x} y={y}>
            {content}
        </foreignObject>
    );
};

export default function TreeVisualization({ data }) {
    if (!data) return null;

    return (
        <div className="w-full h-full bg-zinc-950/80 backdrop-blur-3xl rounded-2xl border border-zinc-800/60 shadow-2xl overflow-hidden relative">
            <div className="absolute top-6 left-6 z-10">
                <h3 className="font-semibold text-zinc-100 text-lg flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    Architecture Canvas
                </h3>
                <p className="text-zinc-500 text-xs mt-1">Scroll to zoom, drag to pan. Click nodes to expand.</p>
            </div>
            
            <div style={{ width: '100%', height: '100%' }}>
                <Tree 
                    data={data} 
                    orientation="horizontal"
                    pathFunc="diagonal" // Smooth bezier curves
                    renderCustomNodeElement={renderCustomNodeElement}
                    translate={{ x: 100, y: 350 }}
                    nodeSize={{ x: 300, y: 80 }} // Increased spacing for cards
                    separation={{ siblings: 1, nonSiblings: 1.2 }}
                    zoomable={true}
                    collapsible={true}
                    initialDepth={1}
                />
            </div>
            
            <style jsx>{`
                .rd3t-link {
                    stroke: #3f3f46 !important; /* zinc-700 */
                    stroke-width: 1.5px !important;
                    fill: none !important;
                }
            `}</style>
        </div>
    );
}
