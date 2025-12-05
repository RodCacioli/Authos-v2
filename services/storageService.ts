
import { Memory, UserProfile, ContentDraft, ChatMessage, Product } from "../types";
import { supabase } from "./supabaseClient";

// Local Storage Keys
const KEYS = {
  PROFILE: 'authos_db_profile',
  MEMORIES: 'authos_db_memories',
  PRODUCTS: 'authos_db_products',
  DRAFTS: 'authos_db_drafts',
  CHAT_HISTORY: 'authos_db_chat_history'
};

// --- Helper: Check Auth Status ---
const isAuthenticated = async () => {
    const { data } = await supabase.auth.getSession();
    return !!data.session;
};

const getUserId = async () => {
    const { data } = await supabase.auth.getUser();
    return data.user?.id;
};

// --- DATA MAPPERS (CamelCase <-> SnakeCase) ---

const mapProfileFromDb = (row: any): UserProfile => ({
    name: row.name,
    niche: row.niche,
    audience: row.audience,
    tone: row.tone,
    emojiUsage: row.emoji_usage,
    values: row.values || [],
    contrarianViews: row.contrarian_views || [],
    onboardingComplete: row.onboarding_complete,
    voiceAnalysis: row.voice_analysis
});

const mapMemoryFromDb = (row: any): Memory => ({
    id: row.id,
    type: row.type,
    title: row.title,
    content: row.content,
    tags: row.tags || [],
    createdAt: row.created_at,
    emotionalTone: row.emotional_tone,
    sourceAudio: row.source_audio,
    usageCount: row.usage_count
});

const mapProductFromDb = (row: any): Product => ({
    id: row.id,
    name: row.name,
    persona: row.persona,
    painPoints: row.pain_points,
    solution: row.solution,
    differentiators: row.differentiators,
    testimonials: row.testimonials,
    link: row.link,
    purpose: row.purpose,
    results: row.results,
    notes: row.notes
});

const mapDraftFromDb = (row: any): ContentDraft => ({
    id: row.id,
    title: row.title,
    content: row.content,
    platform: row.platform,
    status: row.status,
    date: row.date,
    scheduledDate: row.scheduled_date
});

// --- PROFILE ---

export const saveProfile = async (profile: UserProfile) => {
  const isAuth = await isAuthenticated();
  
  // Always save local backup
  localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));

  if (isAuth) {
      const uid = await getUserId();
      if (!uid) return;

      const dbProfile = {
          id: uid,
          name: profile.name,
          niche: profile.niche,
          audience: profile.audience,
          tone: profile.tone,
          emoji_usage: profile.emojiUsage,
          values: profile.values,
          contrarian_views: profile.contrarianViews,
          onboarding_complete: profile.onboardingComplete,
          voice_analysis: profile.voiceAnalysis
      };

      const { error } = await supabase.from('profiles').upsert(dbProfile);
      if (error) console.error("Supabase Profile Error:", error);
  }
};

export const getProfile = async (): Promise<UserProfile | null> => {
  const isAuth = await isAuthenticated();

  if (isAuth) {
      const uid = await getUserId();
      if (uid) {
          const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).single();
          if (data) return mapProfileFromDb(data);
          // If auth but no profile, fall through to check local (might be syncing) or return null
      }
  }

  // Fallback Local
  try {
    const data = localStorage.getItem(KEYS.PROFILE);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};

// --- MEMORIES ---

export const saveMemories = async (memories: Memory[]) => {
    // This is rarely called in bulk for Supabase, usually we add/update individually
    // But we keep it for LocalStorage sync
    localStorage.setItem(KEYS.MEMORIES, JSON.stringify(memories));
};

