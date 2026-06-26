import React, { useState, useEffect } from 'react';
import { Command } from 'cmdk';
import { Search, Folder, File, Code2, Import, X } from 'lucide-react';
import useStore from '../store/useStore';

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const { treeData, setSearchQuery, searchQuery } = useStore();

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  if (!treeData) return null;

  // Flatten treeData to make it searchable by cmdk
  const items = [];
  const traverse = (node) => {
    if (!node) return;
    
    items.push({
      id: node.attributes?.path || node.name,
      name: node.name,
      type: node.attributes?.type || 'unknown',
    });

    if (node.children) {
      node.children.forEach(traverse);
    }
  };
  traverse(treeData);

  return (
    <>
      {/* ⌘K trigger button (Optional visual cue) */}
      <div className="absolute top-6 right-6 z-40 pointer-events-auto flex gap-2">
        {searchQuery ? (
          <button
            onClick={() => setSearchQuery('')}
            className="flex items-center gap-3 bg-red-400 border-4 border-black px-6 py-3 brutalist-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black transition-all group"
          >
            <X className="w-5 h-5 stroke-black stroke-[3]" />
            <span className="text-sm font-black uppercase tracking-widest">Clear Search</span>
          </button>
        ) : (
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-3 bg-yellow-300 border-4 border-black px-6 py-3 brutalist-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black transition-all group"
          >
            <Search className="w-5 h-5 stroke-black stroke-[3]" />
            <span className="text-sm font-black uppercase tracking-widest">Search codebase...</span>
            <kbd className="hidden sm:inline-flex items-center gap-1 bg-white border-2 border-black rounded-none px-2 py-0.5 text-xs font-black text-black">
              <span>⌘</span>K
            </kbd>
          </button>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-white/80 backdrop-blur-md pointer-events-auto p-4 transition-all">
          <div 
            className="absolute inset-0 z-[-1]" 
            onClick={() => setOpen(false)}
          />
          <Command 
            className="w-full max-w-2xl bg-white border-4 border-black brutalist-shadow overflow-hidden flex flex-col"
            onKeyDown={(e) => {
              if (e.key === 'Escape') setOpen(false);
            }}
          >
            <div className="flex items-center px-4 border-b-4 border-black bg-cyan-300">
              <Search className="w-6 h-6 text-black mr-2 shrink-0 stroke-[3]" />
              <Command.Input 
                autoFocus
                placeholder="Search for files, functions, imports..." 
                className="w-full bg-transparent border-none py-5 text-base font-black text-black placeholder-gray-600 focus:outline-none focus:ring-0 uppercase tracking-wider"
              />
              <kbd className="hidden sm:inline-flex items-center gap-1 bg-white border-2 border-black px-2 py-0.5 text-xs font-black text-black">
                ESC
              </kbd>
            </div>

            <Command.List className="max-h-[60vh] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-black scrollbar-track-transparent">
              <Command.Empty className="py-10 text-center text-sm font-bold text-black uppercase tracking-widest">
                No results found.
              </Command.Empty>

              <Command.Group heading="Codebase" className="text-xs font-black text-gray-500 px-2 py-3 uppercase tracking-widest [&_[cmdk-group-heading]]:mb-2 [&_[cmdk-group-heading]]:px-2">
                {items.map((item, index) => {
                  let Icon = File;
                  if (item.type === 'tree') Icon = Folder;
                  if (item.type === 'function') Icon = Code2;
                  if (item.type === 'import') Icon = Import;

                  return (
                    <Command.Item
                      key={`${item.id}-${index}`}
                      value={item.name}
                      onSelect={(val) => {
                        setSearchQuery(item.name);
                        setOpen(false);
                      }}
                      className="flex items-center gap-3 px-3 py-3 text-sm font-bold text-black border-2 border-transparent cursor-pointer aria-selected:bg-yellow-300 aria-selected:border-black aria-selected:brutalist-shadow-sm group transition-all mb-1"
                    >
                      <Icon className="w-5 h-5 text-gray-500 group-aria-selected:text-black stroke-[2.5]" />
                      <span className="truncate">{item.name}</span>
                      <span className="ml-auto text-xs text-gray-500 font-black hidden sm:block truncate max-w-[200px] uppercase group-aria-selected:text-black">
                        {item.type}
                      </span>
                    </Command.Item>
                  );
                })}
              </Command.Group>
            </Command.List>
          </Command>
        </div>
      )}
    </>
  );
}
