import React from 'react';
import { Sparkle, ArrowRight } from '@phosphor-icons/react';
import CheckoutButton from '../app/enterprise/CheckoutButton';

interface Props {
    queryText: string;
}

export default function ArbitragePremiumCTA({ queryText }: Props) {
    const handlePreRedirectCache = () => {
        // We must cache the user's raw idea so that when Stripe redirects back 
        // to our frontend, we can automatically pull the intent from local storage 
        // and trigger the "Premium" double-rerun sequence without losing data.
        if (typeof window !== 'undefined') {
            localStorage.setItem('pending_arbitrage_query', queryText);
            
            // Generate the dynamic callback URL pointing right back to this exact tool
            const origin = window.location.origin;
            return `${origin}/super-architect?tier=premium`;
        }
        return '/super-architect?tier=premium';
    };

    // Calculate the success URL dynamically
    const successUrl = typeof window !== 'undefined' ? handlePreRedirectCache() : undefined;
    return (
        <div className="w-full relative mt-8 mb-4 p-8 rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-zinc-950/90 to-black overflow-hidden group shadow-[0_0_30px_rgba(0,229,255,0.05)] hover:shadow-[0_0_40px_rgba(0,229,255,0.15)] transition-all duration-500">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] z-0 pointer-events-none group-hover:bg-cyan-500/20 transition-colors duration-700"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1 text-left">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-4">
                        <Sparkle size={14} className="animate-pulse" />
                        <span>Intelligence Router Available</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-tight">
                        Upgrade to Enterprise Intelligence
                    </h3>
                    <p className="text-sm text-zinc-400 leading-relaxed max-w-xl">
                        This architecture was built using a basic drafting model. Upgrade to Enterprise, and our <strong>B2B Value Router</strong> will instantly hook into the global LLM matrix, calculate the smartest <strong>Budget-SOTA Reasoning Model</strong>, and completely re-synthesize your PRD algorithms and microservice topology in real time.
                    </p>
                </div>
                
                <div className="w-full md:w-auto flex-shrink-0 flex flex-col items-center">
                    <div onClick={handlePreRedirectCache} className="w-full">
                        <CheckoutButton 
                            label="Buy Premium Blueprint ($99)" 
                            successUrl={successUrl}
                            className="w-full md:w-auto bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-4 rounded-xl transition-all duration-300 hover:scale-[1.02] flex items-center justify-center font-bold text-base shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_30px_rgba(0,229,255,0.5)] group/btn relative overflow-hidden"
                        />
                    </div>
                    <p className="text-center mt-3 text-xs text-zinc-500 font-mono tracking-wider uppercase opacity-80 flex items-center gap-1">
                        <Sparkle size={12} /> Powered by Stripe
                    </p>
                </div>
            </div>
        </div>
    );
}
