import fs from 'fs';
import path from 'path';
import Link from 'next/link';

export const metadata = {
    title: 'Startup Validation by Industry | Directory',
    description: 'Explore our complete directory of data-driven startup validation frameworks and architectural insights across 50+ business models.',
};

export default function IndustriesDirectoryPage() {
    let industries: { slug: string, title?: string }[] = [];
    try {
        const contentDir = path.join(process.cwd(), 'src/content/validate-seo');
        if (fs.existsSync(contentDir)) {
            const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.json'));
            industries = files.map(file => {
                const content = JSON.parse(fs.readFileSync(path.join(contentDir, file), 'utf-8'));
                return {
                    slug: file.replace('.json', ''),
                    title: content.title || file.replace('.json', '').replace(/-/g, ' ')
                };
            }).sort((a, b) => {
                // Alphabetical sort by title
                if (a.title && b.title) return a.title.localeCompare(b.title);
                return a.slug.localeCompare(b.slug);
            });
        }
    } catch (e) {
        console.error(e);
    }

    return (
        <div className="min-h-screen bg-black text-white px-6 py-24">
            <div className="max-w-4xl mx-auto">
                
                <Link href="/validate" className="inline-flex items-center text-xs font-mono uppercase tracking-widest text-zinc-500 hover:text-white mb-12 transition-colors">
                    ← Back to Validator
                </Link>

                <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                    Industry Validation Directory
                </h1>
                <p className="text-zinc-400 text-lg mb-16 max-w-2xl leading-relaxed">
                    Select a thesis below to explore structural heuristics, typical failure patterns, and predictable acquisition costs before you build your Minimum Viable Product.
                </p>

                {industries.length === 0 ? (
                    <div className="p-4 border border-zinc-800 rounded-lg text-zinc-500">
                        No SEO content generated yet. Please run the generation engine.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {industries.map((industry) => (
                            <Link 
                                key={industry.slug} 
                                href={`/validate/${industry.slug}`}
                                className="group block p-4 rounded-xl border border-zinc-900 bg-zinc-950 hover:bg-zinc-900 hover:border-zinc-700 transition-all"
                            >
                                <h3 className="text-white font-medium group-hover:text-cyan-400 transition-colors">
                                    {industry.title}
                                </h3>
                                <div className="text-xs text-zinc-500 mt-1 uppercase tracking-wider font-mono">
                                    /validate/{industry.slug}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
                
            </div>
        </div>
    );
}
