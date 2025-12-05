
import { ContentIntention, ContentFormat, PersonalizationFocus, ContentFramework, MemoryType } from "./types";
import { Flame, BookOpen, Heart, Zap, Lightbulb, TrendingUp } from "lucide-react";

export const INTENTIONS: ContentIntention[] = [
    { id: 'educate', label: 'Educate', icon: BookOpen, description: 'Teach specific skills or share knowledge.' },
    { id: 'motivate', label: 'Motivate', icon: Zap, description: 'Inspire action or mindset shifts.' },
    { id: 'connect', label: 'Connect', icon: Heart, description: 'Build emotional rapport and trust.' },
    { id: 'polarize', label: 'Polarize', icon: Flame, description: 'Challenge status quo or state opinions.' },
    { id: 'promote', label: 'Promote', icon: TrendingUp, description: 'Soft sell a product or service.' },
    { id: 'analyze', label: 'Analyze', icon: Lightbulb, description: 'Break down trends or news.' }
];

export const FORMATS: ContentFormat[] = [
    { 
        id: 'x_short', 
        label: 'X Short Post', 
        description: 'Under 280 chars. Punchy.',
        structureInstruction: 'PLATFORM: X (Twitter). LENGTH: STRICTLY under 280 characters. STRUCTURE: One powerful hook, one supporting sentence, one punchy conclusion. FORMATTING: Use short, punchy sentences. Double line breaks between thoughts. NO DASHES ("-") or bullet points. NO EM-DASHES ("—"). Lowercase after colons unless a proper noun.' 
    },
    { 
        id: 'x_thread', 
        label: 'X Long Post (Thread)', 
        description: 'Deep dive thread format.',
        structureInstruction: 'PLATFORM: X (Twitter) Thread. STRUCTURE: Tweet 1 (Viral Hook), Tweet 2-N (Value/Story points), Final Tweet (Call to Action). FORMATTING: One or two short sentences per tweet. Double spacing between ideas. NO DASHES ("-"). NO EM-DASHES ("—"). Lowercase after colons. DO NOT use numbering (e.g. "1/") unless you calculate the exact total count (e.g. "1/5").' 
    },
    { 
        id: 'li_short', 
        label: 'LinkedIn Short', 
        description: 'Professional, single idea.',
        structureInstruction: 'PLATFORM: LinkedIn. LENGTH: Short (100-150 words). STRUCTURE: Professional hook, clear insight, question for engagement. FORMATTING: Use whitespace generously. Short paragraphs. NO DASHES ("-"). NO EM-DASHES ("—").' 
    },
    { 
        id: 'li_long', 
        label: 'LinkedIn Long', 
        description: 'Story-driven narrative.',
        structureInstruction: 'PLATFORM: LinkedIn. LENGTH: Long form (300-500 words). STRUCTURE: "Broetry" style spacing. Open with a strong story/failure/result. Agitate the problem. Solve it with a unique insight. End with a lesson. FORMATTING: One sentence per line for emphasis. NO DASHES ("-"). NO EM-DASHES ("—").' 
    },
    { 
        id: 'ig_short', 
        label: 'Instagram Short', 
        description: 'Visual caption.',
        structureInstruction: 'PLATFORM: Instagram Caption. FOCUS: Emotional connection to the image. Short, relatable, heavy use of line breaks. Include 3-5 relevant hashtags at the bottom. NO DASHES.' 
    },
    { 
        id: 'ig_carousel', 
        label: 'Instagram Carousel (Editorial)', 
        description: 'High-performance narrative arc.',
        structureInstruction: `
        PLATFORM: Instagram Carousel.
        
        CRITICAL: Scan the user's Memory Bank first. Use their specific tone, "sacred words", and stories. The output must sound 100% like the user, not a generic AI.
        
        NARRATIVE STRUCTURE (MAXIMUM 12 SLIDES):
        1. COVER SLIDE: ONE bold sentence. Paradox, tension, or hidden truth (e.g. "The Death of X", "Why X is actually Y"). NO subtitles.
        2. CONTEXT: Historical context or "Before vs After". Show the contradiction.
        3. DATA PUNCH: 1-3 Hard stats proving the shift.
        4. ROOT CAUSE: Explain the deeper mechanism (culture, psychology, economy).
        5. PROOF/CASES (Slides 5-7): Real-life cases, metaphors, or specific examples.
        6. REFRAME (Slide 8-9): Zoom out. Show the bigger cultural truth.
        7. FINAL INSIGHT (Slide 10-11): Quote-style summary with punch.
        8. CTA (Last Slide): "Comment '[WORD]' to receive [VALUE]". Short & direct.

        WRITING RULES:
        - SLIDE LIMIT: ABSOLUTE MAXIMUM 12 SLIDES. Rewrite or summarize to fit if needed.
        - Density: 30-60 words per slide. Write in mini editorial paragraphs (2-5 lines).
        - NO BULLET POINTS. NO DASHES.
        - Tone: Direct, journalistic, insightful. No "chatty" fluff.
        - Cultural Intelligence: Find the deeper meaning (e.g. "Gen Z rejecting alcohol is a status shift").
        
        TECHNICAL: Separate each slide with a DOUBLE LINE BREAK. Do not write "Slide 1".
        `
    },
    { 
        id: 'blog', 
        label: 'Blog Article', 
        description: 'SEO & Depth.',
        structureInstruction: 'PLATFORM: Blog / Medium. STRUCTURE: SEO-Optimized Headline. H1 Title. Introduction with a hook. H2 Subheaders for key points. Deep analysis. Conclusion with takeaways. Tone: Authoritative yet personal. NO DASHES.' 
    },
    { 
        id: 'email', 
        label: 'E-mail Newsletter', 
        description: 'Personal inbox letter.',
        structureInstruction: 'PLATFORM: Email. STRUCTURE: Subject Line (High Open Rate). Salutation. Personal Story Bridge -> The Lesson/Value -> Soft Sell or CTA. Tone: Intimate, "writing to a friend". NO DASHES.' 
    },
    { 
        id: 'video_short', 
        label: 'Short Video Script', 
        description: 'TikTok/Reels (<60s).',
        structureInstruction: 'PLATFORM: TikTok/Reels/Shorts. LENGTH: Under 60 seconds spoken. STRUCTURE: 0-3s (Visual Hook), 3-45s (The Value/Story fast-paced), 45-60s (CTA). Include [VISUAL CUES] in brackets. NO DASHES in the script dialogue.' 
    },
    { 
        id: 'video_long', 
        label: 'Long Video Script', 
        description: 'YouTube deep dive.',
        structureInstruction: 'PLATFORM: YouTube. LENGTH: Long form script. STRUCTURE: The Tease (What we will cover), The Intro (Who am I), The Meat (Deep dive points with examples), The Outro. Include [VISUAL CUES] and [B-ROLL SUGGESTIONS]. NO DASHES.' 
    }
];

