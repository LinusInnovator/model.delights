"use client";

import React, { useState, useEffect } from "react";
import { ManifestoArticle, ToneLevel, ContentBlock, MarginNote } from "@/types/manifesto";
import { Sun, Moon, ArrowRight, ArrowLeft, Sparkle } from "@phosphor-icons/react";
import Link from "next/link";
import Image from "next/image";
import { useCompletion } from "@ai-sdk/react";
import { getOptimalWriterModel } from "@/app/actions/getOptimalWriter";
import { motion, useScroll, useTransform } from "framer-motion";

interface ManifestoReaderProps {
  article: ManifestoArticle;
  allArticles: ManifestoArticle[];
}

export default function ManifestoReader({ article, allArticles }: ManifestoReaderProps) {
  const [sliderPos, setSliderPos] = useState(2);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activeNote, setActiveNote] = useState<string | null>(null);

  // Image Panning State
  const [heroPanPos, setHeroPanPos] = useState({ x: 50, y: 35 });

  // Parallax Scroll State
  const { scrollY } = useScroll();
  const yOffset = useTransform(scrollY, [0, 1000], [0, 150]); // Parallax translateY array

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiStats, setAiStats] = useState<any>(null);

  const { completion, complete, isLoading: isStreaming } = useCompletion({
    api: '/api/rewrite',
    streamProtocol: 'text'
  });

  const getToneFromSlider = (pos: number): ToneLevel | 'ai' => {
    if (pos === 1) return 'simple';
    if (pos === 2) return 'professional';
    if (pos === 3) return 'academic';
    return 'ai';
  };

  const currentTone = getToneFromSlider(sliderPos);

  // Smooth appearance on load
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleHeroMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setHeroPanPos({ x, y });
  };

  const handleHeroMouseLeave = () => {
    setHeroPanPos({ x: 50, y: 35 }); // Reset to a cinematic slight-top focus
  };

  const handleSliderChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setSliderPos(val);

    if (val === 4 && !completion && !isStreaming && !isAiLoading) {
      setIsAiLoading(true);
      try {
        const stats = await getOptimalWriterModel();
        setAiStats(stats);
        
        // Map the full professional text to rewrite (excluding callouts to preserve them)
        const fullText = article.blocks
          .filter(b => b.type !== 'callout')
          .map(b => {
             return Array.isArray(b.content.professional) ? b.content.professional.join(' ') : b.content.professional;
          }).join('\n\n');
        
        complete(fullText, { 
          body: { 
            model: stats.smartValue || stats.flagship,
            articleContext: `Article Title: ${article.title}\nArticle Theme: ${article.subtitle}`
          } 
        });
      } finally {
        setIsAiLoading(false);
      }
    }
  };

  if (!mounted) return null;

  const bgClass = theme === "dark" ? "bg-[#09090b] text-zinc-300" : "bg-[#fafafa] text-zinc-800";
  const headerClass = theme === "dark" ? "text-white" : "text-black";
  const controlPanelBg = theme === "dark" ? "bg-zinc-900/80 border-zinc-800" : "bg-white/80 border-zinc-200";
  const noteBg = theme === "dark" ? "bg-zinc-900/50 border-emerald-500/20" : "bg-emerald-50 border-emerald-500/20";
  const noteText = theme === "dark" ? "text-zinc-400" : "text-zinc-600";

  return (
    <div className={`min-h-screen w-full transition-colors duration-700 font-sans ${bgClass} pb-40`}>
      
      {/* Immersive Background Elements */}
      {theme === "dark" && (
        <>
          <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none -translate-y-1/2 translate-x-1/3 z-0" />
          <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-rose-500/5 rounded-full blur-[150px] pointer-events-none translate-y-1/2 -translate-x-1/3 z-0" />
          {/* Noise overlay */}
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

      {/* Floating Control Panel */}
      <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl px-6 py-4 rounded-full backdrop-blur-xl border shadow-xl transition-all duration-500 flex items-center justify-between gap-6 ${controlPanelBg}`}>
        
        {/* Theme Toggle */}
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex items-center gap-2 text-sm font-medium opacity-70 hover:opacity-100 transition-opacity"
        >
          {theme === 'dark' ? (
            <><Sun weight="bold" className="w-4 h-4" /> Light</>
          ) : (
            <><Moon weight="bold" className="w-4 h-4" /> Dark</>
          )}
        </button>

        {/* Tone Slider */}
        <div className="flex-1 flex flex-col items-center gap-1">
          <div className="flex justify-between w-full text-[10px] uppercase font-bold tracking-widest opacity-50 px-2 lg:px-4 mb-1">
            <button onClick={() => setSliderPos(1)} className={`flex-1 text-left hover:text-emerald-500 transition-colors ${sliderPos === 1 ? 'text-emerald-500 opacity-100' : ''}`}>In Short</button>
            <button onClick={() => setSliderPos(2)} className={`flex-1 text-center hover:text-emerald-500 transition-colors ${sliderPos === 2 ? 'text-emerald-500 opacity-100' : ''}`}>Consultant</button>
            <button onClick={() => setSliderPos(3)} className={`flex-1 text-center hover:text-emerald-500 transition-colors ${sliderPos === 3 ? 'text-emerald-500 opacity-100' : ''}`}>Academic</button>
            <button 
              onClick={() => handleSliderChange({target: {value: '4'}} as React.ChangeEvent<HTMLInputElement>)} 
              className={`flex-1 text-right flex justify-end items-center gap-1 hover:text-emerald-500 transition-colors ${sliderPos === 4 ? 'text-emerald-500 opacity-100' : ''}`}
            >
              <Sparkle weight="fill" className="w-3 h-3"/> Model SDK
            </button>
          </div>
          <input 
            type="range" 
            min="1" 
            max="4" 
            step="1" 
            value={sliderPos} 
            onChange={handleSliderChange}
            className={`w-full h-1 bg-zinc-700/50 rounded-lg appearance-none cursor-pointer accent-emerald-500`}
          />
        </div>

      </div>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-40 md:pt-48 flex gap-12">
        
        {/* Left/Center: Article Text */}
        <article className="flex-1 max-w-2xl mx-auto md:mx-0">
          
          <header className="mb-16 animate-fade-in-up">
            <p className="text-emerald-500 font-mono text-sm mb-4 tracking-wider">
              PUBLISHED {article.date} • {article.readTimeMin} MIN READ
            </p>
            {(() => {
              const rawTitle = currentTone === 'ai' ? article.title['professional'] : article.title[currentTone as ToneLevel];
              const parts = rawTitle.split(': ');
              const partStr = parts.length > 1 ? parts[0] + ':' : '';
              const mainTitle = parts.length > 1 ? parts.slice(1).join(': ') : rawTitle;

              return (
                <>
                  {partStr && (
                    <span className="block text-emerald-500 font-mono text-xs md:text-sm tracking-widest font-bold uppercase mb-2">
                      {partStr}
                    </span>
                  )}
                  <h1 className={`text-4xl md:text-5xl lg:text-6xl font-[family-name:var(--font-playfair)] font-bold italic leading-tight tracking-tight mb-6 transition-all duration-700 ${headerClass} flex flex-wrap items-center gap-4`}>
                    <span>{mainTitle}</span>
                    {currentTone === 'ai' && (
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-base md:text-lg font-sans not-italic font-medium border border-emerald-500/20 shadow-sm align-middle mt-2 md:mt-0">
                        <Sparkle weight="fill" className="w-4 h-4" /> Model SDK Cut
                      </span>
                    )}
                  </h1>
                </>
              );
            })()}
            <h2 className="text-xl md:text-2xl opacity-70 leading-relaxed font-light transition-all duration-700">
              {currentTone === 'ai' ? "Dynamically rewritten using the SDK's Best-in-Class reasoning model." : article.subtitle[currentTone as ToneLevel]}
            </h2>
          </header>

          {/* Hero Image */}
          {article.heroImage && (
            <div 
              className={`mb-16 relative w-full aspect-[21/9] rounded-3xl overflow-hidden border shadow-2xl transition-all duration-700 animate-fade-in group cursor-crosshair ${theme === 'dark' ? 'border-zinc-800' : 'border-zinc-200'}`}
              onMouseMove={handleHeroMouseMove}
              onMouseLeave={handleHeroMouseLeave}
            >
              <motion.div 
                style={{ y: yOffset }} 
                className="absolute top-[-40%] bottom-[-40%] left-[-10%] right-[-10%] transition-transform duration-700 ease-out group-hover:scale-[1.03] z-0"
              >
                <Image 
                  src={article.heroImage.url} 
                  alt={article.heroImage.alt} 
                  fill 
                  style={{
                    objectPosition: `${heroPanPos.x}% ${heroPanPos.y}%`,
                    transition: "object-position 0.15s ease-out"
                  }}
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 800px"
                />
              </motion.div>
              {/* Vignette Overlay for cinematic bleed */}
              {theme === "dark" && (
                <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent opacity-80 pointer-events-none z-10 transition-opacity duration-700 group-hover:opacity-60" />
              )}
            </div>
          )}

          <div className="space-y-8 md:space-y-10 min-h-[500px]">
            {currentTone === 'ai' ? (
              <div className="animate-fade-in">
                {isAiLoading && (
                  <div className="flex flex-col items-center justify-center py-20 opacity-50">
                    <Sparkle size={32} className="animate-pulse text-emerald-500 mb-4" />
                    <p className="font-mono text-xs tracking-widest uppercase">Querying Model SDK for Best Reasoning Model...</p>
                  </div>
                )}
                
                {aiStats && (
                  <div className={`mb-10 p-4 rounded-xl border flex items-center justify-between font-mono text-xs ${theme === 'dark' ? 'bg-zinc-900 border-emerald-500/30' : 'bg-emerald-50 border-emerald-500/30'}`}>
                    <div className="flex items-center gap-3 text-emerald-500">
                      <Sparkle weight="fill" />
                      <span>Live Rewriting Engine</span>
                    </div>
                    <div className="flex flex-col items-end gap-1 opacity-70">
                      <span>Model: {aiStats.smartValue || aiStats.flagship}</span>
                      {aiStats.tradeoff && <span>Value: {aiStats.tradeoff}</span>}
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  {completion.split('\n\n').map((paragraph: string, i: number) => {
                    const isLast = i === completion.split('\n\n').length - 1;
                    return (
                      <p key={i} className="text-lg md:text-xl leading-relaxed animate-fade-in-up transition-all prose-a:text-emerald-500 prose-a:underline hover:prose-a:text-emerald-400">
                        <span dangerouslySetInnerHTML={{ __html: paragraph }} />
                        {isLast && isStreaming && (
                           <span className="inline-block w-2 h-4 bg-emerald-500 animate-pulse ml-2 -mb-1" />
                        )}
                      </p>
                    );
                  })}
                  
                  {/* Append native callouts that shouldn't be rewritten */}
                  {!isStreaming && completion && article.blocks.filter(b => b.type === 'callout').map((block) => {
                    const calloutContent = Array.isArray(block.content.professional) 
                      ? block.content.professional.join("\n") 
                      : block.content.professional;
                    return (
                      <div key={`native-${block.id}`} className={`my-10 p-6 md:p-8 rounded-2xl ${noteBg} transition-all duration-500 animate-fade-in-up`}>
                        <p className={`text-lg font-medium leading-relaxed ${headerClass} prose-a:text-emerald-500 prose-a:underline hover:prose-a:text-emerald-400`} dangerouslySetInnerHTML={{ __html: calloutContent }} />
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              // Normal Document Blocks
              article.blocks.map((block) => {
                
                const hasNote = !!block.marginNoteId;
                const handleMouseEnter = () => hasNote && setActiveNote(block.marginNoteId!);
                const handleMouseLeave = () => setActiveNote(null);

                const textContent = Array.isArray(block.content[currentTone as ToneLevel]) 
                  ? (block.content[currentTone as ToneLevel] as string[]).join("\n") 
                  : block.content[currentTone as ToneLevel] as string;

                if (block.type === 'h2') {
                  return <h2 key={block.id} className={`text-3xl font-bold mt-16 mb-6 transition-all duration-500 ${headerClass}`} dangerouslySetInnerHTML={{ __html: textContent }} />;
                }
                if (block.type === 'h3') {
                  return <h3 key={block.id} className={`text-2xl font-bold mt-10 mb-4 transition-all duration-500 ${headerClass}`} dangerouslySetInnerHTML={{ __html: textContent }} />;
                }
                if (block.type === 'quote') {
                  return (
                    <blockquote key={block.id} className="pl-6 border-l-4 border-emerald-500 my-10 italic text-2xl font-[family-name:var(--font-playfair)] opacity-90 transition-all duration-500" dangerouslySetInnerHTML={{ __html: `"${textContent}"` }} />
                  );
                }
                if (block.type === 'callout') {
                  return (
                    <div key={block.id} className={`my-10 p-6 md:p-8 rounded-2xl ${noteBg} transition-all duration-500`}>
                      <p className={`text-lg font-medium leading-relaxed ${headerClass} prose-a:text-emerald-500 prose-a:underline hover:prose-a:text-emerald-400`} dangerouslySetInnerHTML={{ __html: textContent }} />
                    </div>
                  );
                }

                return (
                  <div 
                    key={block.id} 
                    className="relative group isolate"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <p 
                      className={`text-lg md:text-xl leading-relaxed transition-all duration-500 prose-a:text-emerald-500 prose-a:underline hover:prose-a:text-emerald-400 ${hasNote ? 'cursor-pointer' : ''}`}
                      dangerouslySetInnerHTML={{ __html: textContent }}
                    />
                    
                    {hasNote && (
                      <span className="absolute -left-6 top-2 w-2 h-2 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block" />
                    )}
                    {hasNote && theme === 'dark' && (
                       <div className="absolute inset-[-10px] bg-emerald-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10 blur-sm pointer-events-none" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Article Pagination Grid */}
          <div className={`mt-32 pt-16 border-t flex flex-col md:flex-row gap-6 ${theme === 'dark' ? 'border-zinc-800' : 'border-zinc-200'}`}>
            {(() => {
              const currentIndex = allArticles.findIndex(a => a.slug === article.slug);
              const prevArticle = currentIndex > 0 ? allArticles[currentIndex - 1] : null;
              const nextArticle = currentIndex < allArticles.length - 1 ? allArticles[currentIndex + 1] : null;

              return (
                <>
                  {prevArticle && (
                    <Link href={`/manifesto?article=${prevArticle.slug}`} scroll={true} className={`flex-1 group flex flex-col p-8 rounded-2xl border transition-all duration-500 ${theme === 'dark' ? 'border-zinc-800 hover:border-emerald-500 hover:bg-zinc-900/50' : 'border-zinc-200 hover:border-emerald-500 hover:bg-zinc-50'}`}>
                      <div className="flex items-center gap-3 text-emerald-500 mb-4 font-mono text-xs tracking-widest uppercase">
                        <ArrowLeft weight="bold" /> Previous Part
                      </div>
                      <h4 className={`text-xl font-bold font-[family-name:var(--font-playfair)] mb-2 ${headerClass}`}>
                        {currentTone === 'ai' ? prevArticle.title['professional'] : prevArticle.title[currentTone as ToneLevel]}
                      </h4>
                    </Link>
                  )}
                  {nextArticle && (
                    <Link href={`/manifesto?article=${nextArticle.slug}`} scroll={true} className={`flex-1 group flex flex-col p-8 rounded-2xl border transition-all duration-500 ${theme === 'dark' ? 'border-zinc-800 hover:border-emerald-500 hover:bg-zinc-900/50' : 'border-zinc-200 hover:border-emerald-500 hover:bg-zinc-50'} text-right items-end`}>
                      <div className="flex items-center gap-3 text-emerald-500 mb-4 font-mono text-xs tracking-widest uppercase">
                        Next Part <ArrowRight weight="bold" />
                      </div>
                      <h4 className={`text-xl font-bold font-[family-name:var(--font-playfair)] mb-2 ${headerClass}`}>
                      {currentTone === 'ai' ? nextArticle.title['professional'] : nextArticle.title[currentTone as ToneLevel]}
                      </h4>
                    </Link>
                  )}
                </>
              );
            })()}
          </div>

        </article>

        {/* Right: Margin Notes (Desktop Only) */}
        <aside className="hidden lg:block w-72 relative">
          <div className="sticky top-48 h-[calc(100vh-12rem)] flex flex-col">
            <h3 className="font-mono text-xs tracking-widest text-emerald-500 mb-8 border-b border-emerald-500/20 pb-4">
              MARGIN NOTES
            </h3>
            
            <div className="space-y-4 flex-1 overflow-y-auto pr-2 pb-10">
              {Object.values(article.marginNotes).map((note) => {
                const isActive = activeNote === note.id;
                return (
                  <div 
                    key={note.id}
                    className={`p-5 rounded-xl border transition-all duration-500 ${isActive ? 'scale-105 shadow-xl border-emerald-500 ' + noteBg : 'opacity-40 border-transparent hover:opacity-100'}`}
                  >
                    <p className={`text-sm leading-relaxed ${noteText}`}>{note.content}</p>
                    {note.authorTitle && (
                      <p className="mt-3 text-xs font-mono uppercase tracking-widest opacity-50">
                        — {note.authorTitle}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
            
            {!activeNote && (
              <p className="mt-auto pt-4 text-xs font-mono opacity-30 italic">
                Hover over paragraphs to reveal context notes.
              </p>
            )}
          </div>
        </aside>

      </main>
    </div>
  );
}
