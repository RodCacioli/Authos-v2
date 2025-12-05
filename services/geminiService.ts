import { GoogleGenAI, Type } from "@google/genai";
import { Memory, UserProfile, Language, NewsItem, MemoryType, ContentFramework, ContentFormat, Product, PersonaReport } from "../types";

// Using the requested model - Switched to Flash for higher quotas/speed
const MODEL_NAME = "gemini-2.5-flash";
// UPGRADE: Nano-Banana Pro (Gemini 3 Pro Image) for high-fidelity carousel generation
const IMAGE_MODEL_NAME = "gemini-3-pro-image-preview";
const AUDIO_MODEL_NAME = "gemini-2.5-flash";

const getClient = () => {
  let apiKey = '';
  
  // Priority 1: process.env (Instruction compliant & Node environments)
  try {
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      apiKey = process.env.API_KEY;
    }
  } catch (e) {
    // Ignore process access errors
  }

  // Priority 2: Vite import.meta.env (Browser/Local Dev)
  if (!apiKey) {
    try {
      if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
        apiKey = (import.meta as any).env.VITE_API_KEY;
      }
    } catch (e) {
      console.warn("Error accessing import.meta.env");
    }
  }

  if (!apiKey) {
    console.error("API Key missing. Please add VITE_API_KEY to your .env file");
  }
  
  // If key is missing, use a dummy one to prevent immediate crash, calls will just fail gracefully
  return new GoogleGenAI({ apiKey: apiKey || 'missing-key' });
};

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface GenerationOptions {
    profile: UserProfile;
    memories: Memory[];
    topic: string;
    platform: string;
    language: Language;
    framework?: ContentFramework;
    format?: ContentFormat;
    focusTypes?: MemoryType[];
    sourceMaterial?: string;
    styleReference?: string;
    product?: Product;
    persona?: string; // New field for persona context
}

/**
 * Generates a content piece based on user profile, selected memories, and a prompt.
 * Updated to support the new Framework/Wizard system and Product Promotion.
 */