export const FOCUS_AREAS: PersonalizationFocus[] = [
    { id: 'belief', label: 'Core Belief', memoryTypes: [MemoryType.BELIEF, MemoryType.FACT], description: 'Use a strong opinion or value.' },
    { id: 'failure', label: 'Past Failure', memoryTypes: [MemoryType.FAILURE, MemoryType.LESSON], description: 'Vulnerability and lessons learned.' },
    { id: 'story', label: 'Personal Story', memoryTypes: [MemoryType.STORY, MemoryType.EMOTION], description: 'A specific life event.' },
    { id: 'analogy', label: 'Analogy/Metaphor', memoryTypes: [MemoryType.ANALOGY], description: 'Explain complex topics simply.' },
    { id: 'neutral', label: 'Pure Value (Neutral)', memoryTypes: [], description: 'Focus on the topic, not the person.' }
];

export const FRAMEWORKS: ContentFramework[] = [
    // --- POLARIZE / BELIEF ---
    {
        id: 'unpopular-opinion',
        title: 'The Unpopular Opinion',
        description: 'Call out a common industry lie and state your truth.',
        intentionId: 'polarize',
        focusId: 'belief',
        formatIds: ['x_short', 'x_thread', 'li_short'],
        systemPrompt: `
            FRAMEWORK: THE UNPOPULAR OPINION
            1. Identify a commonly held belief in the niche (The "Lie").
            2. Immediately contradict it with the User's specific Belief (The "Truth").
            3. Provide 3 quick reasons why the Lie is dangerous.
            4. End with a definitive statement.
            TONE: Bold, confident, slightly aggressive.
        `
    },
    {
        id: 'stop-doing-this',
        title: 'Stop Doing This',
        description: 'A wake-up call to the audience about a specific mistake.',
        intentionId: 'polarize',
        focusId: 'belief',
        formatIds: ['x_thread', 'li_long', 'video_short'],
        systemPrompt: `
            FRAMEWORK: THE WAKE UP CALL
            1. Hook: "Stop [Action X]. It is killing your [Result Y]."
            2. Agitate: Explain why people do it (comfort) and why it fails.
            3. Solution: Insert the User's Belief or Method as the better alternative.
            4. CTA: Challenge the reader to change today.
        `
    },

    // --- CONNECT / FAILURE ---
    {
        id: 'scars-to-stars',
        title: 'Scars to Stars',
        description: 'How a painful failure led to a specific success.',
        intentionId: 'connect',
        focusId: 'failure',
        formatIds: ['li_long', 'blog', 'email', 'video_long'],
        systemPrompt: `
            FRAMEWORK: SCARS TO STARS
            1. Start in the middle of the bad moment (The Failure memory). Visceral details.
            2. The Pivot Point: What realization changed everything?
            3. The Result: Where you are now.
            4. The Lesson: One sentence takeaway for the reader.
            TONE: Vulnerable, humble, then authoritative.
        `
    },
    {
        id: 'dear-younger-me',
        title: 'Dear Younger Me',
        description: 'Advice you wish you had 5 years ago.',
        intentionId: 'connect',
        focusId: 'failure',
        formatIds: ['x_thread', 'li_long'],
        systemPrompt: `
            FRAMEWORK: LETTER TO SELF
            1. Hook: "I wish I knew this [Time Period] ago."
            2. List 3-5 mistakes you made (derived from Failure memories).
            3. Correct each mistake with a Lesson.
            4. Closing: "Be patient."
        `
    },

    // --- EDUCATE / ANALOGY ---
    {
        id: 'complex-simple',
        title: 'Like a 5-Year Old',
        description: 'Explain a hard concept using a simple metaphor.',
        intentionId: 'educate',
        focusId: 'analogy',
        formatIds: ['x_short', 'li_short', 'video_short'],
        systemPrompt: `
            FRAMEWORK: THE SIMPLIFIER
            1. State the complex problem/topic.
            2. "Think of it like [User's Analogy Memory]..."
            3. Map the parts of the analogy to the problem.
            4. The "Aha!" moment.
        `
    },

    // --- EDUCATE / NEUTRAL ---
    {
        id: 'how-to-guide',
        title: 'The Tactical Guide',
        description: 'Pure value. Step-by-step instructions.',
        intentionId: 'educate',
        focusId: 'neutral',
        formatIds: ['x_thread', 'li_long', 'blog', 'ig_carousel'],
        systemPrompt: `
            FRAMEWORK: TACTICAL GUIDE
            1. Hook: Promise a specific result (e.g. "How to get X in Y days").
            2. The Method: Step 1, Step 2, Step 3.
            3. Pro-Tip: A small nuance often missed.
            4. Outcome: What happens when you execute this.
            NOTE: Focus purely on utility.
        `
    },

    // --- MOTIVATE / STORY ---
    {
        id: 'hero-moment',
        title: 'The Defining Moment',
        description: 'A story about overcoming a specific obstacle.',
        intentionId: 'motivate',
        focusId: 'story',
        formatIds: ['li_long', 'email', 'blog'],
        systemPrompt: `
            FRAMEWORK: THE DEFINING MOMENT
            1. Set the scene: A specific Story memory where the user faced a choice.
            2. The struggle: Why was it hard?
            3. The action: What did they do?
            4. The takeaway: Why the reader can do it too.
            TONE: Inspiring, high energy.
        `
    }
];
