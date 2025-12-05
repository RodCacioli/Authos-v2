
import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Edit3, Clock } from 'lucide-react';
import { ContentDraft, Language, AppView } from '../types';
import { getTranslation } from '../translations';

interface CalendarProps {
  drafts: ContentDraft[];
  language: Language;
  setView: (view: AppView) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ drafts, language, setView }) => {
  const t = getTranslation(language);
  const [currentDate, setCurrentDate] = useState(new Date());

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Calculate blank days for the start of the grid (Monday start)
  const startDay = getDay(monthStart); // 0 = Sunday
  // Adjust for Monday start: Sunday(0) becomes 6, Monday(1) becomes 0
  const emptyDays = startDay === 0 ? 6 : startDay - 1;

  const weekDays = [t.mon, t.tue, t.wed, t.thu, t.fri, t.sat, t.sun];

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col font-mono">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2 tracking-tight uppercase">{t.calendarTitle}</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">{t.calendarSub}</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={prevMonth}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-lg font-bold uppercase tracking-wider min-w-[140px] text-center">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <button 
            onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 flex-1">
        {weekDays.map(day => (
          <div key={day} className="bg-zinc-50 dark:bg-zinc-950 p-2 text-center text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            {day}
          </div>
        ))}
        
        {Array.from({ length: emptyDays }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-white dark:bg-zinc-950/50" />
        ))}

        {daysInMonth.map(day => {
          const dayDrafts = drafts.filter(d => d.scheduledDate && isSameDay(new Date(d.scheduledDate), day));
          const isToday = isSameDay(day, new Date());
          
          return (
            <div key={day.toISOString()} className={`bg-white dark:bg-zinc-950 p-2 min-h-[100px] relative group hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors ${isToday ? 'bg-zinc-50 dark:bg-zinc-900 ring-1 ring-inset ring-black dark:ring-white' : ''}`}>
              <span className={`text-xs font-bold ${isToday ? 'text-black dark:text-white' : 'text-zinc-500'}`}>
                {format(day, 'd')}
              </span>
              
              <div className="mt-2 space-y-1">
                {dayDrafts.map(draft => (
                  <button 
                    key={draft.id}
                    onClick={() => {
                         setView(AppView.DRAFTS);
                    }}
                    className="w-full text-left p-1 rounded bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 block overflow-hidden"
                  >
                    <div className="flex items-center gap-1">
                       <Clock size={8} className="text-blue-500 shrink-0"/>
                       <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 truncate leading-none block">{format(new Date(draft.scheduledDate!), 'HH:mm')}</span>
                    </div>
                    <span className="text-[10px] text-zinc-700 dark:text-zinc-300 truncate block mt-0.5">{draft.title}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
