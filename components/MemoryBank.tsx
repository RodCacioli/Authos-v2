
import React, { useState, useMemo } from 'react';
import { Memory, MemoryType, UserProfile, Language } from '../types';
import { Search, Tag, Filter, ArrowRight, Edit2, Trash2, X, Check, Mic, Database, Layers, ArrowDownAZ, ArrowUpAZ, Calendar, Save } from 'lucide-react';
import { getTranslation } from '../translations';

interface MemoryBankProps {
  profile?: UserProfile;
  memories: Memory[];
  language: Language;
  onUseMemory: (memory: Memory) => void;
  onUpdateMemory: (memory: Memory) => void;
  onDeleteMemory: (id: string) => void;
}

type SortOrder = 'NEWEST' | 'OLDEST';

export const MemoryBank: React.FC<MemoryBankProps> = ({ 
    memories, language, 
    onUseMemory, onUpdateMemory, onDeleteMemory
}) => {
  const t = getTranslation(language);
  
  // --- FILTER & SORT STATE ---
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<SortOrder>('NEWEST');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // --- EDITING STATE ---
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  // --- LOGIC ---
  const startEdit = (memory: Memory) => {
      setEditingId(memory.id);
      setEditContent(memory.content);
  };

  const saveEdit = (memory: Memory) => {
      onUpdateMemory({ ...memory, content: editContent });
      setEditingId(null);
      setEditContent('');
  };

  // Extract unique tags
  const allTags = useMemo(() => {
      const tags = new Set<string>();
      memories.forEach(m => m.tags.forEach(t => tags.add(t)));
      return Array.from(tags).sort();
  }, [memories]);

  // Filter & Sort Logic
  const filteredMemories = useMemo(() => {
      return memories
      .filter(m => {
        if (m.type === MemoryType.STYLE_REFERENCE) return false; // Hide style refs (moved to TrainBrain)
        if (m.type === MemoryType.PERSONA) return false; // Hide personas (moved to TrainBrain)
        
        const matchesSearch = m.title.toLowerCase().includes(search.toLowerCase()) || m.content.toLowerCase().includes(search.toLowerCase());
        const matchesType = filterType === 'ALL' || m.type === filterType;
        const matchesTag = selectedTag ? m.tags.includes(selectedTag) : true;
        
        return matchesSearch && matchesType && matchesTag;
      })
      .sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return sortOrder === 'NEWEST' ? dateB - dateA : dateA - dateB;
      });
  }, [memories, search, filterType, sortOrder, selectedTag]);

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24 font-mono">
      
      {/* Database Statistics Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
             <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2 tracking-tight uppercase flex items-center gap-3">
                <Database className="text-zinc-400" />
                {t.bankTitle}
             </h2>
             <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl text-sm">{t.bankDescription}</p>
        </div>
        <div className="flex gap-4">
            <div className="bg-white dark:bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-center">
                <span className="block text-2xl font-bold text-zinc-900 dark:text-white">{filteredMemories.length}</span>
                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Items Found</span>
            </div>
            <div className="bg-white dark:bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-center">
                <span className="block text-2xl font-bold text-zinc-900 dark:text-white">{allTags.length}</span>
                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Unique Tags</span>
            </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 mb-8 sticky top-0 z-20 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row gap-4">
            
            {/* Search */}
            <div className="relative flex-1">
                <Search className="absolute left-3 top-3 text-zinc-400" size={18} />
                <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-zinc-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors font-mono text-sm"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {/* Type Filter */}
            <div className="relative min-w-[180px]">
                <Filter className="absolute left-3 top-3 text-zinc-400 pointer-events-none" size={16} />
                <select
                    className="w-full appearance-none bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-zinc-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white cursor-pointer transition-colors text-xs font-bold uppercase tracking-wider font-mono"
                    value={filterType}
                    onChange={e => setFilterType(e.target.value)}
                >
                    <option value="ALL">{t.allTypes}</option>
                    <option value={MemoryType.STORY}>Story</option>
                    <option value={MemoryType.BELIEF}>Belief</option>
                    <option value={MemoryType.FAILURE}>Failure</option>
                    <option value={MemoryType.LESSON}>Lesson</option>
                    <option value={MemoryType.ANALOGY}>Analogy</option>
                    <option value={MemoryType.EMOTION}>Emotion</option>
                    <option value={MemoryType.FACT}>Fact</option>
                </select>
            </div>

            {/* Sort Order */}
            <div className="relative min-w-[180px]">
                <Calendar className="absolute left-3 top-3 text-zinc-400" size={16} />
                <select
                    className="w-full appearance-none bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-zinc-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white cursor-pointer transition-colors text-xs font-bold uppercase tracking-wider font-mono"
                    value={sortOrder}
                    onChange={e => setSortOrder(e.target.value as SortOrder)}
                >
                    <option value="NEWEST">{t.newestFirst}</option>
                    <option value="OLDEST">{t.oldestFirst}</option>
                </select>
            </div>
          </div>

          {/* Tag Cloud */}
          {allTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] font-bold uppercase text-zinc-400 py-1 tracking-wider">{t.filterTags}:</span>
                  <button 
                    onClick={() => setSelectedTag(null)}
                    className={`text-[10px] px-2 py-1 rounded-sm border transition-colors font-bold uppercase tracking-wider ${!selectedTag ? 'bg-black text-white dark:bg-white dark:text-black border-transparent' : 'bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-400'}`}
                  >
                      ALL
                  </button>
                  {allTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                        className={`text-[10px] px-2 py-1 rounded-sm border transition-colors font-bold uppercase tracking-wider ${selectedTag === tag ? 'bg-black text-white dark:bg-white dark:text-black border-transparent' : 'bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-400'}`}
                      >
                          #{tag}
                      </button>
                  ))}
              </div>
          )}
      </div>

      {/* Memory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMemories.length === 0 ? (
              <div className="col-span-full text-center py-20 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                  <Database size={48} className="mx-auto text-zinc-300 mb-4" />
                  <p className="text-zinc-500 font-bold uppercase tracking-wider">{t.noMemories}</p>
              </div>
          ) : (
              filteredMemories.map(memory => (
                  <div key={memory.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 hover:shadow-lg transition-all flex flex-col group relative">
                      
                      {/* Card Header */}
                      <div className="flex justify-between items-start mb-4">
                          <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                              {memory.type}
                          </span>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {editingId === memory.id ? (
                                  <>
                                    <button onClick={() => saveEdit(memory)} className="p-1.5 bg-green-100 dark:bg-green-900/20 text-green-600 rounded hover:bg-green-200 dark:hover:bg-green-900/40"><Check size={14}/></button>
                                    <button onClick={() => setEditingId(null)} className="p-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded hover:bg-zinc-200"><X size={14}/></button>
                                  </>
                              ) : (
                                  <>
                                    <button onClick={() => startEdit(memory)} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-blue-500 rounded transition-colors"><Edit2 size={14}/></button>
                                    <button onClick={() => { if(window.confirm(t.confirmDelete)) onDeleteMemory(memory.id) }} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-red-500 rounded transition-colors"><Trash2 size={14}/></button>
                                  </>
                              )}
                          </div>
                      </div>

                      {/* Card Content */}
                      <div className="flex-1 mb-4">
                          <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-2 leading-tight">{memory.title}</h3>
                          {editingId === memory.id ? (
                              <textarea 
                                className="w-full h-32 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded p-2 text-xs font-mono resize-none focus:outline-none focus:border-black dark:focus:border-white"
                                value={editContent}
                                onChange={e => setEditContent(e.target.value)}
                              />
                          ) : (
                              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono leading-relaxed line-clamp-4">
                                  {memory.content}
                              </p>
                          )}
                      </div>

                      {/* Card Footer */}
                      <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/50 mt-auto">
                          <div className="flex flex-wrap gap-2 mb-4">
                              {memory.tags.slice(0, 3).map(tag => (
                                  <span key={tag} className="text-[9px] text-zinc-400 uppercase font-bold tracking-wider">#{tag}</span>
                              ))}
                          </div>
                          <button 
                            onClick={() => onUseMemory(memory)}
                            className="w-full py-3 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-400 dark:hover:border-zinc-600 transition-all flex items-center justify-center gap-2 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-800"
                          >
                              {t.createContentFromMemory} <ArrowRight size={12}/>
                          </button>
                      </div>
                  </div>
              ))
          )}
      </div>
    </div>
  );
};
