import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { ArrowRight, Loader2, AlertCircle, HardDrive } from 'lucide-react';
import { Language } from '../types';
import { getTranslation } from '../translations';

interface LoginProps {
    onSuccess: () => void;
    onOffline: () => void;
    language: Language;
}

export const Login: React.FC<LoginProps> = ({ onSuccess, onOffline, language }) => {
    const t = getTranslation(language);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const [message, setMessage] = useState('');

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage('');

        try {
            if (mode === 'signup') {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                setMessage("Check your email for the confirmation link!");
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                onSuccess();
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 transition-colors">
            <div className="max-w-md w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-8 animate-in fade-in zoom-in-95 duration-300">
                
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2 font-mono">
                        AUTHOS<span className="animate-pulse">_</span>
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                        {mode === 'signin' ? 'Access your digital brain.' : 'Create your account.'}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-zinc-500 mb-1">Email</label>
                        <input 
                            type="email" 
                            required
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-zinc-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none transition-colors font-mono"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-zinc-500 mb-1">Password</label>
                        <input 
                            type="password" 
                            required
                            minLength={6}
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-zinc-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none transition-colors font-mono"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg flex items-start gap-2 text-red-600 dark:text-red-400 text-sm">
                            <AlertCircle size={16} className="mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {message && (
                         <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-lg text-green-600 dark:text-green-400 text-sm text-center font-bold">
                            {message}
                        </div>
                    )}

                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-zinc-900 dark:bg-white text-white dark:text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg mt-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight size={18} />}
                        {mode === 'signin' ? 'Sign In' : 'Sign Up'}
                    </button>
                </form>

                <div className="my-6 flex items-center gap-4">
                    <div className="h-px bg-zinc-200 dark:bg-zinc-800 flex-1"></div>
                    <span className="text-xs text-zinc-400 font-bold uppercase">OR</span>
                    <div className="h-px bg-zinc-200 dark:bg-zinc-800 flex-1"></div>
                </div>

                <button 
                    onClick={onOffline}
                    className="w-full bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors border border-zinc-200 dark:border-zinc-800"
                >
                    <HardDrive size={18} />
                    Continue Offline (Local Database)
                </button>

                <div className="mt-6 text-center">
                    <p className="text-xs text-zinc-500">
                        {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
                        <button 
                            onClick={() => {
                                setMode(mode === 'signin' ? 'signup' : 'signin');
                                setError(null);
                                setMessage('');
                            }}
                            className="font-bold text-zinc-900 dark:text-white hover:underline"
                        >
                            {mode === 'signin' ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};