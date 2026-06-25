import React, { useMemo } from 'react';
import { ReactFlow, MiniMap, Controls, Background } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CustomNode from './CustomNode';
import { transformTreeToFlow } from '../utils/layout';
import useStore from '../store/useStore';

const nodeTypes = {
  custom: CustomNode,
};

export default function FlowVisualization() {
  const { treeData, edges: dependencyEdges, searchQuery } = useStore();

  const { nodes, edges } = useMemo(() => {
    return transformTreeToFlow(treeData, dependencyEdges, searchQuery);
  }, [treeData, dependencyEdges, searchQuery]);

  if (!treeData) return null;

  return (
    <div className="w-full h-full bg-zinc-950/80 backdrop-blur-3xl rounded-2xl border border-zinc-800/60 shadow-2xl overflow-hidden relative">
      <div className="absolute top-6 left-6 z-30 pointer-events-none">
        <h3 className="font-semibold text-zinc-100 text-lg flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          Architecture Canvas
        </h3>
        <p className="text-zinc-500 text-xs mt-1">Scroll to zoom. Drag to pan.</p>
      </div>
      
      <div style={{ width: '100%', height: '100%' }} className="relative z-10">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.1}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#3f3f46" gap={16} />
          <Controls className="bg-zinc-900 border border-zinc-800 fill-zinc-400" />
          <MiniMap 
            nodeColor={(n) => {
              if (n.data?.type === 'tree') return '#818cf8'; // indigo-400
              if (n.data?.type === 'function') return '#c084fc'; // purple-400
              return '#a1a1aa'; // zinc-400
            }}
            maskColor="rgba(24, 24, 27, 0.5)"
            className="bg-zinc-950 border border-zinc-800"
          />
        </ReactFlow>
      </div>
    </div>
  );
}
