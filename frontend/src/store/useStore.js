import { create } from 'zustand';

const useStore = create((set) => ({
  treeData: null,
  edges: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  hasExperimentalLanguages: false,
  filters: {
    hideImports: false,
    hideTests: false,
  },
  collapsedNodes: new Set(),

  toggleCollapse: (nodeId) => set((state) => {
    const newCollapsed = new Set(state.collapsedNodes);
    if (newCollapsed.has(nodeId)) {
      newCollapsed.delete(nodeId);
    } else {
      newCollapsed.add(nodeId);
    }
    return { collapsedNodes: newCollapsed };
  }),
  expandAll: () => set({ collapsedNodes: new Set() }),
  collapseAll: () => set((state) => {
    const allGroupIds = new Set();
    const collectIds = (node) => {
        if (!node) return;
        const type = node.attributes?.type;
        if (type === 'tree' || type === 'function_group' || type === 'import_group' || type === 'class_group') {
            const id = node.attributes?.path;
            if (id) allGroupIds.add(id);
        }
        if (node.children) node.children.forEach(collectIds);
    };
    collectIds(state.treeData);
    return { collapsedNodes: allGroupIds };
  }),

  setFilter: (key, value) => set((state) => ({ 
    filters: { ...state.filters, [key]: value } 
  })),
  setSearchQuery: (query) => set({ searchQuery: query }),
  clearError: () => set({ error: null }),

  fetchTreeUrl: async (url) => {
    set({ isLoading: true, error: null, searchQuery: '', collapsedNodes: new Set() });
    
    try {
      const response = await fetch('http://localhost:3001/api/tree', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch repository data');
      
      set({ 
        treeData: data.tree, 
        edges: data.edges || [],
        hasExperimentalLanguages: data.hasExperimentalLanguages || false,
        isLoading: false
      });
    } catch (err) {
      console.error(err);
      set({ error: err.message, isLoading: false });
    }
  },

  uploadZip: async (file) => {
    set({ isLoading: true, error: null, searchQuery: '', collapsedNodes: new Set() });

    try {
      const formData = new FormData();
      formData.append('zipfile', file);

      const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to process ZIP file');
      
      set({ 
        treeData: data.tree, 
        edges: data.edges || [],
        hasExperimentalLanguages: data.hasExperimentalLanguages || false,
        isLoading: false
      });
    } catch (err) {
      console.error(err);
      set({ error: err.message, isLoading: false });
    }
  }
}));

export default useStore;
