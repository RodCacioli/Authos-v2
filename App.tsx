
import React, { useState, useEffect } from 'react';
import { UserProfile, Memory, AppView, ContentDraft, MemoryType, Language, Theme, NewsItem, Product } from './types';
import { Onboarding } from './components/Onboarding';
import { LandingPage } from './components/LandingPage';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { MemoryBank } from './components/MemoryBank';
import { TrainBrain } from './components/TrainBrain'; // New Import
import { Writer } from './components/Writer';
import { ChatBot } from './pages/ChatBot';
import { Calendar } from './components/Calendar';
import { DraftsList } from './components/DraftsList';
import { Login } from './components/Login';
import { getProfile, saveProfile, getMemories, addMemory, updateMemory, deleteMemory, getDrafts, saveDrafts, getProducts, addProduct, updateProduct, deleteProduct } from './services/storageService';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';
import { Session } from '@supabase/supabase-js';
import { LogOut, HardDrive } from 'lucide-react';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [drafts, setDrafts] = useState<ContentDraft[]>([]);
  const [view, setView] = useState<AppView>(AppView.LANDING);
  const [loading, setLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Preferences
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>('dark');
  
  // Navigation Params
  const [initialWriterTopic, setInitialWriterTopic] = useState('');
  const [initialWriterContent, setInitialWriterContent] = useState('');
  const [initialWriterMemory, setInitialWriterMemory] = useState<Memory | null>(null);
  const [activeNewsItem, setActiveNewsItem] = useState<NewsItem | null>(null);

  // Theme Effect
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Auth Initialization
  useEffect(() => {
    const initAuth = async () => {
        // Skip Supabase connection if keys are missing to avoid "Failed to fetch"
        if (!isSupabaseConfigured) {
            console.log("Supabase not configured. App starting in disconnected mode.");
            setIsInitializing(false);
            return;
        }

        try {
            // Attempt to get session.
            const { data, error } = await supabase.auth.getSession();
            if (error) throw error;
            
            setSession(data.session);
            if (data.session) setIsOffline(false);
        } catch (err) {
            console.warn("Supabase connection failed or not configured (Failed to fetch). Defaulting app to available state.", err);
        } finally {
            setIsInitializing(false);
        }
    };

    initAuth();

    if (isSupabaseConfigured) {
        const {
        data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        if (session) setIsOffline(false);
        });

        return () => subscription.unsubscribe();
    }
  }, []);

  // Load User Data when Session exists OR Offline Mode is active
  useEffect(() => {
    const loadData = async () => {
      if (session || isOffline) {
        setLoading(true);
        try {
          const [p, m, prod, d] = await Promise.all([
            getProfile(),
            getMemories(),
            getProducts(),
            getDrafts()
          ]);

          if (p && p.onboardingComplete) {
            setProfile(p);
            setView(AppView.DASHBOARD);
          } else {
            setProfile(null); // Ensure profile is null if not complete
            setView(AppView.ONBOARDING);
          }
          setMemories(m);
          setProducts(prod);
          setDrafts(d);
        } catch (e) {
          console.error("Error loading data", e);
        } finally {
          setLoading(false);
        }
      } else {
        // Reset state on logout
        setProfile(null);
        setMemories([]);
        setProducts([]);
        setDrafts([]);
        setView(AppView.LANDING);
        setLoading(false);
      }
    };

    if (!isInitializing || isOffline) {
        loadData();
    }
  }, [session, isOffline, isInitializing]);

  const handleSignOut = async () => {
    if (isOffline) {
        setIsOffline(false);
        setView(AppView.LANDING);
    } else if (isSupabaseConfigured) {
        await supabase.auth.signOut();
    }
  };

  const handleStartLogin = () => {
    setView('LOGIN' as AppView); 
  };

  const handleOfflineLogin = () => {
      setIsOffline(true);
      // Loading effect handled by useEffect dependency on isOffline
  };

  const handleOnboardingComplete = async (newProfile: UserProfile) => {
    setProfile(newProfile);
    // Optimistic update
    setView(AppView.DASHBOARD);
    
    // Async Save
    await saveProfile(newProfile);
    
    const initialMemory: Memory = {
      id: `init-${Date.now()}`,
      type: MemoryType.BELIEF,
      title: 'My Core Values',
      content: `I value ${newProfile.values.join(', ')}. I believe ${newProfile.contrarianViews[0]}.`,
      tags: ['core', 'values'],
      createdAt: new Date().toISOString(),
      emotionalTone: 'Determined'
    };
    handleAddMemory(initialMemory);
  };

  const handleAddMemory = async (memory: Memory) => {
    // Optimistic Update
    setMemories(prev => [memory, ...prev]);
    // Async Save
    await addMemory(memory);
  };

  const handleUpdateMemory = async (memory: Memory) => {
    // Optimistic
    setMemories(prev => prev.map(m => m.id === memory.id ? memory : m));
    // Async
    await updateMemory(memory);
  };

  const handleDeleteMemory = async (id: string) => {
    // Optimistic
    setMemories(prev => prev.filter(m => m.id !== id));
    // Async
    await deleteMemory(id);
  };

  // Product Handlers
  const handleAddProduct = async (product: Product) => {
    setProducts(prev => [product, ...prev]);
    await addProduct(product);
  };

  const handleUpdateProduct = async (product: Product) => {
    setProducts(prev => prev.map(p => p.id === product.id ? product : p));
    await updateProduct(product);
  };

  const handleDeleteProduct = async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    await deleteProduct(id);
  };

  const handleSaveDraft = async (draft: ContentDraft) => {
    const existingIndex = drafts.findIndex(d => d.id === draft.id);
    let updatedDrafts;
    
    if (existingIndex >= 0) {
        updatedDrafts = [...drafts];
        updatedDrafts[existingIndex] = draft;
    } else {
        updatedDrafts = [draft, ...drafts];
    }
    
    // Optimistic
    setDrafts(updatedDrafts);
    // Async
    await saveDrafts(updatedDrafts);
  };

  const handleEditDraft = (draft: ContentDraft) => {
      setInitialWriterTopic(draft.title);
      setInitialWriterContent(draft.content);
      setInitialWriterMemory(null);
      setView(AppView.WRITER);
  };

  const handleUseMemory = (memory: Memory) => {
    setInitialWriterMemory(memory);
    setInitialWriterTopic(''); 
    setInitialWriterContent('');
    setView(AppView.WRITER);
  };

  const handleNewsSelect = (news: NewsItem) => {
    setActiveNewsItem(news);
    setView(AppView.CHAT);
  };

  const handleChatContentGeneration = (content: string, topic: string) => {
    setInitialWriterTopic(topic);
    setInitialWriterContent(content);
    setView(AppView.WRITER);
  }

  // Loading Screen
  if (isInitializing || ( (session || isOffline) && loading)) {
      return (
          <div className={`h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-zinc-950 text-white' : 'bg-white text-black'}`}>
              <div className="flex flex-col items-center gap-4 animate-pulse">
                  <h1 className="text-3xl font-mono font-bold">AUTHOS_</h1>
                  <p className="text-sm font-mono">Connecting to neural link...</p>
              </div>
          </div>
      );
  }

  // View Routing

  // 1. Landing (No Session & Not Offline)
  if (!session && !isOffline && view === AppView.LANDING) {
    return (
        <LandingPage 
            onStart={handleStartLogin} 
            language={language} 
            setLanguage={setLanguage} 
            theme={theme} 
            setTheme={setTheme} 
        />
    );
  }

  // 2. Login (No Session & Not Offline)
  if (!session && !isOffline && view === 'LOGIN' as AppView) {
      return <Login onSuccess={() => {}} onOffline={handleOfflineLogin} language={language} /> 
  }

  // 3. Onboarding (Session or Offline Mode, but no profile)
  if ((session || isOffline) && view === AppView.ONBOARDING) {
      return <Onboarding onComplete={handleOnboardingComplete} language={language} />;
  }

  // 4. Main App (Session/Offline + Profile)
  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-zinc-950 text-zinc-50' : 'bg-white text-zinc-950'}`}>
      <Sidebar 
        currentView={view} 
        setView={setView} 
        language={language} 
        setLanguage={setLanguage} 
        theme={theme} 
        setTheme={setTheme} 
      />
      <main className="flex-1 overflow-auto relative">
        <div className="absolute top-4 right-4 z-50 flex items-center gap-4">
            {isOffline && (
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 cursor-help" title="Data is saved locally to your browser.">
                    <HardDrive size={12} /> Local Mode
                </div>
            )}
            <button 
                onClick={handleSignOut}
                className="p-2 text-zinc-500 hover:text-red-500 transition-colors bg-white dark:bg-zinc-950 rounded-full border border-zinc-200 dark:border-zinc-800"
                title="Sign Out"
            >
                <LogOut size={18} />
            </button>
        </div>

        {view === AppView.DASHBOARD && profile && (
          <Dashboard 
            profile={profile} 
            memories={memories} 
            drafts={drafts}
            products={products}
            onAddMemory={handleAddMemory} 
            onChangeView={setView}
            onSelectNews={handleNewsSelect}
            language={language}
          />
        )}
        
        {/* New Train Brain View */}
        {view === AppView.TRAIN_BRAIN && (
           <TrainBrain
            profile={profile}
            memories={memories}
            products={products}
            language={language}
            onAddMemory={handleAddMemory}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onDeleteMemory={handleDeleteMemory}
           />
        )}

        {view === AppView.MEMORY_BANK && (
          <MemoryBank 
            profile={profile}
            memories={memories} 
            language={language}
            onUseMemory={handleUseMemory}
            onUpdateMemory={handleUpdateMemory}
            onDeleteMemory={handleDeleteMemory}
          />
        )}
        {view === AppView.WRITER && profile && (
          <Writer 
            profile={profile} 
            memories={memories}
            products={products}
            saveDraft={handleSaveDraft} 
            language={language}
            initialTopic={initialWriterTopic}
            initialMemory={initialWriterMemory}
            initialContent={initialWriterContent}
          />
        )}
        {view === AppView.DRAFTS && (
          <DraftsList 
            drafts={drafts}
            language={language}
            onEdit={handleEditDraft}
          />
        )}
        {view === AppView.CHAT && profile && (
          <ChatBot 
            profile={profile} 
            memories={memories} 
            language={language} 
            activeNewsItem={activeNewsItem}
            onGenerateContent={handleChatContentGeneration}
          />
        )}
        {view === AppView.CALENDAR && (
          <Calendar 
            drafts={drafts}
            language={language}
            setView={setView}
          />
        )}
      </main>
    </div>
  );
};

export default App;
