
import React from 'react';
import { ArrowRight, Check, X, Star, Sun, Moon, ChevronRight, Fingerprint, TrendingUp, Heart, User, Zap, Briefcase } from 'lucide-react';
import { Language, Theme } from '../types';
import { getTranslation } from '../translations';

interface LandingPageProps {
  onStart: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, language, setLanguage, theme, setTheme }) => {
  const t = getTranslation(language);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
  const toggleLang = () => setLanguage(language === 'en' ? 'pt' : 'en');

  const comparisonData = [
    { feature: t.feature1, authos: true, other: false },
    { feature: t.feature2, authos: true, other: false },
    { feature: t.feature3, authos: true, other: false },
    { feature: t.feature4, authos: true, other: false },
    { feature: t.feature5, authos: true, other: false },
  ];

  return (
    <div className={`min-h-screen font-mono transition-colors duration-500 ${theme === 'dark' ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-900'}`}>
      
      {/* Top Bar */}
      <nav className={`sticky top-0 z-50 border-b backdrop-blur-xl ${theme === 'dark' ? 'border-zinc-800 bg-zinc-950/80' : 'border-zinc-200 bg-white/80'}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 ${theme === 'dark' ? 'bg-white' : 'bg-black'}`}></div>
            <span className="text-xl font-bold tracking-tight font-mono">AUTHOS_v1</span>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2 border-r border-zinc-800 pr-6">
                <button onClick={toggleTheme} className="p-2 hover:bg-zinc-800 rounded-md transition-colors">
                    {theme === 'dark' ? <Sun size={16}/> : <Moon size={16}/>}
                </button>
                <button onClick={toggleLang} className="p-2 hover:bg-zinc-800 rounded-md transition-colors font-mono text-xs font-bold">
                    {language === 'en' ? 'EN' : 'PT'}
                </button>
             </div>
             <button 
                onClick={onStart}
                className={`px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider border transition-all ${
                    theme === 'dark' 
                    ? 'bg-white text-black border-white hover:bg-zinc-200' 
                    : 'bg-black text-white border-black hover:bg-zinc-800'
                }`}
             >
                {t.login}
             </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 border-b border-zinc-200 dark:border-zinc-800 overflow-hidden">
         {/* Grid Background */}
         <div className={`absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none`}></div>
         
         <div className="max-w-6xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-zinc-500">System Online</span>
            </div>
            
            <h1 className="text-4xl md:text-7xl font-bold tracking-tighter mb-8 leading-[0.9] uppercase text-yellow-500">
                {t.heroTitle}
            </h1>
            
            <p className="text-lg font-mono text-zinc-500 dark:text-zinc-400 max-w-3xl mx-auto mb-12 leading-relaxed">
               {t.heroSub}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                    onClick={onStart}
                    className={`h-14 px-8 text-sm font-mono font-bold uppercase tracking-wider flex items-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all border border-black dark:border-white ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'}`}
                >
                    {t.startTrial} <ChevronRight size={16} />
                </button>
            </div>
         </div>
      </section>

      {/* Value Chain Section */}
      <section className="py-20 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30">
          <div className="max-w-5xl mx-auto px-6">
             <div className="grid md:grid-cols-3 gap-8 text-center relative">
                {/* Arrows for desktop */}
                <div className="hidden md:block absolute top-1/2 left-1/3 -translate-y-1/2 text-zinc-300 dark:text-zinc-700 z-0">
                    <ArrowRight size={32} />
                </div>
                 <div className="hidden md:block absolute top-1/2 right-1/3 -translate-y-1/2 text-zinc-300 dark:text-zinc-700 z-0">
                    <ArrowRight size={32} />
                </div>

                {/* Step 1 */}
                <div className="flex flex-col items-center p-8 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm z-10 relative hover:border-zinc-400 transition-all">
                    <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4">
                        <Fingerprint size={24} />
                    </div>
                    <h3 className="font-bold text-sm uppercase tracking-wider mb-2 text-zinc-900 dark:text-white">{t.vcStep1Title}</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-mono">{t.vcStep1Sub}</p>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center p-8 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm z-10 relative hover:border-zinc-400 transition-all">
                    <div className="p-4 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 mb-4">
                        <Heart size={24} />
                    </div>
                    <h3 className="font-bold text-sm uppercase tracking-wider mb-2 text-zinc-900 dark:text-white">{t.vcStep2Title}</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-mono">{t.vcStep2Sub}</p>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center p-8 bg-white dark:bg-zinc-950 rounded-xl border-2 border-green-500/20 dark:border-green-500/20 shadow-sm z-10 relative hover:border-zinc-400 transition-all">
                    <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-4">
                        <TrendingUp size={24} />
                    </div>
                    <h3 className="font-bold text-sm uppercase tracking-wider mb-2 text-zinc-900 dark:text-white">{t.vcStep3Title}</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-mono">{t.vcStep3Sub}</p>
                </div>
             </div>
          </div>
      </section>

      {/* The Comparison Section */}
      <section className="py-24 px-6 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-4 text-zinc-900 dark:text-white uppercase">
              {t.comparisonTitle}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-stretch">
            {/* Generic Card */}
            <div className="bg-zinc-50 dark:bg-zinc-900 p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col transition-colors hover:border-zinc-300 dark:hover:border-zinc-700">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
                    <X size={16} />
                 </div>
                 <h3 className="font-bold text-xs uppercase tracking-widest text-zinc-500">{t.genericHeader}</h3>
              </div>
              <div className="flex-1">
                <p className="text-sm font-mono leading-relaxed text-zinc-500 dark:text-zinc-400">
                  "{t.genericSample}"
                </p>
              </div>
            </div>

            {/* Authos Card */}
            <div className="bg-white dark:bg-zinc-950 p-8 rounded-xl border-2 border-zinc-900 dark:border-white shadow-xl relative flex flex-col transform md:-translate-y-4">
               {/* Badge */}
               <div className="absolute -top-3 left-6 bg-black dark:bg-white text-white dark:text-black px-3 py-1 text-[10px] font-bold uppercase tracking-widest border border-transparent">
                  Authos Engine
               </div>
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                    <Check size={16} strokeWidth={3} />
                 </div>
                 <h3 className="font-bold text-xs uppercase tracking-widest text-zinc-900 dark:text-white">{t.authosHeader}</h3>
              </div>
              <div className="flex-1">
                <p className="text-sm font-mono leading-relaxed text-zinc-900 dark:text-zinc-100 font-bold">
                  "{t.authosSample}"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24 px-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="max-w-4xl mx-auto">
             <h2 className="text-3xl font-bold tracking-tighter mb-12 text-center uppercase">{t.featureTableTitle}</h2>
             
             <div className="overflow-hidden border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm">
                 <table className="w-full">
                     <thead>
                         <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-left">
                             <th className="py-4 px-6 font-mono text-xs uppercase tracking-wider text-zinc-500 w-1/2">Feature</th>
                             <th className="py-4 px-6 font-mono text-xs uppercase tracking-wider text-center text-black dark:text-white w-1/4 border-l border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800">Authos</th>
                             <th className="py-4 px-6 font-mono text-xs uppercase tracking-wider text-center text-zinc-400 w-1/4 border-l border-zinc-200 dark:border-zinc-800">{t.otherTools}</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                         {comparisonData.map((row, idx) => (
                             <tr key={idx} className="bg-white dark:bg-zinc-950">
                                 <td className="py-4 px-6 text-xs font-bold uppercase tracking-wide">{row.feature}</td>
                                 <td className="py-4 px-6 text-center border-l border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30">
                                     {row.authos ? <Check className="inline-block text-black dark:text-white" size={16} strokeWidth={3} /> : <X className="inline-block text-zinc-300" size={16} />}
                                 </td>
                                 <td className="py-4 px-6 text-center border-l border-zinc-200 dark:border-zinc-800">
                                     {row.other ? <Check className="inline-block text-zinc-400" size={16} /> : <X className="inline-block text-zinc-300 dark:text-zinc-700" size={16} />}
                                 </td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>
          </div>
      </section>

      {/* Target Audience Section */}
      <section className="py-24 px-6 bg-zinc-50 dark:bg-zinc-900/30 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-4 text-zinc-900 dark:text-white uppercase">
                    {t.targetAudienceTitle}
                </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Card 1: Experts */}
                <div className="bg-white dark:bg-zinc-950 p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-zinc-400 transition-all">
                    <div className="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-6 text-zinc-900 dark:text-white">
                         <User size={20} strokeWidth={1.5}/>
                    </div>
                    <h3 className="text-sm font-bold mb-3 text-zinc-900 dark:text-white uppercase tracking-wider">{t.targetIndieTitle}</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-mono">
                        {t.targetIndieSub}
                    </p>
                </div>

                {/* Card 2: Agencies */}
                <div className="bg-white dark:bg-zinc-950 p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-zinc-400 transition-all">
                    <div className="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-6 text-zinc-900 dark:text-white">
                         <Zap size={20} strokeWidth={1.5}/>
                    </div>
                    <h3 className="text-sm font-bold mb-3 text-zinc-900 dark:text-white uppercase tracking-wider">{t.targetAgencyTitle}</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-mono">
                        {t.targetAgencySub}
                    </p>
                </div>

                {/* Card 3: Leaders */}
                <div className="bg-white dark:bg-zinc-950 p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-zinc-400 transition-all">
                    <div className="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-6 text-zinc-900 dark:text-white">
                         <Briefcase size={20} strokeWidth={1.5}/>
                    </div>
                    <h3 className="text-sm font-bold mb-3 text-zinc-900 dark:text-white uppercase tracking-wider">{t.targetLeaderTitle}</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-mono">
                        {t.targetLeaderSub}
                    </p>
                </div>
            </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-zinc-50 dark:bg-zinc-900/20">
          <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tighter mb-12 text-center uppercase">{t.testimonialsTitle}</h2>
              
              <div className="grid md:grid-cols-3 gap-8">
                  {[
                      { name: t.t1Name, role: t.t1Role, text: t.t1Text, img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces" },
                      { name: t.t2Name, role: t.t2Role, text: t.t2Text, img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces" },
                      { name: t.t3Name, role: t.t3Role, text: t.t3Text, img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces" }
                  ].map((item, i) => (
                      <div key={i} className="p-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] hover:-translate-y-1 transition-transform duration-300">
                          <div className="flex items-center gap-1 mb-4 text-black dark:text-white">
                              {[1,2,3,4,5].map(s => <Star key={s} size={12} fill="currentColor" />)}
                          </div>
                          <p className="text-sm font-medium leading-relaxed mb-6 font-mono">"{item.text}"</p>
                          <div className="flex items-center gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-900">
                              <img src={item.img} alt={item.name} className="w-10 h-10 rounded-full grayscale" />
                              <div>
                                  <p className="font-bold text-xs uppercase tracking-wider">{item.name}</p>
                                  <p className="font-mono text-[10px] text-zinc-500 uppercase">{item.role}</p>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 text-center">
         <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-8 max-w-4xl mx-auto uppercase">
            Ready to upload your brain?
         </h2>
         <button 
            onClick={onStart}
            className={`h-16 px-10 text-sm font-mono font-bold uppercase tracking-wider shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all border border-black dark:border-white ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'}`}
        >
            {t.startTrial}
        </button>
      </section>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-12 text-center text-zinc-500 font-mono text-xs">
          <p>SYSTEM_VERSION: 1.0.4 // AUTHOS_AI © 2024</p>
      </footer>
    </div>
  );
};
