
import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { analyzeImage } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { Language } from '../types';
import { getTranslation } from '../translations';

export const ImageAnalyzer: React.FC<{language: Language}> = ({ language }) => {
  const t = getTranslation(language);
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setAnalysis(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const result = await analyzeImage(image, "Extract the core story, emotion, and objects from this image. How can I use this as a metaphor for business or life?", language);
      setAnalysis(result);
    } catch (e) {
      setAnalysis("Failed to analyze image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2 tracking-tight">{t.visionTitle}</h2>
        <p className="text-zinc-500 dark:text-zinc-400">{t.visionSub}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Upload Area */}
        <div className="flex flex-col gap-6">
          <div 
            className={`border-2 border-dashed rounded-2xl aspect-video flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden group ${
              image ? 'border-zinc-300 dark:border-zinc-700' : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-500 dark:hover:border-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            {image ? (
              <img src={image} alt="Uploaded" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors p-6 text-center">
                <div className="p-4 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4">
                    <Upload className="w-8 h-8" />
                </div>
                <p className="font-medium mb-2">{t.upload}</p>
                <p className="text-xs text-zinc-400 max-w-xs">{t.uploadExplainer}</p>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageUpload}
            />
          </div>
          
          {image && (
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full bg-zinc-900 dark:bg-white text-white dark:text-black font-bold py-4 rounded-xl hover:opacity-90 disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg transition-opacity"
            >
              {loading ? <Loader2 className="animate-spin" /> : <ImageIcon />}
              {loading ? t.analyzing : t.analyze}
            </button>
          )}
        </div>

        {/* Result Area */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 h-[500px] overflow-y-auto shadow-sm">
           <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-6 flex items-center gap-2">
             {t.analysisResult}
           </h3>
           
           {loading ? (
             <div className="space-y-4 animate-pulse">
               <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4"></div>
               <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-full"></div>
               <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-5/6"></div>
               <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2"></div>
             </div>
           ) : analysis ? (
             <div className="prose prose-zinc dark:prose-invert leading-relaxed">
               <ReactMarkdown>{analysis}</ReactMarkdown>
             </div>
           ) : (
             <div className="h-full flex flex-col items-center justify-center text-zinc-400 opacity-50">
                <ImageIcon size={40} className="mb-2"/>
                <p className="text-sm">Results will appear here</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};