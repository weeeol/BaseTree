import dagre from 'dagre';

export const getLayoutedElements = (nodes, edges, direction = 'LR') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const nodeHeight = 80;

  // Tighter vertical spacing between siblings (nodesep) and wider horizontal spacing between folders (ranksep)
  dagreGraph.setGraph({ rankdir: direction, ranksep: 400, nodesep: 30 });

  nodes.forEach((node) => {
    // Estimate width based on character count. Uppercase tracking-widest text takes about 9px per char.
    const isSmall = node.data.type === 'function' || node.data.type === 'import';
    const minWidth = isSmall ? 220 : 260;
    const padding = 80; // icons + internal padding + margins
    const textLength = node.data.label ? node.data.label.length : 10;
    
    // We cap width at 400px (our max-w-[400px] in CustomNode)
    const maxTextWidth = 400 - padding;
    const estimatedTextWidth = textLength * 9;
    
    const estimatedWidth = Math.min(400, Math.max(minWidth, estimatedTextWidth + padding));
    
    // If text wraps, increase height
    const lines = Math.max(1, Math.ceil(estimatedTextWidth / maxTextWidth));
    const baseHeight = isSmall ? 44 : 64;
    const estimatedHeight = baseHeight + ((lines - 1) * 20); // roughly 20px per wrapped line
    
    dagreGraph.setNode(node.id, { width: estimatedWidth, height: estimatedHeight });
    node.data.measuredWidth = estimatedWidth; // store just in case
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
      x: nodeWithPosition.x - nodeWithPosition.width / 2 + staircaseOffset,
      y: nodeWithPosition.y - nodeWithPosition.height / 2,
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
        style: { stroke: '#000', strokeWidth: 3 } // Brutalist edge
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
      style: { stroke: '#cbd5e1', strokeWidth: 2, strokeDasharray: '6,6' }, // Light gray dependency edge
      data: { type: 'dependency' }
    });
  });

  return getLayoutedElements(nodes, edges);
};
