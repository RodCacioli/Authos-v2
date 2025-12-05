
import React, { useState } from 'react';
import { UserProfile, Language } from '../types';
import { ArrowRight, Check } from 'lucide-react';
import { getTranslation } from '../translations';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
  language: Language;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, language }) => {
  const t = getTranslation(language);
  const totalSteps = 6;
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: '',
    values: [],
    contrarianViews: [],
    emojiUsage: 'minimal',
    tone: ''
  });

  const handleNext = () => {
    if (step === 1 && !formData.name?.trim()) return; // Require name
    
    if (step < totalSteps) setStep(step + 1);
    else onComplete({ ...formData, onboardingComplete: true } as UserProfile);
  };

  const updateField = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addToList = (field: 'values' | 'contrarianViews', item: string) => {
    const current = formData[field] || [];
    if (item && !current.includes(item)) {
      updateField(field, [...current, item]);
    }
  };

  const [tempInput, setTempInput] = useState('');

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white flex items-center justify-center p-4 transition-colors font-mono">
      <div className="max-w-lg w-full">
        {/* Progress Bar */}
        <div className="flex mb-12 gap-2">
          {Array.from({length: totalSteps}).map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i + 1 <= step ? 'bg-black dark:bg-white' : 'bg-zinc-200 dark:bg-zinc-800'}`} />
          ))}
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight leading-tight uppercase">
            {step === 1 && t.step1Title}
            {step === 2 && t.step2Title}
            {step === 3 && t.step3Title}
            {step === 4 && t.step4Title}
            {step === 5 && t.step5Title}
            {step === 6 && t.step6Title}
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 mb-10 text-sm leading-relaxed font-mono">
            {step === 1 && t.step1Sub}
            {step === 2 && t.step2Sub}
            {step === 3 && t.step3Sub}
            {step === 4 && t.step4Sub}
            {step === 5 && t.step5Sub}
            {step === 6 && t.step6Sub}
            </p>

            {/* Step 1: Name */}
            {step === 1 && (
            <div className="space-y-6">
                <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">{t.firstName}</label>
                <input 
                    type="text" 
                    className="w-full bg-transparent border-b-2 border-zinc-200 dark:border-zinc-800 py-3 text-xl focus:border-black dark:focus:border-white focus:outline-none transition-colors font-mono"
                    placeholder="e.g. Jane"
                    autoFocus
                    value={formData.name || ''}
                    onChange={e => updateField('name', e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleNext()}
                />
                </div>
            </div>
            )}

            {/* Step 2: Niche & Audience */}
            {step === 2 && (
            <div className="space-y-8">
                <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">{t.niche}</label>
                <input 
                    type="text" 
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 focus:ring-1 focus:ring-black dark:focus:ring-white focus:outline-none transition-colors font-mono text-sm"
                    placeholder="e.g., B2B SaaS Marketing"
                    value={formData.niche || ''}
                    onChange={e => updateField('niche', e.target.value)}
                />
                </div>
                <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">{t.audience}</label>
                <input 
                    type="text" 
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 focus:ring-1 focus:ring-black dark:focus:ring-white focus:outline-none transition-colors font-mono text-sm"
                    placeholder="e.g., Freelance designers"
                    value={formData.audience || ''}
                    onChange={e => updateField('audience', e.target.value)}
                />
                </div>
            </div>
            )}

            {/* Step 3: Values */}
            {step === 3 && (
            <div className="space-y-6">
                <div className="flex gap-3">
                <input 
                    type="text" 
                    className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 focus:ring-1 focus:ring-black dark:focus:ring-white focus:outline-none transition-colors font-mono text-sm"
                    placeholder="e.g., Radical Transparency"
                    value={tempInput}
                    onChange={e => setTempInput(e.target.value)}
                    onKeyDown={e => {
                        if(e.key === 'Enter') {
                            addToList('values', tempInput);
                            setTempInput('');
                        }
                    }}
                />
                <button 
                    onClick={() => { addToList('values', tempInput); setTempInput(''); }}
                    className="bg-zinc-900 dark:bg-white text-white dark:text-black px-6 rounded-lg font-bold text-xs uppercase tracking-wider hover:opacity-90"
                >{t.add}</button>
                </div>
                <div className="flex flex-wrap gap-2">
                {formData.values?.map((val, i) => (
                    <span key={i} className="px-3 py-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-xs font-mono uppercase tracking-wide">
                    {val}
                    </span>
                ))}
                </div>
            </div>
            )}

            {/* Step 4: Beliefs */}
            {step === 4 && (
            <div className="space-y-6">
                <div className="flex gap-3">
                <input 
                    type="text" 
                    className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 focus:ring-1 focus:ring-black dark:focus:ring-white focus:outline-none transition-colors font-mono text-sm"
                    placeholder="e.g., Hustle culture is toxic"
                    value={tempInput}
                    onChange={e => setTempInput(e.target.value)}
                    onKeyDown={e => {
                        if(e.key === 'Enter') {
                            addToList('contrarianViews', tempInput);
                            setTempInput('');
                        }
                    }}
                />
                <button 
                    onClick={() => { addToList('contrarianViews', tempInput); setTempInput(''); }}
                    className="bg-zinc-900 dark:bg-white text-white dark:text-black px-6 rounded-lg font-bold text-xs uppercase tracking-wider hover:opacity-90"
                >{t.add}</button>
                </div>
                <div className="flex flex-wrap gap-2">
                {formData.contrarianViews?.map((val, i) => (
                    <span key={i} className="px-3 py-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-xs font-mono uppercase tracking-wide">
                    {val}
                    </span>
                ))}
                </div>
            </div>
            )}

            {/* Step 5: Tone of Voice */}
            {step === 5 && (
             <div className="space-y-6">
                <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">{t.toneLabel}</label>
                <textarea 
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 focus:ring-1 focus:ring-black dark:focus:ring-white focus:outline-none transition-colors min-h-[120px] font-mono text-sm"
                    placeholder="e.g., Witty, Sarcastic, Direct..."
                    value={formData.tone || ''}
                    onChange={e => updateField('tone', e.target.value)}
                />
                </div>
             </div>
            )}

            {/* Step 6: Emojis */}
            {step === 6 && (
              <div className="space-y-4">
                 {[
                    { val: 'none', label: t.emojiNone },
                    { val: 'minimal', label: t.emojiMinimal },
                    { val: 'heavy', label: t.emojiHeavy }
                 ].map((opt) => (
                    <button
                        key={opt.val}
                        onClick={() => updateField('emojiUsage', opt.val)}
                        className={`w-full p-4 rounded-lg border text-left transition-all ${
                            formData.emojiUsage === opt.val 
                            ? 'border-black dark:border-white bg-zinc-50 dark:bg-zinc-900' 
                            : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600'
                        }`}
                    >
                        <span className="font-bold text-sm uppercase tracking-wide">{opt.label}</span>
                    </button>
                 ))}
              </div>
            )}

            <div className="mt-12 flex justify-end">
            <button 
                onClick={handleNext}
                className="bg-black dark:bg-white text-white dark:text-black px-8 py-4 rounded-lg font-bold uppercase tracking-widest text-xs flex items-center gap-3 hover:opacity-90 transition-opacity shadow-lg"
            >
                {step === totalSteps ? t.finish : t.continue}
                {step === totalSteps ? <Check size={16} /> : <ArrowRight size={16} />}
            </button>
            </div>
        </div>
      </div>
    </div>
  );
};
