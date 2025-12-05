
import React, { useState, useRef, useEffect } from 'react';
import { Memory, MemoryType, UserProfile, Language, Product, PersonaReport } from '../types';
import { BookOpen, ShoppingBag, Feather, Database, Tag, Sparkles, Radio, Loader2, Square, Mic, Plus, X, RefreshCw, Save, Package, Edit2, Trash2, Users, CheckCircle, ArrowLeft, Maximize2, AlertTriangle, CloudRain, Shield, Target, Quote, MessageSquare, Zap, Eye, AlertCircle, Heart, PenLine, Lightbulb, Ban, Check } from 'lucide-react';
import { getTranslation } from '../translations';
import { enrichMemory, processAudioMemory, extractStyleFromUrl, generatePersonaReport } from '../services/geminiService';
import { saveProfile } from '../services/storageService';

interface TrainBrainProps {
  profile?: UserProfile;
  memories: Memory[];
  products?: Product[];
  language: Language;
  onAddMemory: (memory: Memory) => void;
  onAddProduct?: (product: Product) => void;
  onUpdateProduct?: (product: Product) => void;
  onDeleteProduct?: (id: string) => void;
  onDeleteMemory: (id: string) => void; 
  onUpdateMemory?: (memory: Memory) => void;
}

type TrainTab = 'REFLECTIONS' | 'PRODUCTS' | 'STYLE_LAB' | 'PERSONA';

// --- HELPER COMPONENTS FOR DEBRIEFING UI ---

interface DebriefCardProps {
    title: string;
    icon?: any;
    colorTheme: 'red' | 'green';
    className?: string;
    children: React.ReactNode;
    isEditing: boolean;
    onToggleEdit: () => void;
    onSave: () => void;
    onCancel: () => void;
}