export const generatePersonalizedContent = async (
  options: GenerationOptions
): Promise<string> => {
  const { profile, memories, topic, platform, language, framework, format, focusTypes, sourceMaterial, styleReference, product, persona } = options;
  
  const ai = getClient();

  // 1. Filter Memories based on Focus Area (if provided)
  let relevantMemories = memories;
  if (focusTypes && focusTypes.length > 0) {
      const primary = memories.filter(m => focusTypes.includes(m.type));
      // If we need specific types (like FAILURES or BELIEFS), we prioritize them heavily
      relevantMemories = [...primary, ...memories.filter(m => !focusTypes.includes(m.type))].slice(0, 30);
  }

  // Always separate style references
  const narrativeMemories = relevantMemories.filter(m => m.type !== MemoryType.STYLE_REFERENCE && m.type !== MemoryType.PERSONA);
  const styleMemories = memories.filter(m => m.type === MemoryType.STYLE_REFERENCE);

  // Extract Voice DNA elements
  const voiceJargon = styleMemories.find(m => m.tags.includes('voice_jargon'))?.content || "";
  const voiceAudience = styleMemories.find(m => m.tags.includes('voice_audience'))?.content || "";
  const voiceIntensity = styleMemories.find(m => m.tags.includes('voice_intensity'))?.content || "";
  const voiceSacred = styleMemories.find(m => m.tags.includes('voice_sacred'))?.content || "";
  
  // Standard cadence samples (exclude DNA specific tags)
  const cadenceSamples = styleMemories.filter(m => !m.tags.includes('voice_dna'));

  // Constructing the context from narrative memories
  const memoryContext = narrativeMemories.map(m => 
    `[ID: ${m.id} | TYPE: ${m.type}] TITLE: ${m.title} \nCONTENT: ${m.content} \n(Emotion/Tone: ${m.emotionalTone || 'Neutral'})`
  ).join('\n\n');

  // Constructing Style Examples
  const styleExamples = cadenceSamples.length > 0 
    ? `
    USER WRITING SAMPLES (CADENCE & RHYTHM):
    The following text blocks are examples of the user's unique cadence. 
    Adopt this sentence length, paragraph structure, and flow.
    
    ${cadenceSamples.map(m => `Sample: "${m.content}"`).join('\n---\n')}
    ` 
    : "";

  const langInstruction = language === 'pt' 
    ? "IMPORTANT: You MUST write the final output in Brazilian Portuguese." 
    : "Write in English.";

  // Format instruction
  let formatInstruction = "";
  if (format) {
      formatInstruction = `
      STRICT FORMATTING RULES (${format.label}):
      ${format.structureInstruction}
      `;
  } else {
      formatInstruction = `Format: ${platform} post. Optimize for engagement.`;
  }

  // Framework Blueprint Injection
  const frameworkInstruction = framework 
    ? `
    *** CRITICAL: FOLLOW THIS FRAMEWORK BLUEPRINT ***
    ${framework.systemPrompt}
    `
    : "Task: Write a high-performing piece about the topic using the user's memories.";

  // Product Context Injection
  const productInstruction = product 
    ? `
    *** PRODUCT PROMOTION MODE ***
    Integrate the following product authentically:
    NAME: ${product.name}
    ${product.persona ? `TARGET PERSONA: ${product.persona}` : ''}
    ${product.painPoints ? `PAIN POINTS: ${product.painPoints}` : ''}
    SOLUTION: ${product.solution}
    LINK: ${product.link}
    
    INSTRUCTION: Do not make it sound like an ad. Make it sound like a recommendation or a solution to a story you just told.
    `
    : "";

  // Persona Context Injection
  const personaInstruction = persona
    ? `
    *** TARGET AUDIENCE PERSONA (CRITICAL) ***
    You are writing specifically for this person. Every word must resonate with their hidden fears and desires.
    
    PERSONA PROFILE:
    ${persona}
    
    INSTRUCTION:
    - Address their specific pains mentioned above.
    - Use language that validates their internal dialogue.
    - Overcome their specific limiting beliefs.
    `
    : "";

  const voiceInstruction = profile.voiceAnalysis 
    ? `MIMIC THIS VOICE PROFILE: ${profile.voiceAnalysis}`
    : `Tone: ${profile.tone}`;

  const systemInstruction = `
    You are a world-class ghostwriter for ${profile.name}. 
    
    YOUR GOAL: Create content that feels 100% human, organic, and authentic. 
    
    USER PROFILE:
    - Niche: ${profile.niche}
    - Audience: ${profile.audience}
    - Values: ${profile.values.join(', ')}
    - Contrarian Views: ${profile.contrarianViews.join(', ')}
    
    *** VOICE & LANGUAGE DNA (MANDATORY INCLUSION) ***
    1. JARGON & CATCHPHRASES: ${voiceJargon ? `Use these phrases naturally: "${voiceJargon}"` : "None specified."}
    2. AUDIENCE NAME: ${voiceAudience ? `Address the community as: "${voiceAudience}"` : "Generic address."}
    3. TONE INTENSITY (PROFANITY): ${voiceIntensity ? `Guidance: ${voiceIntensity}` : "Keep tone professional."}
    4. SACRED WORDS/MANTRAS: ${voiceSacred ? `Weave in these philosophies: "${voiceSacred}"` : "None specified."}
    
    ${voiceInstruction}
    ${styleExamples}

    DATABASE (USER STORIES & LESSONS):
    ${memoryContext}

    ${productInstruction}
    ${personaInstruction}

    *** STRICT NEGATIVE CONSTRAINTS (DO NOT IGNORE) ***
    1. **NO DASHES**: You are STRICTLY PROHIBITED from using dashes ("-") or bullet points. It looks robotic. Use narrative flow, numbered lists (1., 2.), or whitespace to separate ideas. NEVER use a bulleted list with dashes.
    2. **NO EM-DASHES**: Do not use the long em-dash ("—"). Use a simple comma, period, or parenthesis instead. It signals "AI written".
    3. **NO INCORRECT NUMBERING**: Do NOT number tweets (1/, 2/) unless you calculate the exact total (1/5, 2/5). Otherwise, just use double line breaks.
    4. **LOWERCASE COLONS**: Do not capitalize the word after a colon unless it is a proper noun. 
       - Correct: "The lesson is simple: just do it." 
       - Incorrect: "The lesson is simple: Just do it."
    5. **USE THE DATABASE**: Search the memory context above. If the user needs to write about "Failure", find a [FAILURE] memory. If "Belief", find a [BELIEF]. Reference specific details (names, places, feelings) from the memories to prove authenticity.
    6. **NO AI FLUFF**: Banned words: "Unlock", "Unleash", "Master", "Elevate", "Game-changer", "In today's digital world", "Dive in", "Tapestry", "Beacon".
    
    ${formatInstruction}
    ${langInstruction}
  `;

  let prompt = `
    TOPIC: ${topic}
    ${sourceMaterial ? `SOURCE MATERIAL / CONTEXT: ${sourceMaterial}` : ''}
    
    ${frameworkInstruction}
    
    REMINDER: DO NOT USE DASHES/BULLETS. Write like a human talking.
  `;

  if (styleReference) {
      prompt += `
      STYLE REVERSE ENGINEERING:
      Steal the structure of this reference, but use my content/topic:
      "${styleReference}"
      `;
  }
  
  prompt += `
    IMPORTANT: Return the content wrapped in <draft> and </draft> tags.
  `;

  // Detect URL in source material to enable Google Search Grounding
  let tools = undefined;
  if (sourceMaterial && (sourceMaterial.includes('http://') || sourceMaterial.includes('https://'))) {
      tools = [{ googleSearch: {} }];
      prompt += `\nNOTE: The Source Material contains a URL. Use Google Search to access content.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.85, 
        tools: tools
      },
    });
    
    const text = response.text || "Could not generate content.";
    const match = text.match(/<draft>([\s\S]*?)<\/draft>/);
    return match ? match[1].trim() : text;
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    return "Error generating content. Please check your API key.";
  }
};

/**
 * Generate a detailed Persona Report from form data (JSON Structured).
 */
export const generatePersonaReport = async (formData: any, language: Language): Promise<string> => {
    const ai = getClient();
    const langInstruction = language === 'pt' ? "Output in Portuguese (Brazil)." : "Output in English.";

    const prompt = `
        You are an expert audience researcher and lead psychologist.
        
        TASK:
        Create a comprehensive "Persona Psychological Debriefing" based on the raw inputs provided.
        Your goal is to turn these answers into a deep, human profile that exposes the hidden drivers of this person.
        
        USER PROVIDED DATA:
        - Name: ${formData.name}
        - Gender Focus: ${formData.gender}
        - Challenges: ${formData.challenges}
        - Fears: ${formData.fears}
        - Goals: ${formData.goals}
        - Behaviors: ${formData.behaviors}
        
        ${langInstruction}
        
        Provide the output in strict JSON format matching the schema.
    `;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    snapshot: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING, description: "The persona name" },
                        gender: { type: Type.STRING, description: "Gender focus" },
                        summary: { type: Type.STRING, description: "One-line summary of their situation or pain" }
                      }
                    },
                    executiveSummary: { type: Type.STRING, description: "A few short paragraphs explaining who they are." },
                    psychology: {
                      type: Type.OBJECT,
                      properties: {
                        coreConflict: { type: Type.STRING, description: "What do they want vs what they fear?" },
                        thought3AM: { type: Type.STRING, description: "The specific thought keeping them up at night." },
                        limitingBeliefs: { 
                          type: Type.ARRAY, 
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              belief: { type: Type.STRING },
                              description: { type: Type.STRING }
                            }
                          }
                        }
                      }
                    },
                    behaviors: {
                      type: Type.OBJECT,
                      properties: {
                        triggerEvents: { type: Type.ARRAY, items: { type: Type.STRING } },
                        copingMechanisms: {
                          type: Type.ARRAY,
                          items: {
                             type: Type.OBJECT,
                             properties: {
                               title: { type: Type.STRING },
                               description: { type: Type.STRING }
                             }
                          }
                        }
                      }
                    },
                    drivers: {
                       type: Type.OBJECT,
                       properties: {
                         fears: { type: Type.ARRAY, items: { type: Type.STRING } },
                         goals: { type: Type.ARRAY, items: { type: Type.STRING } },
                         internalDialogue: { type: Type.ARRAY, items: { type: Type.STRING } }
                       }
                    },
                    communication: {
                       type: Type.OBJECT,
                       properties: {
                         tone: { type: Type.STRING, description: "Tone that resonates" },
                         wordsToAvoid: { type: Type.ARRAY, items: { type: Type.STRING } },
                         powerWords: {
                            type: Type.OBJECT,
                            properties: {
                              empowerment: { type: Type.ARRAY, items: { type: Type.STRING } },
                              clarity: { type: Type.ARRAY, items: { type: Type.STRING } },
                              emotional: { type: Type.ARRAY, items: { type: Type.STRING } }
                            }
                         },
                         ctaStyle: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Examples of good CTAs" }
                       }
                    }
                  }
                }
            }
        });
        return response.text || "{}";
    } catch (e) {
        console.error("Persona Generation Error", e);
        return "{}";
    }
}

/**
 * Refine Carousel Content (Spread, Shorten, Expand)
 */
export const refineCarouselContent = async (
    currentContent: string, 
    mode: 'spread' | 'shorter' | 'longer', 
    language: Language
): Promise<string> => {
  const ai = getClient();
  const langInstruction = language === 'pt' ? "Output in Portuguese." : "Output in English.";

  let modeInstruction = "";
  if (mode === 'spread') {
      modeInstruction = `
      MODE: SPREAD TEXT
      - Goal: Better readability. Spread the exact same ideas across more slides.
      - Do NOT make it shorter or longer. Just improve spacing and flow.
      - Ensure NO slide is overcrowded (max 30-50 words per slide).
      `;
  } else if (mode === 'shorter') {
      modeInstruction = `
      MODE: MAKE SHORTER
      - Goal: Punchier, more concise.
      - Summarize dense points. Remove fluff. Use stronger verbs.
      - Reduce total word count by ~30%.
      `;
  } else if (mode === 'longer') {
      modeInstruction = `
      MODE: MAKE LONGER / EXPAND
      - Goal: Add depth and value.
      - Add concrete examples, data points, or analogies to support the claims.
      - Expand on the "HOW" and "WHY".
      - Do NOT fluff. Add substance.
      `;
  }

  const prompt = `
    You are an expert Instagram Carousel Editor.
    
    TASK:
    Refine the user's content based on the selected mode: "${mode}".
    
    STRICT CAROUSEL RULES (Do Not Ignore):
    1. **MAXIMUM 12 SLIDES**: You must fit the content into 12 slides or fewer. This is a hard limit. Even in 'longer' mode, do not exceed 12 slides.
    2. **DENSITY CONTROL**: Each slide should have 30-60 words (2-5 lines). It should feel airy and editorial.
    3. **NO LABELS**: Do not write "Slide 1". Just separate text with DOUBLE LINE BREAKS.
    4. **NO DASHES**: Use narrative flow.
    
    MANDATORY NARRATIVE STRUCTURE (Apply this flow to the refined text):
    - Slide 1: Cover Title (One sentence, high tension/curiosity)
    - Slide 2: Context / "Before" state
    - Slide 3: Data Punch / Fact
    - Slide 4: Root Cause / "Why"
    - Slides 5-9: The Proof / Examples / Core Argument (Split logically)
    - Second to Last Slide: The Reframe / Big Cultural Shift
    - Last Slide: CTA (Short & Direct)
    
    ${modeInstruction}

    CURRENT CONTENT:
    """
    ${currentContent}
    """

    ${langInstruction}
  `;

  try {
      const response = await ai.models.generateContent({
          model: MODEL_NAME,
          contents: prompt
      });
      return response.text || currentContent;
  } catch (e) {
      console.error("Failed to refine carousel content", e);
      return currentContent;
  }
};

/**
 * "The Critic" - Humanizes content
 */
export const humanizeContent = async (content: string, profile: UserProfile, language: Language): Promise<string> => {
    const ai = getClient();
    const langInstruction = language === 'pt' ? "Output in Portuguese." : "Output in English.";

    const prompt = `
        You are "The Editor". Your job is to take AI-generated content and ruthlessly "Humanize" it.
        
        INPUT TEXT:
        """
        ${content}
        """
        
        YOUR ORDERS:
        1. **Kill the Cliches**: Remove words like "Unlock", "Elevate", "Dive deep".
        2. **Vary Sentence Length**: Mix very short sentences with longer ones.
        3. **NO DASHES**: Convert any bullet points with dashes ("-") into narrative paragraphs or numbered lists.
        4. **NO EM-DASHES**: Use commas or periods instead of long dashes ("—").
        5. **Lower the Reading Level**: Make it sound like a conversation.
        
        User's Voice: ${profile.voiceAnalysis || profile.tone}
        
        Return ONLY the rewritten text.
        ${langInstruction}
    `;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt
        });
        return response.text || content;
    } catch (e) {
        return content;
    }
}

/**
 * Repurpose Content (Campaign Mode)
 */
export const repurposeContent = async (
    originalContent: string, 
    originalPlatform: string, 
    targetPlatform: string,
    profile: UserProfile,
    language: Language
): Promise<string> => {
    const ai = getClient();
    
    // We reuse the main generation function but with a specific prompt wrapper via GenerationOptions
    return generatePersonalizedContent({
        profile,
        memories: [],
        topic: "Repurpose",
        platform: targetPlatform,
        language,
        sourceMaterial: `ORIGINAL CONTENT (${originalPlatform}):\n${originalContent}\n\nTASK: Rewrite this strictly for ${targetPlatform}. Keep the core message but change the formatting/hook to fit the new platform.`
    });
}

/**
 * Process Audio Memory (Voice-to-Text + Tone Analysis)
 */
export const processAudioMemory = async (audioBase64: string, language: Language): Promise<{text: string, analysis: string}> => {
    const ai = getClient();
    const langInstruction = language === 'pt' ? "in Portuguese" : "in English";
    
    const prompt = `
        Task 1: Transcribe this audio exactly as spoken ${langInstruction}.
        Task 2: Analyze the speaker's "Voice Profile". Describe their cadence, emotional range, sentence structure, and unique quirks.
        
        Return JSON:
        {
            "transcription": "The text...",
            "voiceAnalysis": "The analysis..."
        }
    `;

    try {
        const response = await ai.models.generateContent({
            model: AUDIO_MODEL_NAME,
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: "audio/mp3", // Assumes MP3/WebM, Gemini handles most
                            data: audioBase64
                        }
                    },
                    { text: prompt }
                ]
            },
            config: { responseMimeType: "application/json" }
        });
        
        const json = JSON.parse(response.text || "{}");
        return {
            text: json.transcription || "Audio processing failed.",
            analysis: json.voiceAnalysis || "No analysis."
        };
    } catch (e) {
        console.error("Audio Processing Error", e);
        return { text: "Error processing audio.", analysis: "" };
    }
}

/**
 * Analyze Brain Dump (Extract Angles)
 */
export const analyzeBrainDump = async (text: string, language: Language): Promise<{title: string, hook: string, type: string, description: string}[]> => {
    const ai = getClient();
    const langInstruction = language === 'pt' ? "Output in Portuguese." : "Output in English.";

    const prompt = `
        You are a Viral Content Strategist.
        The user has provided a raw "Brain Dump" (unstructured thoughts).
        
        TASK:
        Analyze the raw text and extract 3 distinct "Content Angles" or "Hooks" that could be turned into a post.
        
        TYPES OF ANGLES TO LOOK FOR:
        1. "The Contrarian": Is there something they disagree with?
        2. "The Story": Is there a personal anecdote?
        3. "The Action Plan": Is there advice or a how-to?
        4. "The Vulnerable": Is there an emotional admission?
        
        RAW TEXT:
        "${text}"
        
        RETURN JSON ARRAY (Exactly 3 items):
        [
            {
                "type": "Contrarian / Story / Action / etc",
                "title": "Short Punchy Title",
                "hook": "The first sentence of the post...",
                "description": "Why this angle works..."
            }
        ]
        
        ${langInstruction}
    `;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        
        return JSON.parse(response.text || "[]");
    } catch (e) {
        console.error("Failed to analyze brain dump", e);
        return [];
    }
}

/**
 * Generate topic suggestions based on a memory (Angles)
 */
export const generateAnglesFromMemory = async (
  profile: UserProfile,
  memoryContent: string,
  language: Language
): Promise<string[]> => {
  const ai = getClient();
  const langInstruction = language === 'pt' ? "Output in Portuguese." : "Output in English.";
  
  const prompt = `
    You are an expert content strategist. 
    The user has a specific memory: "${memoryContent}".
    
    Generate 3 distinct, viral "Angles" or "Hooks" for a content piece for ${profile.niche}.
    
    Example:
    Memory: "I got fired."
    Angle 1: "Getting fired was the best thing that happened to my career."
    Angle 2: "Why you should fire yourself today."
    Angle 3: "The exact moment I knew I was unemployable."

    Return JSON format: { "angles": ["Angle 1", "Angle 2", "Angle 3"] }
    ${langInstruction}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    const json = JSON.parse(response.text || '{"angles": []}');
    return json.angles || [];
  } catch (e) {
    console.error("Error generating angles", e);
    return [];
  }
}

