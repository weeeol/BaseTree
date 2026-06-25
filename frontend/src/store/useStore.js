import { create } from 'zustand';

const useStore = create((set) => ({
  treeData: null,
  edges: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  hasExperimentalLanguages: false,

  setSearchQuery: (query) => set({ searchQuery: query }),
  clearError: () => set({ error: null }),

  fetchTreeUrl: async (url) => {
    set({ isLoading: true, error: null, searchQuery: '' });
    
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
    set({ isLoading: true, error: null, searchQuery: '' });

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
