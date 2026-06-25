import React, { useState, useEffect } from 'react';
import { Command } from 'cmdk';
import { Search, Folder, File, Code2, Import } from 'lucide-react';
import useStore from '../store/useStore';

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const { treeData, setSearchQuery } = useStore();

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
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-3 bg-zinc-900/90 backdrop-blur-xl border border-zinc-700/50 hover:border-zinc-500 rounded-full px-4 py-2 shadow-2xl shadow-black/50 text-zinc-400 hover:text-zinc-200 transition-all group"
        >
          <Search className="w-4 h-4" />
          <span className="text-sm">Search codebase...</span>
          <kbd className="hidden sm:inline-flex items-center gap-1 bg-zinc-800 border border-zinc-700 rounded px-1.5 py-0.5 text-[10px] font-mono text-zinc-300">
            <span className="text-[12px]">⌘</span>K
          </kbd>
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-md pointer-events-auto p-4 transition-all">
          <div 
            className="absolute inset-0 z-[-1]" 
            onClick={() => setOpen(false)}
          />
          <Command 
            className="w-full max-w-2xl bg-zinc-950/90 backdrop-blur-2xl border border-zinc-800/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col ring-1 ring-white/5"
            onKeyDown={(e) => {
              if (e.key === 'Escape') setOpen(false);
            }}
          >
            <div className="flex items-center px-4 border-b border-zinc-800">
              <Search className="w-5 h-5 text-zinc-500 mr-2 shrink-0" />
              <Command.Input 
                autoFocus
                placeholder="Search for files, functions, imports..." 
                className="w-full bg-transparent border-none py-4 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-0"
              />
              <kbd className="hidden sm:inline-flex items-center gap-1 bg-zinc-800 border border-zinc-700 rounded px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
                ESC
              </kbd>
            </div>

            <Command.List className="max-h-[60vh] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
              <Command.Empty className="py-10 text-center text-sm text-zinc-500">
                No results found.
              </Command.Empty>

              <Command.Group heading="Codebase" className="text-xs font-medium text-zinc-500 px-2 py-3 [&_[cmdk-group-heading]]:mb-2 [&_[cmdk-group-heading]]:px-2">
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
                      className="flex items-center gap-3 px-3 py-3 text-sm text-zinc-200 rounded-lg cursor-pointer aria-selected:bg-indigo-500/10 aria-selected:text-indigo-200 group transition-colors"
                    >
                      <Icon className="w-4 h-4 text-zinc-500 group-aria-selected:text-indigo-400" />
                      <span className="truncate">{item.name}</span>
                      <span className="ml-auto text-xs text-zinc-600 font-mono hidden sm:block truncate max-w-[200px]">
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
