
import { Memory, UserProfile, ContentDraft, ChatMessage, Product } from "../types";

// Local Storage Keys acting as our "Local Database"
const KEYS = {
  PROFILE: 'authos_db_profile',
  MEMORIES: 'authos_db_memories',
  PRODUCTS: 'authos_db_products',
  DRAFTS: 'authos_db_drafts',
  CHAT_HISTORY: 'authos_db_chat_history'
};

// --- Profile ---

export const saveProfile = async (profile: UserProfile) => {
  try {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error("Failed to save profile locally", e);
  }
};

export const getProfile = async (): Promise<UserProfile | null> => {
  try {
    const data = localStorage.getItem(KEYS.PROFILE);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("Failed to load profile locally", e);
    return null;
  }
};

// --- Memories ---

export const saveMemories = async (memories: Memory[]) => {
    localStorage.setItem(KEYS.MEMORIES, JSON.stringify(memories));
};

export const getMemories = async (): Promise<Memory[]> => {
  try {
    const data = localStorage.getItem(KEYS.MEMORIES);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const addMemory = async (memory: Memory) => {
  const memories = await getMemories();
  const updated = [memory, ...memories];
  localStorage.setItem(KEYS.MEMORIES, JSON.stringify(updated));
  return updated;
};

export const updateMemory = async (updatedMemory: Memory) => {
  const memories = await getMemories();
  const updated = memories.map(m => m.id === updatedMemory.id ? updatedMemory : m);
  localStorage.setItem(KEYS.MEMORIES, JSON.stringify(updated));
  return updated;
};

export const deleteMemory = async (id: string) => {
  const memories = await getMemories();
  const updated = memories.filter(m => m.id !== id);
  localStorage.setItem(KEYS.MEMORIES, JSON.stringify(updated));
  return updated;
};

// --- Products ---

export const saveProducts = async (products: Product[]) => {
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
};

export const getProducts = async (): Promise<Product[]> => {
  try {
    const data = localStorage.getItem(KEYS.PRODUCTS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const addProduct = async (product: Product) => {
  const products = await getProducts();
  const updated = [product, ...products];
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(updated));
  return updated;
};

export const updateProduct = async (updatedProduct: Product) => {
  const products = await getProducts();
  const updated = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(updated));
  return updated;
};

export const deleteProduct = async (id: string) => {
  const products = await getProducts();
  const updated = products.filter(p => p.id !== id);
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(updated));
  return updated;
};

// --- Drafts ---

export const saveDrafts = async (drafts: ContentDraft[]) => {
    localStorage.setItem(KEYS.DRAFTS, JSON.stringify(drafts));
};

export const getDrafts = async (): Promise<ContentDraft[]> => {
  try {
    const data = localStorage.getItem(KEYS.DRAFTS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

// --- Chat History ---

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

// Clear all data (Utility for debugging or hard reset)
export const clearAllData = () => {
  localStorage.removeItem(KEYS.PROFILE);
  localStorage.removeItem(KEYS.MEMORIES);
  localStorage.removeItem(KEYS.PRODUCTS);
  localStorage.removeItem(KEYS.DRAFTS);
  localStorage.removeItem(KEYS.CHAT_HISTORY);
};