export const getMemories = async (): Promise<Memory[]> => {
  const isAuth = await isAuthenticated();

  if (isAuth) {
      const { data, error } = await supabase.from('memories').select('*').order('created_at', { ascending: false });
      if (data) return data.map(mapMemoryFromDb);
  }

  try {
    const data = localStorage.getItem(KEYS.MEMORIES);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const addMemory = async (memory: Memory) => {
  const isAuth = await isAuthenticated();
  
  // Local Update
  const localMemories = await getLocalMemories(); // Use internal helper to avoid recursion
  const updated = [memory, ...localMemories];
  localStorage.setItem(KEYS.MEMORIES, JSON.stringify(updated));

  if (isAuth) {
      const uid = await getUserId();
      const dbMemory = {
          id: memory.id,
          user_id: uid,
          type: memory.type,
          title: memory.title,
          content: memory.content,
          tags: memory.tags,
          created_at: memory.createdAt,
          emotional_tone: memory.emotionalTone,
          source_audio: memory.sourceAudio,
          usage_count: memory.usageCount || 0
      };
      await supabase.from('memories').insert(dbMemory);
  }
  return updated;
};

export const updateMemory = async (updatedMemory: Memory) => {
  const isAuth = await isAuthenticated();

  // Local Update
  const localMemories = await getLocalMemories();
  const updated = localMemories.map(m => m.id === updatedMemory.id ? updatedMemory : m);
  localStorage.setItem(KEYS.MEMORIES, JSON.stringify(updated));

  if (isAuth) {
      const dbMemory = {
          title: updatedMemory.title,
          content: updatedMemory.content,
          tags: updatedMemory.tags,
          emotional_tone: updatedMemory.emotionalTone,
          usage_count: updatedMemory.usageCount
      };
      await supabase.from('memories').update(dbMemory).eq('id', updatedMemory.id);
  }
  return updated;
};

export const deleteMemory = async (id: string) => {
  const isAuth = await isAuthenticated();

  // Local Update
  const localMemories = await getLocalMemories();
  const updated = localMemories.filter(m => m.id !== id);
  localStorage.setItem(KEYS.MEMORIES, JSON.stringify(updated));

  if (isAuth) {
      await supabase.from('memories').delete().eq('id', id);
  }
  return updated;
};

// --- PRODUCTS ---

export const getProducts = async (): Promise<Product[]> => {
  const isAuth = await isAuthenticated();

  if (isAuth) {
      const { data } = await supabase.from('products').select('*');
      if (data) return data.map(mapProductFromDb);
  }

  try {
    const data = localStorage.getItem(KEYS.PRODUCTS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const addProduct = async (product: Product) => {
  const isAuth = await isAuthenticated();

  // Local
  const local = await getLocalProducts();
  const updated = [product, ...local];
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(updated));

  if (isAuth) {
      const uid = await getUserId();
      const dbProduct = {
          id: product.id,
          user_id: uid,
          name: product.name,
          persona: product.persona,
          pain_points: product.painPoints,
          solution: product.solution,
          differentiators: product.differentiators,
          testimonials: product.testimonials,
          link: product.link,
          purpose: product.purpose,
          results: product.results,
          notes: product.notes
      };
      await supabase.from('products').insert(dbProduct);
  }
  return updated;
};

export const updateProduct = async (updatedProduct: Product) => {
  const isAuth = await isAuthenticated();

  // Local
  const local = await getLocalProducts();
  const updated = local.map(p => p.id === updatedProduct.id ? updatedProduct : p);
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(updated));

  if (isAuth) {
      const dbProduct = {
          name: updatedProduct.name,
          persona: updatedProduct.persona,
          pain_points: updatedProduct.painPoints,
          solution: updatedProduct.solution,
          differentiators: updatedProduct.differentiators,
          testimonials: updatedProduct.testimonials,
          link: updatedProduct.link,
          purpose: updatedProduct.purpose,
          results: updatedProduct.results,
          notes: updatedProduct.notes
      };
      await supabase.from('products').update(dbProduct).eq('id', updatedProduct.id);
  }
  return updated;
};

export const deleteProduct = async (id: string) => {
  const isAuth = await isAuthenticated();

  // Local
  const local = await getLocalProducts();
  const updated = local.filter(p => p.id !== id);
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(updated));

  if (isAuth) {
      await supabase.from('products').delete().eq('id', id);
  }
  return updated;
};

// --- DRAFTS ---

export const saveDrafts = async (drafts: ContentDraft[]) => {
    // This is called by App.tsx which sends the whole array.
    // For Supabase, we need to be smarter. We usually only save the changed one.
    // However, for simplicity in this migration, we will save to local, and upsert all (inefficient but safe)
    // OR ideally, App.tsx should call add/update draft instead of saveDrafts(all).
    // Given the architecture, we'll sync local first.
    
    localStorage.setItem(KEYS.DRAFTS, JSON.stringify(drafts));

    const isAuth = await isAuthenticated();
    if (isAuth) {
        const uid = await getUserId();
        if (!uid) return;

        // Upsert all drafts
        const dbDrafts = drafts.map(d => ({
            id: d.id,
            user_id: uid,
            title: d.title,
            content: d.content,
            platform: d.platform,
            status: d.status,
            date: d.date,
            scheduled_date: d.scheduledDate
        }));

        // Supabase upsert
        await supabase.from('drafts').upsert(dbDrafts);
    }
};

export const getDrafts = async (): Promise<ContentDraft[]> => {
  const isAuth = await isAuthenticated();

  if (isAuth) {
      const { data } = await supabase.from('drafts').select('*').order('date', { ascending: false });
      if (data) return data.map(mapDraftFromDb);
  }

  try {
    const data = localStorage.getItem(KEYS.DRAFTS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

// --- CHAT HISTORY (Local Only for now to save DB space/complexity) ---

export const saveChatHistory = async (messages: ChatMessage[]) => {
  try {
    localStorage.setItem(KEYS.CHAT_HISTORY, JSON.stringify(messages));
  } catch (e) {
    console.error("Failed to save chat history", e);
  }
};

export const getChatHistory = async (): Promise<ChatMessage[]> => {
  try {
    const data = localStorage.getItem(KEYS.CHAT_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

// --- INTERNAL HELPERS FOR HYBRID SYNC ---
// These ensure we can always read local state without triggering a DB fetch loop

const getLocalMemories = async (): Promise<Memory[]> => {
    try {
        const data = localStorage.getItem(KEYS.MEMORIES);
        return data ? JSON.parse(data) : [];
    } catch { return []; }
}

const getLocalProducts = async (): Promise<Product[]> => {
    try {
        const data = localStorage.getItem(KEYS.PRODUCTS);
        return data ? JSON.parse(data) : [];
    } catch { return []; }
}

// Clear all data
export const clearAllData = () => {
  localStorage.removeItem(KEYS.PROFILE);
  localStorage.removeItem(KEYS.MEMORIES);
  localStorage.removeItem(KEYS.PRODUCTS);
  localStorage.removeItem(KEYS.DRAFTS);
  localStorage.removeItem(KEYS.CHAT_HISTORY);
};
