
import React, { useState } from 'react';
import { ContentDraft, Language } from '../types';
import { FileText, Calendar, CheckCircle, Edit3, Search, MoreHorizontal, Clock } from 'lucide-react';
import { getTranslation } from '../translations';
import { format } from 'date-fns';

interface DraftsListProps {
  drafts: ContentDraft[];
  language: Language;
  onEdit: (draft: ContentDraft) => void;
}

export const DraftsList: React.FC<DraftsListProps> = ({ drafts, language, onEdit }) => {
  const t = getTranslation(language);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const filtered = drafts.filter(d => {
      const matchesSearch = d.title.toLowerCase().includes(search.toLowerCase()) || d.content.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = filter === 'ALL' || d.status === filter.toLowerCase();
      return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
      switch(status) {
          case 'published': return <CheckCircle size={14} className="text-green-500" />;
          case 'scheduled': return <Clock size={14} className="text-blue-500" />;
          default: return <FileText size={14} className="text-zinc-400" />;
      }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
        case 'published': return t.statusPublished;
        case 'scheduled': return t.statusScheduled;
        default: return t.statusDraft;
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto font-mono">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2 tracking-tight uppercase">{t.draftsTitle}</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">{t.draftsSub}</p>
        </div>
      </div>

      <div className="flex gap-4 mb-8">
         <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-zinc-400" size={18} />
            <input
                type="text"
                placeholder="Search drafts..."
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-zinc-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors font-mono text-sm"
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
         </div>
         <select 
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-white focus:outline-none cursor-pointer font-bold text-xs uppercase tracking-wider"
            value={filter}
            onChange={e => setFilter(e.target.value)}
         >
             <option value="ALL">{t.allTypes}</option>
             <option value="DRAFT">{t.statusDraft}</option>
             <option value="SCHEDULED">{t.statusScheduled}</option>
             <option value="PUBLISHED">{t.statusPublished}</option>
         </select>
      </div>

      <div className="grid grid-cols-1 gap-4">
         {filtered.length === 0 ? (
             <div className="text-center py-20 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl">
                 <p className="text-zinc-500 font-bold uppercase tracking-wider text-sm">{t.noDraftsFound}</p>
             </div>
         ) : (
             filtered.map(draft => (
                 <div key={draft.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 flex items-center justify-between group hover:border-zinc-400 dark:hover:border-zinc-600 transition-all shadow-sm">
                     <div className="flex items-center gap-4 flex-1">
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                             draft.status === 'published' ? 'bg-green-50 dark:bg-green-900/20' :
                             draft.status === 'scheduled' ? 'bg-blue-50 dark:bg-blue-900/20' :
                             'bg-zinc-100 dark:bg-zinc-800'
                         }`}>
                             {getStatusIcon(draft.status)}
                         </div>
                         <div>
                             <h3 className="font-bold text-zinc-900 dark:text-white text-sm uppercase tracking-wide">{draft.title || "Untitled"}</h3>
                             <div className="flex items-center gap-3 mt-1">
                                 <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">{draft.platform}</span>
                                 <span className="text-[10px] text-zinc-400 font-mono">{format(new Date(draft.date), 'MMM d, yyyy')}</span>
                                 {draft.scheduledDate && (
                                     <span className="text-[10px] text-blue-500 font-mono flex items-center gap-1 font-bold">
                                         <Calendar size={10} /> {format(new Date(draft.scheduledDate), 'MMM d, HH:mm')}
                                     </span>
                                 )}
                             </div>
                         </div>
                     </div>
                     
                     <div className="flex items-center gap-4">
                         <div className={`px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider border ${
                             draft.status === 'published' ? 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' :
                             draft.status === 'scheduled' ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' :
                             'bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
                         }`}>
                             {getStatusLabel(draft.status)}
                         </div>
                         <button 
                            onClick={() => onEdit(draft)}
                            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                         >
                             <Edit3 size={16} />
                         </button>
                     </div>
                 </div>
             ))
         )}
      </div>
    </div>
  );
};
