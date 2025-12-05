import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Memory, UserProfile, ContentDraft, Language, ContentFramework, ContentIntention, ContentFormat, PersonalizationFocus, Product, NewsItem, MemoryType } from '../types';
import { generatePersonalizedContent, repurposeContent, processAudioMemory, getTrendingNews, summarizeContentFromUrl, refineCarouselContent, analyzeBrainDump, humanizeContent } from '../services/geminiService';
import { Sparkles, Share2, RefreshCw, Link as LinkIcon, Image as ImageIcon, X, MoreHorizontal, MessageCircle, Heart, Repeat, Send, Trash2, Plus, Layers, Lightbulb, Calendar as CalendarIcon, Clock, Check, ChevronLeft, ChevronRight, Wand2, Type, Download, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline, Plus as PlusIcon, Minus as MinusIcon, UserCheck, ShoppingBag, Mic, Square, Brain, PlayCircle, Zap, Compass, History, ArrowLeft, CheckCircle, Flame, Search, Globe, ArrowRight, FileInput, Youtube, LayoutList, Info, Users, Save, ChevronUp, ChevronDown, Minimize2, Maximize2 } from 'lucide-react';
import { getTranslation } from '../translations';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, setHours, setMinutes } from 'date-fns';
import html2canvas from 'html2canvas';
import { INTENTIONS, FORMATS, FOCUS_AREAS, FRAMEWORKS } from '../frameworks';

interface WriterProps {
  profile: UserProfile;
  memories: Memory[];
  products?: Product[]; 
  saveDraft: (draft: ContentDraft) => void;
  language: Language;
  initialTopic?: string;
  initialMemory?: Memory | null;
  initialContent?: string;
}

// --- Rich Text Components ---

const RichTextToolbar = ({ onFormat }: { onFormat: (cmd: string, val?: string) => void }) => {
    return (
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1 mb-2 w-fit border border-zinc-200 dark:border-zinc-700">
            <button onClick={(e) => { e.preventDefault(); onFormat('bold'); }} className="p-1.5 hover:bg-white dark:hover:bg-zinc-600 rounded text-zinc-600 dark:text-zinc-300" title="Bold"><Bold size={14}/></button>
            <button onClick={(e) => { e.preventDefault(); onFormat('italic'); }} className="p-1.5 hover:bg-white dark:hover:bg-zinc-600 rounded text-zinc-600 dark:text-zinc-300" title="Italic"><Italic size={14}/></button>
            <button onClick={(e) => { e.preventDefault(); onFormat('underline'); }} className="p-1.5 hover:bg-white dark:hover:bg-zinc-600 rounded text-zinc-600 dark:text-zinc-300" title="Underline"><Underline size={14}/></button>
        </div>
    )
}

const EditorBlock = ({ html, onChange, placeholder, minHeight = "80px" }: { html: string, onChange: (html: string) => void, placeholder?: string, minHeight?: string }) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const lastHtmlRef = useRef(html);

    useEffect(() => {
        if (contentRef.current && html !== lastHtmlRef.current) {
            contentRef.current.innerHTML = html;
            lastHtmlRef.current = html;
        }
    }, [html]);

    const handleInput = () => {
        if (contentRef.current) {
            const newHtml = contentRef.current.innerHTML;
            if (newHtml !== lastHtmlRef.current) {
                lastHtmlRef.current = newHtml;
                onChange(newHtml);
            }
        }
    };

    const applyFormat = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        if (contentRef.current) handleInput();
    };

    return (
        <div className="relative group font-mono">
             <div className="absolute -top-8 left-0 opacity-0 group-focus-within:opacity-100 transition-opacity z-10">
                 <RichTextToolbar onFormat={applyFormat} />
             </div>
            <div
                ref={contentRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleInput}
                className="w-full bg-transparent border-none outline-none resize-none focus:ring-0 p-0 text-sm md:text-base text-zinc-900 dark:text-white empty:before:content-[attr(data-placeholder)] empty:before:text-zinc-400 font-mono"
                data-placeholder={placeholder}
                style={{ minHeight, whiteSpace: 'pre-wrap' }}
            />
        </div>
    );
};

interface EditorProps {
    content: string;
    onChange: (content: string) => void;
    profile: UserProfile;
    t: any;
    refinementVersion: number; 
    topic?: string;
    onShowToast?: (msg: string) => void;
    language?: Language;
}

