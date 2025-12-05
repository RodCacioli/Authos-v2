
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, Memory, Language, NewsItem, ChatMessage } from '../types';
import { sendChatMessage } from '../services/geminiService';
import { getChatHistory, saveChatHistory } from '../services/storageService';
import { Send, Bot, User, Flame, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getTranslation } from '../translations';

interface ChatBotProps {
  profile: UserProfile;
  memories: Memory[];
  language: Language;
  activeNewsItem?: NewsItem | null;
  onGenerateContent?: (content: string, topic: string) => void;
}

export const ChatBot: React.FC<ChatBotProps> = ({ profile, memories, language, activeNewsItem, onGenerateContent }) => {
  const t = getTranslation(language);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasInitializedNews = useRef(false);
  const isHistoryLoaded = useRef(false);

  // Load history on mount
  useEffect(() => {
    const loadHistory = async () => {
      if (!isHistoryLoaded.current) {
        const history = await getChatHistory();
        if (history.length > 0) {
          setMessages(history);
        } else if (!activeNewsItem) {
          // Initial greeting if no history
          const initialMsg: ChatMessage = { 
            role: 'model', 
            text: language === 'en' 
            ? `Hi ${profile.name}. I'm your creative partner. I know your values ("${profile.values[0]}...") and your stories. Ask me anything about your content or past lessons.`
            : `Oi ${profile.name}. Sou seu parceiro criativo. Conheço seus valores ("${profile.values[0]}...") e suas histórias. Pergunte qualquer coisa sobre seu conteúdo ou lições passadas.`,
            timestamp: Date.now()
          };
          setMessages([initialMsg]);
          saveChatHistory([initialMsg]);
        }
        isHistoryLoaded.current = true;
      }
    };
    loadHistory();
  }, [profile, language, activeNewsItem]);

  // Auto-save effect
  useEffect(() => {
    if (messages.length > 0 && isHistoryLoaded.current) {
      saveChatHistory(messages);
    }
  }, [messages]);

  // Newsjack trigger
  useEffect(() => {
    if (activeNewsItem && !hasInitializedNews.current) {
        const startMsg: ChatMessage = { 
            role: 'model', 
            text: language === 'en' ? "Analyzing news context..." : "Analisando contexto da notícia...",
            timestamp: Date.now()
        };
        
        // We append news context to existing flow or start fresh? 
        // Let's append to preserve history but focus on news.
        setMessages(prev => [...prev, startMsg]);
        hasInitializedNews.current = true;
        initiateNewsStrategy(activeNewsItem);
    } 
  }, [activeNewsItem, language]);

  const initiateNewsStrategy = async (news: NewsItem) => {
      setLoading(true);
      const initialPrompt = language === 'en'
        ? `I want to write content about this news: "${news.title}". Help me find an angle relevant to my niche.`
        : `Quero escrever conteúdo sobre esta notícia: "${news.title}". Me ajude a encontrar um ângulo relevante para meu nicho.`;
      
      try {
        const history = messages.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }));
        
        const response = await sendChatMessage(history, initialPrompt, profile, memories, language, news);
        
        setMessages(prev => {
            const updated = prev.slice(0, -1); // Remove "Analyzing..."
            return [...updated, { role: 'model', text: response || "Ready to brainstorm.", timestamp: Date.now() }];
        });
      } catch (e) {
          console.error(e);
          setMessages(prev => [...prev, { role: 'model', text: "Error initializing strategy session.", timestamp: Date.now() }]);
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
    setInput('');
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      // Append current message to history for API call
      history.push({ role: 'user', parts: [{ text: userMsg.text }]});

      const response = await sendChatMessage(history, userMsg.text, profile, memories, language, activeNewsItem);
      
      // Check for draft tag
      const draftMatch = response?.match(/<draft>([\s\S]*?)<\/draft>/);

      if (draftMatch && draftMatch[1]) {
          const content = draftMatch[1].trim();
          const cleanResponse = response?.replace(/<draft>[\s\S]*?<\/draft>/, '').trim() || (language === 'en' ? "Draft generated! Opening studio..." : "Rascunho gerado! Abrindo estúdio...");
          
          setMessages(prev => [...prev, { role: 'model', text: cleanResponse, timestamp: Date.now() }]);
          
          // Trigger redirect
          if (onGenerateContent) {
              setTimeout(() => {
                  onGenerateContent(content, activeNewsItem?.title || "Newsjack Content");
              }, 1500);
          }
      } else {
          setMessages(prev => [...prev, { role: 'model', text: response || "...", timestamp: Date.now() }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Error.", timestamp: Date.now() }]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    if (window.confirm(language === 'en' ? "Clear chat history?" : "Limpar histórico do chat?")) {
        setMessages([]);
        saveChatHistory([]);
    }
  }

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white max-w-5xl mx-auto w-full border-x border-zinc-200 dark:border-zinc-800">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold flex items-center gap-3 tracking-tight">
            {activeNewsItem ? <Flame className="text-orange-500" /> : <Bot className="text-black dark:text-white" strokeWidth={2} />}
            {activeNewsItem ? t.hotIdeas : t.chatTitle}
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                {activeNewsItem ? `Strategizing: ${activeNewsItem.title.substring(0, 40)}...` : t.chatSub}
            </p>
        </div>
        <button onClick={clearHistory} className="p-2 text-zinc-400 hover:text-red-500 transition-colors" title="Clear History">
            <Trash2 size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-6 rounded-2xl shadow-sm ${
              msg.role === 'user' 
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-black rounded-br-sm' 
                : 'bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-300 rounded-bl-sm'
            }`}>
              <div className="flex items-center gap-2 mb-2 opacity-50 text-[10px] font-bold uppercase tracking-wide">
                 {msg.role === 'user' ? <User size={12}/> : <Bot size={12}/>}
                 {msg.role === 'user' ? t.you : 'Authos'}
              </div>
              <div className="prose prose-sm max-w-none dark:prose-invert prose-zinc leading-relaxed">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl rounded-bl-none">
              <div className="flex space-x-1.5">
                <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="relative max-w-3xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t.chatInput}
            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-5 pr-14 py-4 focus:ring-1 focus:ring-zinc-500 focus:outline-none transition-colors shadow-sm text-sm"
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="absolute right-2 top-2 bottom-2 bg-black dark:bg-white text-white dark:text-black w-10 rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
