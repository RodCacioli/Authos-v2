
import React from 'react';
import { Home, BrainCircuit, Database, PenTool, Calendar, MessageSquare, User, Moon, Sun, Globe, FileText } from 'lucide-react';
import { AppView, Language, Theme } from '../types';
import { getTranslation } from '../translations';

interface SidebarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, language, setLanguage, theme, setTheme }) => {
  const t = getTranslation(language);

  const navItems = [
    { id: AppView.DASHBOARD, label: t.home, icon: Home },
    { id: AppView.TRAIN_BRAIN, label: t.trainBrain, icon: BrainCircuit },
    { id: AppView.WRITER, label: t.studio, icon: PenTool },
    { id: AppView.MEMORY_BANK, label: t.memoryBank, icon: Database },
    { id: AppView.DRAFTS, label: t.drafts, icon: FileText },
    { id: AppView.CHAT, label: t.aiChat, icon: MessageSquare },
    { id: AppView.CALENDAR, label: t.calendar, icon: Calendar },
  ];

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
  const toggleLang = () => setLanguage(language === 'en' ? 'pt' : 'en');

  return (
    <div className="w-64 border-r border-zinc-200 dark:border-zinc-800 h-screen flex flex-col sticky top-0 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white transition-colors duration-300">
      <div className="p-8">
        <h1 className="text-lg font-bold tracking-wider uppercase font-mono">
          AUTHOS<span className="animate-pulse">_</span>
        </h1>
        <p className="text-[10px] text-zinc-400 mt-1 font-mono uppercase">sys.v.1.0.7</p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`flex items-center w-full px-4 py-3 text-xs font-bold uppercase tracking-wider font-mono transition-all duration-200 group ${
              currentView === item.id
                ? 'bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white'
                : 'text-zinc-500 hover:text-black dark:hover:text-white hover:pl-6'
            }`}
          >
            <span className={`mr-3 transition-opacity ${currentView === item.id ? 'opacity-100' : 'opacity-50 group-hover:opacity-100'}`}>
                <item.icon size={14} />
            </span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
        <div className="flex gap-2 mb-4">
            <button onClick={toggleTheme} className="flex-1 p-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 flex justify-center items-center text-zinc-500 dark:text-zinc-400 transition-colors">
                {theme === 'dark' ? <Sun size={14}/> : <Moon size={14}/>}
            </button>
            <button onClick={toggleLang} className="flex-1 p-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 flex justify-center items-center text-zinc-500 dark:text-zinc-400 font-mono text-xs font-bold transition-colors">
                {language === 'en' ? 'EN' : 'PT'}
            </button>
        </div>

        <div className="flex items-center px-3 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
            <User size={14} />
          </div>
          <div className="ml-3">
            <p className="text-xs font-bold uppercase tracking-wider">{t.creator}</p>
            <p className="text-[10px] text-zinc-500 font-mono">ONLINE</p>
          </div>
        </div>
      </div>
    </div>
  );
};