const TwitterEditor: React.FC<EditorProps> = ({ content, onChange, profile, t, refinementVersion }) => {
    const [tweets, setTweets] = useState<{id: number, text: string, image?: string}[]>([]);
    const displayName = profile?.name || "Creator";
    const lastContentRef = useRef(content);
    
    // Parse content into tweets
    useEffect(() => {
        if (tweets.length === 0 || lastContentRef.current !== content) {
             const splitText = content.split('\n\n');
             setTweets(splitText.map((text, i) => {
                 let cleanText = text.trim();
                 const isFraction = /^\d+\/\d+/.test(cleanText); 
                 if (!isFraction) {
                     cleanText = cleanText.replace(/^\d+[\/\.]\s*/, '');
                 }
                 return { id: Date.now() + i, text: cleanText };
             }));
             lastContentRef.current = content;
        }
    }, [content, refinementVersion]);

    const updateParent = (newTweets: typeof tweets) => {
        setTweets(newTweets);
        const joined = newTweets.map(t => t.text).join('\n\n');
        lastContentRef.current = joined; 
        onChange(joined);
    };

    const handleTweetChange = (id: number, newText: string) => {
        const newTweets = tweets.map(tw => tw.id === id ? { ...tw, text: newText } : tw);
        updateParent(newTweets);
    };

    const handleImageUpload = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newTweets = tweets.map(tw => tw.id === id ? { ...tw, image: reader.result as string } : tw);
                updateParent(newTweets);
            };
            reader.readAsDataURL(file);
        }
    };

    const addTweet = () => {
        updateParent([...tweets, { id: Date.now(), text: '' }]);
    };

    const removeTweet = (id: number) => {
        updateParent(tweets.filter(t => t.id !== id));
    };

    const getCharCount = (html: string) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        return tempDiv.textContent?.length || 0;
    }

    return (
        <div className="max-w-xl mx-auto pb-20 pt-8 font-sans">
            {tweets.map((tweet, index) => {
                const charCount = getCharCount(tweet.text);
                const remaining = 280 - charCount;
                const isOverLimit = remaining < 0;
                
                return (
                <div key={tweet.id} className="flex gap-4 relative group mb-4">
                    <div className="flex flex-col items-center shrink-0">
                        <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 font-bold">
                            {displayName.substring(0, 2).toUpperCase()}
                        </div>
                        {index !== tweets.length - 1 && (
                            <div className="w-0.5 flex-1 bg-zinc-200 dark:bg-zinc-800 my-2"></div>
                        )}
                    </div>

                    <div className="flex-1 pb-8">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-zinc-900 dark:text-white">{displayName}</span>
                                <span className="text-zinc-500 text-sm">@{displayName.replace(/\s/g, '').toLowerCase()}</span>
                            </div>
                            {index > 0 && (
                                <button 
                                    onClick={() => removeTweet(tweet.id)} 
                                    className="text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                                    title={t.deleteTweet}
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>

                        <EditorBlock 
                            html={tweet.text} 
                            onChange={(val) => handleTweetChange(tweet.id, val)}
                            placeholder={t.tweetPlaceholder}
                        />

                        {tweet.image && (
                            <div className="mt-2 relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
                                <img src={tweet.image} alt="Tweet media" className="w-full h-auto max-h-[300px] object-cover" />
                                <button onClick={() => {
                                     const newTweets = tweets.map(tw => tw.id === tweet.id ? { ...tw, image: undefined } : tw);
                                     updateParent(newTweets);
                                }} className="absolute top-2 right-2 bg-black/50 p-1 rounded-full text-white">
                                    <X size={14} />
                                </button>
                            </div>
                        )}

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-900">
                            <div className="flex items-center gap-2 text-zinc-500">
                                <label className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full cursor-pointer text-blue-500 transition-colors">
                                    <ImageIcon size={18} />
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(tweet.id, e)} />
                                </label>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-bold ${isOverLimit ? 'text-red-500' : 'text-zinc-400'}`}>
                                        {remaining}
                                    </span>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                        isOverLimit ? 'border-red-500' : remaining < 20 ? 'border-yellow-500' : 'border-zinc-200 dark:border-zinc-700'
                                    }`}>
                                        <div 
                                            className={`w-full h-full rounded-full transition-all duration-300 ${isOverLimit ? 'bg-red-500' : 'bg-transparent'}`}
                                            style={{ transform: isOverLimit ? 'scale(1)' : `scale(${Math.max(0, charCount / 280)})` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )})}
            <button 
                onClick={addTweet} 
                className="w-full py-4 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-400 hover:text-blue-500 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all flex items-center justify-center gap-2 font-medium"
            >
                <Plus size={20} />
                {t.addTweet}
            </button>
        </div>
    )
}

// Instagram Editor Components
interface SlideStyle { textAlign: 'left' | 'center' | 'right'; fontFamily: string; }
interface Slide { id: number; html: string; image?: string; style: SlideStyle; }

const FONT_OPTIONS = [
    { id: 'Inter', label: 'Inter (Standard)', family: "'Inter', sans-serif" },
    { id: 'Playfair Display', label: 'Playfair (Serif)', family: "'Playfair Display', serif" },
    { id: 'JetBrains Mono', label: 'JetBrains (Tech)', family: "'JetBrains Mono', monospace" },
    { id: 'Caveat', label: 'Caveat (Handwritten)', family: "'Caveat', cursive" },
    { id: 'Oswald', label: 'Oswald (Bold)', family: "'Oswald', sans-serif" },
    { id: 'Merriweather', label: 'Merriweather (Classic)', family: "'Merriweather', serif" },
    { id: 'Orbitron', label: 'Orbitron (Futuristic)', family: "'Orbitron', sans-serif" },
    { id: 'Dancing Script', label: 'Dancing Script (Cursive)', family: "'Dancing Script', cursive" },
    { id: 'Anton', label: 'Anton (Impact)', family: "'Anton', sans-serif" },
    { id: 'Quicksand', label: 'Quicksand (Rounded)', family: "'Quicksand', sans-serif" },
];

const GoogleFontsLoader = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Caveat:wght@400;700&family=Dancing+Script:wght@400;700&family=Inter:wght@300;400;700&family=JetBrains+Mono:wght@400;700&family=Merriweather:wght@300;400;700&family=Orbitron:wght@400;700&family=Oswald:wght@400;700&family=Playfair+Display:wght@400;700&family=Quicksand:wght@300;400;700&display=swap');
    `}</style>
);

const EditableSlide = ({ html, style, onContentChange, onFocus, onBlur, id }: { html: string, style: SlideStyle, onContentChange: (h: string) => void, onFocus: () => void, onBlur: () => void, id: number }) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const lastHtmlRef = useRef(html);

    useEffect(() => { if (contentRef.current) { contentRef.current.innerHTML = html; lastHtmlRef.current = html; } }, [id]); 

    const handleInput = () => { if (contentRef.current) { const newHtml = contentRef.current.innerHTML; if (newHtml !== lastHtmlRef.current) { lastHtmlRef.current = newHtml; onContentChange(newHtml); } } };

    return (
        <div
            ref={contentRef} contentEditable suppressContentEditableWarning onInput={handleInput} onFocus={onFocus} onBlur={onBlur} onMouseUp={onBlur} onKeyUp={onBlur}
            className={`relative z-10 w-full h-full outline-none p-8 flex flex-col justify-center overflow-hidden select-text`}
            style={{ 
                textAlign: style.textAlign, 
                fontFamily: style.fontFamily,
                color: '#ffffff', 
                textShadow: '0 2px 10px rgba(0,0,0,0.5)', 
                fontSize: '24px', 
                lineHeight: 1.4, 
                whiteSpace: 'pre-wrap' 
            }}
        />
    );
};

const InstagramEditor: React.FC<EditorProps> = ({ content, onChange, t, refinementVersion, onShowToast, language }) => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [activeSlideId, setActiveSlideId] = useState<number | null>(null);
  const [fontSizeSlider, setFontSizeSlider] = useState(3); 
  
  const lastContentRef = useRef(content);
  const [downloading, setDownloading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);

  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const savedSelection = useRef<Range | null>(null);
  const IMG_DELIMITER = "||IMG:"; const END_IMG_DELIMITER = "||"; const STYLE_DELIMITER = "||STYLE:"; const END_STYLE_DELIMITER = "||";
  const defaultStyle: SlideStyle = { textAlign: 'center', fontFamily: "'Inter', sans-serif" };

  useEffect(() => {
     if (slides.length === 0 || lastContentRef.current !== content) {
        // Cleanup: Remove any hallucinated "Slide X:" headers using regex
        const cleanContent = content.replace(/\*\*Slide \d+:.*?\*\*/gi, '').replace(/Slide \d+:/gi, '');
        const splitText = cleanContent.split('\n\n');
        const parsedSlides = splitText.map((block, i) => {
            let html = block.trim();
            let image = undefined;
            let style = { ...defaultStyle };

            const imgMatch = html.match(/\|\|IMG:(.*?)\|\|/);
            if (imgMatch) { image = imgMatch[1]; html = html.replace(imgMatch[0], ''); }

            const styleMatch = html.match(/\|\|STYLE:(.*?)\|\|/);
            if (styleMatch) {
                try { const parsedStyle = JSON.parse(styleMatch[1]); style = { ...defaultStyle, ...parsedStyle }; } catch (e) { console.warn("Failed to parse slide style", e); }
                html = html.replace(styleMatch[0], '');
            }
            return { id: Date.now() + i, html: html.trim(), image: image, style: style };
        });
        setSlides(parsedSlides);
        if (parsedSlides.length > 0 && activeSlideId === null) setActiveSlideId(parsedSlides[0].id);
        lastContentRef.current = content;
     }
  }, [content, refinementVersion]);

  const updateParent = (newSlides: Slide[]) => {
      setSlides(newSlides);
      const joined = newSlides.map(s => {
          let line = s.html;
          if (s.image) line += `${IMG_DELIMITER}${s.image}${END_IMG_DELIMITER}`;
          const styleJson = JSON.stringify(s.style);
          line += `${STYLE_DELIMITER}${styleJson}${END_STYLE_DELIMITER}`;
          return line;
      }).join('\n\n');
      lastContentRef.current = joined;
      onChange(joined);
  };

  const handleSlideHtmlChange = useCallback((id: number, newHtml: string) => {
      setSlides(prev => {
          const newSlides = prev.map(s => s.id === id ? { ...s, html: newHtml } : s);
          const joined = newSlides.map(s => {
            let line = s.html;
            if (s.image) line += `${IMG_DELIMITER}${s.image}${END_IMG_DELIMITER}`;
            const styleJson = JSON.stringify(s.style);
            line += `${STYLE_DELIMITER}${styleJson}${END_STYLE_DELIMITER}`;
            return line;
          }).join('\n\n');
          lastContentRef.current = joined;
          onChange(joined); 
          return newSlides;
      });
  }, [onChange]); 

  const addSlide = () => { const newId = Date.now(); updateParent([...slides, { id: newId, html: 'New Slide', style: { ...defaultStyle } }]); setActiveSlideId(newId); };
  const removeSlide = (id: number) => { const newSlides = slides.filter(s => s.id !== id); updateParent(newSlides); if (activeSlideId === id && newSlides.length > 0) setActiveSlideId(newSlides[0].id); };
  const saveSelectionRange = () => { const sel = window.getSelection(); if (sel && sel.rangeCount > 0) { const range = sel.getRangeAt(0); if (range.commonAncestorContainer.parentElement?.closest('[contenteditable="true"]')) savedSelection.current = range; } };
  const restoreSelectionRange = () => { const sel = window.getSelection(); if (sel && savedSelection.current) { sel.removeAllRanges(); sel.addRange(savedSelection.current); } };
  const applyFormat = (command: string, value?: string) => { restoreSelectionRange(); document.execCommand('styleWithCSS', false, 'true'); document.execCommand(command, false, value); if (activeSlideId) { const activeEl = document.querySelector(`[data-slide-id="${activeSlideId}"] [contenteditable="true"]`); if (activeEl) handleSlideHtmlChange(activeSlideId, activeEl.innerHTML); } saveSelectionRange(); };
  const updateGlobalSlideStyle = (updates: Partial<SlideStyle>) => { if (activeSlideId === null) return; const newSlides = slides.map(s => s.id === activeSlideId ? { ...s, style: { ...s.style, ...updates } } : s); updateParent(newSlides); };

  const handleRefine = async (mode: 'spread' | 'shorter' | 'longer') => {
      setIsRefining(true);
      if (onShowToast) onShowToast("Refining carousel content...");
      const fullText = slides.map(s => s.html.replace(/<[^>]*>/g, '')).join('\n\n');
      const newContent = await refineCarouselContent(fullText, mode, language || 'en');
      onChange(newContent);
      setIsRefining(false);
      if (onShowToast) onShowToast("Done! Slides updated.");
  }

  const handleDownloadAll = async () => {
      setDownloading(true);
      try {
          for (let i = 0; i < slides.length; i++) {
              const el = slideRefs.current[i];
              if (el) { const canvas = await html2canvas(el, { useCORS: true, scale: 2, backgroundColor: null, logging: false }); const link = document.createElement('a'); link.download = `slide_${i + 1}.png`; link.href = canvas.toDataURL('image/png'); link.click(); }
          }
          if (onShowToast) onShowToast("Slides exported!");
      } catch (e) { if (onShowToast) onShowToast("Failed to export."); } finally { setDownloading(false); }
  };

  const activeSlide = slides.find(s => s.id === activeSlideId) || slides[0];
  const currentStyle = activeSlide?.style || defaultStyle;
  const PRESET_COLORS = ['#FFFFFF', '#000000', '#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  return (
      <div className="max-w-5xl mx-auto pb-20 font-mono">
          <GoogleFontsLoader />
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 mb-6 shadow-sm sticky top-0 z-30 transition-all" onMouseDown={(e) => { const tagName = (e.target as HTMLElement).tagName; if (tagName !== 'INPUT' && tagName !== 'SELECT' && tagName !== 'TEXTAREA') e.preventDefault(); }}>
             <div className="flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2 border-r border-zinc-200 dark:border-zinc-700 pr-4 mr-2">
                    <span className="text-[10px] font-bold uppercase text-zinc-400">Slide</span>
                    <span className="text-xs font-bold bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">{slides.findIndex(s => s.id === activeSlideId) + 1}</span>
                </div>
                 <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
                    <button onClick={() => updateGlobalSlideStyle({ textAlign: 'left' })} className={`p-1.5 rounded-md ${currentStyle.textAlign === 'left' ? 'bg-white dark:bg-zinc-600 shadow-sm' : ''}`}><AlignLeft size={14}/></button>
                    <button onClick={() => updateGlobalSlideStyle({ textAlign: 'center' })} className={`p-1.5 rounded-md ${currentStyle.textAlign === 'center' ? 'bg-white dark:bg-zinc-600 shadow-sm' : ''}`}><AlignCenter size={14}/></button>
                    <button onClick={() => updateGlobalSlideStyle({ textAlign: 'right' })} className={`p-1.5 rounded-md ${currentStyle.textAlign === 'right' ? 'bg-white dark:bg-zinc-600 shadow-sm' : ''}`}><AlignRight size={14}/></button>
                 </div>
                 
                 <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
                     <select 
                        value={currentStyle.fontFamily} 
                        onChange={(e) => updateGlobalSlideStyle({ fontFamily: e.target.value })}
                        className="bg-transparent text-xs font-bold text-zinc-700 dark:text-zinc-300 focus:outline-none px-2 py-1 w-[120px] font-mono"
                     >
                         {FONT_OPTIONS.map(font => (
                             <option key={font.id} value={font.family}>{font.label}</option>
                         ))}
                     </select>
                 </div>

                 <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-1"></div>
                 <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1 gap-1">
                    <button onClick={() => applyFormat('bold')} className="p-1.5 hover:bg-white dark:hover:bg-zinc-600 rounded" title="Bold"><Bold size={14}/></button>
                    <button onClick={() => applyFormat('italic')} className="p-1.5 hover:bg-white dark:hover:bg-zinc-600 rounded" title="Italic"><Italic size={14}/></button>
                    <button onClick={() => applyFormat('underline')} className="p-1.5 hover:bg-white dark:hover:bg-zinc-600 rounded" title="Underline"><Underline size={14}/></button>
                 </div>
                 <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-1.5 border border-zinc-200 dark:border-zinc-700">
                    <input type="range" min="1" max="7" step="1" value={fontSizeSlider} onMouseDown={() => saveSelectionRange()} onChange={(e) => { const val = parseInt(e.target.value); setFontSizeSlider(val); applyFormat('fontSize', e.target.value); }} className="w-24 h-1 bg-zinc-300 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white"/>
                 </div>
                 <div className="flex items-center gap-1 ml-2 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
                     {PRESET_COLORS.map(color => (
                         <button key={color} onMouseDown={(e) => { e.preventDefault(); applyFormat('foreColor', color); }} className="w-5 h-5 rounded-full border border-zinc-300 hover:scale-110 transition-transform shadow-sm focus:outline-none" style={{ backgroundColor: color }} title={color} />
                     ))}
                     <div className="relative w-6 h-6 ml-1 rounded-full overflow-hidden cursor-pointer border border-zinc-300 hover:scale-110 transition-transform bg-gradient-to-br from-red-500 via-green-500 to-blue-500">
                        <input type="color" onClick={() => saveSelectionRange()} onInput={(e: any) => applyFormat('foreColor', e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" title="Custom Color" />
                     </div>
                 </div>
             </div>
             <div className="h-px w-full bg-zinc-100 dark:bg-zinc-800 my-3"></div>
             <div className="flex flex-wrap gap-4 items-center justify-between">
                 {/* New Carousel Action Toolbar */}
                 <div className="flex items-center gap-2">
                     <button 
                        onClick={() => handleRefine('spread')}
                        disabled={isRefining}
                        className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 px-3 py-2 rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center gap-2 transition-colors disabled:opacity-50"
                        title="Spread content across more slides (Max 12)"
                     >
                        {isRefining ? <RefreshCw className="animate-spin" size={12}/> : <LayoutList size={12}/>} Spread Text
                    </button>
                    <button 
                        onClick={() => handleRefine('shorter')}
                        disabled={isRefining}
                        className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 px-3 py-2 rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center gap-2 transition-colors disabled:opacity-50"
                        title="Condense text and summarize"
                     >
                        {isRefining ? <RefreshCw className="animate-spin" size={12}/> : <Minimize2 size={12}/>} Make Shorter
                    </button>
                    <button 
                        onClick={() => handleRefine('longer')}
                        disabled={isRefining}
                        className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 px-3 py-2 rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center gap-2 transition-colors disabled:opacity-50"
                        title="Expand ideas and add detail"
                     >
                        {isRefining ? <RefreshCw className="animate-spin" size={12}/> : <Maximize2 size={12}/>} Make Longer
                    </button>
                 </div>

                 <div className="flex gap-2">
                    <button onClick={handleDownloadAll} disabled={downloading} className="bg-zinc-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors disabled:opacity-50 shadow-md hover:scale-105 transform whitespace-nowrap">
                        {downloading ? <RefreshCw className="animate-spin" size={14} /> : <Download size={14} />}
                        Export All
                    </button>
                 </div>
             </div>
          </div>
          <div className="overflow-x-auto custom-scrollbar pb-8">
             <div className="flex gap-6 items-start pl-2">
                {slides.map((slide, index) => { return (
                    <div key={slide.id} className="flex-shrink-0 w-[320px] group relative" data-slide-id={slide.id}>
                        <div onClick={() => { setActiveSlideId(slide.id); }} className={`rounded-xl transition-all duration-200 ${activeSlideId === slide.id ? 'ring-4 ring-blue-500 ring-offset-2 ring-offset-zinc-50 dark:ring-offset-zinc-950' : 'hover:ring-2 hover:ring-zinc-300 dark:hover:ring-zinc-700'}`}>
                            <div ref={(el) => { slideRefs.current[index] = el; }} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg overflow-hidden aspect-[3/4] flex flex-col relative select-none" >
                                <div className="flex-1 relative flex items-center justify-center bg-zinc-100 dark:bg-zinc-950 overflow-hidden">
                                    {slide.image ? ( <> <img src={slide.image} className="absolute inset-0 w-full h-full object-cover" alt="bg" crossOrigin="anonymous" /> <div className="absolute inset-0 bg-black/20 pointer-events-none" /> </> ) : ( <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5"> <ImageIcon size={64} /> </div> )}
                                    <EditableSlide id={slide.id} html={slide.html} style={slide.style} onContentChange={(newHtml) => handleSlideHtmlChange(slide.id, newHtml)} onFocus={() => setActiveSlideId(slide.id)} onBlur={() => saveSelectionRange()} />
                                </div>
                            </div>
                        </div>
                        <div className="mt-3 flex justify-between items-center px-2">
                            <span className={`text-xs font-bold uppercase tracking-wider transition-colors ${activeSlideId === slide.id ? 'text-blue-500' : 'text-zinc-400'}`}> {t.slide} {index + 1} </span>
                            {slides.length > 1 && ( <button onClick={() => removeSlide(slide.id)} className="text-zinc-300 hover:text-red-500 transition-colors p-1"> <Trash2 size={14} /> </button> )}
                        </div>
                    </div>
                )})}
                <button onClick={addSlide} className="flex-shrink-0 w-[320px] aspect-[3/4] border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col items-center justify-center text-zinc-400 hover:text-blue-500 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all gap-2"> <Plus size={32} /> <span className="font-medium">{t.addSlide}</span> </button>
             </div>
          </div>
      </div>
  );
}

const LinkedInEditor: React.FC<EditorProps> = ({ content, onChange, profile, t, refinementVersion }) => {
    const [image, setImage] = useState<string | null>(null);
    const displayName = profile?.name || "Creator";
    const [localContent, setLocalContent] = useState(content);
    const lastContentRef = useRef(content);

    useEffect(() => { if (content !== lastContentRef.current) { setLocalContent(content); lastContentRef.current = content; } }, [content, refinementVersion]);

    const handleChange = (val: string) => { setLocalContent(val); lastContentRef.current = val; onChange(val); }
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => setImage(reader.result as string); reader.readAsDataURL(file); } };

    return (
        <div className="max-w-xl mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden pt-4 font-sans">
             <div className="p-4 flex justify-between items-start">
                <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300 font-bold text-lg">
                        {displayName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm text-zinc-900 dark:text-white leading-tight">{displayName}</h3>
                        <p className="text-xs text-zinc-500 leading-tight">{profile?.niche || "Writer"} • 1st</p>
                        <p className="text-xs text-zinc-400 leading-tight mt-0.5">Now • <span className="inline-block ml-1">🌐</span></p>
                    </div>
                </div>
                <button className="text-zinc-500"><MoreHorizontal size={20} /></button>
             </div>
             <div className="px-4 pb-2">
                <EditorBlock 
                    html={localContent}
                    onChange={handleChange}
                    placeholder={t.linkedinPlaceholder}
                    minHeight="200px"
                />
             </div>
             {image ? ( <div className="relative w-full"> <img src={image} alt="Post" className="w-full h-auto object-cover" /> <button onClick={() => setImage(null)} className="absolute top-2 right-2 bg-black/50 p-1 rounded-full text-white"> <X size={16} /> </button> </div> ) : ( <div className="px-4 pb-4"> <label className="flex items-center justify-center w-full p-8 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-lg cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-600"> <div className="flex flex-col items-center gap-2"> <ImageIcon size={24} /> <span className="text-xs font-medium">Add Photo / Video</span> </div> <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} /> </label> </div> )}
             <div className="border-t border-zinc-100 dark:border-zinc-800 px-4 py-2 flex justify-between items-center">
                 <div className="flex gap-1">
                     <button className="flex items-center gap-1.5 px-3 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md text-zinc-500 text-sm font-medium transition-colors"> <Heart size={18} /> <span>Like</span> </button>
                     <button className="flex items-center gap-1.5 px-3 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md text-zinc-500 text-sm font-medium transition-colors"> <MessageCircle size={18} /> <span>Comment</span> </button>
                     <button className="flex items-center gap-1.5 px-3 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md text-zinc-500 text-sm font-medium transition-colors"> <Repeat size={18} /> <span>Repost</span> </button>
                     <button className="flex items-center gap-1.5 px-3 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md text-zinc-500 text-sm font-medium transition-colors"> <Send size={18} /> <span>Send</span> </button>
                 </div>
             </div>
        </div>
    );
}

// ... (CampaignModal Component Removed)

// --- Main Writer Component ---

type StudioMode = 'HUB' | 'BRAIN_DUMP' | 'GUIDED' | 'MEMORY_HUNT' | 'NEWS_JACK' | 'LINK_ANALYSIS';

export const Writer: React.FC<WriterProps> = ({ profile, memories, products = [], saveDraft, language, initialTopic, initialMemory, initialContent }) => {
  const t = getTranslation(language);
  
  // ... (State management remains identical)
  const [studioMode, setStudioMode] = useState<StudioMode>('HUB');
  const [topic, setTopic] = useState(initialTopic || '');
  const [platform, setPlatform] = useState('twitter');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [refinementVersion, setRefinementVersion] = useState(0); 
  const [brainDumpText, setBrainDumpText] = useState('');
  const [brainDumpMode, setBrainDumpMode] = useState<'text' | 'audio'>('text');
  const [isRecordingDump, setIsRecordingDump] = useState(false);
  const dumpMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const dumpAudioChunksRef = useRef<Blob[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [newsQuery, setNewsQuery] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkSummary, setLinkSummary] = useState('');
  const [isAnalyzingLink, setIsAnalyzingLink] = useState(false);
  const [userOpinion, setUserOpinion] = useState('');
  const [isRecordingOpinion, setIsRecordingOpinion] = useState(false);
  const opinionMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const opinionAudioChunksRef = useRef<Blob[]>([]);
  const [showStyleMatch, setShowStyleMatch] = useState(false);
  const [styleReference, setStyleReference] = useState('');
  const [isHumanizing, setIsHumanizing] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleMonth, setScheduleMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('12:00');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedIntention, setSelectedIntention] = useState<ContentIntention | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<ContentFormat | null>(null);
  const [selectedFocus, setSelectedFocus] = useState<PersonalizationFocus | null>(null);
  const [selectedFramework, setSelectedFramework] = useState<ContentFramework | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductSelect, setShowProductSelect] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<Memory | null>(null);
  const [showPersonaSelect, setShowPersonaSelect] = useState(false);
  
  // NEW STATE FOR SMART BRAIN DUMP
  const [isAnalyzingDump, setIsAnalyzingDump] = useState(false);
  const [dumpAngles, setDumpAngles] = useState<{title: string, hook: string, type: string, description: string}[]>([]);
  const [selectedDumpAngle, setSelectedDumpAngle] = useState<number | null>(null);

  useEffect(() => { if (initialTopic) setTopic(initialTopic); }, [initialTopic]);
  useEffect(() => { if (initialContent) { setGeneratedContent(initialContent); setRefinementVersion(prev => prev + 1); } }, [initialContent]);
  useEffect(() => { if (initialMemory) { setTopic(initialMemory.title); setStudioMode('GUIDED'); setWizardStep(5); const focus = FOCUS_AREAS.find(f => f.memoryTypes.includes(initialMemory.type)); if (focus) setSelectedFocus(focus); } else if (initialTopic) { setStudioMode('GUIDED'); setWizardStep(5); } }, [initialMemory, initialTopic]);
  useEffect(() => { if (studioMode === 'NEWS_JACK' && news.length === 0) { fetchNews(); } }, [studioMode]);

  const fetchNews = async (manualQuery?: string) => { setLoadingNews(true); let query = manualQuery; if (!query && profile) { const location = language === 'pt' ? 'Brazil' : 'USA'; query = `Trending news and events about ${profile.niche} for ${profile.audience} in ${location}`; } const trending = await getTrendingNews(language, query); setNews(trending); setLoadingNews(false); };
  const handleAnalyzeLink = async () => { if(!linkUrl.trim()) return; setIsAnalyzingLink(true); const summary = await summarizeContentFromUrl(linkUrl, language); setLinkSummary(summary); setIsAnalyzingLink(false); }
  const startRecordingOpinion = async () => { try { const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); const mediaRecorder = new MediaRecorder(stream); opinionMediaRecorderRef.current = mediaRecorder; opinionAudioChunksRef.current = []; mediaRecorder.ondataavailable = (event) => { if (event.data.size > 0) opinionAudioChunksRef.current.push(event.data); }; mediaRecorder.onstop = async () => { const audioBlob = new Blob(opinionAudioChunksRef.current, { type: 'audio/mp3' }); const reader = new FileReader(); reader.readAsDataURL(audioBlob); reader.onloadend = async () => { const base64Audio = reader.result as string; const cleanBase64 = base64Audio.split(',')[1]; try { const result = await processAudioMemory(cleanBase64, language); setUserOpinion(prev => prev + " " + result.text); } catch(e) { console.error(e); } }; mediaRecorder.stream.getTracks().forEach(t => t.stop()); }; mediaRecorder.start(); setIsRecordingOpinion(true); } catch (err) { console.error("Mic error", err); } };
  const stopRecordingOpinion = () => { if (opinionMediaRecorderRef.current && isRecordingOpinion) { opinionMediaRecorderRef.current.stop(); setIsRecordingOpinion(false); } };
  const handleFormatSelection = (f: ContentFormat) => { setSelectedFormat(f); if (f.id.startsWith('x_')) setPlatform('twitter'); else if (f.id.startsWith('ig_')) setPlatform('instagram'); else setPlatform('linkedin'); };
  const handleGenerateFromLink = async () => { if (!linkSummary) return; setIsGenerating(true); const combinedSource = `[EXTERNAL CONTENT SUMMARY]:\n${linkSummary}\n\n[USER'S OPINION/PERSPECTIVE]:\n${userOpinion || "No specific opinion provided. Provide a balanced analysis."}`; const result = await generatePersonalizedContent({ profile, memories, topic: "Link Analysis", platform, language, format: selectedFormat || undefined, sourceMaterial: combinedSource, persona: selectedPersona?.content }); setGeneratedContent(result); setRefinementVersion(prev => prev + 1); setIsGenerating(false); }
  
  // Updated Generate Function for Brain Dump to handle angles
  const handleGenerate = async (forcedTopic?: string, angleDescription?: string) => { 
      const effectiveTopic = forcedTopic || topic || "Brain Dump Content";
      if (!effectiveTopic && !brainDumpText) return; 
      setIsGenerating(true); 
      
      let sourceContext = ''; 
      if (studioMode === 'BRAIN_DUMP' && brainDumpText) { 
          sourceContext += `\n\n[USER BRAIN DUMP / RAW THOUGHTS]:\n${brainDumpText}`;
          if (angleDescription) {
             sourceContext += `\n\n(STRATEGIC INSTRUCTION: Focus specifically on this angle: ${angleDescription})`;
          } else {
             sourceContext += `\n\n(INSTRUCTION: Structure these raw thoughts into the selected format.)`;
          }
      } 
      
      const result = await generatePersonalizedContent({ 
          profile, 
          memories, 
          topic: effectiveTopic, 
          platform, 
          language, 
          framework: selectedFramework || undefined, 
          format: selectedFormat || undefined, 
          focusTypes: selectedFocus?.memoryTypes, 
          sourceMaterial: sourceContext, 
          styleReference: showStyleMatch ? styleReference : undefined, 
          product: selectedProduct || undefined,
          persona: selectedPersona?.content || undefined
      }); 
      setGeneratedContent(result); 
      setRefinementVersion(prev => prev + 1); 
      setIsGenerating(false); 
      setBrainDumpText('');
      setDumpAngles([]); // Reset dump state
      setSelectedDumpAngle(null);
  };

  const handleAnalyzeDump = async () => {
      if(!brainDumpText) return;
      setIsAnalyzingDump(true);
      const angles = await analyzeBrainDump(brainDumpText, language);
      setDumpAngles(angles);
      setIsAnalyzingDump(false);
  }

  const handleHumanize = async () => { if (!generatedContent) return; setIsHumanizing(true); const result = await humanizeContent(generatedContent, profile, language); setGeneratedContent(result); setRefinementVersion(prev => prev + 1); setIsHumanizing(false); triggerToast("Content Humanized"); };
  const handleSave = (status: 'draft' | 'scheduled' | 'published' = 'draft', dateToSave?: Date) => { if (!generatedContent) return; const finalDate = dateToSave ? dateToSave.toISOString() : undefined; const draft: ContentDraft = { id: Date.now().toString(), title: topic || "Untitled Draft", content: generatedContent, platform: platform as any, status: status, date: new Date().toISOString(), scheduledDate: finalDate }; saveDraft(draft); if (status === 'scheduled') { setIsScheduling(false); triggerToast(t.scheduled); } else if (status === 'published') triggerToast(t.published); else triggerToast("Draft saved!"); };
  const triggerToast = (msg: string) => { setToastMessage(msg); setShowToast(true); setTimeout(() => setShowToast(false), 3000); };
  const handleConfirmSchedule = () => { if (!selectedDate) return; const [h, m] = selectedTime.split(':').map(Number); handleSave('scheduled', setMinutes(setHours(selectedDate, h), m)); };
  const filteredFrameworks = FRAMEWORKS.filter(fw => { return (selectedIntention ? fw.intentionId === selectedIntention.id : true) && (selectedFormat ? fw.formatIds.includes(selectedFormat.id) : true) && (selectedFocus ? fw.focusId === selectedFocus.id : true); });
  const startDumpRecording = async () => { try { const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); const mediaRecorder = new MediaRecorder(stream); dumpMediaRecorderRef.current = mediaRecorder; dumpAudioChunksRef.current = []; mediaRecorder.ondataavailable = (event) => { if (event.data.size > 0) dumpAudioChunksRef.current.push(event.data); }; mediaRecorder.onstop = async () => { const audioBlob = new Blob(dumpAudioChunksRef.current, { type: 'audio/mp3' }); const reader = new FileReader(); reader.readAsDataURL(audioBlob); reader.onloadend = async () => { const base64Audio = reader.result as string; const cleanBase64 = base64Audio.split(',')[1]; try { const result = await processAudioMemory(cleanBase64, language); setBrainDumpText(result.text); } catch(e) { console.error(e); } }; mediaRecorder.stream.getTracks().forEach(t => t.stop()); }; mediaRecorder.start(); setIsRecordingDump(true); } catch (err) { console.error("Mic error", err); } };
  const stopDumpRecording = () => { if (dumpMediaRecorderRef.current && isRecordingDump) { dumpMediaRecorderRef.current.stop(); setIsRecordingDump(false); } };

  // ... (PersonaSelector and Render functions remain mostly same, omitting for brevity until Editor View) ...
  // --- REUSABLE COMPONENT: PERSONA SELECTOR ---
  const PersonaSelector = () => (
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 bg-white dark:bg-zinc-900 mb-6 transition-all shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 font-mono">
        <button onClick={() => setShowPersonaSelect(!showPersonaSelect)} className="flex items-center justify-between w-full group">
            <div className="flex items-center gap-2">
                <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                    <Users size={16}/>
                </div>
                <span className="font-bold text-xs uppercase tracking-wide group-hover:text-black dark:group-hover:text-white transition-colors">Optional: Target Specific Persona?</span>
                {selectedPersona && <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-purple-200 dark:border-purple-800">{selectedPersona.title}</span>}
            </div>
            {showPersonaSelect ? <ChevronUp size={16} className="text-zinc-400"/> : <ChevronDown size={16} className="text-zinc-400"/>}
        </button>

        {showPersonaSelect && (
            <div className="mt-4 animate-in fade-in slide-in-from-top-2 border-t border-zinc-100 dark:border-zinc-800 pt-4">
                <p className="text-xs font-bold text-zinc-900 dark:text-white mb-2 uppercase tracking-wide">{t.personaSelectorTitle}</p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4 font-mono">{t.personaSelectorDesc}</p>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 italic mb-4 border-l-2 border-zinc-200 dark:border-zinc-700 pl-3">{t.personaSelectorNote}</p>

                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                    <button
                        onClick={() => { setSelectedPersona(null); setShowPersonaSelect(false); }}
                        className={`text-left px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${!selectedPersona ? 'bg-zinc-900 dark:bg-white text-white dark:text-black border-zinc-900 dark:border-white shadow-md' : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600'}`}
                    >
                        General Audience (No Persona)
                    </button>
                    {memories.filter(m => m.type === MemoryType.PERSONA).map(p => (
                        <button
                            key={p.id}
                            onClick={() => { setSelectedPersona(p); setShowPersonaSelect(false); }}
                            className={`text-left px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all flex justify-between items-center ${selectedPersona?.id === p.id ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-500 shadow-md ring-1 ring-purple-500' : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-purple-400 hover:text-purple-600 dark:hover:text-purple-300'}`}
                        >
                            <span>{p.title}</span>
                            {selectedPersona?.id === p.id && <Check size={14} className="text-purple-600 dark:text-purple-400"/>}
                        </button>
                    ))}
                    {memories.filter(m => m.type === MemoryType.PERSONA).length === 0 && (
                        <div className="text-center py-4 text-xs text-zinc-400 font-mono italic border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">No personas found in Train Brain.</div>
                    )}
                </div>
            </div>
        )}
      </div>
  );

  // RENDER: HUB MODE
  const renderHub = () => {
      const features = [
        { id: 'BRAIN_DUMP', title: t.featBrainDumpTitle, short: t.featBrainDumpShort, icon: Zap, color: 'indigo', cta: t.startBrainDump, popup: { desc: t.featBrainDumpPopupDesc, tip: t.featBrainDumpPopupTip } },
        { id: 'GUIDED', title: t.featGuidedTitle, short: t.featGuidedShort, icon: Compass, color: 'blue', cta: t.startGuided, popup: { desc: t.featGuidedPopupDesc, tip: t.featGuidedPopupTip } },
        { id: 'MEMORY_HUNT', title: t.featMemoryTitle, short: t.featMemoryShort, icon: History, color: 'purple', cta: t.findMemories, popup: { desc: t.featMemoryPopupDesc, tip: t.featMemoryPopupTip } },
        { id: 'NEWS_JACK', title: t.featNewsTitle, short: t.featNewsShort, icon: Flame, color: 'orange', cta: t.featNewsCta, popup: { desc: t.featNewsPopupDesc, tip: t.featNewsPopupTip } },
        { id: 'LINK_ANALYSIS', title: t.featLinkTitle, short: t.featLinkShort, icon: Youtube, color: 'pink', cta: t.featLinkCta, popup: { desc: t.featLinkPopupDesc, tip: t.featLinkPopupTip } },
      ];

      return (
        <div className="max-w-7xl mx-auto p-8 font-mono">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2 tracking-tight uppercase">{t.studioHubTitle}</h2>
                <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto text-sm">{t.studioHubDesc}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map(feat => (
                    <button 
                        key={feat.id}
                        onClick={() => setStudioMode(feat.id as StudioMode)}
                        className="flex flex-col text-left p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-zinc-900 dark:hover:border-zinc-100 transition-all group relative overflow-visible min-h-[280px]"
                    >
                        <div className={`p-4 rounded-lg mb-4 w-fit bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors`}>
                            <feat.icon size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2 uppercase tracking-tight">{feat.title}</h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4 flex-1 font-mono">
                            {feat.short}
                        </p>
                        
                        <div className="flex items-center text-xs font-bold uppercase tracking-wider mt-auto text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                            {feat.cta} <ChevronRight size={14} className="ml-1" />
                        </div>

                        {/* Hover Tooltip Card */}
                        <div className="absolute inset-x-0 bottom-0 transform translate-y-full opacity-0 group-hover:opacity-100 group-hover:-translate-y-2 pointer-events-none group-hover:pointer-events-auto transition-all duration-300 z-20 px-2 pb-2">
                             <div className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black p-4 rounded-xl shadow-2xl border border-zinc-700 dark:border-zinc-300 text-left">
                                 <p className="text-xs font-medium mb-2 leading-relaxed font-mono">{feat.popup.desc}</p>
                                 <div className="pt-2 border-t border-zinc-700 dark:border-zinc-300 text-[10px] font-bold uppercase tracking-wider opacity-70">
                                     {feat.popup.tip}
                                 </div>
                             </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
      );
  }

  // RENDER: LINK ANALYSIS MODE
  const renderLinkAnalysis = () => (
    <div className="max-w-4xl mx-auto p-8 flex flex-col h-full font-mono">
         <button onClick={() => { setStudioMode('HUB'); setLinkUrl(''); setLinkSummary(''); setUserOpinion(''); }} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-6 text-xs font-bold uppercase tracking-wider">
            <ArrowLeft size={16} /> {t.backToHub}
         </button>
         
         <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-lg flex-1 flex flex-col">
             <div className="flex items-center gap-3 mb-6">
                 <Youtube className="text-pink-600" size={32} />
                 <h2 className="text-2xl font-bold text-zinc-900 dark:text-white uppercase tracking-tight">{t.linkImportTitle}</h2>
             </div>

             {!linkSummary ? (
                 <div className="flex flex-col gap-4 flex-1 justify-center items-center max-w-xl mx-auto w-full">
                     <input 
                        type="text" 
                        className="w-full p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-1 focus:ring-black dark:focus:ring-white outline-none text-sm font-mono"
                        placeholder={t.linkInputPlaceholder}
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                     />
                     <button 
                        onClick={handleAnalyzeLink}
                        disabled={!linkUrl || isAnalyzingLink}
                        className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                     >
                         {isAnalyzingLink ? <RefreshCw className="animate-spin"/> : <Search/>}
                         {isAnalyzingLink ? t.analyzingLink : t.analyzeUrl}
                     </button>
                 </div>
             ) : (
                 <div className="flex flex-col h-full">
                     <div className="mb-6 p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl max-h-60 overflow-y-auto">
                         <h3 className="text-xs font-bold uppercase text-zinc-500 mb-2 tracking-wider">{t.summaryTitle}</h3>
                         <p className="text-xs text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed font-mono">{linkSummary}</p>
                     </div>

                     <div className="flex-1 flex flex-col gap-4 mb-6">
                         <h3 className="text-xs font-bold uppercase text-zinc-500 tracking-wider">{t.addOpinionTitle}</h3>
                         <p className="text-xs text-zinc-400 mb-2 font-mono">{t.addOpinionDesc}</p>
                         
                         <div className="relative flex-1">
                             <textarea 
                                className="w-full h-full p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-1 focus:ring-black dark:focus:ring-white outline-none resize-none font-mono text-sm"
                                placeholder="I agree with this point, but..."
                                value={userOpinion}
                                onChange={(e) => setUserOpinion(e.target.value)}
                             />
                             <button 
                                onClick={isRecordingOpinion ? stopRecordingOpinion : startRecordingOpinion}
                                className={`absolute bottom-4 right-4 p-3 rounded-full shadow-lg transition-all ${isRecordingOpinion ? 'bg-red-500 text-white animate-pulse' : 'bg-zinc-900 dark:bg-white text-white dark:text-black'}`}
                             >
                                 {isRecordingOpinion ? <Square size={16} fill="currentColor"/> : <Mic size={16}/>}
                             </button>
                         </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                        <div className="md:col-span-2">
                            {/* Insert Persona Selector Here */}
                            <div className="mb-4">
                                <PersonaSelector />
                            </div>

                            <label className="block text-xs font-bold uppercase text-zinc-400 mb-2 tracking-wider">Output Format</label>
                            <div className="grid grid-cols-2 gap-2 h-40 overflow-y-auto custom-scrollbar pr-2">
                                {FORMATS.map(f => (
                                    <button 
                                        key={f.id} 
                                        onClick={() => handleFormatSelection(f)}
                                        className={`p-3 rounded-lg border text-left text-xs transition-all ${selectedFormat?.id === f.id ? 'border-black dark:border-white bg-zinc-100 dark:bg-zinc-800 ring-1 ring-black dark:ring-white' : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
                                    >
                                        <span className="font-bold block uppercase tracking-wide">{f.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button 
                            onClick={handleGenerateFromLink}
                            disabled={isGenerating || !selectedFormat}
                            className="h-14 w-full bg-zinc-900 dark:bg-white text-white dark:text-black font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-lg"
                        >
                        {isGenerating ? <RefreshCw className="animate-spin" size={18}/> : <Sparkles size={18}/>} {t.generateFromLink}
                        </button>
                    </div>
                 </div>
             )}
         </div>
    </div>
  );

  // RENDER: NEWS SCAN MODE
  const renderNewsJack = () => (
      // ... (omitted for brevity, assume unchanged logic) ...
      <div className="max-w-5xl mx-auto p-8 font-mono">
          <button onClick={() => setStudioMode('HUB')} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-6 text-xs font-bold uppercase tracking-wider">
              <ArrowLeft size={16} /> {t.backToHub}
          </button>

          <div className="flex flex-col gap-6 mb-8">
             <div>
                <div className="flex items-center gap-2 mb-3">
                    <Flame className="text-orange-500" size={24} />
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight uppercase">
                        {t.featNewsTitle} <span className="text-zinc-300 px-2">|</span> {profile.niche}
                    </h3>
                </div>
                <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-3xl font-mono text-xs">
                    {t.hotIdeasSub}
                </p>
             </div>
             
             <div className="w-full">
                 <div className="flex gap-0 mb-2 shadow-sm">
                     <div className="relative flex-1">
                         <input 
                            type="text" 
                            value={newsQuery}
                            onChange={(e) => setNewsQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchNews(newsQuery)}
                            placeholder={t.newsSearchPlaceholder}
                            className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-700 py-4 pl-4 pr-10 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder-zinc-500 font-mono"
                         />
                         {loadingNews && <RefreshCw className="absolute right-4 top-4 animate-spin text-zinc-400" size={16}/>}
                     </div>
                     <button 
                        onClick={() => fetchNews(newsQuery)}
                        className="bg-zinc-900 dark:bg-white hover:bg-zinc-700 dark:hover:bg-zinc-200 text-white dark:text-black px-6 border border-zinc-900 dark:border-white transition-colors font-bold uppercase tracking-wider flex items-center justify-center"
                     >
                         <Search size={20} />
                     </button>
                 </div>
                 <p className="text-xs text-zinc-400 flex items-center gap-2 font-mono">
                     <Globe size={12} /> {t.newsSearchHelp}
                 </p>
             </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {loadingNews && news.length === 0 ? (
                 <>
                    <div className="h-48 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-pulse" />
                    <div className="h-48 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-pulse" />
                 </>
             ) : news.length > 0 ? (
                 news.map((item) => (
                     <div key={item.id} className="p-6 bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-100 transition-all group flex flex-col h-full font-mono rounded-xl">
                         <div className="flex justify-between items-start mb-4">
                             <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 bg-white dark:bg-zinc-950 px-2 py-1 border border-zinc-200 dark:border-zinc-800">
                                 {item.source}
                             </span>
                             <span className="text-[10px] text-zinc-400 font-mono">{item.publishedTime}</span>
                         </div>
                         <h4 className="font-bold text-lg leading-tight text-zinc-900 dark:text-white mb-3">
                             {item.title}
                         </h4>
                         <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6 line-clamp-3 flex-1 font-mono">
                             {item.snippet}
                         </p>
                         <button 
                            onClick={() => {
                                setTopic(item.title);
                                setSourceUrl(item.url); // Pre-fill source URL if available
                                setStudioMode('GUIDED');
                                setWizardStep(5); // Jump to final step
                                // Auto-select "Analyze" intention as it fits news
                                const analyzeIntention = INTENTIONS.find(i => i.id === 'analyze');
                                if(analyzeIntention) setSelectedIntention(analyzeIntention);
                            }}
                            className="w-full py-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-white group-hover:bg-zinc-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors flex items-center justify-center gap-2 mt-auto font-mono rounded-lg"
                         >
                             {t.createContentNews} <ArrowRight size={12} />
                         </button>
                     </div>
                 ))
             ) : (
                 <div className="col-span-2 py-12 text-center border border-dashed border-zinc-300 dark:border-zinc-800 text-zinc-500 text-sm rounded-xl font-mono">
                     No specific news found.
                 </div>
             )}
         </div>
      </div>
  );

  // ... (Brain Dump, Memory Hunt, Guided Wizard components logic preserved, omitted for brevity) ...
  const renderBrainDump = () => (
      // ... Brain Dump logic ...
      <div className="max-w-4xl mx-auto p-8 flex flex-col h-full font-mono">
          <button onClick={() => setStudioMode('HUB')} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-6 text-xs font-bold uppercase tracking-wider">
              <ArrowLeft size={16} /> {t.backToHub}
          </button>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-lg flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
                        <Zap className="text-indigo-500"/> {t.brainDumpTitle}
                    </h2>
                </div>
                
                {!dumpAngles.length ? (
                    <>
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl text-xs text-zinc-600 dark:text-zinc-300 mb-6 leading-relaxed border border-indigo-100 dark:border-indigo-800/50 font-mono">
                            {t.brainDumpBestPractices}
                        </div>

                        <div className="flex gap-2 mb-6 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg w-fit">
                            <button onClick={() => setBrainDumpMode('text')} className={`px-6 py-2 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${brainDumpMode === 'text' ? 'bg-white dark:bg-zinc-600 shadow-sm' : 'text-zinc-500'}`}>
                                <Type size={14}/> {t.writeInstead}
                            </button>
                            <button onClick={() => setBrainDumpMode('audio')} className={`px-6 py-2 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${brainDumpMode === 'audio' ? 'bg-white dark:bg-zinc-600 shadow-sm' : 'text-zinc-500'}`}>
                                <Mic size={14}/> {t.recordInstead}
                            </button>
                        </div>

                        <div className="flex-1 flex flex-col">
                            {brainDumpMode === 'text' ? (
                                <textarea 
                                    className="w-full flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-sm font-mono focus:ring-1 focus:ring-black dark:focus:ring-white outline-none resize-none mb-6 placeholder-zinc-400"
                                    placeholder={t.brainDumpPlaceholder}
                                    value={brainDumpText}
                                    onChange={e => setBrainDumpText(e.target.value)}
                                />
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl mb-6">
                                    {isRecordingDump ? (
                                        <div className="flex flex-col items-center gap-4 animate-pulse text-red-500">
                                            <div className="p-6 bg-red-100 rounded-full"><Mic size={48}/></div>
                                            <span className="text-lg font-bold">Recording...</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-4 text-zinc-400">
                                            <Mic size={48}/>
                                            <span className="text-sm font-mono">Ready to capture</span>
                                        </div>
                                    )}
                                    <button 
                                        onClick={isRecordingDump ? stopDumpRecording : startDumpRecording}
                                        className={`mt-8 px-8 py-4 rounded-full font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-transform hover:scale-105 ${isRecordingDump ? 'bg-red-500 text-white' : 'bg-black dark:bg-white text-white dark:text-black'}`}
                                    >
                                        {isRecordingDump ? <Square size={16} fill="currentColor"/> : <PlayCircle size={16}/>}
                                        {isRecordingDump ? "Stop Recording" : t.startRecording}
                                    </button>
                                    {brainDumpText && <p className="mt-6 text-sm text-green-500 font-bold flex items-center gap-2"><CheckCircle size={16}/> Audio Transcribed!</p>}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                            <div className="md:col-span-2">
                                {/* Insert Persona Selector Here */}
                                <div className="mb-4">
                                    <PersonaSelector />
                                </div>

                                <label className="block text-xs font-bold uppercase text-zinc-400 mb-2 tracking-wider">Output Format</label>
                                <div className="grid grid-cols-2 gap-2 h-40 overflow-y-auto custom-scrollbar pr-2">
                                    {FORMATS.map(f => (
                                        <button 
                                            key={f.id} 
                                            onClick={() => handleFormatSelection(f)}
                                            className={`p-3 rounded-lg border text-left text-xs transition-all ${selectedFormat?.id === f.id ? 'border-black dark:border-white bg-zinc-100 dark:bg-zinc-800 ring-1 ring-black dark:ring-white' : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
                                        >
                                            <span className="font-bold block uppercase tracking-wide">{f.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button 
                                onClick={handleAnalyzeDump}
                                disabled={!brainDumpText || isAnalyzingDump}
                                className="h-14 w-full bg-zinc-900 dark:bg-white text-white dark:text-black font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-lg"
                            >
                            {isAnalyzingDump ? <RefreshCw className="animate-spin" size={18}/> : <Brain size={18}/>} 
                            {isAnalyzingDump ? "Analyzing..." : "Analyze Thoughts"}
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="animate-in fade-in slide-in-from-right-4 flex flex-col h-full">
                        <div className="mb-6 flex justify-between items-center">
                            <h3 className="text-lg font-bold uppercase tracking-wide">Select Strategy Angle</h3>
                            <button onClick={() => setDumpAngles([])} className="text-xs font-bold text-zinc-500 uppercase hover:text-red-500">Reset</button>
                        </div>
                        <div className="grid grid-cols-1 gap-4 flex-1 overflow-y-auto mb-6">
                            {dumpAngles.map((angle, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => handleGenerate(angle.title, angle.description)}
                                    className="text-left p-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-zinc-900 dark:hover:border-zinc-100 transition-all group shadow-sm hover:shadow-md"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-900 text-[10px] font-bold uppercase tracking-wider rounded text-zinc-600 dark:text-zinc-400">
                                            {angle.type}
                                        </span>
                                    </div>
                                    <h4 className="text-lg font-bold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{angle.title}</h4>
                                    <p className="text-sm font-mono text-zinc-500 mb-4">{angle.hook}</p>
                                    <p className="text-xs text-zinc-400 italic border-l-2 border-zinc-200 pl-3">{angle.description}</p>
                                </button>
                            ))}
                        </div>
                        {isGenerating && (
                            <div className="absolute inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center z-10 backdrop-blur-sm rounded-2xl">
                                <div className="flex flex-col items-center gap-4">
                                    <RefreshCw className="animate-spin" size={32}/>
                                    <p className="font-bold uppercase tracking-widest text-sm">Generating Content...</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
          </div>
      </div>
  );

  const renderMemoryHunt = () => {
      const unusedMemories = memories.filter(m => !m.usageCount || m.usageCount === 0);
      
      return (
          <div className="max-w-5xl mx-auto p-8 font-mono">
              <button onClick={() => setStudioMode('HUB')} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-6 text-xs font-bold uppercase tracking-wider">
                  <ArrowLeft size={16} /> {t.backToHub}
              </button>
              
              <div className="flex items-center justify-between mb-8">
                  <div>
                      <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2 flex items-center gap-2 uppercase tracking-tight"><History className="text-purple-500"/> {t.featMemoryTitle}</h2>
                      <p className="text-zinc-500 dark:text-zinc-400 text-sm font-mono">{t.featMemoryDesc}</p>
                  </div>
                  <div className="bg-zinc-100 dark:bg-zinc-900 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider">
                      {unusedMemories.length} Unused Items
                  </div>
              </div>

              {unusedMemories.length === 0 ? (
                  <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800">
                      <Sparkles className="mx-auto text-zinc-400 mb-4" size={48}/>
                      <p className="text-zinc-500 font-bold uppercase tracking-wider">{t.noUnusedMemories}</p>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {unusedMemories.map(memory => (
                          <div key={memory.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 flex flex-col hover:shadow-lg transition-all group relative overflow-hidden">
                              <div className="absolute top-0 left-0 w-1 h-full bg-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                              <div className="flex justify-between items-start mb-4">
                                  <span className="text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-zinc-500">{memory.type}</span>
                              </div>
                              <h3 className="font-bold text-lg mb-2 line-clamp-2">{memory.title}</h3>
                              <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-3 mb-6 flex-1 font-mono">{memory.content}</p>
                              <button 
                                  onClick={() => {
                                      setTopic(memory.title);
                                      setStudioMode('GUIDED');
                                      setWizardStep(5); // Skip to end
                                      // Auto-select focus based on type
                                      const focus = FOCUS_AREAS.find(f => f.memoryTypes.includes(memory.type));
                                      if (focus) setSelectedFocus(focus);
                                  }}
                                  className="w-full py-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors flex items-center justify-center gap-2"
                              >
                                  <Sparkles size={14}/> {t.unusedCardCta}
                              </button>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      )
  }

  const renderWizard = () => (
      // ... Wizard logic ...
      <div className="flex flex-col h-full max-w-6xl mx-auto w-full font-mono">
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-950 sticky top-0 z-20">
              <div className="flex items-center gap-4">
                  <button onClick={() => setStudioMode('HUB')} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white"><ArrowLeft size={20}/></button>
                  <h2 className="text-lg font-bold flex items-center gap-2 uppercase tracking-tight"><Compass className="text-blue-500" size={20}/> Guided Creation</h2>
              </div>
              <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(step => (
                      <div key={step} className={`h-1 w-8 rounded-full transition-colors ${step <= wizardStep ? 'bg-black dark:bg-white' : 'bg-zinc-200 dark:bg-zinc-800'}`}></div>
                  ))}
              </div>
          </div>

          <div className="flex-1 p-8 overflow-y-auto">
            <div className="max-w-2xl mx-auto">
              {wizardStep === 1 && (
                  <div className="animate-in fade-in slide-in-from-right-4">
                      <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-8 text-center uppercase tracking-tight">What is your goal today?</h3>
                      <div className="grid grid-cols-2 gap-4">
                          {INTENTIONS.map(intent => (
                              <button key={intent.id} onClick={() => { setSelectedIntention(intent); setWizardStep(2); }} className="flex flex-col items-center p-6 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-black dark:hover:border-white hover:bg-zinc-50 dark:hover:bg-zinc-900/10 transition-all text-center gap-4 group">
                                  <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-full group-hover:bg-white dark:group-hover:bg-zinc-800 transition-colors"><intent.icon size={24} className="text-zinc-600 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white"/></div>
                                  <div>
                                      <span className="block font-bold text-sm mb-1 uppercase tracking-wide">{intent.label}</span>
                                      <span className="text-[10px] text-zinc-500 font-mono">{intent.description}</span>
                                  </div>
                              </button>
                          ))}
                      </div>
                  </div>
              )}
              {wizardStep === 2 && (
                  <div className="animate-in fade-in slide-in-from-right-4">
                       <button onClick={() => setWizardStep(1)} className="text-xs text-zinc-500 flex items-center gap-1 mb-6 hover:text-zinc-900 uppercase tracking-wider"><ArrowLeft size={12} /> Back</button>
                      <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-8 text-center uppercase tracking-tight">Choose a format</h3>
                      <div className="grid grid-cols-2 gap-4">
                          {FORMATS.map(fmt => (
                              <button key={fmt.id} onClick={() => { handleFormatSelection(fmt); setWizardStep(3); }} className="text-left p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-black dark:hover:border-white hover:bg-zinc-50 dark:hover:bg-zinc-900/10 transition-colors group">
                                  <div className="flex justify-between items-start">
                                      <div>
                                          <span className="block font-bold text-sm mb-1 uppercase tracking-wide group-hover:text-black dark:group-hover:text-white">{fmt.label}</span>
                                          <span className="block text-[10px] text-zinc-500 font-mono">{fmt.description}</span>
                                      </div>
                                      <ChevronRight className="text-zinc-300 group-hover:text-black dark:group-hover:text-white"/>
                                  </div>
                              </button>
                          ))}
                      </div>
                  </div>
              )}
              {wizardStep === 3 && (
                  <div className="animate-in fade-in slide-in-from-right-4">
                       <button onClick={() => setWizardStep(2)} className="text-xs text-zinc-500 flex items-center gap-1 mb-6 hover:text-zinc-900 uppercase tracking-wider"><ArrowLeft size={12} /> Back</button>
                      <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-8 text-center uppercase tracking-tight">Personalization Focus</h3>
                      <div className="flex flex-col gap-4">
                          {FOCUS_AREAS.map(focus => (
                              <button key={focus.id} onClick={() => { setSelectedFocus(focus); setWizardStep(4); }} className="text-left p-6 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-black dark:hover:border-white hover:bg-zinc-50 dark:hover:bg-zinc-900/10 transition-colors group">
                                  <div className="flex justify-between items-center">
                                      <div>
                                          <span className="block font-bold text-sm mb-1 uppercase tracking-wide group-hover:text-black dark:group-hover:text-white">{focus.label}</span>
                                          <span className="block text-[10px] text-zinc-500 font-mono">{focus.description}</span>
                                      </div>
                                      <ChevronRight className="text-zinc-300 group-hover:text-black dark:group-hover:text-white"/>
                                  </div>
                              </button>
                          ))}
                      </div>
                  </div>
              )}
              {wizardStep === 4 && (
                  <div className="animate-in fade-in slide-in-from-right-4">
                       <button onClick={() => setWizardStep(3)} className="text-xs text-zinc-500 flex items-center gap-1 mb-6 hover:text-zinc-900 uppercase tracking-wider"><ArrowLeft size={12} /> Back</button>
                      <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-8 text-center uppercase tracking-tight">Select Framework</h3>
                      {filteredFrameworks.length === 0 ? (
                          <div className="text-center py-12 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl">
                              <p className="text-zinc-500 mb-4 font-mono text-sm">No specific frameworks match this combination.</p>
                              <button onClick={() => setWizardStep(5)} className="bg-zinc-900 dark:bg-white text-white dark:text-black px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-wider">Skip & Use General Model</button>
                          </div>
                      ) : (
                        <div className="flex flex-col gap-4">
                            {filteredFrameworks.map(fw => (
                                <button key={fw.id} onClick={() => { setSelectedFramework(fw); setWizardStep(5); }} className="text-left p-6 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-black dark:hover:border-white hover:bg-zinc-50 dark:hover:bg-zinc-900/10 transition-colors group">
                                    <span className="block font-bold text-sm mb-1 group-hover:text-black dark:group-hover:text-white uppercase tracking-wide">{fw.title}</span>
                                    <span className="block text-[10px] text-zinc-500 font-mono">{fw.description}</span>
                                </button>
                            ))}
                        </div>
                      )}
                  </div>
              )}
              {wizardStep === 5 && (
                  <div className="animate-in fade-in slide-in-from-right-4">
                      <div className="flex justify-between items-center mb-6">
                          <button onClick={() => setWizardStep(4)} className="text-xs text-zinc-500 flex items-center gap-1 hover:text-zinc-900 uppercase tracking-wider"><ArrowLeft size={12} /> Back</button>
                          <button onClick={() => { setWizardStep(1); setSelectedIntention(null); setSelectedFormat(null); setSelectedFocus(null); setSelectedFramework(null); setSelectedProduct(null); setSelectedPersona(null); }} className="text-xs text-red-500 font-bold uppercase hover:text-red-600 tracking-wider">Reset All</button>
                      </div>
                      
                      <div className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-xl mb-8 text-[10px] uppercase tracking-wider space-y-2 border border-zinc-200 dark:border-zinc-800 font-bold">
                          <div className="flex justify-between"><span className="text-zinc-500">Intent:</span><span className="text-black dark:text-white">{selectedIntention?.label || 'General'}</span></div>
                          <div className="flex justify-between"><span className="text-zinc-500">Format:</span><span className="text-black dark:text-white">{selectedFormat?.label || 'Standard'}</span></div>
                          <div className="flex justify-between"><span className="text-zinc-500">Focus:</span><span className="text-black dark:text-white">{selectedFocus?.label || 'General'}</span></div>
                          {selectedFramework && <div className="flex justify-between text-blue-500"><span className="text-zinc-500">Framework:</span><span className="text-black dark:text-white">{selectedFramework.title}</span></div>}
                      </div>

                      <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-zinc-900 dark:text-white mb-2 uppercase tracking-wider">{t.topic}</label>
                            <textarea value={topic} onChange={e => setTopic(e.target.value)} placeholder={t.topicPlaceholder} className="w-full h-32 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-zinc-900 dark:text-white focus:ring-1 focus:ring-black dark:focus:ring-white outline-none resize-none shadow-sm font-mono text-sm" />
                        </div>

                         <button onClick={() => setShowProductSelect(!showProductSelect)} className={`flex items-center justify-between p-4 rounded-xl border transition-colors w-full group ${showProductSelect ? 'bg-zinc-100 dark:bg-zinc-900/50 border-black dark:border-white' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'}`}>
                             <span className="flex items-center gap-3 font-bold text-xs uppercase tracking-wider"><ShoppingBag size={18} className="text-zinc-400 group-hover:text-black dark:group-hover:text-white"/> Promote Product? {selectedProduct && <span className="text-black dark:text-white bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded-sm text-[10px]">{selectedProduct.name}</span>}</span>
                             {showProductSelect ? <MinusIcon size={16}/> : <PlusIcon size={16}/>}
                         </button>
                         {showProductSelect && (
                             <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                 <button onClick={() => setSelectedProduct(null)} className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider ${!selectedProduct ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200'}`}>No Product</button>
                                 {products.map(p => (
                                     <button key={p.id} onClick={() => setSelectedProduct(p)} className={`w-full text-left px-4 py-3 rounded-lg text-xs flex justify-between items-center font-bold uppercase tracking-wider ${selectedProduct?.id === p.id ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200'}`}>
                                         <span>{p.name}</span>
                                         {selectedProduct?.id === p.id && <Check size={14}/>}
                                     </button>
                                 ))}
                             </div>
                         )}

                         {/* Use Reusable Persona Selector */}
                         <PersonaSelector />
                         
                        <button onClick={() => handleGenerate()} disabled={isGenerating || (!topic)} className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 shadow-lg text-xs uppercase tracking-widest mt-8 transition-transform hover:scale-[1.01]">
                            {isGenerating ? <RefreshCw className="animate-spin" size={16} /> : <Sparkles size={16} />} {isGenerating ? t.writing : t.generate}
                        </button>
                      </div>
                  </div>
              )}
            </div>
          </div>
      </div>
  );

  // Main Editor View (Only if generatedContent is present)
  if (generatedContent) {
      return (
        <div className="h-full flex flex-col bg-white dark:bg-zinc-950 relative font-mono">
            <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 z-[110] transition-all duration-500 ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                 <div className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-full shadow-2xl flex items-center gap-3">
                     <CheckCircle size={18} />
                     <span className="font-bold text-xs uppercase tracking-wider">{toastMessage}</span>
                 </div>
            </div>

            {/* Top Bar */}
            <div className="h-16 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-6 bg-white dark:bg-zinc-950 z-50">
                <button onClick={() => { setGeneratedContent(''); setTopic(''); }} className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-black dark:hover:text-white transition-colors">
                    <ArrowLeft size={16} /> {t.backToHub}
                </button>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 mr-2 border-r border-zinc-200 dark:border-zinc-800 pr-4">{platform}</span>
                    <button onClick={() => handleSave('draft')} className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors">
                        <Save size={16} /> {t.save}
                    </button>
                    <button onClick={() => setIsScheduling(true)} className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors">
                        <CalendarIcon size={16} /> {t.schedule}
                    </button>
                    <button onClick={() => handleSave('published')} className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity">
                        <Send size={16} /> {t.postNow}
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden flex justify-center bg-zinc-50 dark:bg-zinc-900/30">
                {/* Editor */}
                <div className="w-full max-w-6xl h-full overflow-y-auto custom-scrollbar p-6">
                     {platform === 'twitter' && <TwitterEditor content={generatedContent} onChange={setGeneratedContent} profile={profile} t={t} refinementVersion={refinementVersion} />}
                     {platform === 'linkedin' && <LinkedInEditor content={generatedContent} onChange={setGeneratedContent} profile={profile} t={t} refinementVersion={refinementVersion} />}
                     {platform === 'instagram' && <InstagramEditor content={generatedContent} onChange={setGeneratedContent} profile={profile} t={t} refinementVersion={refinementVersion} onShowToast={triggerToast} language={language}/>}
                </div>
            </div>
            
            {/* Scheduling Modal */}
            {isScheduling && (
                <div className="absolute inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-full max-w-md border border-zinc-200 dark:border-zinc-800 shadow-2xl">
                        <h3 className="text-lg font-bold mb-4 uppercase tracking-tight">{t.scheduleTitle}</h3>
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Date</label>
                            <input 
                                type="date" 
                                className="w-full p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white font-mono text-sm"
                                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Time</label>
                            <input 
                                type="time" 
                                className="w-full p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white font-mono text-sm"
                                value={selectedTime}
                                onChange={(e) => setSelectedTime(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setIsScheduling(false)} className="flex-1 py-3 border border-zinc-200 dark:border-zinc-800 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-zinc-50 dark:hover:bg-zinc-800">Cancel</button>
                            <button onClick={handleConfirmSchedule} disabled={!selectedDate} className="flex-1 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-bold text-xs uppercase tracking-wider hover:opacity-90 disabled:opacity-50">Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
      );
  }

  // View Routing based on Mode
  if (studioMode === 'BRAIN_DUMP') return renderBrainDump();
  if (studioMode === 'MEMORY_HUNT') return renderMemoryHunt();
  if (studioMode === 'NEWS_JACK') return renderNewsJack();
  if (studioMode === 'LINK_ANALYSIS') return renderLinkAnalysis();
  if (studioMode === 'GUIDED') return renderWizard();

  // Default: Studio Hub
  return renderHub();
};
