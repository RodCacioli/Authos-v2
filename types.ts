
export enum MemoryType {
  STORY = 'STORY',
  BELIEF = 'BELIEF',
  FAILURE = 'FAILURE',
  LESSON = 'LESSON',
  ANALOGY = 'ANALOGY',
  EMOTION = 'EMOTION',
  FACT = 'FACT',
  STYLE_REFERENCE = 'STYLE_REFERENCE',
  PERSONA = 'PERSONA'
}

export interface Memory {
  id: string;
  type: MemoryType;
  title: string;
  content: string;
  tags: string[];
  createdAt: string; // ISO Date
  emotionalTone?: string;
  sourceAudio?: boolean;
  usageCount?: number; // Tracks how many times this memory has been used in content
}

export interface Product {
  id: string;
  name: string;
  persona: string;
  painPoints: string;
  solution: string;
  differentiators: string;
  testimonials: string;
  link: string;
  purpose: string;
  results: string;
  notes: string;
}

export interface UserProfile {
  name: string;
  niche: string;
  values: string[];
  contrarianViews: string[];
  audience: string;
  tone: string;
  emojiUsage: 'none' | 'minimal' | 'heavy';
  onboardingComplete: boolean;
  voiceAnalysis?: string; // New: Stores the AI analysis of their actual speech patterns
}

export interface ContentDraft {
  id: string;
  title: string;
  content: string;
  platform: 'twitter' | 'linkedin' | 'blog' | 'instagram';
  status: 'draft' | 'scheduled' | 'published';
  date: string; // Creation or Last Edit Date
  scheduledDate?: string; // For calendar
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  snippet: string;
  url: string;
  publishedTime: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp?: number;
}

export enum AppView {
  LANDING = 'LANDING',
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  TRAIN_BRAIN = 'TRAIN_BRAIN',
  MEMORY_BANK = 'MEMORY_BANK',
  WRITER = 'WRITER',
  CHAT = 'CHAT',
  CALENDAR = 'CALENDAR',
  DRAFTS = 'DRAFTS'
}

export type Language = 'en' | 'pt';
export type Theme = 'light' | 'dark';

export interface AppState {
  language: Language;
  theme: Theme;
}

// --- NEW FRAMEWORK TYPES ---

export interface ContentIntention {
  id: string;
  label: string;
  icon: any; // Lucide Icon
  description: string;
}

export interface ContentFormat {
  id: string;
  label: string;
  description: string;
  structureInstruction: string; // Instructions for the AI about length/structure
}

export interface PersonalizationFocus {
  id: string;
  label: string;
  memoryTypes: MemoryType[]; // Which memory types to prioritize
  description: string;
}

export interface ContentFramework {
  id: string;
  title: string;
  description: string;
  intentionId: string;
  formatIds: string[]; // Compatible formats
  focusId: string; // Required focus
  systemPrompt: string; // The specific "Blueprint" for the AI
}

// --- PERSONA REPORT TYPE ---
export interface PersonaReport {
  snapshot: {
    name: string;
    gender: string;
    summary: string;
  };
  executiveSummary: string;
  psychology: {
    coreConflict: string;
    thought3AM: string;
    limitingBeliefs: { belief: string; description: string }[];
  };
  behaviors: {
    triggerEvents: string[];
    copingMechanisms: { title: string; description: string }[];
  };
  drivers: {
    fears: string[];
    goals: string[];
    internalDialogue: string[];
  };
  communication: {
    tone: string;
    wordsToAvoid: string[];
    powerWords: {
       empowerment: string[];
       clarity: string[];
       emotional: string[];
    };
    ctaStyle: string[];
  };
}
