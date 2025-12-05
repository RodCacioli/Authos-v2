
import { Language } from "./types";

export const translations = {
  en: {
    // Sidebar
    home: "Home",
    dashboard: "Home", // Fallback
    trainBrain: "Train Brain",
    memoryBank: "Memory Database",
    studio: "Studio",
    aiChat: "AI Chat",
    calendar: "Calendar",
    drafts: "Drafts",
    creator: "Creator",
    freePlan: "Free Plan",
    
    // Landing
    startTrial: "Start 7-Day Free Trial",
    login: "Login",
    heroTitle: "Generic AI content is killing your business.",
    heroSub: "Authos 10x's your content production by encoding your unique stories and beliefs into every piece. Escape the 'slop' era and generate authentic content that builds trust.",

    // Value Chain
    vcStep1Title: "Authentic Content",
    vcStep1Sub: "Stop sounding like a robot. Authos turns your raw memories into powerful content that connects instantly.",
    vcStep2Title: "Strong Connection",
    vcStep2Sub: "People buy from people they trust. When you share real stories, you build a loyal audience that listens.",
    vcStep3Title: "More Revenue, Less Effort",
    vcStep3Sub: "You don't need to chase new clients constantly. Authentic content attracts the right people who are ready to buy from you.",

    // Comparison
    comparisonTitle: "The Difference Is In The Data",
    genericHeader: "Generic AI (ChatGPT, Claude, etc)",
    genericSample: "In the fast-paced world of digital marketing, it is crucial to leverage key strategies to optimize your workflow...",
    authosHeader: "Authos (Your Brain Uploaded)",
    authosSample: "I almost fired my biggest client yesterday. It wasn't about money. It was about respect. Here's why (and what I learned)...",

    featureTableTitle: "Why The Top 1% Use Authos",
    feature1: "Learns Your Life Story",
    feature2: "Matches Your Specific Tone",
    feature3: "Auto-Generates Viral Hooks",
    feature4: "Platform-Specific Formatting",
    feature5: "Re-purposes Old Content",
    otherTools: "Others",

    // Target Audience Section
    targetAudienceTitle: "Who Is Authos For?",
    targetIndieTitle: "Independent Experts",
    targetIndieSub: "Personal Trainers, Lawyers, Architects, and Coaches. If you sell your expertise, mentorships, or courses, Authos helps you show up consistently without burnout.",
    targetAgencyTitle: "Agencies & Ghostwriters",
    targetAgencySub: "Deliver powerful, authentic content for your clients at top speed. Manage distinct voices for multiple accounts effortlessly.",
    targetLeaderTitle: "Founders & Leaders",
    targetLeaderSub: "CMOs and Startup Founders who know the value of an online presence. Build an audience that attracts talent and investors.",

    // Testimonials
    testimonialsTitle: "What users say about Authos",
    t1Name: "Sarah Jenkins",
    t1Role: "Marketing Consultant",
    t1Text: "I used to spend 4 hours writing a thread. Authos does it in 5 minutes, and it actually sounds like me. It's scary good.",
    t2Name: "David Chen",
    t2Role: "SaaS Founder",
    t2Text: "Finally, an AI that doesn't sound like a corporate brochure. My engagement on LinkedIn has tripled since I started using my own memories.",
    t3Name: "Elena Rodriguez",
    t3Role: "Life Coach",
    t3Text: "The memory bank feature is a game changer. It remembers stories I forgot I had and turns them into lessons for my clients.",

    // App
    goodAfternoon: "System Online",
    profileActive: "Creator Profile Active",
    memoriesStored: "memories stored",
    createNew: "Launch Studio",
    practicalTips: "Content Tips",
    practicalTipsSub: "Operational efficiency protocols.",
    tips: [
        "Authenticity. Do not just teach. Share the origin story of the lesson. Data informs, stories connect.",
        "Database Integrity. Ensure your Memory Bank contains failure data. Vulnerability increases trust metrics by 300%.",
        "Pattern Interruption. In Studio, combine 'Polarize' intention with specific frameworks to arrest scroll behavior.",
        "Soft Sell. Use Product definitions to allow AI to weave solutions into narrative structures naturally.",
        "Consistency. A scheduled post frequency of 3x/week outperforms sporadic high-volume bursts.",
        "Diferenciação. If industry consensus is 'X', use Train Brain to articulate belief 'Y'. Polarization filters for high-value leads.",
        "Turing Test. The goal is not views, but humanity. Verify: 'Does this output prove existence?'",
        "Hybrid Workflow. Utilize AI for structural velocity; inject manual life details for ownership."
    ],
    
    // Dashboard & Daily Challenges
    dailyGoals: "Daily Tasks", // RENAMED from Daily Protocol
    goalsCompleted: "Sync Status",
    
    // Dynamic Challenge Keys
    taskLog1Mem: "Log 1 Memory",
    taskLog3Mem: "Log 3 Memories",
    taskCreateDraft: "Create 1 Draft",
    taskBrainDump: "Use Brain Dump",
    taskStyleRef: "Add Style Ref",
    taskNewProduct: "Add Product",
    
    keepGoing: "Upload in progress...",
    allDone: "System Synchronized.",
    
    hotIdeas: "Intel Stream",
    hotIdeasSub: "Real-time market signals for your sector.",
    createContentNews: "Newsjack this Topic",
    loadingNews: "Scanning global networks...",
    
    // Progress Snapshot
    progressSnapshot: "Progress Snapshot",
    contentScore: "Content Score",
    totalMemories: "Total Memories",
    registeredProducts: "Products",
    contentsGenerated: "Contents Created",
    postsScheduled: "Scheduled/Published",
    brainQuestions: "Brain Qs Answered",
    
    // Smart Notifications / Writer Suggestions
    smartNotifications: "Smart Notifications",
    notificationsSub: "Actionable insights to boost your consistency.",
    unusedMemory: "Dormant Memory Detected",
    unusedMemoryDesc: "This data point has not been utilized in output.",
    turnIntoContent: "Activate Memory",
    newQuestions: "Train Brain",
    newQuestionsDesc: "You have new questions waiting to be answered.",
    answerNow: "Answer Now",
    productOpportunity: "Product Opportunity",
    productOpportunityDesc: "You haven't created content for this product recently.",
    promoteNow: "Promote Now",

    // Studio Hub (NEW - REFINED)
    studioHubTitle: "Content Creation Studio",
    studioHubDesc: "Select your protocol.",
    
    // Feature 1: Brain Dump
    featBrainDumpTitle: "Brain Dump",
    featBrainDumpShort: "Turn raw thoughts or audio into polished posts instantly.",
    featBrainDumpPopupDesc: "Best for Flow State. Don't edit yourself. Rant, ramble, or drop voice notes. The AI structures the chaos.",
    featBrainDumpPopupTip: "TIP: Use this after meetings or when you feel emotional about a topic.",
    startBrainDump: "Start Brain Dump",

    // Feature 2: Guided Creation
    featGuidedTitle: "Guided Creation",
    featGuidedShort: "Strategic builder for specific goals (Sales, Education, Virality).",
    featGuidedPopupDesc: "Best for High-Stakes Content. Use this when you need a specific outcome, like launching a product or teaching a complex concept.",
    featGuidedPopupTip: "TIP: Select 'Polarize' intent to generate high-engagement hooks.",
    startGuided: "Start Wizard",

    // Feature 3: Memory Hunt
    featMemoryTitle: "Memory Resurfacing",
    featMemoryShort: "Find forgotten stories in your database to stop repeating yourself.",
    featMemoryDesc: "Identify and utilize high-potential memories that are currently dormant in your database.",
    featMemoryPopupDesc: "Best for Writer's Block. The AI scans your history to find high-value stories and lessons you haven't used recently.",
    featMemoryPopupTip: "TIP: Use 'Failure' memories to build deeper trust with your audience.",
    findMemories: "Scan Database",
    noUnusedMemories: "All memories utilized. Great job.",
    unusedCardCta: "Revive This Memory",

    // Feature 4: Newsjack
    featNewsTitle: "Hot News of Your Niche",
    featNewsShort: "Ride viral trends and news waves with your unique take.",
    featNewsPopupDesc: "Best for Relevance. We scan global news, you choose a topic, and we inject your opinion into the conversation.",
    featNewsPopupTip: "TIP: Be contrarian. If everyone agrees with the news, disagree.",
    featNewsCta: "Scan Global Intel",

    // Feature 5: Link Import
    featLinkTitle: "Import Link / Video",
    featLinkShort: "Turn YouTube videos or Articles into your own content.",
    featLinkPopupDesc: "Best for Curation. Paste a URL, we summarize it, you add your take, and we generate the post.",
    featLinkPopupTip: "TIP: Great for turning long podcasts into short, punchy threads.",
    featLinkCta: "Import Content",

    // News Search
    newsSearchPlaceholder: "Query specific sector...",
    newsSearchHelp: "Manual override for specific intel.",
    search: "Scan",

    // Studio / Brain Dump
    brainDumpTitle: "Modo Brain Dump",
    brainDumpDesc: "Insira áudio ou texto bruto. O sistema estruturará em conteúdo.",
    brainDumpBestPractices: "💡 Best Practice: Be raw and unfiltered. Don't edit yourself. If you're angry about a trend, say it. If you're excited about a trip, describe the smells and sounds. The AI will handle the structure; you provide the soul.",
    startRecording: "Init Audio",
    stopRecording: "Process & Gen",
    writeInstead: "Text Input",
    recordInstead: "Voice Input",
    brainDumpPlaceholder: "Awaiting raw input...",
    generateFromDump: "Compile Content",

    // Studio / Link Import
    linkImportTitle: "Import & Remix",
    linkInputPlaceholder: "Paste YouTube URL or Article Link...",
    analyzingLink: "Analyzing Source Material...",
    analyzeUrl: "Analyze URL",
    summaryTitle: "Content Summary",
    addOpinionTitle: "Add Your Perspective",
    addOpinionDesc: "Do you agree? Disagree? Have a personal story about this? (Optional)",
    generateFromLink: "Generate Content",

    // Persona Selector (Studio)
    personaSelectorTitle: "Optional: Choose a Persona to Target This Content",
    personaSelectorDesc: "If you’re creating content intended to sell or connect deeply with your audience — especially when promoting your product or service — selecting a persona helps the AI generate communication that speaks directly to that person’s pains, desires, beliefs, and language.",
    personaSelectorNote: "If you don’t select a persona, the content will still be personalized using your tone of voice, values, and writing style from your memory database. But selecting a persona creates even more targeted and emotionally resonant content. You can leave this blank if you're creating broader or less persona-specific content.",

    // Sidebar / Common
    format: "Format",
    twitterThread: "X Thread",
    linkedinPost: "LinkedIn Post",
    instagramCarousel: "IG Carousel",
    topic: "Topic",
    addSource: "Add Source URL",
    removeSource: "Remove URL",
    topicPlaceholder: "Input core topic or directive...",
    writing: "Compiling...",
    generate: "Execute",
    refineTools: "Refinement Tools",
    refineExplainer: "Tweak the vibe instantly.",
    makeSarcastic: "Make it Sarcastic",
    sarcasticDesc: "Add wit and bite.",
    makePersonal: "Make it Vulnerable",
    personalDesc: "Focus on emotion.",
    makeConcise: "Make it Concise",
    conciseDesc: "Corte o excesso.",
    memoryContext: "Data Context",
    memoryContextSub: "Accessing",
    memories: "nodes",
    preview: "Output Preview",
    save: "Save to Drafts",
    postNow: "Deploy Now",
    schedule: "Schedule",
    scheduleTitle: "Schedule Post",
    confirmSchedule: "Confirm Schedule",
    pickDate: "Pick a date and time",
    published: "Deployed!",
    scheduled: "Scheduled!",
    emptyCanvas: "System Ready.",
    emptyCanvasSub: "Select parameters to begin generation.",
    tweetPlaceholder: "What's happening?",
    carouselPlaceholder: "Slide Text",
    slide: "Slide",
    addSlide: "Add Slide",
    linkedinPlaceholder: "What do you want to talk about?",
    addTweet: "Add Tweet",
    deleteTweet: "Delete Tweet",
    backToHub: "Back to Studio",
    
    // Train Brain
    trainTitle: "Train Brain",
    trainSub: "Input data to refine AI model.",
    trainReflections: "Beliefs & Stories",
    trainProducts: "Products",
    trainStyle: "Voice & Language",
    trainPersona: "Persona",

    // Train Brain - Product Creation
    prodPersonaDesc: "Choose the persona this product targets. This helps AI tailor messaging specifically to their needs. If none exist, create one in the Persona tab first.",
    prodSolutionDesc: "Describe your product or service in depth. Focus on how it works, what problems it solves, how it’s delivered, and how it creates results. Include all relevant details—frameworks, formats, support, tools, or methods you use.\nExample: “My coaching program helps overwhelmed entrepreneurs clarify their brand and build confidence through weekly 1:1 sessions, personalized content plans, mindset training, and live Q&A calls.”",
    prodDiffDesc: "What makes your offer unique? Highlight distinct features, methods, or personal touches. Example: 'Unlike others, I offer live support tailored specifically for female founders.'",
    prodTestimonialDesc: "Add proof that it works. Use specific wins, numbers, or quotes. Example: 'Maria doubled her income in 90 days using this method.'",
    prodResultsDesc: "List measurable outcomes or credentials to build trust. Example: 'Over 800 students with a 98% completion rate.'",
    prodNotesDesc: "Any extra context like launch plans, pricing strategy, or internal notes.",

    // Train Brain - Persona
    createNewPersona: "Create New Persona",
    
    personaName: "Name or Nickname for the Persona",
    personaNamePlace: "e.g. Overwhelmed Corporate Mom",
    
    personaGender: "Gender Focus",
    personaGenderOptionFemale: "Primarily Female",
    personaGenderOptionMale: "Primarily Male",
    personaGenderOptionBalanced: "Balanced: Both Male and Female",
    
    personaChallenges: "Challenges and Pains",
    personaChallengesDesc: "What are the biggest problems, frustrations, or difficulties this person faces? If you have current or past clients, what do they usually complain about? What causes them stress, fear, or insecurity? List everything that comes to your mind — the more problems, the better the AI will understand your audience. (If you’re unsure, you can leave this blank for now.)",
    
    personaFears: "Fears and Insecurities",
    personaFearsDesc: "What fears or insecurities might this person deal with regularly? Try to think like your persona — what do they feel when they wake up? What worries them before they take action? What do they fear will happen if they fail or stay stuck? Write down anything that reveals emotional or psychological tension.",
    
    personaGoals: "Goals and Dreams",
    personaGoalsDesc: "What does this person truly want in life? What are they trying to achieve, fix, or create for themselves? This could be personal, emotional, professional, physical, or financial. Examples: feel more confident, make $10K/month, lose 15kg, become a known speaker, get promoted, launch a side business.",
    
    personaBehaviors: "Common Behaviors",
    personaBehaviorsDesc: "What are some habits or patterns this person tends to repeat? What actions do they take (or avoid) often? This helps the AI understand how they think and behave. Examples: constantly overconsume content without acting, always searching for the next productivity hack, starting courses but never finishing, complaining about time or money.",
    
    generatePersona: "Generate Persona Report",
    generatingPersona: "Analyzing...",
    noPersonas: "No personas defined yet.",

    // Memory Bank (Database)
    bankTitle: "Memory Database",
    bankSub: "Search, manage, and organize your digital brain.",
    bankDescription: "This is your archive. Use advanced filters to find specific stories or delete outdated information.",
    bankEditNote: "You can edit or delete old memories at any time.",
    createContentFromMemory: "Create content from this",
    searchPlaceholder: "Search database...",
    allTypes: "All Types",
    noMemories: "No data found.",
    filterTags: "Filter by Tag",
    sortBy: "Sort By",
    newestFirst: "Newest First",
    oldestFirst: "Oldest First",
    
    deepDive: "Deep Dive Prompt",
    prompt: "Prompt",
    promptPlaceholder: "Input response data...",
    depositMemory: "Log Data",
    skipQuestion: "Skip",
    styleLab: "Voice & Language", 
    styleLabSub: "Define Your Writing Identity", 
    styleLabDesc: "This is where you define how your content should sound.",
    pasteStyle: "Input text or URL...",
    saveStyle: "Save Reference",
    edit: "Edit",
    delete: "Delete",
    confirmDelete: "Confirm deletion?",
    update: "Update",

    // Voice DNA Questions
    voiceDNA: "Voice DNA",
    
    vdnaJargon: "Do you use any specific jargon, catchphrases, or coined expressions in your writing?",
    vdnaJargonDesc: "Explanation:\nWe want to understand the unique way you speak or write. These could be phrases you repeat often, ways you simplify concepts, or words that are part of your personal brand.\n\nHow to answer well:\nThink about phrases your audience might associate with you, or words you repeat often across emails, posts, or captions.\n\nExamples:\n• \"I always say 'Build in public' when talking about product launches.\"\n• \"I use the phrase 'done is better than perfect' to encourage action.\"\n• \"I often write 'Plot twist!' when announcing something unexpected.\"",
    vdnaJargonPlace: "List your catchphrases here...",
    
    vdnaAudience: "Do you call your audience or community by a specific name?",
    vdnaAudienceDesc: "Explanation:\nCreators often give their audience a nickname to build identity and connection. If you call your followers something special, tell us.\n\nHow to answer well:\nIf you've ever referred to your audience with a nickname or label (even casually), write it down.\n\nExamples:\n• \"I call my audience 'Brand Rebels.'\"\n• \"I speak to them as 'The Builders.'\"\n• \"I say 'Hey misfits' at the start of most posts.\"",
    vdnaAudiencePlace: "E.g. Rebels, Misfits, Builders...",
    
    vdnaIntensity: "Do you use strong or explicit language (like curse words) in your writing?",
    vdnaIntensityDesc: "Explanation:\nThis helps us know how bold or raw your tone should be. Some people like polished and clean. Others want to sound real and intense.\n\nHow to answer well:\nTell us whether you use curse words — and if so, in what context or frequency.\n\nExamples:\n• \"Yes — I use words like 'damn', 'fuck', or 'bullshit' when I want to emphasize a point.\"\n• \"I only use curse words in emotional or personal posts.\"\n• \"No — I keep my tone clean and professional at all times.\"",
    vdnaIntensityPlace: "Describe your stance on strong language...",
    
    vdnaSacred: "Are there any sacred words or values you repeat often in your writing?",
    vdnaSacredDesc: "Explanation:\nThis could be words that define your mission, values you repeat in most of your content, or even phrases that show up across multiple posts.\n\nHow to answer well:\nThink of words or ideas that are central to your message and identity — or that you want your audience to remember.\n\nExamples:\n• \"Clarity, Consistency, Courage — I mention these in most posts.\"\n• \"I often say: 'This isn't advice. This is a mirror.'\"\n• \"My go-to ending is: 'Stay dangerous.'\"",
    vdnaSacredPlace: "List your sacred words or values...",
    
    saveVoiceSettings: "Save Voice Settings",

    // Drafts
    draftsTitle: "Drafts",
    draftsSub: "Work in progress.",
    statusDraft: "Draft",
    statusScheduled: "Scheduled",
    statusPublished: "Deployed",
    noDraftsFound: "No drafts.",

    // Chat
    chatTitle: "Authos Chat",
    chatSub: "Interactive strategizing.",
    you: "User",
    chatInput: "Input command...",

    // Calendar
    calendarTitle: "Calendar",
    calendarSub: "Consistency visualization.",
    mon: "Mon",
    tue: "Tue",
    wed: "Wed",
    thu: "Thu",
    fri: "Fri",
    sat: "Sat",
    sun: "Sun",

    // System Navigation / Guide
    guideTitle: "System Navigation",
    guideSub: "Operational manual for Authos modules.",
    
    guideTrainBrain: "Train Brain",
    guideTrainBrainDesc: "The input center. Feed the AI your stories, define your products, and upload writing samples so it learns your unique voice.",
    
    guideStudio: "Studio",
    guideStudioDesc: "The output center. Use Brain Dump for speed, Guided Wizard for strategy, or Newsjack to ride trends.",
    
    guideMemoryBank: "Memory Database",
    guideMemoryBankDesc: "Your digital hippocampus. Review, edit, and delete the raw data points (stories/beliefs) you've trained the system with.",
    
    guideDrafts: "Drafts",
    guideDraftsDesc: "Staging area. Review generated content, refine outputs, and manage publishing status.",
    
    guideChat: "AI Chat",
    guideChatDesc: "Strategic partner. Brainstorm ideas, ask questions about your own content, or get quick feedback.",
    
    guideCalendar: "Calendar",
    guideCalendarDesc: "Consistency tracker. Visualize your publishing frequency and upcoming scheduled posts.",

    // Onboarding
    step1Title: "Initialize System.",
    step1Sub: "Building digital twin. Input designation.",
    step2Title: "Define Arena.",
    step2Sub: "Be ultra-specific. Precision improves output quality.",
    step3Title: "Core Protocols",
    step3Sub: "What principles are non-negotiable?",
    step4Title: "Contrarian Data",
    step4Sub: "What industry consensus do you reject?",
    step5Title: "Voice Modulation",
    step5Sub: "Defina parâmetros de saída (ex: 'Severo', 'Solidário').",
    step6Title: "Densidade de Emojis",
    step6Sub: "Frequência de indicador visual.",
    firstName: "First Name",
    niche: "Specific Niche / Industry",
    audience: "Target Audience",
    toneLabel: "Writing Style",
    emojiNone: "None (Professional)",
    emojiMinimal: "Minimal (Efficiency)",
    emojiHeavy: "Heavy (Visual)",
    add: "Add",
    continue: "Next",
    finish: "Initialize",

    // Image Analyzer
    visionTitle: "Vision Analyzer",
    visionSub: "Extract semantic meaning from imagery.",
    upload: "Upload Image",
    uploadExplainer: "Drop file for scanning.",
    analyzing: "Processing...",
    analyze: "Run Analysis",
    analysisResult: "Output"
  },
  pt: {
    // Sidebar
    home: "Início",
    dashboard: "Início", // Fallback
    trainBrain: "Treinar Cérebro",
    memoryBank: "Banco de Dados",
    studio: "Estúdio",
    aiChat: "Chat IA",
    calendar: "Calendário",
    drafts: "Rascunhos",
    creator: "Criador",
    freePlan: "Plano Grátis",
    
    // Landing
    startTrial: "Teste Grátis por 7 Dias",
    login: "Entrar",
    heroTitle: "Conteúdo genérico de IA está destruindo seu negócio.",
    heroSub: "O Authos multiplica sua produção de conteúdo codificando suas histórias e crenças únicas em cada peça. Fuja da era do conteúdo 'lixo' e gere material autêntico que constrói confiança.",

    // Value Chain
    vcStep1Title: "Conteúdo Autêntico",
    vcStep1Sub: "Pare de soar como um robô. O Authos transforma suas memórias brutas em conteúdo poderoso que conecta instantaneamente.",
    vcStep2Title: "Conexão Forte",
    vcStep2Sub: "Pessoas compram de quem confiam. Quando você compartilha histórias reais, constrói uma audiência fiel que te escuta.",
    vcStep3Title: "Mais Receita, Menos Esforço",
    vcStep3Sub: "Você não precisa perseguir clientes o tempo todo. Conteúdo autêntico atrai as pessoas certas que estão prontas para comprar.",

    // Comparison
    comparisonTitle: "A Diferença Está Nos Dados",
    genericHeader: "IA Genérica (ChatGPT, Claude, etc)",
    genericSample: "No mundo acelerado do marketing digital, é crucial alavancar estratégias chave para otimizar seu fluxo de trabalho...",
    authosHeader: "Authos (Seu Cérebro Uploaded)",
    authosSample: "Eu quase demiti meu maior cliente ontem. Não foi por dinheiro. Foi por respeito. Eis o porquê (e o que aprendi)...",

    featureTableTitle: "Por Que o Top 1% Usa Authos",
    feature1: "Aprende Sua História de Vida",
    feature2: "Imita Seu Tom Específico",
    feature3: "Gera Ganchos Virais Automaticamente",
    feature4: "Formatação Específica para Plataforma",
    feature5: "Reaproveita Conteúdo Antigo",
    otherTools: "Outros",

    // Target Audience Section
    targetAudienceTitle: "Para Quem É O Authos?",
    targetIndieTitle: "Experts & Profissionais Liberais",
    targetIndieSub: "Personal Trainers, Advogados, Arquitetos e Mentores. Se você vende sua expertise ou cursos, o Authos ajuda a aparecer com consistência sem burnout.",
    targetAgencyTitle: "Agências & Ghostwriters",
    targetAgencySub: "Entregue conteúdo poderoso e autêntico para seus clientes em velocidade máxima. Gerencie vozes distintas sem esforço.",
    targetLeaderTitle: "Fundadores & Líderes",
    targetLeaderSub: "CMOs e Fundadores de Startups que sabem o valor de uma presença online. Construa uma audiência que atrai talentos e investidores.",

    // Testimonials
    testimonialsTitle: "O que usuários dizem sobre o Authos",
    t1Name: "Sarah Jenkins",
    t1Role: "Consultora de Marketing",
    t1Text: "Eu costumava gastar 4 horas escrevendo uma thread. O Authos faz em 5 minutos, e realmente soa como eu. É assustadoramente bom.",
    t2Name: "David Chen",
    t2Role: "Fundador SaaS",
    t2Text: "Finalmente, uma IA que não soa como um folheto corporativo. Meu engajamento no LinkedIn triplicou desde que comecei a usar minhas próprias memórias.",
    t3Name: "Elena Rodriguez",
    t3Role: "Coach de Vida",
    t3Text: "O recurso de banco de memórias é um divisor de águas. Ele lembra histórias que eu esqueci que tinha e as transforma em lições para meus clientes.",

    // App
    goodAfternoon: "Sistema Online",
    profileActive: "Perfil de Criador Ativo",
    memoriesStored: "memórias guardadas",
    createNew: "Lançar Estúdio",
    practicalTips: "Dicas de Conteúdo",
    practicalTipsSub: "Protocolos de eficiência operacional.",
    tips: [
        "Autenticidade. Não ensine apenas. Conte a história de origem da lição. Fatos informam, histórias conectam.",
        "Integridade do Banco. Garanta que seu Banco de Memórias contenha dados de falha. Vulnerabilidade aumenta métricas de confiança em 300%.",
        "Interrupção de Padrão. No Estúdio, combine intenção 'Polarizar' com frameworks específicos para parar o comportamento de rolagem.",
        "Venda Suave. Use definições de Produto para permitir que a IA teça soluções em estruturas narrativas naturalmente.",
        "Consistência. Uma frequência agendada de 3x/semana supera explosões esporádicas de alto volume.",
        "Diferenciação. Se o consenso da indústria é 'X', use o Treinar Cérebro para articular crença 'Y'. Polarização filtra leads de alto valor.",
        "Teste de Turing. O objetivo não são visualizações, mas humanidade. Verifique: 'Esta saída prova existência?'",
        "Fluxo Híbrido. Utilize IA para velocidade estrutural; injete detalhes manuais de vida para propriedade."
    ],

    // Dashboard & Daily Challenges
    dailyGoals: "Tarefas Diárias", // RENAMED
    goalsCompleted: "Status de Sincronia",
    
    // Dynamic Challenge Keys
    taskLog1Mem: "Logar 1 Memória",
    taskLog3Mem: "Logar 3 Memórias",
    taskCreateDraft: "Criar 1 Rascunho",
    taskBrainDump: "Usar Brain Dump",
    taskStyleRef: "Adicionar Ref Estilo",
    taskNewProduct: "Adicionar Produto",

    keepGoing: "Upload em progresso...",
    allDone: "Sistema Sincronizado.",
    
    hotIdeas: "Fluxo de Intel",
    hotIdeasSub: "Sinais de mercado em tempo real para seu setor.",
    createContentNews: "Newsjack este Tópico",
    loadingNews: "Escaneando redes globais...",
    
    // Progress Snapshot
    progressSnapshot: "Snapshot de Progresso",
    contentScore: "Pontuação de Conteúdo",
    totalMemories: "Total de Memórias",
    registeredProducts: "Produtos",
    contentsGenerated: "Conteúdos Criados",
    postsScheduled: "Agendados/Publicados",
    brainQuestions: "Perguntas Respondidas",
    
    // Smart Notifications
    smartNotifications: "Notificações Inteligentes",
    notificationsSub: "Insights acionáveis para aumentar sua consistência.",
    unusedMemory: "Memória Adormecida Detectada",
    unusedMemoryDesc: "Este ponto de dados não foi utilizado na saída.",
    turnIntoContent: "Ativar Memória",
    newQuestions: "Treine o Cérebro",
    newQuestionsDesc: "Você tem novas perguntas esperando para serem respondidas.",
    answerNow: "Responder Agora",
    productOpportunity: "Oportunidade de Produto",
    productOpportunityDesc: "Você não criou conteúdo para este produto recentemente.",
    promoteNow: "Promover Agora",

    // Studio Hub (NEW)
    studioHubTitle: "Estúdio de Criação",
    studioHubDesc: "Selecione seu protocolo.",
    
    // Feature 1: Brain Dump
    featBrainDumpTitle: "Brain Dump",
    featBrainDumpShort: "Transforme pensamentos brutos em posts polidos instantaneamente.",
    featBrainDumpPopupDesc: "Melhor para Estado de Fluxo. Não se edite. Desabafe ou grave notas de voz. A IA estrutura o caos.",
    featBrainDumpPopupTip: "DICA: Use isso após reuniões ou quando sentir uma emoção forte.",
    startBrainDump: "Iniciar Brain Dump",

    // Feature 2: Guided Creation
    featGuidedTitle: "Criação Guiada",
    featGuidedShort: "Construtor estratégico para metas específicas (Vendas, Educação).",
    featGuidedPopupDesc: "Melhor para Conteúdo de Alto Risco. Use para lançamentos, ensino complexo ou opiniões polarizadoras.",
    featGuidedPopupTip: "DICA: Selecione 'Polarizar' para gerar ganchos de alto engajamento.",
    startGuided: "Iniciar Assistente",

    // Feature 3: Memory Hunt
    featMemoryTitle: "Memórias Adormecidas",
    featMemoryShort: "Encontre histórias esquecidas no seu banco para parar de se repetir.",
    featMemoryDesc: "Identifique e utilize memórias de alto potencial que estão atualmente inativas em seu banco de dados.",
    featMemoryPopupDesc: "Melhor para Bloqueio Criativo. A IA escaneia seu histórico em busca de histórias de alto valor não usadas recentemente.",
    featMemoryPopupTip: "DICA: Use memórias de 'Falha' para construir confiança profunda.",
    findMemories: "Escanear Banco",
    noUnusedMemories: "Todas as memórias utilizadas. Ótimo trabalho.",
    unusedCardCta: "Reviver esta Memória",

    // Feature 4: Newsjack
    featNewsTitle: "Hot News do Seu Nicho",
    featNewsShort: "Surfe tendências virais com sua perspectiva única.",
    featNewsPopupDesc: "Melhor para Relevância. Escaneamos notícias globais, você escolhe, e injetamos sua opinião.",
    featNewsPopupTip: "DICA: Seja do contra. Se todos concordam com a notícia, discorde.",
    featNewsCta: "Escanear Intel Global",

    // Feature 5: Link Import
    featLinkTitle: "Importar Link / Vídeo",
    featLinkShort: "Transforme vídeos do YouTube ou Artigos no seu conteúdo.",
    featLinkPopupDesc: "Melhor para Curadoria. Cole uma URL, nós resumimos, você opina, e geramos o post.",
    featLinkPopupTip: "DICA: Ótimo para transformar podcasts longos em threads curtas.",
    featLinkCta: "Importar Conteúdo",

    // News Search
    newsSearchPlaceholder: "Consultar setor específico...",
    newsSearchHelp: "Substituição manual para intel específica.",
    search: "Escanear",

    // Studio / Brain Dump
    brainDumpTitle: "Modo Brain Dump",
    brainDumpDesc: "Insira áudio ou texto bruto. O sistema estruturará em conteúdo.",
    brainDumpBestPractices: "💡 Melhor Prática: Seja cru e sem filtros. Não se edite. Se está com raiva de uma tendência, diga. Se está empolgado com uma viagem, descreva. A IA cuidará da estrutura; você fornece a alma.",
    startRecording: "Iniciar Áudio",
    stopRecording: "Processar & Gerar",
    writeInstead: "Entrada de Texto",
    recordInstead: "Entrada de Voz",
    brainDumpPlaceholder: "Aguardando entrada bruta...",
    generateFromDump: "Compilar Conteúdo",

    // Studio / Link Import
    linkImportTitle: "Importar e Remixar",
    linkInputPlaceholder: "Cole URL do YouTube ou Link de Artigo...",
    analyzingLink: "Analisando Material Fonte...",
    analyzeUrl: "Analisar URL",
    summaryTitle: "Resumo do Conteúdo",
    addOpinionTitle: "Adicione Sua Perspectiva",
    addOpinionDesc: "Você concorda? Discorda? Tem uma história pessoal sobre isso? (Opcional)",
    generateFromLink: "Gerar Conteúdo",

    // Persona Selector (Studio)
    personaSelectorTitle: "Opcional: Escolha uma Persona para Direcionar este Conteúdo",
    personaSelectorDesc: "Se você está criando conteúdo com a intenção de vender ou conectar profundamente com seu público — especialmente ao promover seu produto ou serviço — selecionar uma persona ajuda a IA a gerar uma comunicação que fala diretamente com as dores, desejos, crenças e linguagem dessa pessoa.",
    personaSelectorNote: "Se você não selecionar uma persona, o conteúdo ainda será personalizado usando seu tom de voz, valores e estilo de escrita do seu banco de memória. Mas selecionar uma persona cria um conteúdo ainda mais direcionado e emocionalmente ressonante. Você pode deixar em branco se estiver criando conteúdo mais amplo.",

    // Sidebar / Common
    format: "Formato",
    twitterThread: "X Thread",
    linkedinPost: "Post no LinkedIn",
    instagramCarousel: "Carrossel no IG",
    topic: "Tópico",
    addSource: "Adicionar URL Fonte",
    removeSource: "Remover URL",
    topicPlaceholder: "Inserir tópico central ou diretriz...",
    writing: "Compilando...",
    generate: "Executar",
    refineTools: "Ferramentas de Refino",
    refineExplainer: "Ajuste a vibe instantaneamente.",
    makeSarcastic: "Tornar Sarcástico",
    sarcasticDesc: "Adicione inteligência e acidez.",
    makePersonal: "Tornar Pessoal",
    personalDesc: "Foque na emoção.",
    makeConcise: "Tornar Conciso",
    conciseDesc: "Corte o excesso.",
    memoryContext: "Contexto de Dados",
    memoryContextSub: "Acessando",
    memories: "nós",
    preview: "Prévia de Saída",
    save: "Salvar em Rascunhos",
    postNow: "Implantar Agora",
    schedule: "Agendar",
    scheduleTitle: "Agendar Post",
    confirmSchedule: "Confirmar Agendamento",
    pickDate: "Escolha data e hora",
    published: "Implantado!",
    scheduled: "Agendado!",
    emptyCanvas: "Sistema Pronto.",
    emptyCanvasSub: "Selecione parâmetros para iniciar geração.",
    tweetPlaceholder: "O que está acontecendo?",
    carouselPlaceholder: "Texto do Slide",
    slide: "Slide",
    addSlide: "Adicionar Slide",
    linkedinPlaceholder: "Sobre o que você quer falar?",
    addTweet: "Adicionar Tweet",
    deleteTweet: "Deletar Tweet",
    backToHub: "Voltar ao Estúdio",
    
    // Train Brain
    trainTitle: "Treinar Cérebro",
    trainSub: "Insira dados para refinar modelo de IA.",
    trainReflections: "Crenças & Histórias", 
    trainProducts: "Produtos",
    trainStyle: "Voz & Linguagem", 
    trainPersona: "Persona", 

    // Train Brain - Product Creation
    prodPersonaDesc: "Escolha a persona alvo. Isso ajuda a IA a adaptar a mensagem às necessidades dela. Se não houver, crie uma na aba Persona.",
    prodSolutionDesc: "Descreva seu produto ou serviço em profundidade. Foque em como funciona, quais problemas resolve, como é entregue e como cria resultados. Inclua todos os detalhes relevantes—frameworks, formatos, suporte, ferramentas ou métodos que você usa.\nExemplo: “Meu programa de coaching ajuda empreendedores sobrecarregados a clarear sua marca e construir confiança através de sessões 1:1 semanais, planos de conteúdo personalizados, treinamento de mentalidade e chamadas de perguntas e respostas ao vivo.”",
    prodDiffDesc: "O que torna sua oferta única? Destaque recursos ou toques pessoais. Ex: 'Ao contrário de outros, ofereço suporte ao vivo para fundadoras.'",
    prodTestimonialDesc: "Adicione provas de que funciona. Use vitórias específicas, números ou citações. Ex: 'Maria dobrou a renda em 90 dias com este método.'",
    prodResultsDesc: "Liste resultados mensuráveis ou credenciais para gerar confiança. Ex: 'Mais de 800 alunos com 98% de conclusão.'",
    prodNotesDesc: "Qualquer contexto extra como planos de lançamento, estratégia de preço ou notas internas.",

    // Train Brain - Persona
    createNewPersona: "Criar Nova Persona",
    
    personaName: "Nome/Apelido da Persona",
    personaNamePlace: "ex: Mãe Corporativa Sobrecarregada",
    
    personaGender: "Foco de Gênero",
    personaGenderOptionFemale: "Primariamente Feminino",
    personaGenderOptionMale: "Primariamente Masculino",
    personaGenderOptionBalanced: "Equilibrado: Ambos",
    
    personaChallenges: "Desafios & Dores",
    personaChallengesDesc: "Quais são os maiores problemas, frustrações ou dificuldades que essa pessoa enfrenta? Se você tem clientes atuais ou passados, do que eles costumam reclamar? O que lhes causa estresse, medo ou insegurança? Liste tudo o que vier à mente — quanto mais problemas, melhor a IA entenderá seu público. (Se não tiver certeza, pode deixar em branco por enquanto.)",
    
    personaFears: "Medos & Inseguranças",
    personaFearsDesc: "Com que medos ou inseguranças essa pessoa lida regularmente? Tente pensar como sua persona — o que ela sente ao acordar? O que a preocupa antes de agir? O que ela teme que aconteça se falhar ou ficar estagnada? Escreva qualquer coisa que revele tensão emocional ou psicológica.",
    
    personaGoals: "Objetivos & Sonhos",
    personaGoalsDesc: "O que essa pessoa realmente quer na vida? O que ela está tentando alcançar, consertar ou criar para si mesma? Isso pode ser pessoal, emocional, profissional, físico ou financeiro. Exemplos: sentir-se mais confiante, ganhar R$10k/mês, perder 15kg, tornar-se um palestrante conhecido, ser promovido, lançar um negócio paralelo.",
    
    personaBehaviors: "Comportamentos Comuns",
    personaBehaviorsDesc: "Quais são alguns hábitos ou padrões que essa pessoa tende a repetir? Quais ações ela toma (ou evita) com frequência? Isso ajuda a IA a entender como ela pensa e se comporta. Exemplos: consome conteúdo constantemente sem agir, sempre procurando o próximo hack de produtividade, começa cursos mas nunca termina, reclama de tempo ou dinheiro.",
    
    generatePersona: "Gerar Relatório de Persona",
    generatingPersona: "Analisando...",
    noPersonas: "Nenhuma persona definida ainda.",

    // Memory Bank (Database)
    bankTitle: "Banco de Memória",
    bankSub: "Pesquise, gerencie e organize seu cérebro digital.",
    bankDescription: "Este é seu arquivo. Use filtros avançados para encontrar histórias específicas ou excluir informações desatualizadas.",
    bankEditNote: "Você pode editar ou excluir memórias antigas a qualquer momento.",
    createContentFromMemory: "Criar conteúdo disto",
    searchPlaceholder: "Buscar no banco...",
    allTypes: "Todos os Tipos",
    noMemories: "Nenhum dado encontrado.",
    filterTags: "Filtrar por Tag",
    sortBy: "Ordenar Por",
    newestFirst: "Mais Recentes",
    oldestFirst: "Mais Antigos",
    
    deepDive: "Mergulho Profundo",
    prompt: "Prompt",
    promptPlaceholder: "Inserir dados de resposta...",
    depositMemory: "Logar Dados",
    skipQuestion: "Pular",
    styleLab: "Voz & Linguagem", 
    styleLabSub: "Defina sua Identidade de Escrita", 
    styleLabDesc: "Esta é a área onde você define como seu conteúdo deve soar.",
    pasteStyle: "Inserir texto ou URL...",
    saveStyle: "Salvar Referência",
    edit: "Editar",
    delete: "Apagar",
    confirmDelete: "Confirmar exclusão?",
    update: "Atualizar",

    // Voice DNA Questions
    voiceDNA: "DNA de Voz",
    
    vdnaJargon: "Você usa jargões, bordões ou expressões criadas em seu conteúdo?",
    vdnaJargonDesc: "Explicação:\nQueremos entender a maneira única como você fala ou escreve. Podem ser frases que você repete frequentemente, formas de simplificar conceitos ou palavras que fazem parte da sua marca pessoal.\n\nComo responder bem:\nPense em frases que sua audiência pode associar a você, ou palavras que você repete frequentemente em e-mails, posts ou legendas.\n\nExemplos:\n• \"Eu sempre digo 'Construa em público' ao falar sobre lançamentos de produtos.\"\n• \"Uso a frase 'feito é melhor que perfeito' para incentivar a ação.\"\n• \"Muitas vezes escrevo 'Plot twist!' ao anunciar algo inesperado.\"",
    vdnaJargonPlace: "Liste seus bordões aqui...",
    
    vdnaAudience: "Você chama sua audiência ou comunidade por um nome específico?",
    vdnaAudienceDesc: "Explicação:\nCriadores frequentemente dão um apelido à sua audiência para construir identidade e conexão. Se você chama seus seguidores de algo especial, conte-nos.\n\nComo responder bem:\nSe você já se referiu à sua audiência com um apelido ou rótulo (mesmo casualmente), escreva.\n\nExemplos:\n• \"Chamo minha audiência de 'Rebeldes da Marca'.\"\n• \"Falo com eles como 'Os Construtores'.\"\n• \"Digo 'Ei desajustados' no início da maioria dos posts.\"",
    vdnaAudiencePlace: "Ex: Rebeldes, Construtores...",
    
    vdnaIntensity: "Você usa linguagem forte ou explícita (como palavrões) na sua escrita?",
    vdnaIntensityDesc: "Explicação:\nIsso nos ajuda a saber quão ousado ou cru seu tom deve ser. Algumas pessoas gostam de polido e limpo. Outras querem soar reais e intensas.\n\nComo responder bem:\nDiga-nos se você usa palavrões — e se sim, em que contexto ou frequência.\n\nExemplos:\n• \"Sim — uso palavras como 'droga', 'merda' quando quero enfatizar um ponto.\"\n• \"Só uso palavrões em posts emocionais ou pessoais.\"\n• \"Não — mantenho meu tom limpo e profissional o tempo todo.\"",
    vdnaIntensityPlace: "Descreva sua postura sobre linguagem forte...",
    
    vdnaSacred: "Existem palavras sagradas ou valores que você repete frequentemente na sua escrita?",
    vdnaSacredDesc: "Explicação:\nPodem ser palavras que definem sua missão, valores que você repete na maioria do seu conteúdo, ou até frases que aparecem em vários posts.\n\nComo responder bem:\nPense em palavras ou ideias que são centrais para sua mensagem e identidade — ou que você quer que sua audiência lembre.\n\nExemplos:\n• \"Clareza, Consistência, Coragem — menciono isso na maioria dos posts.\"\n• \"Muitas vezes digo: 'Isso não é um conselho. Isso é um espelho.'\"\n• \"Meu final padrão é: 'Continue perigoso.'\"",
    vdnaSacredPlace: "Liste suas palavras ou valores sagrados...",
    
    saveVoiceSettings: "Salvar Configurações de Voz",

    // Drafts
    draftsTitle: "Rascunhos",
    draftsSub: "Trabalho em progresso.",
    statusDraft: "Rascunho",
    statusScheduled: "Agendado",
    statusPublished: "Implantado",
    noDraftsFound: "Sem rascunhos.",

    // Chat
    chatTitle: "Chat Authos",
    chatSub: "Estratégia interativa.",
    you: "Usuário",
    chatInput: "Inserir comando...",

    // Calendar
    calendarTitle: "Calendário",
    calendarSub: "Visualização de consistência.",
    mon: "Seg",
    tue: "Ter",
    wed: "Qua",
    thu: "Qui",
    fri: "Sex",
    sat: "Sáb",
    sun: "Dom",

    // System Navigation / Guide
    guideTitle: "Navegação do Sistema",
    guideSub: "Manual operacional dos módulos Authos.",
    
    guideTrainBrain: "Treinar Cérebro",
    guideTrainBrainDesc: "O centro de entrada. Alimente a IA com suas histórias, defina seus produtos e faça upload de amostras de escrita para que ela aprenda sua voz.",
    
    guideStudio: "Estúdio",
    guideStudioDesc: "O centro de saída. Use Brain Dump para velocidade, Criação Guiada para estratégia, ou Newsjack para tendências.",
    
    guideMemoryBank: "Banco de Memória",
    guideMemoryBankDesc: "Seu hipocampo digital. Revise, edite e exclua os dados brutos (histórias/crenças) com os quais você treinou o sistema.",
    
    guideDrafts: "Rascunhos",
    guideDraftsDesc: "Área de preparação. Revise o conteúdo gerado, refine as saídas e gerencie o status de publicação.",
    
    guideChat: "Chat IA",
    guideChatDesc: "Parceiro estratégico. Tenha ideias, faça perguntas sobre seu próprio conteúdo ou obtenha feedback rápido.",
    
    guideCalendar: "Calendário",
    guideCalendarDesc: "Rastreador de consistência. Visualize sua frequência de publicação e próximos posts agendados.",

    // Onboarding
    step1Title: "Inicializar Sistema.",
    step1Sub: "Construindo gêmeo digital. Insira designação.",
    step2Title: "Defina Arena.",
    step2Sub: "Seja ultra-específico. Precisão melhora qualidade de saída.",
    step3Title: "Protocolos Centrais",
    step3Sub: "Quais princípios são inegociáveis?",
    step4Title: "Dados Contrários",
    step4Sub: "Qual consenso da indústria você rejeita?",
    step5Title: "Modulação de Voz",
    step5Sub: "Defina parâmetros de saída (ex: 'Severo', 'Solidário').",
    step6Title: "Densidade de Emojis",
    step6Sub: "Frequência de indicador visual.",
    firstName: "Primeiro Nome",
    niche: "Nicho Específico / Indústria",
    audience: "Público Alvo",
    toneLabel: "Estilo de Escrita",
    emojiNone: "Nenhum (Profissional)",
    emojiMinimal: "Mínimo (Eficiência)",
    emojiHeavy: "Intenso (Visual)",
    add: "Add",
    continue: "Próximo",
    finish: "Inicializar",

    // Image Analyzer
    visionTitle: "Analisador de Visão",
    visionSub: "Extrair significado semântico de imagens.",
    upload: "Carregar Imagem",
    uploadExplainer: "Solte arquivo para escaneamento.",
    analyzing: "Processando...",
    analyze: "Rodar Análise",
    analysisResult: "Saída"
  }
};

export type LanguageKey = keyof typeof translations;

export const getTranslation = (lang: Language) => translations[lang];
