import React from 'react';
import Tree from 'react-d3-tree';

// Custom Node rendering to distinguish files, folders, functions, and imports
const renderCustomNodeElement = ({ nodeDatum, toggleNode }) => {
    const type = nodeDatum.attributes?.type;
    
    let fillColor = '#10b981'; // Emerald for files
    let radius = 12;
    let strokeWidth = 3;

    if (type === 'tree') {
        fillColor = '#06b6d4'; // Cyan for folders
    } else if (type === 'function_group' || type === 'import_group') {
        fillColor = '#4b5563'; // Gray for groups
        radius = 8;
        strokeWidth = 2;
    } else if (type === 'function') {
        fillColor = '#a855f7'; // Purple for functions
        radius = 6;
        strokeWidth = 1;
    } else if (type === 'import') {
        fillColor = '#f59e0b'; // Amber for imports
        radius = 6;
        strokeWidth = 1;
    }

    return (
        <g onClick={toggleNode} className={type === 'tree' || type === 'function_group' || type === 'import_group' ? 'cursor-pointer' : ''}>
            <circle 
                r={radius} 
                fill={fillColor}
                stroke="#111827" 
                strokeWidth={strokeWidth}
            />
            <text 
                fill="#e5e7eb" 
                strokeWidth="0" 
                x={radius + 8} 
                dy="5"
                className={`font-mono ${type === 'function' || type === 'import' ? 'text-xs text-gray-400' : 'text-sm'}`}
            >
                {nodeDatum.name}
            </text>
            {type === 'blob' && nodeDatum.attributes?.size > 0 && (
                <text fill="#6b7280" x={radius + 8} dy="20" className="text-xs font-mono">
                    {(nodeDatum.attributes.size / 1024).toFixed(2)} KB
                </text>
            )}
        </g>
    );
};

export default function TreeVisualization({ data }) {
    if (!data) return null;

    return (
        <div className="w-full h-[600px] bg-black/60 backdrop-blur-md rounded-xl border border-gray-800 shadow-2xl overflow-hidden relative">
            <div className="absolute top-4 left-4 z-10 font-mono text-gray-500 text-sm flex flex-col gap-1">
                <div>Repository Architecture Node Map</div>
                <div className="flex items-center gap-4 mt-2 text-xs">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-cyan-500 inline-block"></span> Folder</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> File</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-purple-500 inline-block"></span> Function</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span> Import</span>
                </div>
            </div>
            
            <div style={{ width: '100%', height: '100%' }}>
                <Tree 
                    data={data} 
                    orientation="horizontal"
                    pathFunc="step"
                    renderCustomNodeElement={renderCustomNodeElement}
                    translate={{ x: 50, y: 300 }}
                    nodeSize={{ x: 300, y: 50 }}
                    zoomable={true}
                    collapsible={true}
                    initialDepth={1}
                />
            </div>
            
            <style jsx>{`
                .rd3t-link {
                    stroke: #374151 !important;
                    stroke-width: 2px !important;
                }
            `}</style>
        </div>
    );
}
