import dagre from 'dagre';

export const getLayoutedElements = (nodes, edges, direction = 'LR') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const nodeWidth = 240;
  const nodeHeight = 60;

  // Tighter vertical spacing between siblings (nodesep) and wider horizontal spacing between folders (ranksep)
  dagreGraph.setGraph({ rankdir: direction, ranksep: 200, nodesep: 15 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    // Only layout using structural edges, ignore dependency edges for layout computation to prevent hairballs
    if (edge.type !== 'dependency') {
        dagreGraph.setEdge(edge.source, edge.target);
    }
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = direction === 'LR' ? 'left' : 'top';
    node.sourcePosition = direction === 'LR' ? 'right' : 'bottom';
    
    // Create a subtle staircase effect for leaf nodes (files/functions) 
    // so they don't form a perfectly straight vertical line
    let staircaseOffset = 0;
    if (node.data.isLeaf) {
        // Shift right by 15px per sibling, resetting every 8 nodes to avoid overflowing into the next layer
        staircaseOffset = (node.data.siblingIndex % 8) * 20;
    }

    // Shift dagre node position (anchor=center) to top left for React Flow
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2 + staircaseOffset,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
    return node;
  });

  return { nodes, edges };
};

export const transformTreeToFlow = (treeData, dependencyEdges = [], searchQuery = '') => {
  const nodes = [];
  const edges = [];
  
  if (!treeData) return { nodes, edges };

  let nodeIdCounter = 0;

  // Flatten tree recursively
  const traverse = (node, parentId = null, siblingIndex = 0) => {
    const id = node.attributes?.path || `group-${nodeIdCounter++}`;
    
    let isMatch = true;
    if (searchQuery && searchQuery.trim() !== '') {
        isMatch = node.name.toLowerCase().includes(searchQuery.toLowerCase());
    }

    nodes.push({
      id: id,
      type: 'custom',
      data: { 
        label: node.name, 
        type: node.attributes?.type,
        size: node.attributes?.size,
        path: node.attributes?.path,
        isMatch,
        siblingIndex,
        isLeaf: !node.children || node.children.length === 0
      },
      position: { x: 0, y: 0 } // Computed later by dagre
    });

    if (parentId) {
      edges.push({
        id: `e-${parentId}-${id}`,
        source: parentId,
        target: id,
        type: 'smoothstep',
        style: { stroke: '#52525b', strokeWidth: 1.5 } // zinc-600
      });
    }

    if (node.children) {
      node.children.forEach((child, index) => traverse(child, id, index));
    }
  };

  traverse(treeData);

  // Add dependency edges
  dependencyEdges.forEach((edge, index) => {
    edges.push({
      id: `dep-${index}`,
      source: edge.source,
      target: edge.target,
      type: 'bezier',
      style: { stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '5,5' }, // amber-500
      data: { type: 'dependency' }
    });
  });

  return getLayoutedElements(nodes, edges);
};
