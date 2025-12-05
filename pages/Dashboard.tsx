
import React, { useState, useEffect } from 'react';
import { Memory, UserProfile, AppView, ContentDraft, Language, NewsItem, Product, MemoryType } from '../types';
import { Plus, Zap, Database, FileText, Cpu, Target, CheckCircle, Search, Globe, ChevronLeft, ChevronRight, BrainCircuit, PenTool, MessageSquare, Calendar, ShoppingBag, Feather } from 'lucide-react';
import { getTranslation } from '../translations';
import { isSameDay } from 'date-fns';

interface DashboardProps {
  profile: UserProfile;
  memories: Memory[];
  drafts: ContentDraft[];
  products?: Product[];
  onAddMemory: (memory: Memory) => void;
  onChangeView: (view: AppView) => void;
  onSelectNews: (news: NewsItem) => void;
  language: Language;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
    profile, memories, drafts, products = [], 
    onAddMemory, onChangeView, onSelectNews, 
    language 
}) => {
  const t = getTranslation(language);
  
  // Tips State
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const tips = t.tips || [];

  // Calculate Content Score
  const totalMemories = memories.length;
  const totalProducts = products.length;
  const totalDrafts = drafts.length;
  const publishedOrScheduled = drafts.filter(d => d.status === 'published' || d.status === 'scheduled').length;
  const contentScore = (totalMemories * 5) + (totalProducts * 20) + (totalDrafts * 10) + (publishedOrScheduled * 50);

  // --- DYNAMIC DAILY PROTOCOL LOGIC ---
  const today = new Date();
  
  // 1. Calculate today's stats
  const memoriesToday = memories.filter(m => isSameDay(new Date(m.createdAt), today) && m.type !== MemoryType.STYLE_REFERENCE).length;
  const styleRefsToday = memories.filter(m => isSameDay(new Date(m.createdAt), today) && m.type === MemoryType.STYLE_REFERENCE).length;
  const draftsToday = drafts.filter(d => isSameDay(new Date(d.date), today)).length;
  
  // Note: Products usually don't have a createdAt field in the current type, assume if they exist we count them generally or fallback to 0 change.
  // For simplicity in this strict type environment, we won't track "Products Added Today" unless we add createdAt to Product type. 
  // We will check total count change or just check if > 0 for "New Product" challenge (simplified to "Have at least 1 product" or rely on honor system if stateless).
  // Better: Check if products.length > 0 is good enough for "Add Product" task if user has none, or just check length.
  
  // 2. Define Challenge Sets
  const getChallengeSet = () => {
      const dayIndex = today.getDate() % 3; // Rotates every day (0, 1, 2)
      
      const sets = [
          // SET 0: Standard Flow
          [
              { id: 'log_1', label: t.taskLog1Mem, current: memoriesToday, target: 1, icon: Database, link: AppView.TRAIN_BRAIN },
              { id: 'draft_1', label: t.taskCreateDraft, current: draftsToday, target: 1, icon: FileText, link: AppView.WRITER },
              { id: 'brain_dump', label: t.taskBrainDump, current: draftsToday, target: 1, icon: Zap, link: AppView.WRITER } // Using draft count as proxy
          ],
          // SET 1: Deep Work
          [
              { id: 'log_3', label: t.taskLog3Mem, current: memoriesToday, target: 3, icon: Database, link: AppView.TRAIN_BRAIN },
              { id: 'style_1', label: t.taskStyleRef, current: styleRefsToday, target: 1, icon: Feather, link: AppView.TRAIN_BRAIN },
              { id: 'draft_1', label: t.taskCreateDraft, current: draftsToday, target: 1, icon: FileText, link: AppView.WRITER }
          ],
          // SET 2: Strategy & Products
          [
              { id: 'log_1', label: t.taskLog1Mem, current: memoriesToday, target: 1, icon: Database, link: AppView.TRAIN_BRAIN },
              { id: 'prod_1', label: t.taskNewProduct, current: products.length, target: 1, icon: ShoppingBag, link: AppView.TRAIN_BRAIN }, // Target is having at least 1
              { id: 'draft_1', label: t.taskCreateDraft, current: draftsToday, target: 1, icon: FileText, link: AppView.WRITER }
          ]
      ];
      return sets[dayIndex];
  }

  const dailyChallenges = getChallengeSet();
  const completedChallenges = dailyChallenges.filter(c => c.current >= c.target).length;
  const totalChallenges = dailyChallenges.length;
  const progressPercent = (completedChallenges / totalChallenges) * 100;

  useEffect(() => {
      const interval = setInterval(() => {
          setCurrentTipIndex(prev => (prev + 1) % tips.length);
      }, 15000);
      return () => clearInterval(interval);
  }, [tips.length]);

  const firstName = (profile?.name || 'Creator').split(' ')[0] || 'Creator';

  // Helper for Tech UI progress bar segments
  const renderProgressSegments = () => {
      const segments = 20; // 20 bars
      const filledSegments = Math.floor((progressPercent / 100) * segments);
      return (
          <div className="flex gap-0.5 h-4 w-full mt-2">
              {Array.from({ length: segments }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`flex-1 rounded-sm transition-all duration-500 ${i < filledSegments ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]' : 'bg-zinc-200 dark:bg-zinc-800'}`} 
                  />
              ))}
          </div>
      );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-mono pb-24">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-zinc-200 dark:border-zinc-800 pb-6 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 bg-green-500 animate-pulse rounded-full"></span>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">{t.goodAfternoon}</p>
          </div>
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-white tracking-tighter uppercase">{firstName}</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-xs flex items-center gap-2">
              <Cpu size={12} /> 
              {t.contentScore}: <span className="text-zinc-900 dark:text-white font-bold">{contentScore}</span>
          </p>
        </div>
        
        <button 
          onClick={() => onChangeView(AppView.WRITER)}
          className="bg-zinc-900 dark:bg-white text-white dark:text-black py-3 px-6 text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2 shadow-lg"
        >
          <Plus size={14} />
          {t.createNew}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Daily Tasks (Dynamic) */}
          <div className="lg:col-span-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-none relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-zinc-900 dark:bg-white"></div>
              <div className="p-6">
                 <div className="flex justify-between items-center mb-2">
                     <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                         <Target size={16} /> {t.dailyGoals}
                     </h3>
                     <span className="text-[10px] font-bold text-zinc-500 uppercase">{completedChallenges}/{totalChallenges} {t.goalsCompleted}</span>
                 </div>
                 
                 {renderProgressSegments()}
                 
                 <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                     {dailyChallenges.map((challenge) => {
                         const isComplete = challenge.current >= challenge.target;
                         return (
                             <button 
                                key={challenge.id}
                                onClick={() => onChangeView(challenge.link)}
                                className={`p-4 border bg-zinc-50 dark:bg-zinc-900/30 flex items-center justify-between gap-3 transition-all hover:bg-zinc-100 dark:hover:bg-zinc-900 group ${isComplete ? 'border-green-500/30' : 'border-zinc-200 dark:border-zinc-800'}`}
                             >
                                 <div className="flex items-center gap-3">
                                     <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${isComplete ? 'bg-green-500 border-green-500 text-white' : 'border-zinc-300 dark:border-zinc-700 text-zinc-400 bg-white dark:bg-zinc-900'}`}>
                                         {isComplete ? <CheckCircle size={14} /> : <challenge.icon size={14} />}
                                     </div>
                                     <div className="text-left">
                                         <span className={`block text-xs font-bold uppercase ${isComplete ? 'text-green-600 dark:text-green-400' : 'text-zinc-600 dark:text-zinc-300'}`}>{challenge.label}</span>
                                         <span className="text-[10px] text-zinc-400 font-mono">{challenge.current} / {challenge.target}</span>
                                     </div>
                                 </div>
                                 {!isComplete && <ChevronRight size={14} className="text-zinc-300 group-hover:text-zinc-500" />}
                             </button>
                         );
                     })}
                 </div>
                 
                 <div className="mt-4 flex justify-between items-center border-t border-zinc-100 dark:border-zinc-800 pt-3">
                     <span className="text-[10px] text-zinc-400 uppercase tracking-widest animate-pulse">{progressPercent === 100 ? t.allDone : t.keepGoing}</span>
                     <span className="text-[10px] font-bold text-zinc-500">{Math.round(progressPercent)}% SYNCED</span>
                 </div>
              </div>
          </div>

          {/* Content Tips */}
          <div className="bg-zinc-900 dark:bg-black border border-zinc-700 dark:border-zinc-800 p-6 relative overflow-hidden flex flex-col justify-between min-h-[250px]">
               {/* Decorative Scanlines */}
               <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_2px,3px_100%] pointer-events-none"></div>
               
               <div className="relative z-10">
                   <div className="flex justify-between items-center mb-4 border-b border-zinc-700 pb-2">
                       <h3 className="text-xs font-bold text-green-500 uppercase tracking-widest flex items-center gap-2">
                           <Zap size={12} /> {t.practicalTips}
                       </h3>
                       <div className="flex gap-2">
                          <button onClick={() => setCurrentTipIndex(prev => (prev - 1 + tips.length) % tips.length)} className="text-zinc-500 hover:text-white"><ChevronLeft size={14}/></button>
                          <button onClick={() => setCurrentTipIndex(prev => (prev + 1) % tips.length)} className="text-zinc-500 hover:text-white"><ChevronRight size={14}/></button>
                       </div>
                   </div>
                   
                   <div className="min-h-[120px] flex items-center">
                       <p className="text-sm text-zinc-300 font-mono leading-relaxed">
                           <span className="text-green-500 mr-2">{">"}</span>
                           {tips[currentTipIndex]}
                           <span className="inline-block w-2 h-4 bg-green-500 ml-1 animate-pulse align-middle"></span>
                       </p>
                   </div>
               </div>

               <div className="relative z-10 mt-4 text-[9px] text-zinc-600 font-bold uppercase tracking-[0.2em] flex justify-between">
                   <span>Data Node {currentTipIndex + 1}</span>
                   <span>SYS_OP_25</span>
               </div>
          </div>
      </div>
      
      {/* System Navigation / Platform Guide */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 pt-8">
          <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-4 bg-zinc-900 dark:bg-white"></div>
              <h3 className="text-lg font-bold uppercase tracking-tight text-zinc-900 dark:text-white">{t.guideTitle}</h3>
              <p className="text-xs text-zinc-500">{t.guideSub}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Train Brain */}
              <div onClick={() => onChangeView(AppView.TRAIN_BRAIN)} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded text-zinc-600 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors"><BrainCircuit size={18}/></div>
                      <h4 className="font-bold text-sm uppercase tracking-wider">{t.guideTrainBrain}</h4>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed">{t.guideTrainBrainDesc}</p>
              </div>

              {/* Studio */}
              <div onClick={() => onChangeView(AppView.WRITER)} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded text-zinc-600 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors"><PenTool size={18}/></div>
                      <h4 className="font-bold text-sm uppercase tracking-wider">{t.guideStudio}</h4>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed">{t.guideStudioDesc}</p>
              </div>

              {/* Memory Bank */}
              <div onClick={() => onChangeView(AppView.MEMORY_BANK)} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded text-zinc-600 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors"><Database size={18}/></div>
                      <h4 className="font-bold text-sm uppercase tracking-wider">{t.guideMemoryBank}</h4>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed">{t.guideMemoryBankDesc}</p>
              </div>

              {/* Drafts */}
              <div onClick={() => onChangeView(AppView.DRAFTS)} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded text-zinc-600 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors"><FileText size={18}/></div>
                      <h4 className="font-bold text-sm uppercase tracking-wider">{t.guideDrafts}</h4>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed">{t.guideDraftsDesc}</p>
              </div>

              {/* AI Chat */}
              <div onClick={() => onChangeView(AppView.CHAT)} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded text-zinc-600 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors"><MessageSquare size={18}/></div>
                      <h4 className="font-bold text-sm uppercase tracking-wider">{t.guideChat}</h4>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed">{t.guideChatDesc}</p>
              </div>

              {/* Calendar */}
              <div onClick={() => onChangeView(AppView.CALENDAR)} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded text-zinc-600 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors"><Calendar size={18}/></div>
                      <h4 className="font-bold text-sm uppercase tracking-wider">{t.guideCalendar}</h4>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed">{t.guideCalendarDesc}</p>
              </div>
          </div>
      </div>

    </div>
  );
};
