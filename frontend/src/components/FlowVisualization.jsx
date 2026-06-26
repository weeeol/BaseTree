import React, { useMemo, useState } from 'react';
import { ReactFlow, Controls, Background } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CustomNode from './CustomNode';
import { transformTreeToFlow } from '../utils/layout';
import useStore from '../store/useStore';

const nodeTypes = {
  custom: CustomNode,
};

export default function FlowVisualization() {
  const { treeData, edges: dependencyEdges, searchQuery, filters, collapsedNodes, toggleCollapse } = useStore();
  const [hoveredNodeId, setHoveredNodeId] = useState(null);

  const { nodes, edges } = useMemo(() => {
    return transformTreeToFlow(treeData, dependencyEdges, searchQuery, filters, collapsedNodes, toggleCollapse);
  }, [treeData, dependencyEdges, searchQuery, filters, collapsedNodes, toggleCollapse]);

  const styledEdges = useMemo(() => {
    return edges.map(e => {
      if (e.data?.type === 'dependency') {
        const isHighlighted = hoveredNodeId && (e.source === hoveredNodeId || e.target === hoveredNodeId);
        return {
          ...e,
          animated: isHighlighted,
          style: {
            ...e.style,
            stroke: isHighlighted ? '#ec4899' : '#cbd5e1', // Pink when highlighted
            strokeWidth: isHighlighted ? 4 : 2,
          },
          zIndex: isHighlighted ? 1000 : 0,
        };
      }
      return e;
    });
  }, [edges, hoveredNodeId]);

  if (!treeData) return null;

  return (
    <div className="w-full h-full bg-white border-4 border-black brutalist-shadow overflow-hidden relative">
      <div className="absolute top-6 left-6 z-30 pointer-events-none">
        <h3 className="font-black text-black text-xl uppercase tracking-widest flex items-center gap-2 bg-yellow-300 px-3 py-1 border-3 border-black brutalist-shadow-sm inline-flex">
          <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          Architecture Canvas
        </h3>
        <p className="text-black font-bold text-xs mt-3 bg-white px-2 py-1 border-2 border-black inline-block brutalist-shadow-sm">Scroll to zoom. Drag to pan.</p>
      </div>
      
      <div style={{ width: '100%', height: '100%' }} className="relative z-10">
        <ReactFlow
          nodes={nodes}
          edges={styledEdges}
          nodeTypes={nodeTypes}
          onNodeMouseEnter={(_, node) => setHoveredNodeId(node.id)}
          onNodeMouseLeave={() => setHoveredNodeId(null)}
          fitView
          fitViewOptions={{ minZoom: 0.8, maxZoom: 1 }}
          minZoom={0.1}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#000" gap={24} size={2} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}