const DebriefCard: React.FC<DebriefCardProps> = ({ 
    title, icon: Icon, colorTheme, className = "", children, 
    isEditing, onToggleEdit, onSave, onCancel 
}) => {
    
    // Global rule: Neutral backgrounds for cards. Color only on Title/Icon.
    const containerClasses = "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono";

    const titleColorClasses = {
        red: "text-red-600 dark:text-red-400",
        green: "text-green-600 dark:text-green-400"
    };

    return (
        <div className={`relative rounded-xl p-6 transition-all duration-200 hover:shadow-md ${containerClasses} ${className} group`}>
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                    {Icon && <Icon size={18} className={titleColorClasses[colorTheme]} />}
                    <h4 className={`font-bold text-xs uppercase tracking-wider opacity-90 ${titleColorClasses[colorTheme]}`}>
                        {title}
                    </h4>
                </div>
                
                <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    {!isEditing ? (
                        <button 
                            onClick={onToggleEdit}
                            className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-md text-inherit transition-colors"
                            title="Edit Section"
                        >
                            <Edit2 size={14} />
                        </button>
                    ) : (
                        <div className="flex gap-1">
                            <button 
                                onClick={onCancel}
                                className="p-1.5 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-md text-red-600 dark:text-red-400 transition-colors"
                                title="Cancel"
                            >
                                <X size={14} />
                            </button>
                            <button 
                                onClick={onSave}
                                className="p-1.5 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 rounded-md text-green-600 dark:text-green-400 transition-colors"
                                title="Save"
                            >
                                <Check size={14} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="relative">
                {children}
            </div>
        </div>
    );
};

// Helper for editable lists (Array of strings)
const EditableList = ({ items, onChange, placeholder }: { items: string[], onChange: (items: string[]) => void, placeholder?: string }) => {
    const handleChange = (index: number, val: string) => {
        const newItems = [...items];
        newItems[index] = val;
        onChange(newItems);
    };

    const handleAdd = () => {
        onChange([...items, ""]);
    };

    const handleRemove = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        onChange(newItems);
    };

    return (
        <div className="space-y-2">
            {items.map((item, i) => (
                <div key={i} className="flex gap-2">
                    <input 
                        className="flex-1 bg-white/50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded px-2 py-1.5 text-xs font-mono focus:ring-1 focus:ring-black dark:focus:ring-white outline-none"
                        value={item}
                        onChange={(e) => handleChange(i, e.target.value)}
                        placeholder={placeholder}
                    />
                    <button onClick={() => handleRemove(i)} className="p-1 text-red-400 hover:text-red-600"><Trash2 size={14}/></button>
                </div>
            ))}
            <button onClick={handleAdd} className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-500 hover:text-blue-600 mt-2 font-mono">
                <Plus size={12}/> Add Item
            </button>
        </div>
    );
};


// --- VISUAL DEBRIEF COMPONENT (REFACTORED) ---
interface PersonaDebriefViewProps {
  data: PersonaReport;
  isEditing: boolean; // Kept for signature compatibility but used less now
  onUpdate: (data: PersonaReport) => void;
}

const PersonaDebriefView: React.FC<PersonaDebriefViewProps> = ({ data, onUpdate }) => {
    // We maintain local state for each section to handle "Edit Mode"
    // When saving, we push changes to parent via onUpdate
    
    const [editingSection, setEditingSection] = useState<string | null>(null);
    const [tempData, setTempData] = useState<PersonaReport>(data);

    // Sync temp data when prop changes (unless editing)
    useEffect(() => {
        if (!editingSection) setTempData(data);
    }, [data, editingSection]);

    const startEdit = (section: string) => {
        setTempData(JSON.parse(JSON.stringify(data))); // Deep copy
        setEditingSection(section);
    };

    const cancelEdit = () => {
        setEditingSection(null);
        setTempData(data);
    };

    const saveEdit = () => {
        onUpdate(tempData);
        setEditingSection(null);
    };

    // Generic Update Helpers for Temp State
    const updateSnapshot = (key: keyof PersonaReport['snapshot'], val: string) => setTempData(prev => ({...prev, snapshot: {...prev.snapshot, [key]: val}}));
    const updatePsych = (key: keyof PersonaReport['psychology'], val: any) => setTempData(prev => ({...prev, psychology: {...prev.psychology, [key]: val}}));
    const updateBehavior = (key: keyof PersonaReport['behaviors'], val: any) => setTempData(prev => ({...prev, behaviors: {...prev.behaviors, [key]: val}}));
    const updateDrivers = (key: keyof PersonaReport['drivers'], val: any) => setTempData(prev => ({...prev, drivers: {...prev.drivers, [key]: val}}));
    const updateComm = (key: keyof PersonaReport['communication'], val: any) => setTempData(prev => ({...prev, communication: {...prev.communication, [key]: val}}));

    return (
        <div className="space-y-8 font-mono">
            
            {/* 1. SNAPSHOT CARD - Neutral Styling */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm relative group">
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    {editingSection === 'snapshot' ? (
                        <div className="flex gap-2">
                             <button onClick={cancelEdit} className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg hover:bg-red-200"><X size={16}/></button>
                             <button onClick={saveEdit} className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg hover:bg-green-200"><Check size={16}/></button>
                        </div>
                    ) : (
                        <button onClick={() => startEdit('snapshot')} className="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"><Edit2 size={16}/></button>
                    )}
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0">
                        <Users size={32} className="text-zinc-400"/>
                    </div>
                    <div className="flex-1 text-center md:text-left w-full">
                        {editingSection === 'snapshot' ? (
                            <div className="space-y-3 w-full">
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-zinc-400">Persona Name</label>
                                    <input className="font-bold text-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 w-full font-mono" value={tempData.snapshot.name} onChange={e => updateSnapshot('name', e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-zinc-400">Gender Focus</label>
                                    <input className="text-xs bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 w-full font-mono" value={tempData.snapshot.gender} onChange={e => updateSnapshot('gender', e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-zinc-400">One-Line Summary</label>
                                    <textarea className="w-full text-sm bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded p-2 font-mono" value={tempData.snapshot.summary} onChange={e => updateSnapshot('summary', e.target.value)} />
                                </div>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-3xl font-bold uppercase tracking-tight mb-2 text-zinc-900 dark:text-white">{data.snapshot.name}</h2>
                                <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                                    <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-[10px] font-bold uppercase tracking-wider text-zinc-500">{data.snapshot.gender}</span>
                                </div>
                                <p className="text-sm font-medium leading-relaxed text-zinc-500 dark:text-zinc-400 italic">"{data.snapshot.summary}"</p>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* 2. EXECUTIVE SUMMARY -> Green (Hopeful/Visionary) */}
            <DebriefCard 
                title="Executive Summary" 
                icon={BookOpen} 
                colorTheme="green"
                isEditing={editingSection === 'exec'}
                onToggleEdit={() => startEdit('exec')}
                onSave={saveEdit}
                onCancel={cancelEdit}
            >
                {editingSection === 'exec' ? (
                    <textarea 
                        className="w-full h-32 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-3 text-sm resize-y outline-none focus:border-zinc-400 font-mono"
                        value={tempData.executiveSummary} 
                        onChange={e => setTempData({...tempData, executiveSummary: e.target.value})} 
                    />
                ) : (
                    <div className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 font-medium">
                        {data.executiveSummary}
                    </div>
                )}
            </DebriefCard>

            {/* 3. PSYCHOLOGICAL BREAKDOWN -> Red (Internal Conflict) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {/* Core Conflict */}
                 <DebriefCard 
                    title="Core Conflict" 
                    icon={AlertTriangle} 
                    colorTheme="red"
                    isEditing={editingSection === 'conflict'}
                    onToggleEdit={() => startEdit('conflict')}
                    onSave={saveEdit}
                    onCancel={cancelEdit}
                 >
                    {editingSection === 'conflict' ? (
                        <textarea className="w-full h-32 bg-white/50 dark:bg-black/20 border border-red-200 dark:border-red-900/50 rounded p-2 text-sm outline-none resize-none font-mono" value={tempData.psychology.coreConflict} onChange={e => updatePsych('coreConflict', e.target.value)} />
                    ) : (
                        <p className="text-sm leading-relaxed font-medium">{data.psychology.coreConflict}</p>
                    )}
                 </DebriefCard>

                 {/* 3AM Thought */}
                 <DebriefCard 
                    title="The 3AM Thought" 
                    icon={Quote} 
                    colorTheme="red"
                    className="flex flex-col"
                    isEditing={editingSection === '3am'}
                    onToggleEdit={() => startEdit('3am')}
                    onSave={saveEdit}
                    onCancel={cancelEdit}
                 >
                     <div className="flex-1 flex items-center justify-center text-center">
                        {editingSection === '3am' ? (
                            <textarea className="w-full h-32 bg-white/50 dark:bg-black/20 border border-zinc-200 dark:border-zinc-800 rounded p-2 text-lg font-serif italic outline-none resize-none" value={tempData.psychology.thought3AM} onChange={e => updatePsych('thought3AM', e.target.value)} />
                        ) : (
                            <p className="text-lg md:text-xl font-serif italic leading-tight text-red-900 dark:text-red-200">"{data.psychology.thought3AM}"</p>
                        )}
                     </div>
                 </DebriefCard>

                 {/* Limiting Beliefs */}
                 <DebriefCard 
                    title="Limiting Beliefs" 
                    icon={Shield} 
                    colorTheme="red"
                    isEditing={editingSection === 'beliefs'}
                    onToggleEdit={() => startEdit('beliefs')}
                    onSave={saveEdit}
                    onCancel={cancelEdit}
                 >
                    {editingSection === 'beliefs' ? (
                        <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                             {tempData.psychology.limitingBeliefs.map((belief, i) => (
                                 <div key={i} className="p-2 border border-dashed border-zinc-300 dark:border-zinc-700 rounded relative group">
                                     <button onClick={() => {
                                         const newB = tempData.psychology.limitingBeliefs.filter((_, idx) => idx !== i);
                                         updatePsych('limitingBeliefs', newB);
                                     }} className="absolute top-1 right-1 text-zinc-400 hover:text-red-500"><X size={12}/></button>
                                     
                                     <input className="block w-full text-xs font-bold bg-transparent border-b border-zinc-200 dark:border-zinc-800 mb-1 outline-none font-mono" value={belief.belief} onChange={e => {
                                         const newB = [...tempData.psychology.limitingBeliefs];
                                         newB[i].belief = e.target.value;
                                         updatePsych('limitingBeliefs', newB);
                                     }} placeholder="Belief title"/>
                                     <textarea className="block w-full text-xs bg-transparent outline-none resize-none font-mono" rows={2} value={belief.description} onChange={e => {
                                         const newB = [...tempData.psychology.limitingBeliefs];
                                         newB[i].description = e.target.value;
                                         updatePsych('limitingBeliefs', newB);
                                     }} placeholder="Description"/>
                                 </div>
                             ))}
                             <button onClick={() => updatePsych('limitingBeliefs', [...tempData.psychology.limitingBeliefs, {belief: "", description: ""}])} className="w-full py-2 border border-dashed border-zinc-300 dark:border-zinc-700 rounded text-xs font-bold uppercase text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center gap-2 font-mono"><Plus size={12}/> Add Belief</button>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                            {data.psychology.limitingBeliefs.map((belief, i) => (
                                <div key={i} className="text-xs">
                                    <span className="font-bold block mb-0.5 text-zinc-700 dark:text-zinc-300">• {belief.belief}</span>
                                    <span className="text-zinc-500 leading-snug">{belief.description}</span>
                                </div>
                            ))}
                        </div>
                    )}
                 </DebriefCard>
            </div>

            {/* 4. BEHAVIORAL INSIGHTS -> Red (Triggers/Coping) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Triggers */}
                <DebriefCard 
                    title="Trigger Events" 
                    icon={Zap} 
                    colorTheme="red"
                    isEditing={editingSection === 'triggers'}
                    onToggleEdit={() => startEdit('triggers')}
                    onSave={saveEdit}
                    onCancel={cancelEdit}
                 >
                     {editingSection === 'triggers' ? (
                         <EditableList items={tempData.behaviors.triggerEvents} onChange={(items) => updateBehavior('triggerEvents', items)} placeholder="Add trigger event..." />
                     ) : (
                        <ul className="space-y-2">
                            {data.behaviors.triggerEvents.map((t, i) => (
                                <li key={i} className="flex gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                                    <span className="opacity-50 text-red-500">→</span> {t}
                                </li>
                            ))}
                        </ul>
                     )}
                 </DebriefCard>

                 {/* Coping */}
                 <DebriefCard 
                    title="Coping Mechanisms" 
                    icon={CloudRain} 
                    colorTheme="red"
                    isEditing={editingSection === 'coping'}
                    onToggleEdit={() => startEdit('coping')}
                    onSave={saveEdit}
                    onCancel={cancelEdit}
                 >
                     {editingSection === 'coping' ? (
                         <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                             {tempData.behaviors.copingMechanisms.map((mech, i) => (
                                 <div key={i} className="flex gap-2 items-start">
                                     <div className="flex-1 space-y-1">
                                         <input className="w-full text-xs font-bold bg-white/50 dark:bg-black/20 border border-zinc-200/50 dark:border-zinc-800/50 rounded px-2 py-1 outline-none font-mono" value={mech.title} onChange={e => {
                                             const newC = [...tempData.behaviors.copingMechanisms];
                                             newC[i].title = e.target.value;
                                             updateBehavior('copingMechanisms', newC);
                                         }} placeholder="Mechanism Title"/>
                                         <input className="w-full text-xs bg-white/50 dark:bg-black/20 border border-zinc-200/50 dark:border-zinc-800/50 rounded px-2 py-1 outline-none font-mono" value={mech.description} onChange={e => {
                                             const newC = [...tempData.behaviors.copingMechanisms];
                                             newC[i].description = e.target.value;
                                             updateBehavior('copingMechanisms', newC);
                                         }} placeholder="Description"/>
                                     </div>
                                     <button onClick={() => {
                                         const newC = tempData.behaviors.copingMechanisms.filter((_, idx) => idx !== i);
                                         updateBehavior('copingMechanisms', newC);
                                     }} className="text-zinc-400 hover:text-red-500 pt-1"><Trash2 size={14}/></button>
                                 </div>
                             ))}
                             <button onClick={() => updateBehavior('copingMechanisms', [...tempData.behaviors.copingMechanisms, {title: "", description: ""}])} className="text-[10px] font-bold uppercase text-zinc-500 flex items-center gap-1 mt-2 hover:underline font-mono"><Plus size={12}/> Add Mechanism</button>
                         </div>
                     ) : (
                        <div className="space-y-3">
                            {data.behaviors.copingMechanisms.map((m, i) => (
                                <div key={i} className="bg-white/50 dark:bg-black/20 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
                                    <span className="block font-bold text-xs mb-1 text-zinc-900 dark:text-zinc-100">{m.title}</span>
                                    <span className="block text-xs text-zinc-500 dark:text-zinc-400">{m.description}</span>
                                </div>
                            ))}
                        </div>
                     )}
                </DebriefCard>
            </div>

            {/* 5. DRIVERS -> Red (Fears, Thoughts) / Green (Goals) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DebriefCard 
                    title="Fears & Insecurities" 
                    icon={AlertTriangle} 
                    colorTheme="red"
                    isEditing={editingSection === 'fears'}
                    onToggleEdit={() => startEdit('fears')}
                    onSave={saveEdit}
                    onCancel={cancelEdit}
                >
                    {editingSection === 'fears' ? (
                        <EditableList items={tempData.drivers.fears} onChange={items => updateDrivers('fears', items)} placeholder="Add fear..." />
                    ) : (
                        <ul className="list-disc list-inside space-y-2 text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                            {data.drivers.fears.map((f, i) => <li key={i}>{f}</li>)}
                        </ul>
                    )}
                </DebriefCard>

                <DebriefCard 
                    title="Goals & Dreams" 
                    icon={Target} 
                    colorTheme="green"
                    isEditing={editingSection === 'goals'}
                    onToggleEdit={() => startEdit('goals')}
                    onSave={saveEdit}
                    onCancel={cancelEdit}
                >
                    {editingSection === 'goals' ? (
                        <EditableList items={tempData.drivers.goals} onChange={items => updateDrivers('goals', items)} placeholder="Add goal..." />
                    ) : (
                        <ul className="list-disc list-inside space-y-2 text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                            {data.drivers.goals.map((g, i) => <li key={i}>{g}</li>)}
                        </ul>
                    )}
                </DebriefCard>

                <DebriefCard 
                    title="Common Thoughts" 
                    icon={MessageSquare} 
                    colorTheme="red"
                    isEditing={editingSection === 'thoughts'}
                    onToggleEdit={() => startEdit('thoughts')}
                    onSave={saveEdit}
                    onCancel={cancelEdit}
                >
                    {editingSection === 'thoughts' ? (
                        <EditableList items={tempData.drivers.internalDialogue} onChange={items => updateDrivers('internalDialogue', items)} placeholder="Add thought..." />
                    ) : (
                        <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400 italic">
                            {data.drivers.internalDialogue.map((d, i) => <li key={i}>"{d}"</li>)}
                        </ul>
                    )}
                </DebriefCard>
            </div>

            {/* 6. COMMUNICATION (RESONANCE KEYS) -> Green */}
            <DebriefCard 
                title="Resonance Keys" 
                icon={Lightbulb} 
                colorTheme="green"
                isEditing={editingSection === 'comm'}
                onToggleEdit={() => startEdit('comm')}
                onSave={saveEdit}
                onCancel={cancelEdit}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                     <div>
                         <span className="block text-[10px] font-bold uppercase opacity-50 mb-2">Ideal Tone</span>
                         {editingSection === 'comm' ? (
                             <input className="w-full bg-white/50 dark:bg-black/20 border border-zinc-200/50 dark:border-zinc-800/50 rounded px-2 py-1 text-xs outline-none font-mono" value={tempData.communication.tone} onChange={e => updateComm('tone', e.target.value)} />
                         ) : (
                             <p className="text-sm font-medium">{data.communication.tone}</p>
                         )}
                     </div>
                     <div>
                         <span className="block text-[10px] font-bold uppercase opacity-50 mb-2">Words to Avoid</span>
                         {editingSection === 'comm' ? (
                             <EditableList items={tempData.communication.wordsToAvoid} onChange={items => updateComm('wordsToAvoid', items)} placeholder="Bad word..."/>
                         ) : (
                            <ul className="text-xs space-y-1">
                                {data.communication.wordsToAvoid.map((w, i) => <li key={i} className="flex gap-2"><span className="text-red-500">🚫</span> {w}</li>)}
                            </ul>
                         )}
                     </div>
                     <div>
                         <span className="block text-[10px] font-bold uppercase opacity-50 mb-2">Power Words</span>
                         {editingSection === 'comm' ? (
                             <div className="space-y-2">
                                 <div>
                                     <label className="text-[9px] uppercase opacity-70">Empower</label>
                                     <EditableList items={tempData.communication.powerWords.empowerment} onChange={items => setTempData({...tempData, communication: {...tempData.communication, powerWords: {...tempData.communication.powerWords, empowerment: items}}})} />
                                 </div>
                                 {/* Simplified edit for brevity in UI, focused on main categories */}
                             </div>
                         ) : (
                             <div className="space-y-2 text-xs">
                                 <p><span className="opacity-70">Empower:</span> {data.communication.powerWords.empowerment.slice(0,3).join(', ')}</p>
                                 <p><span className="opacity-70">Clarify:</span> {data.communication.powerWords.clarity.slice(0,3).join(', ')}</p>
                                 <p><span className="opacity-70">Feel:</span> {data.communication.powerWords.emotional.slice(0,3).join(', ')}</p>
                             </div>
                         )}
                     </div>
                     <div>
                         <span className="block text-[10px] font-bold uppercase opacity-50 mb-2">CTA Style</span>
                         {editingSection === 'comm' ? (
                             <EditableList items={tempData.communication.ctaStyle} onChange={items => updateComm('ctaStyle', items)} placeholder="CTA example..."/>
                         ) : (
                             <ul className="text-xs space-y-2 italic opacity-80">
                                 {data.communication.ctaStyle.map((cta, i) => <li key={i}>"{cta}"</li>)}
                             </ul>
                         )}
                     </div>
                </div>
            </DebriefCard>

        </div>
    )
}


export const TrainBrain: React.FC<TrainBrainProps> = ({ 
    profile, memories, products = [], language, 
    onAddMemory, onAddProduct, onUpdateProduct, onDeleteProduct, onDeleteMemory, onUpdateMemory
}) => {
  const t = getTranslation(language);
  const [activeTab, setActiveTab] = useState<TrainTab>('REFLECTIONS');

  // --- REFLECTIONS STATE ---
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [promptAnswer, setPromptAnswer] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // --- STYLE LAB STATE ---
  const [styleText, setStyleText] = useState('');
  const [isSavingStyle, setIsSavingStyle] = useState(false);
  
  // Voice DNA State
  const [jargon, setJargon] = useState('');
  const [audienceName, setAudienceName] = useState('');
  const [strongLanguage, setStrongLanguage] = useState('');
  const [sacredWords, setSacredWords] = useState('');
  const [isSavingVoice, setIsSavingVoice] = useState(false);

  // Load existing voice settings
  useEffect(() => {
      const loadVoiceSetting = (tag: string, setter: (val: string) => void) => {
          const mem = memories.find(m => m.tags.includes(tag) && m.type === MemoryType.STYLE_REFERENCE);
          if (mem) setter(mem.content);
      };
      loadVoiceSetting('voice_jargon', setJargon);
      loadVoiceSetting('voice_audience', setAudienceName);
      loadVoiceSetting('voice_intensity', setStrongLanguage);
      loadVoiceSetting('voice_sacred', setSacredWords);
  }, [memories]);

  // --- PRODUCTS STATE ---
  const [isEditingProduct, setIsEditingProduct] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({});
  const [showProductForm, setShowProductForm] = useState(false);

  // --- PERSONA STATE ---
  const [showPersonaForm, setShowPersonaForm] = useState(false);
  const [isGeneratingPersona, setIsGeneratingPersona] = useState(false);
  const [reviewingPersona, setReviewingPersona] = useState(false);
  
  // generatedReport is now typically a JSON string, but could be plain text if legacy.
  const [generatedReport, setGeneratedReport] = useState(''); 
  const [parsedReport, setParsedReport] = useState<PersonaReport | null>(null);

  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null); // For viewing card details
  const [isEditingCard, setIsEditingCard] = useState(false); // For editing inside the card view
  const [cardEditContent, setCardEditContent] = useState(''); // Raw string for editing
  
  const [personaForm, setPersonaForm] = useState({
      name: '',
      gender: '',
      challenges: '',
      fears: '',
      goals: '',
      behaviors: ''
  });

  const prompts = language === 'en' ? [
    "What is a belief you held strongly 5 years ago that you have completely changed your mind about?",
    "Describe a moment where you lost money or time but gained a valuable lesson.",
    "What is the most unpopular opinion you hold in your specific industry?",
    "Who is a mentor that changed your trajectory, and what specifically did they teach you?",
    "What is a 'failure' that actually set you up for your current success?"
  ] : [
    "Qual é uma crença que você defendia há 5 anos e sobre a qual mudou completamente de ideia?",
    "Descreva um momento em que você perdeu dinheiro ou tempo, mas ganhou uma lição valiosa.",
    "Qual é a opinião mais impopular que você tem na sua indústria?",
    "Quem é um mentor que mudou sua trajetória e o que especificamente ele ensinou?",
    "Qual é uma 'falha' que na verdade preparou você para o seu sucesso atual?"
  ];

  // --- AUDIO HANDLERS ---
  const startRecording = async () => {
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          audioChunksRef.current = [];

          mediaRecorder.ondataavailable = (event) => {
              if (event.data.size > 0) {
                  audioChunksRef.current.push(event.data);
              }
          };

          mediaRecorder.onstop = handleAudioStop;
          mediaRecorder.start();
          setIsRecording(true);
      } catch (err) {
          console.error("Error accessing microphone:", err);
          alert("Could not access microphone. Please check permissions.");
      }
  };

  const stopRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
          mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
  };

  const handleAudioStop = async () => {
      setIsProcessingAudio(true);
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
      
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          const cleanBase64 = base64Audio.split(',')[1]; 

          try {
             const result = await processAudioMemory(cleanBase64, language);
             setPromptAnswer(prev => (prev ? prev + "\n" + result.text : result.text));
             
             if (profile) {
                 const updatedProfile = { ...profile, voiceAnalysis: result.analysis };
                 saveProfile(updatedProfile);
             }
          } catch (e) {
              console.error("Audio processing failed", e);
          } finally {
              setIsProcessingAudio(false);
          }
      };
  };

  // --- MEMORY HANDLERS ---
  const handleDeposit = async () => {
      if (!promptAnswer.trim()) return;
      setIsDepositing(true);

      try {
        const metadata = await enrichMemory(promptAnswer);
        const newMemory: Memory = {
            id: Date.now().toString(),
            type: metadata.type || MemoryType.STORY,
            title: metadata.title || 'Reflection',
            content: promptAnswer,
            tags: metadata.tags || ['reflection'],
            createdAt: new Date().toISOString(),
            emotionalTone: metadata.emotionalTone,
            sourceAudio: !isRecording && audioChunksRef.current.length > 0
        };
        onAddMemory(newMemory);
        setPromptAnswer('');
        audioChunksRef.current = [];
        setCurrentPromptIndex((prev) => (prev + 1) % prompts.length);
      } catch (error) {
        console.error("Failed to deposit memory", error);
      } finally {
        setIsDepositing(false);
      }
  };

  // --- STYLE LAB HANDLERS ---
  const handleSaveStyle = async () => {
      if(!styleText.trim()) return;
      setIsSavingStyle(true);

      let contentToSave = styleText;
      let isUrlAnalysis = false;

      if (styleText.startsWith('http://') || styleText.startsWith('https://')) {
          try {
              const analysis = await extractStyleFromUrl(styleText, language);
              contentToSave = analysis;
              isUrlAnalysis = true;
          } catch (e) {
              console.error("Failed to extract style from URL", e);
          }
      }

      const newMemory: Memory = {
          id: Date.now().toString(),
          type: MemoryType.STYLE_REFERENCE,
          title: isUrlAnalysis ? 'Analyzed Style (URL)' : 'Style Reference',
          content: contentToSave,
          tags: ['style-reference', 'voice', 'cadence'],
          createdAt: new Date().toISOString(),
          emotionalTone: 'N/A'
      };
      
      onAddMemory(newMemory);
      setStyleText('');
      setIsSavingStyle(false);
  };

  const handleSaveVoiceDNA = () => {
      setIsSavingVoice(true);
      const updateOrAdd = (tag: string, content: string, title: string) => {
          if (!content.trim()) return;
          const existing = memories.find(m => m.tags.includes(tag) && m.type === MemoryType.STYLE_REFERENCE);
          
          const mem: Memory = {
              id: existing ? existing.id : Date.now().toString() + Math.random(),
              type: MemoryType.STYLE_REFERENCE,
              title: title,
              content: content,
              tags: ['voice_dna', tag],
              createdAt: new Date().toISOString(),
              emotionalTone: 'Voice Setting'
          };

          if (existing && onUpdateMemory) {
              onUpdateMemory(mem);
          } else {
              onAddMemory(mem);
          }
      };

      updateOrAdd('voice_jargon', jargon, 'Voice: Jargon');
      updateOrAdd('voice_audience', audienceName, 'Voice: Audience Name');
      updateOrAdd('voice_intensity', strongLanguage, 'Voice: Intensity');
      updateOrAdd('voice_sacred', sacredWords, 'Voice: Sacred Words');
      
      setTimeout(() => setIsSavingVoice(false), 800);
  };

  // --- PRODUCT HANDLERS ---
  const handleSaveProduct = () => {
      if (!productForm.name) return;

      const productToSave: Product = {
          id: isEditingProduct || Date.now().toString(),
          name: productForm.name || 'New Product',
          persona: productForm.persona || '',
          painPoints: '', // Removed from form, kept for type compatibility
          solution: productForm.solution || '',
          differentiators: productForm.differentiators || '',
          testimonials: productForm.testimonials || '',
          link: productForm.link || '',
          purpose: productForm.purpose || '',
          results: productForm.results || '',
          notes: productForm.notes || ''
      };

      if (isEditingProduct && onUpdateProduct) {
          onUpdateProduct(productToSave);
      } else if (onAddProduct) {
          onAddProduct(productToSave);
      }

      setProductForm({});
      setIsEditingProduct(null);
      setShowProductForm(false);
  };

  const startEditProduct = (p: Product) => {
      setProductForm(p);
      setIsEditingProduct(p.id);
      setShowProductForm(true);
  }

  // --- PERSONA HANDLERS ---
  const handleGenerateDebrief = async () => {
      if (!personaForm.name) return;
      setIsGeneratingPersona(true);

      const jsonString = await generatePersonaReport(personaForm, language);
      
      // Parse JSON for the structured view
      try {
          const parsed = JSON.parse(jsonString);
          setParsedReport(parsed);
          setGeneratedReport(jsonString);
      } catch(e) {
          console.error("Failed to parse persona report JSON", e);
          setGeneratedReport(jsonString); // Fallback to raw string
          setParsedReport(null);
      }

      setReviewingPersona(true);
      setShowPersonaForm(false);
      setIsGeneratingPersona(false);
  }

  const handleApprovePersona = () => {
      const contentToSave = parsedReport ? JSON.stringify(parsedReport) : generatedReport;
      
      const newMemory: Memory = {
          id: Date.now().toString(),
          type: MemoryType.PERSONA,
          title: parsedReport?.snapshot?.name || personaForm.name,
          content: contentToSave,
          tags: ['persona', 'audience'],
          createdAt: new Date().toISOString(),
          emotionalTone: 'Analysis'
      };

      onAddMemory(newMemory);
      
      setPersonaForm({
          name: '', gender: '', challenges: '', 
          fears: '', goals: '', behaviors: ''
      });
      setGeneratedReport('');
      setParsedReport(null);
      setReviewingPersona(false);
  }

  const handleEditAnswers = () => {
      setReviewingPersona(false);
      setShowPersonaForm(true);
  }

  // Save changes made in the deep view back to the memory
  const handleSaveCardEdit = () => {
      if(selectedPersonaId && onUpdateMemory) {
         const existing = memories.find(m => m.id === selectedPersonaId);
         if(existing) {
             // If we were editing visually (parsedReport), serialize it back. 
             // If we were editing raw text (legacy or error), use cardEditContent.
             const contentToSave = parsedReport ? JSON.stringify(parsedReport) : cardEditContent;
             onUpdateMemory({...existing, content: contentToSave});
             setIsEditingCard(false);
         }
      }
  }

  // When card view opens, sync local parsed report state from memory
  useEffect(() => {
      if(selectedPersonaId) {
          const persona = memories.find(m => m.id === selectedPersonaId);
          if(persona) {
              const parsed = safeParsePersona(persona.content);
              if(parsed) setParsedReport(parsed);
              else setCardEditContent(persona.content);
          }
      }
  }, [selectedPersonaId, memories]);


  // Utility to parse persona content safely (handle JSON vs Plain Text legacy)
  const safeParsePersona = (content: string): PersonaReport | null => {
      try {
          return JSON.parse(content);
      } catch (e) {
          return null;
      }
  }

  // Filter Personas for Product Dropdown
  const userPersonas = memories.filter(m => m.type === MemoryType.PERSONA);

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24 font-mono">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2 tracking-tight uppercase">{t.trainTitle}</h2>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl text-sm">{t.trainSub}</p>
      </div>

      {/* Prominent Tabs - REORDERED: Reflections, Style, Persona, Products */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <button 
            onClick={() => setActiveTab('REFLECTIONS')}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${activeTab === 'REFLECTIONS' ? 'border-black dark:border-white bg-zinc-50 dark:bg-zinc-900' : 'border-transparent bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900'}`}
          >
              <BookOpen className={`mb-2 ${activeTab === 'REFLECTIONS' ? 'text-black dark:text-white' : 'text-zinc-400'}`} size={24} />
              <span className={`text-xs font-bold uppercase tracking-wider ${activeTab === 'REFLECTIONS' ? 'text-black dark:text-white' : 'text-zinc-400'}`}>{t.trainReflections}</span>
          </button>

          <button 
            onClick={() => setActiveTab('STYLE_LAB')}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${activeTab === 'STYLE_LAB' ? 'border-black dark:border-white bg-zinc-50 dark:bg-zinc-900' : 'border-transparent bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900'}`}
          >
              <Feather className={`mb-2 ${activeTab === 'STYLE_LAB' ? 'text-black dark:text-white' : 'text-zinc-400'}`} size={24} />
              <span className={`text-xs font-bold uppercase tracking-wider ${activeTab === 'STYLE_LAB' ? 'text-black dark:text-white' : 'text-zinc-400'}`}>{t.trainStyle}</span>
          </button>

          <button 
            onClick={() => setActiveTab('PERSONA')}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${activeTab === 'PERSONA' ? 'border-black dark:border-white bg-zinc-50 dark:bg-zinc-900' : 'border-transparent bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900'}`}
          >
              <Users className={`mb-2 ${activeTab === 'PERSONA' ? 'text-black dark:text-white' : 'text-zinc-400'}`} size={24} />
              <span className={`text-xs font-bold uppercase tracking-wider ${activeTab === 'PERSONA' ? 'text-black dark:text-white' : 'text-zinc-400'}`}>{t.trainPersona}</span>
          </button>

          <button 
            onClick={() => setActiveTab('PRODUCTS')}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${activeTab === 'PRODUCTS' ? 'border-black dark:border-white bg-zinc-50 dark:bg-zinc-900' : 'border-transparent bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900'}`}
          >
              <ShoppingBag className={`mb-2 ${activeTab === 'PRODUCTS' ? 'text-black dark:text-white' : 'text-zinc-400'}`} size={24} />
              <span className={`text-xs font-bold uppercase tracking-wider ${activeTab === 'PRODUCTS' ? 'text-black dark:text-white' : 'text-zinc-400'}`}>{t.trainProducts}</span>
          </button>
      </div>

      {/* Tab Info Banner */}
      <div className="mb-8 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex items-center gap-4">
          <div className="p-2 bg-white dark:bg-zinc-950 rounded-lg shadow-sm shrink-0 text-zinc-500">
              {activeTab === 'REFLECTIONS' && <Database size={20} />}
              {activeTab === 'PRODUCTS' && <Tag size={20} />}
              {activeTab === 'STYLE_LAB' && <Sparkles size={20} />}
              {activeTab === 'PERSONA' && <Users size={20} />}
          </div>
          <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-0.5 uppercase tracking-wide">
                  {activeTab === 'REFLECTIONS' && (language === 'en' ? "Beliefs & Stories" : "Crenças & Histórias")}
                  {activeTab === 'PRODUCTS' && (language === 'en' ? "Offer Database" : "Banco de Ofertas")}
                  {activeTab === 'STYLE_LAB' && (language === 'en' ? "Voice & Language" : "Voz & Linguagem")}
                  {activeTab === 'PERSONA' && (language === 'en' ? "Target Personas" : "Personas Alvo")}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {activeTab === 'REFLECTIONS' && (language === 'en' ? "Answer prompts to help the AI understand your past stories, beliefs, and failures." : "Responda perguntas para ajudar a IA a entender suas histórias, crenças e falhas.")}
                  {activeTab === 'PRODUCTS' && (language === 'en' ? "Define your products so the AI can write persuasive promotional content automatically." : "Defina seus produtos para que a IA possa escrever conteúdo promocional persuasivo automaticamente.")}
                  {activeTab === 'STYLE_LAB' && (language === 'en' ? "Define your unique vocabulary, tone, and audience to ensure content sounds exactly like you." : "Defina seu vocabulário único, tom e público para garantir que o conteúdo soe exatamente como você.")}
                  {activeTab === 'PERSONA' && (language === 'en' ? "Create deep psychological profiles of your audience to generate highly resonant content." : "Crie perfis psicológicos profundos do seu público para gerar conteúdo altamente ressonante.")}
              </p>
          </div>
      </div>

      {/* --- TAB CONTENT: REFLECTIONS --- */}
      {activeTab === 'REFLECTIONS' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              {/* Deep Dive Prompt */}
              <div className="bg-gradient-to-br from-zinc-100 to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 relative overflow-hidden flex flex-col mb-12">
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                    <Sparkles size={120} />
                </div>
                
                <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-zinc-900 dark:bg-white text-white dark:text-black text-[10px] font-bold uppercase tracking-wider rounded">
                                {t.deepDive}
                            </span>
                        </div>
                        {profile?.voiceAnalysis && (
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded-full">
                                <Radio size={10} className="animate-pulse" /> Voice Profile Active
                            </div>
                        )}
                    </div>

                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 leading-snug flex-1">
                        {prompts[currentPromptIndex]}
                    </h3>

                    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 shadow-sm focus-within:ring-2 ring-zinc-500 transition-all">
                        <textarea 
                            className="w-full bg-transparent p-4 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none resize-none font-mono text-sm"
                            rows={3}
                            placeholder={t.promptPlaceholder}
                            value={promptAnswer}
                            onChange={(e) => setPromptAnswer(e.target.value)}
                        />
                        <div className="flex justify-between items-center px-4 pb-2 pt-2 border-t border-zinc-100 dark:border-zinc-900">
                            <button 
                                onClick={() => setCurrentPromptIndex((prev) => (prev + 1) % prompts.length)}
                                className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 font-bold uppercase tracking-wider"
                            >
                                {t.skipQuestion}
                            </button>
                            
                            <div className="flex gap-2">
                                <button
                                    onClick={isRecording ? stopRecording : startRecording}
                                    disabled={isProcessingAudio}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                                        isRecording 
                                        ? 'bg-red-500 text-white animate-pulse' 
                                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                                    }`}
                                    title="Brain Dump (Record Audio)"
                                >
                                    {isProcessingAudio ? <Loader2 size={14} className="animate-spin"/> : isRecording ? <Square size={14} fill="currentColor"/> : <Mic size={14} />}
                                    {isRecording ? "Stop & Analyze" : "Brain Dump"}
                                </button>

                                <button 
                                    onClick={handleDeposit}
                                    disabled={!promptAnswer.trim() || isDepositing}
                                    className="bg-zinc-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                                >
                                    {isDepositing ? <span className="animate-pulse">Processing...</span> : <><Plus size={14} /> {t.depositMemory}</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>
      )}

      {/* --- TAB CONTENT: PRODUCTS --- */}
      {activeTab === 'PRODUCTS' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
             
             {/* Toggle Form Button */}
             {!showProductForm && (
                 <button 
                    onClick={() => {
                        setProductForm({});
                        setIsEditingProduct(null);
                        setShowProductForm(true);
                    }}
                    className="w-full py-4 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 hover:border-zinc-500 dark:hover:border-zinc-500 transition-all flex items-center justify-center gap-2 font-bold uppercase tracking-wider text-xs mb-8"
                 >
                     <Plus size={16} /> Create New Product
                 </button>
             )}

             {/* Product Form */}
             {showProductForm && (
                 <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 mb-8 shadow-lg ring-1 ring-black/5">
                     <div className="flex justify-between items-center mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                         <h3 className="text-sm font-bold uppercase tracking-wider">Product Details</h3>
                         <button onClick={() => setShowProductForm(false)} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white"><X size={18}/></button>
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="col-span-2">
                             <label className="block text-sm font-bold uppercase tracking-wider text-zinc-500 mb-1">Product Name</label>
                             <input 
                                type="text" 
                                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 focus:ring-1 focus:ring-black dark:focus:ring-white outline-none font-mono text-sm"
                                placeholder="e.g. The Content Operating System"
                                value={productForm.name || ''}
                                onChange={e => setProductForm({...productForm, name: e.target.value})}
                             />
                         </div>

                         <div className="col-span-2">
                             <label className="block text-sm font-bold uppercase tracking-wider text-zinc-500 mb-1">Ideal Customer Persona</label>
                             {userPersonas.length > 0 ? (
                                <select 
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 focus:ring-1 focus:ring-black dark:focus:ring-white outline-none font-mono text-sm cursor-pointer"
                                    value={productForm.persona || ''}
                                    onChange={e => setProductForm({...productForm, persona: e.target.value})}
                                >
                                    <option value="">Select a Persona...</option>
                                    {userPersonas.map(p => (
                                        <option key={p.id} value={p.title}>{p.title}</option>
                                    ))}
                                </select>
                             ) : (
                                <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 font-mono flex items-center justify-between">
                                    <span>No personas found. Create one first.</span>
                                    <button onClick={() => setActiveTab('PERSONA')} className="text-blue-500 hover:underline">Go to Persona Tab</button>
                                </div>
                             )}
                         </div>

                         {/* Pain Points REMOVED as per instructions */}

                         <div className="col-span-2">
                             <label className="block text-sm font-bold uppercase tracking-wider text-zinc-500 mb-1">The Solution (How it works)</label>
                             <textarea 
                                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 focus:ring-1 focus:ring-black dark:focus:ring-white outline-none h-24 resize-none font-mono text-sm"
                                placeholder={t.prodSolutionDesc}
                                value={productForm.solution || ''}
                                onChange={e => setProductForm({...productForm, solution: e.target.value})}
                             />
                         </div>

                         <div className="col-span-2">
                             <label className="block text-sm font-bold uppercase tracking-wider text-zinc-500 mb-1">Unique Differentiators</label>
                             <textarea 
                                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 focus:ring-1 focus:ring-black dark:focus:ring-white outline-none h-24 resize-none font-mono text-sm"
                                placeholder={t.prodDiffDesc}
                                value={productForm.differentiators || ''}
                                onChange={e => setProductForm({...productForm, differentiators: e.target.value})}
                             />
                         </div>

                         <div className="col-span-2">
                             <label className="block text-sm font-bold uppercase tracking-wider text-zinc-500 mb-1">Social Proof / Testimonials</label>
                             <textarea 
                                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 focus:ring-1 focus:ring-black dark:focus:ring-white outline-none h-20 resize-none font-mono text-sm"
                                placeholder={t.prodTestimonialDesc}
                                value={productForm.testimonials || ''}
                                onChange={e => setProductForm({...productForm, testimonials: e.target.value})}
                             />
                         </div>

                         <div className="col-span-2">
                             <label className="block text-sm font-bold uppercase tracking-wider text-zinc-500 mb-1">Mission / Purpose</label>
                             <input 
                                type="text" 
                                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 focus:ring-1 focus:ring-black dark:focus:ring-white outline-none font-mono text-sm"
                                placeholder="Why does this exist?"
                                value={productForm.purpose || ''}
                                onChange={e => setProductForm({...productForm, purpose: e.target.value})}
                             />
                         </div>
                         <div className="col-span-2">
                             <label className="block text-sm font-bold uppercase tracking-wider text-zinc-500 mb-1">Key Results (Metrics)</label>
                             <input 
                                type="text" 
                                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 focus:ring-1 focus:ring-black dark:focus:ring-white outline-none font-mono text-sm"
                                placeholder={t.prodResultsDesc}
                                value={productForm.results || ''}
                                onChange={e => setProductForm({...productForm, results: e.target.value})}
                             />
                         </div>

                         <div className="col-span-2">
                             <label className="block text-sm font-bold uppercase tracking-wider text-zinc-500 mb-1">Link (Landing Page)</label>
                             <input 
                                type="text" 
                                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 focus:ring-1 focus:ring-black dark:focus:ring-white outline-none font-mono text-sm text-blue-500"
                                placeholder="https://..."
                                value={productForm.link || ''}
                                onChange={e => setProductForm({...productForm, link: e.target.value})}
                             />
                         </div>
                         
                         <div className="col-span-2">
                             <label className="block text-sm font-bold uppercase tracking-wider text-zinc-500 mb-1">Additional Notes</label>
                             <textarea 
                                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 focus:ring-1 focus:ring-black dark:focus:ring-white outline-none h-20 resize-none font-mono text-sm"
                                placeholder={t.prodNotesDesc}
                                value={productForm.notes || ''}
                                onChange={e => setProductForm({...productForm, notes: e.target.value})}
                             />
                         </div>
                     </div>

                     <div className="mt-6 flex justify-end gap-3">
                         <button onClick={() => setShowProductForm(false)} className="px-4 py-2 text-zinc-500 font-bold text-xs uppercase tracking-wider">Cancel</button>
                         <button 
                            onClick={handleSaveProduct}
                            className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-bold text-xs uppercase tracking-wider"
                         >
                             Save Product
                         </button>
                     </div>
                 </div>
             )}

             {/* Product List */}
             <div className="space-y-4">
                 {products.map(product => (
                     <div key={product.id} className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 group transition-all hover:border-zinc-400 dark:hover:border-zinc-600">
                         <div className="flex justify-between items-start">
                             <div>
                                 <div className="flex items-center gap-3 mb-2">
                                     <Package size={18} className="text-zinc-400"/>
                                     <h3 className="text-xl font-bold text-zinc-900 dark:text-white uppercase tracking-tight">{product.name}</h3>
                                 </div>
                                 <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 font-mono">
                                     {product.persona ? `Target: ${product.persona}` : 'General Audience'} • {product.purpose}
                                 </p>
                             </div>
                             <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button 
                                    onClick={() => startEditProduct(product)}
                                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-500 hover:text-blue-500"
                                 >
                                     <Edit2 size={16} />
                                 </button>
                                 <button 
                                    onClick={() => { if(onDeleteProduct && window.confirm('Delete this product?')) onDeleteProduct(product.id) }}
                                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-500 hover:text-red-500"
                                 >
                                     <Trash2 size={16} />
                                 </button>
                             </div>
                         </div>
                         
                         {/* Quick Stats */}
                         <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-zinc-100 dark:border-zinc-800/50 pt-4">
                             <div>
                                 <span className="block text-[10px] uppercase text-zinc-400 font-bold tracking-wider">Results</span>
                                 <span className="text-xs text-zinc-700 dark:text-zinc-300 truncate block font-mono">{product.results || 'N/A'}</span>
                             </div>
                             <div className="col-span-2">
                                 <span className="block text-[10px] uppercase text-zinc-400 font-bold tracking-wider">Link</span>
                                 <span className="text-xs text-blue-500 truncate block font-mono">{product.link || 'No link'}</span>
                             </div>
                         </div>
                     </div>
                 ))}
                 {products.length === 0 && !showProductForm && (
                     <div className="text-center py-12 opacity-50">
                         <ShoppingBag size={40} className="mx-auto mb-2 text-zinc-300"/>
                         <p className="text-sm font-mono text-zinc-500">No products defined yet.</p>
                     </div>
                 )}
             </div>
          </div>
      )}

      {/* --- TAB CONTENT: VOICE & LANGUAGE (formerly STYLE LAB) --- */}
      {activeTab === 'STYLE_LAB' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 flex flex-col gap-12 max-w-4xl mx-auto">
              
              {/* Header */}
              <div className="text-center">
                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2 uppercase tracking-tight">{t.styleLabSub}</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed text-sm font-mono">{t.styleLabDesc}</p>
              </div>

              {/* Section 1: Cadence (Upload) */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 relative overflow-hidden flex flex-col">
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-center gap-3 mb-4">
                            <Feather className="text-zinc-400" size={20}/>
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                                Upload Writing Samples
                            </h3>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed font-mono">
                            Paste examples of your previous content. We analyze this to match your sentence length, rhythm, and flow.
                        </p>
                        
                        <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 shadow-sm flex-1 flex flex-col focus-within:ring-1 ring-black dark:ring-white transition-all min-h-[150px]">
                            <textarea 
                                className="w-full bg-transparent p-4 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none resize-none flex-1 font-mono text-sm"
                                placeholder={t.pasteStyle}
                                value={styleText}
                                onChange={(e) => setStyleText(e.target.value)}
                            />
                            <div className="flex justify-end px-4 pb-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                                <button 
                                    onClick={handleSaveStyle}
                                    disabled={!styleText.trim() || isSavingStyle}
                                    className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                                >
                                    {isSavingStyle ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />} 
                                    {t.saveStyle}
                                </button>
                            </div>
                        </div>
                        
                        {/* Saved References List */}
                        <div className="mt-6">
                            <h4 className="text-[10px] font-bold uppercase text-zinc-400 mb-3 tracking-wider">Active Samples</h4>
                            <div className="grid grid-cols-1 gap-3">
                                {memories.filter(m => m.type === MemoryType.STYLE_REFERENCE && !m.tags.includes('voice_dna')).map(memory => (
                                    <div key={memory.id} className="bg-white dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg group hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors flex justify-between items-start">
                                        <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 font-mono flex-1 mr-4">{memory.content}</p>
                                        <button onClick={() => onDeleteMemory(memory.id)} className="text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12}/></button>
                                    </div>
                                ))}
                                {memories.filter(m => m.type === MemoryType.STYLE_REFERENCE && !m.tags.includes('voice_dna')).length === 0 && (
                                    <p className="text-xs text-zinc-400 italic font-mono">No samples uploaded yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
              </div>

              {/* Section 2: Voice DNA (Questionnaire) - VERTICAL STACK */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-8 border-b border-zinc-100 dark:border-zinc-800 pb-6">
                      <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-400">
                          <Radio size={20} />
                      </div>
                      <div>
                          <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">{t.voiceDNA}</h3>
                          <p className="text-xs text-zinc-500 font-mono">Explicitly define your vocabulary and branding rules.</p>
                      </div>
                  </div>

                  <div className="space-y-12">
                      <div>
                          <label className="block text-sm font-bold text-zinc-900 dark:text-white mb-2 uppercase tracking-wide">{t.vdnaJargon}</label>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 whitespace-pre-wrap leading-relaxed bg-zinc-50 dark:bg-zinc-950 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 font-mono">{t.vdnaJargonDesc}</p>
                          <input type="text" className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg p-4 text-sm font-mono focus:ring-1 focus:ring-black dark:focus:ring-white outline-none shadow-sm" placeholder={t.vdnaJargonPlace} value={jargon} onChange={e => setJargon(e.target.value)} />
                      </div>
                      
                      <hr className="border-zinc-100 dark:border-zinc-800"/>

                      <div>
                          <label className="block text-sm font-bold text-zinc-900 dark:text-white mb-2 uppercase tracking-wide">{t.vdnaAudience}</label>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 whitespace-pre-wrap leading-relaxed bg-zinc-50 dark:bg-zinc-950 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 font-mono">{t.vdnaAudienceDesc}</p>
                          <input type="text" className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg p-4 text-sm font-mono focus:ring-1 focus:ring-black dark:focus:ring-white outline-none shadow-sm" placeholder={t.vdnaAudiencePlace} value={audienceName} onChange={e => setAudienceName(e.target.value)} />
                      </div>

                      <hr className="border-zinc-100 dark:border-zinc-800"/>

                      <div>
                          <label className="block text-sm font-bold text-zinc-900 dark:text-white mb-2 uppercase tracking-wide">{t.vdnaIntensity}</label>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 whitespace-pre-wrap leading-relaxed bg-zinc-50 dark:bg-zinc-950 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 font-mono">{t.vdnaIntensityDesc}</p>
                          <input type="text" className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg p-4 text-sm font-mono focus:ring-1 focus:ring-black dark:focus:ring-white outline-none shadow-sm" placeholder={t.vdnaIntensityPlace} value={strongLanguage} onChange={e => setStrongLanguage(e.target.value)} />
                      </div>

                      <hr className="border-zinc-100 dark:border-zinc-800"/>

                      <div>
                          <label className="block text-sm font-bold text-zinc-900 dark:text-white mb-2 uppercase tracking-wide">{t.vdnaSacred}</label>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 whitespace-pre-wrap leading-relaxed bg-zinc-50 dark:bg-zinc-950 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 font-mono">{t.vdnaSacredDesc}</p>
                          <input type="text" className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg p-4 text-sm font-mono focus:ring-1 focus:ring-black dark:focus:ring-white outline-none shadow-sm" placeholder={t.vdnaSacredPlace} value={sacredWords} onChange={e => setSacredWords(e.target.value)} />
                      </div>
                  </div>

                  <div className="mt-12 pt-8 border-t border-zinc-100 dark:border-zinc-800 flex justify-end sticky bottom-0 bg-white dark:bg-zinc-900 py-4">
                      <button 
                        onClick={handleSaveVoiceDNA}
                        disabled={isSavingVoice}
                        className="bg-black dark:bg-white text-white dark:text-black px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-50 shadow-lg hover:scale-[1.02] transform"
                      >
                          {isSavingVoice ? <RefreshCw className="animate-spin" size={16}/> : <Save size={16}/>}
                          {t.saveVoiceSettings}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* --- TAB CONTENT: PERSONA --- */}
      {activeTab === 'PERSONA' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
             
             {/* Toggle Form Button (Only show if not reviewing and not selected card) */}
             {!showPersonaForm && !reviewingPersona && !selectedPersonaId && (
                 <button 
                    onClick={() => {
                        setPersonaForm({
                          name: '', gender: '', challenges: '', 
                          fears: '', goals: '', behaviors: ''
                        });
                        setShowPersonaForm(true);
                    }}
                    className="w-full py-4 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 hover:border-zinc-500 dark:hover:border-zinc-500 transition-all flex items-center justify-center gap-2 font-bold uppercase tracking-wider text-xs mb-8"
                 >
                     <Plus size={16} /> {t.createNewPersona}
                 </button>
             )}

             {/* Persona Creation Form */}
             {showPersonaForm && !reviewingPersona && (
                 <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 mb-8 shadow-lg ring-1 ring-black/5">
                     <div className="flex justify-between items-center mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                         <h3 className="text-sm font-bold uppercase tracking-wider">{t.createNewPersona}</h3>
                         <button onClick={() => setShowPersonaForm(false)} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white"><X size={18}/></button>
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="col-span-2">
                             <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">{t.personaName}</label>
                             <input 
                                type="text" 
                                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 focus:ring-1 focus:ring-black dark:focus:ring-white outline-none font-mono text-sm"
                                placeholder={t.personaNamePlace}
                                value={personaForm.name}
                                onChange={e => setPersonaForm({...personaForm, name: e.target.value})}
                             />
                         </div>

                         <div className="col-span-2">
                             <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">{t.personaGender}</label>
                             <select
                                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 focus:ring-1 focus:ring-black dark:focus:ring-white outline-none font-mono text-sm"
                                value={personaForm.gender}
                                onChange={e => setPersonaForm({...personaForm, gender: e.target.value})}
                             >
                                 <option value="">Select...</option>
                                 <option value={t.personaGenderOptionFemale}>{t.personaGenderOptionFemale}</option>
                                 <option value={t.personaGenderOptionMale}>{t.personaGenderOptionMale}</option>
                                 <option value={t.personaGenderOptionBalanced}>{t.personaGenderOptionBalanced}</option>
                             </select>
                         </div>

                         <div className="col-span-2">
                             <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">{t.personaChallenges}</label>
                             <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2 whitespace-pre-wrap leading-relaxed bg-zinc-50 dark:bg-zinc-950 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 font-mono">{t.personaChallengesDesc}</p>
                             <textarea 
                                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 focus:ring-1 focus:ring-black dark:focus:ring-white outline-none h-24 resize-none font-mono text-xs"
                                value={personaForm.challenges}
                                onChange={e => setPersonaForm({...personaForm, challenges: e.target.value})}
                             />
                         </div>

                         <div className="col-span-2">
                             <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">{t.personaFears}</label>
                             <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2 whitespace-pre-wrap leading-relaxed bg-zinc-50 dark:bg-zinc-950 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 font-mono">{t.personaFearsDesc}</p>
                             <textarea 
                                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 focus:ring-1 focus:ring-black dark:focus:ring-white outline-none h-24 resize-none font-mono text-xs"
                                value={personaForm.fears}
                                onChange={e => setPersonaForm({...personaForm, fears: e.target.value})}
                             />
                         </div>

                         <div className="col-span-2">
                             <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">{t.personaGoals}</label>
                             <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2 whitespace-pre-wrap leading-relaxed bg-zinc-50 dark:bg-zinc-950 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 font-mono">{t.personaGoalsDesc}</p>
                             <textarea 
                                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 focus:ring-1 focus:ring-black dark:focus:ring-white outline-none h-24 resize-none font-mono text-xs"
                                value={personaForm.goals}
                                onChange={e => setPersonaForm({...personaForm, goals: e.target.value})}
                             />
                         </div>

                         <div className="col-span-2">
                             <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">{t.personaBehaviors}</label>
                             <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2 whitespace-pre-wrap leading-relaxed bg-zinc-50 dark:bg-zinc-950 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 font-mono">{t.personaBehaviorsDesc}</p>
                             <textarea 
                                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 focus:ring-1 focus:ring-black dark:focus:ring-white outline-none h-24 resize-none font-mono text-xs"
                                value={personaForm.behaviors}
                                onChange={e => setPersonaForm({...personaForm, behaviors: e.target.value})}
                             />
                         </div>
                     </div>

                     <div className="mt-6 flex justify-end gap-3">
                         <button onClick={() => setShowPersonaForm(false)} className="px-4 py-2 text-zinc-500 font-bold text-xs uppercase tracking-wider">Cancel</button>
                         <button 
                            onClick={handleGenerateDebrief}
                            disabled={isGeneratingPersona || !personaForm.name}
                            className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg"
                         >
                             {isGeneratingPersona ? <RefreshCw className="animate-spin" size={14}/> : <Sparkles size={14}/>}
                             {isGeneratingPersona ? t.generatingPersona : t.generatePersona}
                         </button>
                     </div>
                 </div>
             )}

             {/* Debriefing Review Screen (STRUCTURED) */}
             {reviewingPersona && parsedReport && (
                 <div className="mb-8 animate-in zoom-in-95 duration-300">
                     <PersonaDebriefView 
                        data={parsedReport} 
                        isEditing={false} // Prop kept for signature, but internal state used
                        onUpdate={setParsedReport}
                     />
                     
                     <div className="bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 p-6 rounded-b-xl flex justify-between items-center mt-6 shadow-xl">
                         <button 
                             onClick={handleEditAnswers}
                             className="flex items-center gap-2 px-6 py-3 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                         >
                             <ArrowLeft size={14}/> Edit Answers
                         </button>
                         <div className="flex items-center gap-4">
                             <div className="text-xs text-zinc-400">
                                 Do you want to add anything else? 
                                 <input type="text" className="ml-2 bg-zinc-100 dark:bg-zinc-800 border-none rounded px-2 py-1 text-zinc-900 dark:text-white focus:ring-1 focus:ring-black dark:focus:ring-white outline-none font-mono" placeholder="Optional notes..."/>
                             </div>
                             <button 
                                 onClick={handleApprovePersona}
                                 className="flex items-center gap-2 px-8 py-3 bg-green-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-green-600 transition-colors shadow-lg"
                             >
                                 <CheckCircle size={16}/> Approve Persona
                             </button>
                         </div>
                     </div>
                 </div>
             )}

             {/* Fallback for Legacy/Failed Parse Reports in Review */}
             {reviewingPersona && !parsedReport && (
                 <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 mb-8 shadow-xl animate-in zoom-in-95 duration-300">
                     <div className="mb-6">
                         <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2 font-mono uppercase font-bold tracking-wider">Persona Report for: {personaForm.name}</p>
                         <textarea 
                            className="w-full h-96 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 text-sm font-mono focus:ring-1 focus:ring-black dark:focus:ring-white outline-none resize-none leading-relaxed"
                            value={generatedReport}
                            onChange={(e) => setGeneratedReport(e.target.value)}
                         />
                     </div>
                     <div className="flex justify-between items-center">
                         <button onClick={handleEditAnswers} className="flex items-center gap-2 px-6 py-3 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                             <ArrowLeft size={14}/> Edit Answers
                         </button>
                         <button onClick={handleApprovePersona} className="flex items-center gap-2 px-8 py-3 bg-green-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-green-600 transition-colors shadow-lg">
                             <CheckCircle size={16}/> Approve Persona
                         </button>
                     </div>
                 </div>
             )}

             {/* Persona Detail Modal / Overlay */}
             {selectedPersonaId && (
                 <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                     <div className="bg-white dark:bg-zinc-900 w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl flex flex-col border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200 overflow-hidden">
                         {(() => {
                             const persona = memories.find(m => m.id === selectedPersonaId);
                             if(!persona) return null;
                             
                             const parsedContent = safeParsePersona(persona.content);
                             
                             return (
                                 <>
                                     <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-950/50">
                                         <div className="flex items-center gap-3">
                                             <div className="p-2 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg">
                                                 <Users size={20}/>
                                             </div>
                                             <div>
                                                 <h3 className="text-xl font-bold text-zinc-900 dark:text-white uppercase tracking-tight">{persona.title}</h3>
                                                 <p className="text-xs text-zinc-500 font-mono">Persona Profile</p>
                                             </div>
                                         </div>
                                         <button onClick={() => { setSelectedPersonaId(null); setIsEditingCard(false); setParsedReport(null); }} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors"><X size={20}/></button>
                                     </div>
                                     
                                     <div className="flex-1 p-8 overflow-y-auto bg-zinc-50/50 dark:bg-black/20">
                                         {parsedContent ? (
                                             <PersonaDebriefView 
                                                data={parsedReport || parsedContent} // Use local state if editing, else stored
                                                isEditing={false} // Internal state handles this now
                                                onUpdate={(newData) => {
                                                    setParsedReport(newData);
                                                    // Auto-save logic could go here, but prompt implies save button
                                                }}
                                             />
                                         ) : (
                                            isEditingCard ? (
                                                <textarea 
                                                    className="w-full h-full min-h-[400px] bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 text-sm font-mono focus:ring-1 focus:ring-black dark:focus:ring-white outline-none resize-none leading-relaxed"
                                                    value={cardEditContent || persona.content}
                                                    onChange={(e) => setCardEditContent(e.target.value)}
                                                />
                                            ) : (
                                                <div className="prose prose-sm dark:prose-invert max-w-none font-mono whitespace-pre-line leading-loose text-zinc-700 dark:text-zinc-300">
                                                    {persona.content}
                                                </div>
                                            )
                                         )}
                                     </div>

                                     <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex justify-between items-center">
                                         {/* If parsed content exists, edits are handled inside cards. We just provide a "Close/Done" or "Save All" if needed. 
                                             But prompt asked for individual card saves. 
                                             The "Save Changes" button here is mostly for legacy raw text edits or final persistence if we treated local state as transient.
                                             Let's keep it to persist the final state from parsedReport back to memory.
                                          */}
                                         {parsedContent ? (
                                             <>
                                                 <button 
                                                    onClick={() => { if(window.confirm(t.confirmDelete)) { onDeleteMemory(persona.id); setSelectedPersonaId(null); } }}
                                                    className="px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors"
                                                 >
                                                     <Trash2 size={14}/> Delete Persona
                                                 </button>
                                                 {/* For parsed content, changes are saved via card buttons to parsedReport state. 
                                                     We need a way to commit parsedReport to memory. */}
                                                 <button onClick={handleSaveCardEdit} className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-2"><Save size={14}/> Save Updates</button>
                                             </>
                                         ) : (
                                            isEditingCard ? (
                                                <>
                                                    <button onClick={() => { setIsEditingCard(false); setParsedReport(null); }} className="px-4 py-2 text-zinc-500 font-bold text-xs uppercase tracking-wider">Cancel</button>
                                                    <button onClick={handleSaveCardEdit} className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-2"><Save size={14}/> Save Changes</button>
                                                </>
                                            ) : (
                                                <>
                                                    <button 
                                                        onClick={() => { if(window.confirm(t.confirmDelete)) { onDeleteMemory(persona.id); setSelectedPersonaId(null); } }}
                                                        className="px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors"
                                                    >
                                                        <Trash2 size={14}/> Delete Persona
                                                    </button>
                                                    <button 
                                                        onClick={() => { 
                                                            setIsEditingCard(true); 
                                                            setCardEditContent(persona.content); 
                                                        }}
                                                        className="px-6 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-black dark:hover:border-white rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm"
                                                    >
                                                        <Edit2 size={14}/> Edit Raw Text
                                                    </button>
                                                </>
                                            )
                                         )}
                                     </div>
                                 </>
                             );
                         })()}
                     </div>
                 </div>
             )}

             {/* Persona List Grid */}
             {!reviewingPersona && (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {memories.filter(m => m.type === MemoryType.PERSONA).map(persona => {
                         const parsed = safeParsePersona(persona.content);
                         const summary = parsed ? parsed.snapshot.summary : persona.content.substring(0, 150);
                         
                         return (
                             <button 
                                key={persona.id} 
                                onClick={() => setSelectedPersonaId(persona.id)}
                                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 group transition-all hover:border-black dark:hover:border-white hover:shadow-lg relative overflow-hidden text-left flex flex-col h-[280px]"
                             >
                                 <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-blue-500 opacity-80"></div>
                                 
                                 <div className="flex justify-between items-start mb-4 pl-3">
                                     <div className="flex items-center gap-3">
                                         <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-500 group-hover:text-black dark:group-hover:text-white transition-colors">
                                             <Users size={18}/>
                                         </div>
                                     </div>
                                     <Maximize2 size={14} className="text-zinc-300 group-hover:text-black dark:group-hover:text-white transition-colors"/>
                                 </div>
                                 
                                 <h3 className="text-lg font-bold text-zinc-900 dark:text-white uppercase tracking-tight mb-2 pl-3 group-hover:underline decoration-2 underline-offset-4">{persona.title}</h3>
                                 
                                 <div className="pl-3 flex-1 overflow-hidden relative">
                                     <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono leading-relaxed whitespace-pre-wrap mask-linear-fade">
                                         {summary}...
                                     </p>
                                     <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white dark:from-zinc-900 to-transparent"></div>
                                 </div>

                                 <div className="mt-4 pl-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                                     <BookOpen size={12}/> View Full Debriefing
                                 </div>
                             </button>
                         )
                     })}
                 </div>
             )}

             {memories.filter(m => m.type === MemoryType.PERSONA).length === 0 && !showPersonaForm && !reviewingPersona && (
                 <div className="text-center py-20 opacity-50 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                     <Users size={48} className="mx-auto mb-4 text-zinc-300"/>
                     <p className="text-sm font-mono text-zinc-500">{t.noPersonas}</p>
                 </div>
             )}
          </div>
      )}

    </div>
  );
};