/**
 * Generate topic suggestions from a specific URL (YouTube/Article)
 */
export const generateAnglesFromUrl = async (
  url: string,
  profile: UserProfile,
  language: Language
): Promise<string[]> => {
  const ai = getClient();
  const langInstruction = language === 'pt' ? "Output in Portuguese." : "Output in English.";
  
  const prompt = `
    You are a content strategist.
    
    SOURCE URL: ${url}
    
    TASK:
    1. Access the URL using Google Search.
    2. If this is a YouTube video URL, your PRIMARY GOAL is to find and read the transcript, summary, or detailed content description of the video. 
    3. If it is an article or blog, read the full content.
    4. Analyze the core topics, arguments, and "golden nuggets" from this source.
    5. Generate 5 viral "Angles" or "Hooks" for a content piece based specifically on this source material.
    6. Target Audience: ${profile.niche}.
    
    Return a JSON object (pure JSON, no markdown code blocks): { "angles": ["Angle 1", "Angle 2", ...] }
    ${langInstruction}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // responseMimeType cannot be used with googleSearch tool
      }
    });
    
    let text = response.text || '{"angles": []}';
    // Improved JSON extraction to handle cases where text includes markdown or preambles
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        text = jsonMatch[0];
    }
    
    const json = JSON.parse(text);
    return json.angles || [];
  } catch (e) {
    console.error("Error generating angles from URL", e);
    return ["Could not analyze URL. Please try again."];
  }
}

/**
 * SUMMARIZE CONTENT FROM URL (Youtube or Article)
 */
export const summarizeContentFromUrl = async (
    url: string,
    language: Language
): Promise<string> => {
    const ai = getClient();
    const langInstruction = language === 'pt' ? "Output in Portuguese." : "Output in English.";
    
    const prompt = `
      SOURCE URL: ${url}
      
      TASK:
      1. Access the URL using Google Search.
      2. **IF YOUTUBE VIDEO**: Locate and read the transcript, captions, or detailed video summary. YOU MUST "listen" to the content via the text data available.
      3. **IF ARTICLE**: Read the full text.
      4. **OUTPUT**: Create a comprehensive summary of the content. 
         - Key Points
         - Main Argument
         - Notable Quotes or Data
      
      ${langInstruction}
    `;
  
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });
      
      return response.text || "Could not summarize content.";
    } catch (e) {
      console.error("Error summarizing URL", e);
      return "Error analyzing URL. Please check if the link is valid.";
    }
}

/**
 * EXTRACT STYLE from URL
 */
export const extractStyleFromUrl = async (
  url: string,
  language: Language
): Promise<string> => {
  const ai = getClient();
  const langInstruction = language === 'pt' ? "Output in Portuguese." : "Output in English.";

  const prompt = `
    SOURCE URL: ${url}

    TASK:
    1. Access the URL using Google Search (it might be an X/Twitter post, a blog, or a news article).
    2. Extract the RAW TEXT content of the post/article.
    3. Analyze the "Writing Style" of this content. Look for:
       - Cadence (Choppy? Flowery? Direct?)
       - Sentence Structure (Short vs Long)
       - Vocabulary level
       - Formatting quirks (Bullet points, lower case, emojis)
    
    OUTPUT FORMAT:
    Return a formatted string ready to be saved as a "Style Reference" memory.
    
    Example Output:
    "
    [Reference Content extracted from URL]
    ...the actual text...

    [Style Analysis]
    - Uses very short sentences for impact.
    - Starts with a controversial hook.
    - No emojis.
    - Clinical, detached tone.
    "

    ${langInstruction}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    return response.text || "Could not extract content from URL.";
  } catch (e) {
    console.error("Error extracting style from URL", e);
    return "Error analyzing URL. Please ensure the link is publicly accessible.";
  }
}

