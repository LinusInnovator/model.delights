import React from 'react';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';

export const metadata = {
  title: 'Changelog | model.delights.pro',
  description: 'The autonomous development timeline of model.delights.pro.',
};

export default async function ChangelogPage() {
  let changelogGroups = [];
  
  try {
    const dataPath = path.join(process.cwd(), 'src/data/changelog.json');
    if (fs.existsSync(dataPath)) {
       const fileData = fs.readFileSync(dataPath, 'utf8');
       changelogGroups = JSON.parse(fileData);
    }
  } catch (err) {
    console.error('Failed to parse changelog.json in SSR', err);
  }

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'feat':
      case 'feature':
        return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      case 'fix':
      case 'bugfix':
        return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
      case 'core':
        return 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10';
      case 'style':
      case 'ui':
        return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      default:
        return 'text-zinc-400 border-zinc-700 bg-zinc-800/50';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-[family-name:var(--font-inter)] selection:bg-emerald-500/30 pb-32">
      
      {/* Navigation */}
      <nav className="w-full fixed top-0 z-50 px-6 md:px-12 py-6 flex justify-between items-center bg-black/80 backdrop-blur-md border-b border-zinc-900">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-emerald-500/50 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-zinc-400 group-hover:text-emerald-400 transition-colors">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </div>
          <span className="font-bold text-lg tracking-tight text-zinc-100 hidden sm:block">Back to Platform</span>
        </Link>
        <div className="font-mono text-xs text-zinc-500">
            AUTO_GENERATED_LOG
        </div>
      </nav>

      {/* Header */}
      <header className="pt-40 px-6 md:px-12 max-w-4xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono mb-6">
           <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
           VELOCITY_TRACKER
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 flex flex-col">
          Changelog
          <span className="text-zinc-500 font-serif italic text-3xl md:text-5xl font-light mt-2">v.1.x Architecture</span>
        </h1>
        <p className="text-xl text-zinc-400 max-w-2xl leading-relaxed">
          Powered by a single active Architect leveraging the Snell framework. Below is the raw, unedited git history pulled dynamically at build time, proving our 11-day to 2-day compounding velocity loop.
        </p>
      </header>

      {/* Timeline */}
      <main className="px-6 md:px-12 max-w-4xl mx-auto">
        {changelogGroups.length === 0 ? (
           <div className="p-8 border border-zinc-800 rounded-2xl bg-zinc-900/30 text-zinc-400 text-center font-mono text-sm">
             [SYS_WARN] No changelog data ingested. Requires deployment build step.
           </div>
        ) : (
          <div className="space-y-16 pl-4 md:pl-0 border-l border-zinc-800 md:border-none">
            {changelogGroups.map((group: any, idx: number) => (
              <div key={idx} className="relative md:grid md:grid-cols-4 md:gap-8 md:items-start group">
                
                {/* Date Marker (Desktop) */}
                <div className="hidden md:block sticky top-32 text-right">
                  <div className="font-mono text-sm text-zinc-500 mt-1">{group.date}</div>
                </div>

                {/* Timeline Axis (Desktop) */}
                <div className="hidden md:flex absolute left-[25%] -translate-x-[20px] top-0 bottom-0 w-px bg-zinc-800 flex-col items-center">
                   <div className="w-3 h-3 rounded-full bg-black border-2 border-zinc-700 mt-2 z-10 group-first:bg-emerald-500 group-first:border-emerald-500 group-first:shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                </div>

                {/* Date Marker (Mobile) */}
                <div className="md:hidden flex items-center gap-4 mb-6 -ml-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] z-10"></div>
                  <div className="font-mono text-sm text-zinc-400">{group.date}</div>
                </div>

                {/* Commits */}
                <div className="md:col-span-3 space-y-4">
                  {group.items.map((item: any, idy: number) => (
                    <div key={idy} className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-5 hover:border-zinc-700 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                         <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border ${getTypeColor(item.type)}`}>
                           {item.scope ? `${item.type}(${item.scope})` : item.type}
                         </span>
                         <span className="font-mono text-xs text-zinc-600 border border-zinc-800 bg-black px-1.5 rounded">{item.hash}</span>
                      </div>
                      <p className="text-zinc-300 leading-relaxed text-sm">
                        {item.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

    </div>
  );
}
