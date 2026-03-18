"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useCompletion } from '@ai-sdk/react';
import { X, Terminal, Cpu, Zap, Activity } from 'lucide-react';

export default function SecretPRDGenerator() {
  const [isOpen, setIsOpen] = useState(false);
  const [idea, setIdea] = useState('');
  const [routingState, setRoutingState] = useState<'idle' | 'routing' | 'generating' | 'done'>('idle');
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  const { completion, complete, isLoading, error, stop } = useCompletion({
    api: '/api/generate-prd',
    onFinish: () => {
      setRoutingState('done');
    }
  });

  // Listen for Option + Command + P
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // e.code === 'KeyP' is required because e.altKey (Option) on macOS changes e.key to 'π'
      if (e.altKey && e.metaKey && (e.key.toLowerCase() === 'p' || e.code === 'KeyP')) {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-scroll the terminal
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [completion]);

  const handleGenerate = async (strategy: 'ultra' | 'smart') => {
    if (!idea.trim()) return;
    
    setRoutingState('routing');
    setSelectedModel(null);
    
    try {
      // Step 1: Hit the Intelligence SDK to get the routing decision
      const routeRes = await fetch('/api/resolve-prd-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, strategy })
      });
      
      const routeData = await routeRes.json();
      if (routeData.model) {
        setSelectedModel(routeData.model);
      } else {
        setSelectedModel('fallback-model-selected');
      }

      setRoutingState('generating');

      // Step 2: Actually stream the PRD using the selected model
      await complete(idea, {
        body: { modelId: routeData.model, strategy }
      });
      
    } catch (err) {
      console.error(err);
      setRoutingState('idle');
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    if (isLoading) stop();
    setTimeout(() => {
      setIdea('');
      setRoutingState('idle');
      setSelectedModel(null);
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#050505] border border-zinc-800 rounded-2xl shadow-[0_0_100px_rgba(16,185,129,0.05)] overflow-hidden font-[family-name:var(--font-inter)] relative">
        
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-32 bg-emerald-500/10 blur-[100px] pointer-events-none" />

        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/30">
          <div className="flex items-center gap-3">
             <Terminal className="text-emerald-500 w-5 h-5" />
             <h2 className="text-white font-bold tracking-tight font-[family-name:var(--font-jetbrains)] uppercase text-sm">Autonomous Architecture Planner</h2>
             <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-[10px] font-mono border border-zinc-700">OPT_CMD_P</span>
          </div>
          <button onClick={closeModal} className="text-zinc-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col gap-8 custom-scrollbar">
          
          {routingState === 'idle' && (
            <>
              <div>
                <label className="block text-zinc-400 text-sm mb-3 font-medium">1. Define the Core Primitive</label>
                <textarea 
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder="Describe the platform you want the swarm to build..."
                  className="w-full h-32 bg-black border border-zinc-800 rounded-xl p-4 text-zinc-200 placeholder-zinc-700 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 resize-none font-light leading-relaxed transition-all"
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-sm mb-3 font-medium">2. Select Intelligence Routing Protocol</label>
                <div className="grid md:grid-cols-2 gap-4">
                   <button 
                     onClick={() => handleGenerate('ultra')}
                     disabled={!idea.trim()}
                     className="group text-left p-5 rounded-xl border border-zinc-700/50 bg-gradient-to-br from-zinc-900 to-black hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                      <div className="flex items-center gap-3 mb-2">
                        <Zap className="text-emerald-400 w-5 h-5 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                        <span className="text-white font-bold font-[family-name:var(--font-jetbrains)]">ULTRA PREMIUM</span>
                      </div>
                      <p className="text-xs text-zinc-500 leading-relaxed font-mono">Forces strict ELO topology. Routes to the absolute highest-scoring reasoning model on earth, regardless of API cost.</p>
                   </button>

                   <button 
                     onClick={() => handleGenerate('smart')}
                     disabled={!idea.trim()}
                     className="group text-left p-5 rounded-xl border border-zinc-800/80 bg-zinc-900/30 hover:border-indigo-500/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                      <div className="flex items-center gap-3 mb-2">
                        <Cpu className="text-indigo-400 w-5 h-5 drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                        <span className="text-white font-bold font-[family-name:var(--font-jetbrains)]">PREMIUM SMART</span>
                      </div>
                      <p className="text-xs text-zinc-500 leading-relaxed font-mono">Value optimization. Evaluates current Live ELO against total payload cost to find the mathematically optimal model.</p>
                   </button>
                </div>
              </div>
            </>
          )}

          {routingState !== 'idle' && (
             <div className="bg-black border border-zinc-800 rounded-xl p-6 font-mono text-sm leading-relaxed overflow-hidden">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-zinc-800/50">
                   <Activity className="text-emerald-500 w-5 h-5 animate-pulse" />
                   <div>
                     <p className="text-emerald-400 font-bold tracking-widest text-xs uppercase mb-1">
                       {routingState === 'routing' ? 'Evaluating Capability Matrices...' : 'Telemetry Locked'}
                     </p>
                     {selectedModel && (
                       <p className="text-zinc-400 text-xs">
                         Active Vector: <span className="text-white bg-zinc-900 px-2 py-0.5 rounded border border-zinc-700">{selectedModel}</span>
                       </p>
                     )}
                   </div>
                </div>

                <div className="text-zinc-300 whitespace-pre-wrap">
                  {completion}
                  {(routingState === 'generating' || routingState === 'routing') && (
                    <span className="inline-block w-2 h-4 bg-emerald-500 ml-1 animate-pulse" />
                  )}
                  {error && (
                    <div className="text-red-400 mt-4 p-4 bg-red-950/20 border border-red-900/50 rounded-lg">
                       [SYS_ERR] {error.message}
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>
             </div>
          )}

        </div>
      </div>
    </div>
  );
}