/**
 * Generate topic suggestions (Random) - Expanded
 */
export const generateTopicSuggestions = async (
  profile: UserProfile,
  memories: Memory[],
  language: Language
): Promise<string[]> => {
    const ai = getClient();
    
    // Pick random memories to inspire
    const shuffled = memories.filter(m => m.type !== MemoryType.STYLE_REFERENCE).sort(() => 0.5 - Math.random()).slice(0, 5);
    const memorySnippet = shuffled.map(m => m.content).join(" | ");

    const langInstruction = language === 'pt' ? "Output in Portuguese." : "Output in English.";

    const prompt = `
        Based on the user's niche: ${profile.niche} and beliefs: ${profile.contrarianViews.join(', ')}, 
        and these specific past memories: "${memorySnippet}",
        
        Generate 12 content ideas (Hooks/Headlines) categorized as follows:
        1. **Contrarian Beliefs** (Challenging industry norms)
        2. **Personal Stories** (Using specific memories)
        3. **Actionable Advice** (How-to content)
        4. **Observation** (Things you see others doing wrong)
        
        Return a simple flat list of strings in JSON format.
        
        Example JSON: { "topics": ["Stop doing X", "Why I failed at Y", "How to get Z", ...] }
        ${langInstruction}
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json"
            }
        });
        const json = JSON.parse(response.text || '{"topics": []}');
        return json.topics || [];
    } catch (e) {
        console.error("Error generating topics", e);
        return [];
    }
}


/**
 * Chat functionality
 */
export const sendChatMessage = async (
  history: { role: 'user' | 'model', parts: { text: string }[] }[],
  newMessage: string,
  profile: UserProfile,
  memories: Memory[],
  language: Language,
  activeNewsItem?: NewsItem | null
) => {
  const ai = getClient();

  // Filter out Style References for chat context, stick to stories
  const narrativeMemories = memories.filter(m => m.type !== MemoryType.STYLE_REFERENCE).slice(0, 20);
  
  const memoryContext = narrativeMemories.map(m => 
    `[${m.type}] ${m.title}: ${m.content}`
  ).join('\n');

  const langInstruction = language === 'pt' 
    ? "Respond in Portuguese." 
    : "Respond in English.";

  let roleInstruction = `
    You are an intelligent assistant for ${profile.name}.
    You have access to their personal memories and beliefs.
    Answer questions based on their worldview defined in:
    Values: ${profile.values.join(', ')}
    Beliefs: ${profile.contrarianViews.join(', ')}
  `;

  if (activeNewsItem) {
    roleInstruction += `
      MODE: VIRAL NEWSJACKING STRATEGIST.
      CONTEXT: The user wants to write content about: "${activeNewsItem.title}"
      
      GOAL: Connect this news to the user's niche (${profile.niche}) using an authentic, possibly contrarian angle.
      
      CRITICAL RULES:
      1. **BE FAST**. Present 3 angles/options IMMEDIATELY.
      2. **BE BRIEF**. Keep responses under 50 words unless drafting content.
      3. **OUTPUT FORMAT**: When you generate the actual content piece (Thread/Post), you MUST wrap it in XML tags: <draft>...content here...</draft>.
      
      EXAMPLE INTERACTION:
      User: "I want to write about this."
      AI: "Here are 3 angles: A) Contrarian, B) Personal, C) Lesson. Which one?"
      User: "Option A."
      AI: "Great. Generating draft... <draft>Here is the full post content...</draft>"
    `;
  }

  const systemInstruction = `
    ${roleInstruction}
    ${langInstruction}
    
    Memories:
    ${memoryContext}
  `;

  const chat = ai.chats.create({
    model: MODEL_NAME,
    config: {
      systemInstruction,
    },
    history: history,
  });

  const result = await chat.sendMessage({ message: newMessage });
  return result.text;
};

/**
 * Image Analysis
 */
export const analyzeImage = async (base64Image: string, promptText: string, language: Language) => {
  if (!base64Image) return "Image data missing.";
  const ai = getClient();
  const cleanBase64 = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
  const mimeType = base64Image.includes(';') ? base64Image.split(';')[0].split(':')[1] : 'image/png';

  const langInstruction = language === 'pt' ? "Respond in Portuguese." : "Respond in English.";

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64
            }
          },
          {
            text: `${promptText} ${langInstruction}`
          }
        ]
      }
    });
    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Image Analysis Error:", error);
    throw error;
  }
};

/**
 * Generate a Coherent Style Guide for the Carousel
 */
export const generateCarouselStyle = async (topic: string, niche: string): Promise<string> => {
    const ai = getClient();
    const prompt = `
        TOPIC: ${topic}
        NICHE: ${niche}
        
        Create a cohesive "Visual Style Guide" for a high-end Instagram carousel about this topic.
        Define:
        1. Color Palette
        2. Lighting/Mood
        3. Art Direction
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });
        return response.text || "Cinematic, high-contrast, minimalist.";
    } catch (e) {
        return "Cinematic, high-contrast, minimalist.";
    }
}

