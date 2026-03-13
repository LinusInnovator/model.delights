import fs from 'fs/promises';
import path from 'path';
import { notFound } from 'next/navigation';
import ValidatorFeature from '@/components/ValidatorFeature';
import Link from 'next/link';
import { Metadata } from 'next';

export async function generateStaticParams() {
  const contentDir = path.join(process.cwd(), 'src/content/validate-seo');
  try {
    const files = await fs.readdir(contentDir);
    return files.map(file => ({
      industry: file.replace('.json', '')
    }));
  } catch (e) {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ industry: string }> }): Promise<Metadata> {
    const { industry } = await params;
    const data = await getIndustryData(industry);
    if (!data) return {};
    return {
        title: `${data.title} | Model Delights`,
        description: data.executiveBLUF.substring(0, 160),
    };
}

async function getIndustryData(slug: string) {
    const filePath = path.join(process.cwd(), 'src/content/validate-seo', `${slug}.json`);
    try {
        const file = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(file);
    } catch (e) {
        return null;
    }
}

export default async function IndustryValidationPage({ params }: { params: Promise<{ industry: string }> }) {
    const { industry } = await params;
    const data = await getIndustryData(industry);

    if (!data) {
        notFound();
    }

    return (
        <div className="w-full bg-black text-white font-sans">
            <main className="w-full max-w-5xl mx-auto px-6 py-12 md:py-24 flex flex-col items-center text-center">
                <div className="mb-12">
                    <Link href="/validate" className="text-zinc-500 hover:text-white transition-colors text-xs uppercase tracking-widest font-bold border border-zinc-800 rounded-full px-4 py-2 hover:bg-zinc-900">
                        &larr; Back to Validator
                    </Link>
                </div>
                
                <h1 className="text-4xl md:text-6xl font-black mb-8 text-white leading-tight max-w-3xl">
                    {data.title}
                </h1>
                
                {/* AIEO Executive BLUF */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 md:p-12 text-left mb-16 shadow-2xl relative overflow-hidden w-full max-w-4xl">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500"></div>
                    <h2 className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-4">Executive Summary (BLUF)</h2>
                    <p className="text-zinc-300 leading-relaxed text-lg md:text-xl">
                        {data.executiveBLUF}
                    </p>
                    <div className="mt-8 pt-8 border-t border-zinc-900">
                        <h2 className="text-xs uppercase tracking-widest text-rose-500 font-bold mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-rose-500"></span> Core Tension Risk
                        </h2>
                        <p className="text-white font-medium text-lg leading-relaxed">&quot;{data.coreTension}&quot;</p>
                    </div>
                </div>

                {/* Structured Data Tables for AIEO */}
                <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 mb-24">
                    <div className="text-left bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
                        <div className="p-5 bg-[#2a1318] border-b border-rose-900/30 text-rose-400 font-bold text-sm tracking-widest uppercase flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            Primary Failure Patterns
                        </div>
                        <table className="w-full">
                            <tbody>
                                { }
                                {data.failureRatesTable.map((row: any /* eslint-disable-line @typescript-eslint/no-explicit-any */, i: number) => (
                                    <tr key={i} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-900 transition-colors">
                                        <td className="p-5 text-sm text-zinc-300 font-medium">{row.reason}</td>
                                        <td className="p-5 text-sm font-mono text-rose-400 text-right whitespace-nowrap">{row.percentage}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="text-left bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
                        <div className="p-5 bg-[#132a1f] border-b border-emerald-900/30 text-emerald-400 font-bold text-sm tracking-widest uppercase flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Median Acquisition Costs
                        </div>
                        <table className="w-full">
                            <tbody>
                                { }
                                {data.acquisitionCostsTable.map((row: any /* eslint-disable-line @typescript-eslint/no-explicit-any */, i: number) => (
                                    <tr key={i} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-900 transition-colors">
                                        <td className="p-5 text-sm text-zinc-300 font-medium">{row.channel}</td>
                                        <td className="p-5 text-sm font-mono text-emerald-400 text-right whitespace-nowrap">{row.estimated_cac}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="w-full max-w-4xl text-center mb-12">
                    <h2 className="text-3xl font-black mb-4 flex justify-center items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 256 256"><path d="M208.49,120.49a12,12,0,0,1-17,0L140,69V216a12,12,0,0,1-24,0V69L64.49,120.49a12,12,0,0,1-17-17l72-72a12,12,0,0,1,17,0l72,72A12,12,0,0,1,208.49,120.49Z"></path></svg>
                        </span>
                        Run the Triangulation Engine
                    </h2>
                    <p className="text-zinc-400 text-lg">We&apos;ve pre-filled the engine with a strong {data.industry} hypothesis. Edit it or run it immediately to see the Autopsy results.</p>
                </div>
            </main>
            
            {/* Embedded interactive engine, full bleed container to match original design constraints */}
            <div className="w-full bg-black -mt-12 pb-24">
                <ValidatorFeature initialIdea={data.suggestedIdeaToValidate} />
            </div>
            
            <footer className="w-full border-t border-white/5 py-12 mt-auto text-center">
                 <Link href="/architect" className="text-zinc-500 hover:text-white transition-colors text-sm font-medium">
                     Or skip directly to the Super Architect &rarr;
                 </Link>
            </footer>
        </div>
    );
}
