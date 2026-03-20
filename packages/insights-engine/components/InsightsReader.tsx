"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { ContentObject, IntentLevel, EvidenceBlock } from "../types";
import { Sun, Moon, ArrowRight, ArrowLeft, Sparkle, X, ChartBar, Info } from "@phosphor-icons/react";
import Link from "next/link";
import Image from "next/image";
import { useCompletion } from "@ai-sdk/react";
import { getOptimalWriterModel } from "@/app/actions/getOptimalWriter";
import { motion, useScroll, useTransform, useSpring, useMotionTemplate, AnimatePresence } from "framer-motion";
import AnimatedLogo from "@/components/AnimatedLogo";
import AnimatedTextLogo from "@/components/AnimatedTextLogo";

interface InsightsReaderProps {
  article: ContentObject;
  allArticles: ContentObject[];
}

export default function InsightsReader({ article, allArticles }: InsightsReaderProps) {
  const [sliderPos, setSliderPos] = useState(2);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isDataView, setIsDataView] = useState(false); // The pure "Fact-Matrix" view
  const [activeEvidence, setActiveEvidence] = useState<string | null>(null);
  const [isHeroFullscreen, setIsHeroFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isHeroFullscreen) {
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.documentElement.style.overflow = '';
    };
  }, [isHeroFullscreen]);

  const springConfig = { damping: 25, stiffness: 120, mass: 0.5 };
  const panX = useSpring(0, springConfig);
  const panY = useSpring(0, springConfig);
  const { scrollY } = useScroll();
  const yScrollOffset = useTransform(scrollY, [0, 800], ["0%", "-30%"]); 
  const parallaxX = useMotionTemplate`${panX}%`;
  const parallaxY = useMotionTemplate`calc(${panY}% + ${yScrollOffset})`;
  
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiStats, setAiStats] = useState<any>(null);

  const { completion, complete, isLoading: isStreaming } = useCompletion({
    api: '/api/rewrite',
    streamProtocol: 'text'
  });

  const currentIntent = useMemo(() => {
    if (sliderPos === 1) return 'beginner';
    if (sliderPos === 2) return 'technical';
    if (sliderPos === 3) return 'executive';
    return 'ai';
  }, [sliderPos]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const savedSlider = localStorage.getItem('insights_sliderPos');
    const savedTheme = localStorage.getItem('insights_theme');

    if (savedSlider) {
      const pos = parseInt(savedSlider, 10);
      setSliderPos(pos === 4 ? 2 : pos); 
    }
    if (savedTheme === 'dark' || savedTheme === 'light') setTheme(savedTheme);

    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) localStorage.setItem('insights_sliderPos', sliderPos.toString());
  }, [sliderPos, mounted]);

  useEffect(() => {
    if (mounted) localStorage.setItem('insights_theme', theme);
  }, [theme, mounted]);


  const handleHeroMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia("(hover: none)").matches) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (((e.clientX - rect.left) / rect.width) - 0.5) * -10;
    const yPct = (((e.clientY - rect.top) / rect.height) - 0.5) * -10;
    panX.set(xPct);
    panY.set(yPct);

    if (videoRef.current && videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
    }
  }, [panX, panY]);

  const handleHeroMouseLeave = useCallback(() => {
    if (window.matchMedia("(hover: none)").matches) return;
    panX.set(0);
    panY.set(0);

    if (videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
    }
  }, [panX, panY]);

  const handleSliderChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setSliderPos(val);
    setIsDataView(false); // Turn off data view if sliding

    if (val === 4 && !completion && !isStreaming && !isAiLoading) {
      setIsAiLoading(true);
      try {
        const stats = await getOptimalWriterModel();
        setAiStats(stats);
        
        const fullText = article.narrativeBlocks
          .filter(b => b.type !== 'callout')
          .map(b => {
             return Array.isArray(b.content.technical) ? b.content.technical.join(' ') : b.content.technical;
          }).join('\n\n');
        
        complete(fullText, { 
          body: { 
            model: stats.smartValue || stats.flagship,
            articleContext: `Article Title: ${article.title.technical}\nArticle Theme: ${article.topicEntity}`,
            copyTone: "truth"
          } 
        });
      } finally {
        setIsAiLoading(false);
      }
    }
  }, [completion, isStreaming, isAiLoading, article, complete]);

  const themeClasses = useMemo(() => ({
    bgClass: theme === "dark" ? "bg-[#09090b] text-zinc-300" : "bg-[#fafafa] text-zinc-800",
    headerClass: theme === "dark" ? "text-white" : "text-black",
    controlPanelGlass: theme === "dark" 
      ? "bg-zinc-900/40 backdrop-blur-3xl backdrop-saturate-150 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)]" 
      : "bg-white/40 backdrop-blur-3xl backdrop-saturate-150 border border-black/5 shadow-[0_8px_32px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.6)]",
    noteBg: theme === "dark" ? "bg-zinc-900/50 border-emerald-500/20" : "bg-emerald-50 border-emerald-500/20",
    noteText: theme === "dark" ? "text-zinc-400" : "text-zinc-600"
  }), [theme]);

  const { bgClass, headerClass, controlPanelGlass, noteBg, noteText } = themeClasses;

  if (!mounted) return null;

  const renderSettingsContent = (isMobile: boolean) => {
    const ThemeButton = () => (
      <button 
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className={`flex items-center gap-2 text-sm font-medium opacity-70 hover:opacity-100 transition-opacity ${!isMobile ? 'shrink-0' : ''}`}
      >
        {theme === 'dark' ? (
          <><Moon weight="bold" className="w-4 h-4" /> Dark Mode</>
        ) : (
          <><Sun weight="bold" className="w-4 h-4" /> Light Mode</>
        )}
      </button>
    );

    const DataViewButton = () => (
      <button 
        onClick={() => setIsDataView(!isDataView)}
        className={`flex items-center gap-2 text-sm font-medium transition-opacity ${isDataView ? 'opacity-100 text-emerald-500' : 'opacity-70 hover:opacity-100'} ${!isMobile ? 'shrink-0' : ''}`}
      >
        <ChartBar weight="bold" className="w-4 h-4" /> Just Facts
      </button>
    );

    return (
      <>
        {isMobile && (
          <div className="flex w-full justify-between pb-4 border-b border-zinc-500/20 items-center">
            <ThemeButton />
            <DataViewButton />
          </div>
        )}

        {!isMobile && <ThemeButton />}

      <div className={`flex-1 flex flex-col items-center gap-2 w-full ${isMobile ? 'pt-2' : ''} ${isDataView ? 'opacity-30 pointer-events-none transition-opacity' : ''}`}>
        <div className="flex justify-between w-full text-[10px] uppercase font-bold tracking-widest opacity-50 px-2 lg:px-4 mb-1">
          <button onClick={() => {setSliderPos(1); setIsMobileNavOpen(false)}} className={`flex-1 text-left flex justify-start items-center hover:text-emerald-500 transition-colors ${sliderPos === 1 ? 'text-emerald-500 opacity-100' : ''}`}>Beginner</button>
          <button onClick={() => {setSliderPos(2); setIsMobileNavOpen(false)}} className={`flex-1 text-center hover:text-emerald-500 transition-colors ${sliderPos === 2 ? 'text-emerald-500 opacity-100' : ''}`}>Tech</button>
          <button onClick={() => {setSliderPos(3); setIsMobileNavOpen(false)}} className={`flex-1 text-center hover:text-emerald-500 transition-colors ${sliderPos === 3 ? 'text-emerald-500 opacity-100' : ''}`}>Exec</button>
          <button 
            onClick={(e) => {handleSliderChange({target: {value: '4'}} as React.ChangeEvent<HTMLInputElement>); setIsMobileNavOpen(false)}} 
            className={`flex-1 text-right flex justify-end items-center gap-1 hover:text-emerald-500 transition-colors ${sliderPos === 4 ? 'text-emerald-500 opacity-100' : ''}`}
          >
            <Sparkle weight="fill" className="w-3 h-3"/> AI Rewrite
          </button>
        </div>
        <input 
          type="range" 
          min="1" 
          max="4" 
          step="1" 
          value={sliderPos} 
          onChange={handleSliderChange}
          className={`w-full h-1.5 bg-zinc-700/50 rounded-lg appearance-none cursor-pointer accent-emerald-500 shadow-inner`}
        />
      </div>
      
      {!isMobile && <DataViewButton />}

      {isMobile && (
        <button 
          onClick={() => setIsMobileNavOpen(false)}
          className="w-full py-3 mt-4 text-xs font-bold font-mono tracking-widest uppercase bg-zinc-500/10 hover:bg-zinc-500/20 transition-colors rounded-xl"
        >
          Close Settings
        </button>
      )}
    </>
  );
};

  return (
    <div className={`min-h-screen w-full transition-colors duration-700 font-sans ${bgClass} pb-40`}>
      
      {theme === "dark" && (
        <>
          <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none -translate-y-1/2 translate-x-1/3 z-0" />
          <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-rose-500/5 rounded-full blur-[150px] pointer-events-none translate-y-1/2 -translate-x-1/3 z-0" />
          <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.03] mix-blend-overlay">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full">
              <filter id="noiseFilterLayer">
                <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
              </filter>
              <rect width="100%" height="100%" filter="url(#noiseFilterLayer)" />
            </svg>
          </div>
        </>
      )}

      {/* Floating Control Panels */}
      <motion.div 
        className={`lg:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center gap-2 px-6 py-3 rounded-full cursor-pointer ${controlPanelGlass}`}
        onClick={() => setIsMobileNavOpen(true)}
        initial={false}
        animate={{ y: isMobileNavOpen ? 100 : 0, opacity: isMobileNavOpen ? 0 : 1, pointerEvents: isMobileNavOpen ? 'none' : 'auto' }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <span className="text-sm font-bold tracking-widest uppercase font-mono mt-0.5 flex items-center gap-2">
           {isDataView ? <><ChartBar weight="fill" className="text-emerald-500" /> Facts Only</> : (
            currentIntent === 'ai' ? <><Sparkle className="text-emerald-500"/> AI Rewrite</> 
            : currentIntent === 'beginner' ? 'Beginner' 
            : currentIntent === 'technical' ? 'Technical' 
            : 'Executive'
          )}
        </span>
      </motion.div>

      {isMobileNavOpen && (
         <div 
           className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
           onClick={() => setIsMobileNavOpen(false)}
         />
      )}
      
      <motion.div 
        className={`lg:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md px-6 py-5 rounded-3xl flex flex-col items-center justify-between gap-4 ${controlPanelGlass}`}
        initial={false}
        animate={{ 
          y: isMobileNavOpen ? 0 : 100,
          opacity: isMobileNavOpen ? 1 : 0,
          scale: isMobileNavOpen ? 1 : 0.95,
          pointerEvents: isMobileNavOpen ? 'auto' : 'none'
        }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        {renderSettingsContent(true)}
      </motion.div>

      <div 
        className={`hidden lg:flex fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl px-6 py-4 rounded-full items-center justify-between gap-6 ${controlPanelGlass}`}
      >
        {renderSettingsContent(false)}
      </div>

      <div className="absolute top-8 left-6 z-40">
        <Link href="/" className="flex items-center gap-2 group hover:opacity-80 transition-opacity">
          <AnimatedLogo className={`w-10 h-10 md:w-12 md:h-12 shrink-0 ${theme === 'light' ? 'invert' : ''}`} />
          <div className="flex flex-col justify-center">
            <AnimatedTextLogo className={`h-[26px] md:h-8 w-auto shrink-0 ${theme === 'light' ? 'invert' : ''}`} />
            <span className="text-[10px] md:text-[11px] font-mono tracking-widest text-emerald-500 mt-0.5 relative top-[-2px]">Insights Engine</span>
          </div>
        </Link>
      </div>

      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-32 md:pt-40 flex gap-12">
        <article className="flex-1 max-w-2xl mx-auto md:mx-0">
          
          <header className="mb-12 animate-fade-in-up">
            <div className="flex items-center gap-3 text-emerald-500 font-mono text-xs mb-4 tracking-wider flex-wrap">
              <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded">ENTITY: {article.topicEntity.toUpperCase()}</span>
              <span>VERIFIED: {article.lastVerifiedDate.toUpperCase()}</span>
              <span>{article.readTimeMin} MIN</span>
            </div>
            
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6 transition-all duration-700 ${headerClass} flex flex-wrap items-center gap-4`}>
              <span>{currentIntent === 'ai' ? article.title['technical'] : article.title[currentIntent as IntentLevel]}</span>
            </h1>
            
            <h2 className="text-xl md:text-2xl opacity-70 leading-relaxed font-light transition-all duration-700">
              {currentIntent === 'ai' 
                  ? "Dynamically rewritten by the Model Delights Snell SDK." 
                  : article.subtitle[currentIntent as IntentLevel]
              }
            </h2>
          </header>

          {/* Core Extractable Answer Box (Rankable target) */}
          <div className={`p-6 md:p-8 rounded-2xl border-2 border-emerald-500 mb-12 shadow-[0_0_30px_rgba(16,185,129,0.1)] bg-emerald-500/5`}>
             <h3 className="font-mono text-sm uppercase tracking-widest text-emerald-500 mb-2">Primary Answer</h3>
             <h4 className={`text-xl md:text-2xl font-bold mb-4 ${headerClass}`}>{article.primaryAnswer.question}</h4>
             <p className={`text-lg leading-relaxed ${theme === 'dark' ? 'text-emerald-100/90' : 'text-emerald-900/90'}`}>
                {article.primaryAnswer.summary}
             </p>
          </div>

          {isDataView ? (
            // Data View Mode (Just the facts)
            <div className="space-y-12 animate-fade-in-up">
                {article.extractableAssets.comparisonTable && (
                    <div className="overflow-x-auto rounded-xl border border-zinc-700">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    {article.extractableAssets.comparisonTable.columns.map((col, i) => (
                                        <th key={i} className={`p-4 font-mono text-sm uppercase tracking-widest bg-zinc-800/50 ${headerClass} border-b border-zinc-700`}>{col}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {article.extractableAssets.comparisonTable.rows.map((row, i) => (
                                    <tr key={i} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/20">
                                        {row.map((cell, j) => (
                                            <td key={j} className="p-4 py-6 border-r border-zinc-800/50 last:border-0">{cell}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                
                {article.extractableAssets.expertQuote && (
                    <blockquote className="pl-6 border-l-4 border-emerald-500 italic text-2xl opacity-90 leading-tight">
                        "{article.extractableAssets.expertQuote.text}"
                        <div className="mt-4 font-mono text-sm opacity-50 not-italic uppercase tracking-widest text-emerald-500">— {article.extractableAssets.expertQuote.author}</div>
                    </blockquote>
                )}

                <div className={`p-6 rounded-2xl ${noteBg}`}>
                    <h3 className="font-mono text-sm text-emerald-500 uppercase tracking-widest mb-4">Limitations & Exemptions</h3>
                    <ul className="list-disc pl-5 space-y-3">
                        {article.limitations.map((limit, i) => (
                            <li key={i} className="text-lg opacity-80">{limit}</li>
                        ))}
                    </ul>
                </div>
            </div>
          ) : (
            // Narrative View Mode (Beautiful prose + margin evidence)
            <>
              {article.heroImage && (
                <div 
                  className={`mb-16 relative w-full aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden border shadow-2xl transition-all duration-700 animate-fade-in group cursor-zoom-in ${theme === 'dark' ? 'border-zinc-800' : 'border-zinc-200'}`}
                  onMouseMove={handleHeroMouseMove}
                  onMouseLeave={handleHeroMouseLeave}
                  onClick={() => setIsHeroFullscreen(true)}
                >
                  <motion.div 
                    style={{ x: parallaxX, y: parallaxY }} 
                    className="absolute top-0 bottom-[-50%] left-[-5%] right-[-5%] z-0"
                  >
                    <Image 
                      src={article.heroImage.url} 
                      alt={article.heroImage.alt} 
                      fill 
                      style={{ objectFit: 'cover', objectPosition: 'top' }}
                      priority
                      sizes="(max-width: 768px) 150vw, 150vw"
                    />
                  </motion.div>
                </div>
              )}

              <div className="space-y-8 md:space-y-10 min-h-[500px]">
                {currentIntent === 'ai' ? (
                   <div className="animate-fade-in">
                      {isAiLoading && (
                        <div className="flex flex-col items-center justify-center py-20 opacity-50">
                          <Sparkle size={32} className="animate-pulse text-emerald-500 mb-4" />
                          <p className="font-mono text-xs tracking-widest uppercase">Executing Arbitrage via Snell SDK...</p>
                        </div>
                      )}
                      {completion.split('\n\n').map((paragraph: string, i: number) => {
                        const isLast = i === completion.split('\n\n').length - 1;
                        return (
                          <p key={i} className="text-lg md:text-xl leading-relaxed animate-fade-in-up transition-all prose-a:text-emerald-500 prose-a:underline">
                            <span dangerouslySetInnerHTML={{ __html: paragraph }} />
                            {isLast && isStreaming && ( <span className="inline-block w-2 h-4 bg-emerald-500 animate-pulse ml-2 -mb-1" /> )}
                          </p>
                        );
                      })}
                   </div>
                ) : (
                   article.narrativeBlocks.map((block) => {
                      const hasEvidence = !!block.evidenceId;
                      const evidenceData = hasEvidence ? article.evidenceLog[block.evidenceId as string] : null;

                      const handleMouseEnter = () => hasEvidence && setActiveEvidence(block.evidenceId!);
                      const handleMouseLeave = () => setActiveEvidence(null);
                      
                      const rawContent = block.content[currentIntent as IntentLevel] || block.content['technical'];
                      const textContent = Array.isArray(rawContent) ? rawContent.join("\n\n") : rawContent;
                      const paragraphs = textContent.split(/\n\s*\n/).filter(Boolean);

                      if (block.type === 'h2') {
                         return (
                           <div key={block.id} className="mt-16 mb-6">
                             <h2 className={`text-3xl font-bold transition-all duration-500 ${headerClass} leading-tight`} dangerouslySetInnerHTML={{ __html: paragraphs[0] }} />
                           </div>
                         );
                      }

                      return (
                        <div 
                          key={block.id} 
                          id={block.evidenceId ? `evidence-ref-${block.evidenceId}` : undefined}
                          className="relative group isolate"
                          onMouseEnter={handleMouseEnter}
                          onMouseLeave={handleMouseLeave}
                        >
                          <div className={`space-y-6 transition-all duration-500 ${hasEvidence ? 'cursor-pointer' : ''}`}>
                            {paragraphs.map((p: string, i: number) => (
                               <p key={i} className={`text-lg md:text-xl leading-relaxed md:leading-[1.8]`} dangerouslySetInnerHTML={{ __html: p }} />
                            ))}
                          </div>
                          
                          {hasEvidence && (
                            <span className={`absolute -left-[10px] md:-left-6 top-2 w-2 h-2 rounded-full transition-all duration-300 md:hidden lg:block
                                ${activeEvidence === block.evidenceId ? 'bg-emerald-500 opacity-100 scale-125' : 'bg-emerald-500/30 opacity-100 lg:opacity-0 lg:group-hover:opacity-100'}
                              `} 
                            />
                          )}
                          
                          {/* Inline mobile card for evidence */}
                          {hasEvidence && activeEvidence === block.evidenceId && evidenceData && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0, marginTop: 0 }}
                              animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                              className={`lg:hidden overflow-hidden rounded-xl border ${noteBg}`}
                            >
                               <div className="p-5">
                                  <div className="flex items-center gap-2 mb-2 text-emerald-500 text-xs font-mono uppercase tracking-widest">
                                      <Info weight="bold"/> Evidence: {evidenceData.type}
                                  </div>
                                  <p className={`text-sm leading-relaxed ${noteText}`}>{evidenceData.content}</p>
                                  <p className="mt-3 text-[10px] font-bold font-mono uppercase tracking-widest opacity-50">
                                    Source: {evidenceData.sourceLabel}
                                  </p>
                               </div>
                            </motion.div>
                          )}
                        </div>
                      );
                   })
                )}
              </div>
            </>
          )}

        </article>

        {/* Desktop Evidence Log (Margin Notes) */}
        {!isDataView && (
          <aside className="hidden lg:block w-72 relative">
            <div className="sticky top-48 h-[calc(100vh-12rem)] flex flex-col">
              <h3 className="font-mono text-xs tracking-widest text-emerald-500 mb-8 border-b border-emerald-500/20 pb-4 flex items-center gap-2">
                <Info weight="bold"/> EVIDENCE LOG
              </h3>
              
              <div className="space-y-4 flex-1 overflow-y-auto pr-2 pb-10">
                {Object.values(article.evidenceLog).map((evidence) => {
                  const isActive = activeEvidence === evidence.id;
                  return (
                    <div 
                      key={evidence.id}
                      onMouseEnter={() => setActiveEvidence(evidence.id)}
                      onMouseLeave={() => setActiveEvidence(null)}
                      className={`p-5 rounded-xl border transition-all duration-500 cursor-pointer ${isActive ? 'scale-105 shadow-xl border-emerald-500 ' + noteBg : 'opacity-40 border-transparent hover:opacity-100'}`}
                    >
                      <span className="inline-block px-2 py-0.5 mb-2 bg-emerald-500/10 text-emerald-500 text-[10px] font-mono uppercase tracking-widest rounded border border-emerald-500/20">
                          {evidence.type}
                      </span>
                      <p className={`text-sm leading-relaxed ${noteText}`}>{evidence.content}</p>
                      <p className="mt-3 text-[10px] font-mono uppercase tracking-widest opacity-50">
                        Src: {evidence.sourceLabel}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </aside>
        )}
      </main>

      <AnimatePresence>
        {isHeroFullscreen && article.heroImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 md:p-12"
            onClick={() => setIsHeroFullscreen(false)}
          >
            <div className={`absolute inset-0 backdrop-blur-2xl ${theme === 'dark' ? 'bg-black/90' : 'bg-white/95'}`} />
            <button
              onClick={() => setIsHeroFullscreen(false)}
              className={`absolute top-6 right-6 md:top-8 md:right-8 z-50 p-3 rounded-full transition-colors ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-black/5 hover:bg-black/10 text-black'}`}
            >
              <X weight="bold" className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300, delay: 0.1 }}
              className="relative w-full max-w-7xl flex-1 max-h-[80vh] rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 z-10"
              onClick={(e) => e.stopPropagation()} 
            >
              <Image 
                src={article.heroImage.url} 
                alt={article.heroImage.alt} 
                fill 
                style={{ objectFit: 'contain' }}
                priority
                sizes="100vw"
                className="select-none"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