/**
 * Generate Social Media Image (Original - Backward Compatibility)
 */
export const generateSocialImage = async (promptContext: string, themePrompt: string) => {
    return generateCarouselSlideImage({
        slideNumber: 1,
        totalSlides: 1,
        themeName: "Custom",
        themePrompt: themePrompt,
        slideText: promptContext,
        isFirstSlide: true
    });
}

/**
 * ULTRA-OPTIMIZED CAROUSEL IMAGE GENERATION
 * Using Gemini 3 Pro Image (Nano Banana Pro) with Fallback to Imagen 3
 */
export const generateCarouselSlideImage = async (options: {
    slideNumber: number;
    totalSlides: number;
    themeName: string;
    themePrompt: string;
    slideText: string;
    isFirstSlide?: boolean;
}) => {
    const ai = getClient();
    const { slideNumber, totalSlides, themeName, themePrompt, slideText, isFirstSlide } = options;

    // Advanced Prompt Structuring (as per DeepMind/App instructions)
    const fullPrompt = `
        Title: Carousel Slide ${slideNumber} of ${totalSlides} – Theme: ${themeName}
        Style Description: ${themePrompt}
        
        VISUAL CONTEXT FROM SLIDE TEXT:
        "${slideText}"
        
        STRICT COMPOSITION RULES (Nano-Banana Pro Logic):
        1. **Negative Space**: You MUST leave clear, empty negative space (e.g., top-left, center-right) for text overlay. Do not clutter the entire frame.
        2. **Text Safety**: Do NOT place important visual elements (faces, hands, products) where text might cover them.
        3. **Consistency**: Maintain the exact same visual style, color palette, lighting, and character identity as the rest of the carousel.
        ${isFirstSlide ? "4. **Opening Slide**: Make this high-impact and visually arresting to stop the scroll." : "4. **Continuity**: Ensure this slide feels like a direct continuation of the previous one."}
        
        LAYOUT INSTRUCTION:
        Avoid placing the main subject dead center if it conflicts with standard text readability. 
        Offset subjects to the side to create balance.
        
        FINAL OUTPUT REQUIREMENT:
        High-resolution, 1:1 aspect ratio, cinematic/editorial quality.
    `;

    try {
        // Attempt 1: Gemini 3 Pro (Nano Banana Pro)
        // This model is superior for text adherence and layout, but might be gatekept (403).
        const response = await ai.models.generateContent({
            model: IMAGE_MODEL_NAME, // Gemini 3 Pro
            contents: fullPrompt,
            config: {
                imageConfig: {
                    aspectRatio: "1:1",
                    imageSize: "1K"
                }
            }
        });

        const parts = response.candidates?.[0]?.content?.parts;
        if (parts) {
            for (const part of parts) {
                if (part.inlineData) {
                    const mime = part.inlineData.mimeType || 'image/png';
                    return `data:${mime};base64,${part.inlineData.data}`;
                }
            }
        }
    } catch (e: any) {
        console.warn(`Primary Image Model (${IMAGE_MODEL_NAME}) failed: ${e.message}. Attempting fallback to Imagen 3.`);
        
        // Attempt 2: Imagen 3 (Standard)
        // More widely available, robust fallback.
        try {
             const response = await ai.models.generateImages({
                model: 'imagen-3.0-generate-001',
                prompt: fullPrompt,
                config: {
                    numberOfImages: 1,
                    aspectRatio: '1:1',
                    outputMimeType: 'image/jpeg'
                }
            });
            
            // Imagen returns generatedImages array with imageBytes (base64)
            const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;
            if (imageBytes) {
                return `data:image/jpeg;base64,${imageBytes}`;
            }
        } catch (e2) {
             console.error("Fallback Image Gen failed", e2);
             return null;
        }
    }
    return null;
}

/**
 * Suggest tags/metadata for a new memory
 */
export const enrichMemory = async (content: string): Promise<{
  title: string;
  type: MemoryType;
  tags: string[];
  emotionalTone: string;
}> => {
  const ai = getClient();
  
  const prompt = `
    Analyze the following user memory text: "${content}"
    
    Return a JSON object with:
    - title: A short, punchy summary title (max 6 words)
    - type: One of [STORY, BELIEF, FAILURE, LESSON, ANALOGY, EMOTION, FACT]
    - tags: Array of 3-5 keywords
    - emotionalTone: One word description of the emotion
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            type: { type: Type.STRING, enum: ["STORY", "BELIEF", "FAILURE", "LESSON", "ANALOGY", "EMOTION", "FACT"] },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            emotionalTone: { type: Type.STRING }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response text");
    return JSON.parse(text);
  } catch (error) {
    console.error("Enrich Memory Error:", error);
    return {
      title: "New Memory",
      type: MemoryType.STORY,
      tags: ["memory"],
      emotionalTone: "Neutral"
    };
  }
};

/**
 * Get trending news using Google Search Grounding
 */
export const getTrendingNews = async (language: Language, query?: string): Promise<NewsItem[]> => {
  const ai = getClient();
  const context = language === 'pt' ? 'Brazil' : 'US/Global';
  const q = query || `Trending business and tech news in ${context}`;

  const prompt = `
    Find 4 trending news items about: "${q}".
    
    Return a JSON array (pure JSON, no markdown) where each object has:
    - title
    - source
    - snippet
    - url
    - publishedTime
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    let text = response.text || "[]";
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
        text = jsonMatch[0];
    }
    
    const items = JSON.parse(text);
    if (!Array.isArray(items)) return [];

    return items.map((item: any, i: number) => ({
      id: `news-${Date.now()}-${i}`,
      title: item.title || "Untitled",
      source: item.source || "Web",
      snippet: item.snippet || "",
      url: item.url || "#",
      publishedTime: item.publishedTime || "Today"
    }));

  } catch (error) {
    console.error("Get News Error:", error);
    return [];
  }
};
