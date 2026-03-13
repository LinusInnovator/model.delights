import ValidatorFeature from '@/components/ValidatorFeature';
import Link from 'next/link';

export const metadata = {
    title: 'Validator | model.delights.pro',
    description: 'The autonomous Startup Validator.',
};

export default function ValidatePage() {
    return (
        <div className="flex flex-col min-h-screen">
            <ValidatorFeature />
            
            <div className="w-full bg-black border-t border-zinc-900 py-24">
                <div className="max-w-5xl mx-auto px-6">
                    <h3 className="text-zinc-500 font-bold uppercase tracking-widest text-xs mb-6 px-4">Popular Industries</h3>
                    <div className="flex flex-wrap gap-4 px-4">
                        <Link href="/validate/b2b-saas-validation" className="px-4 py-2 rounded-full border border-zinc-800 bg-zinc-950 text-zinc-400 text-sm hover:text-white hover:border-zinc-500 transition-colors">B2B SaaS</Link>
                        <Link href="/validate/consumer-social-ideas" className="px-4 py-2 rounded-full border border-zinc-800 bg-zinc-950 text-zinc-400 text-sm hover:text-white hover:border-zinc-500 transition-colors">Consumer Social</Link>
                        <Link href="/validate/marketplaces-startup-ideas" className="px-4 py-2 rounded-full border border-zinc-800 bg-zinc-950 text-zinc-400 text-sm hover:text-white hover:border-zinc-500 transition-colors">Marketplaces</Link>
                        <Link href="/validate/hardware-healthcare-validation" className="px-4 py-2 rounded-full border border-zinc-800 bg-zinc-950 text-zinc-400 text-sm hover:text-white hover:border-zinc-500 transition-colors">Hardware & Healthcare</Link>
                        <Link href="/validate/developer-tools-startup-ideas" className="px-4 py-2 rounded-full border border-zinc-800 bg-zinc-950 text-zinc-400 text-sm hover:text-white hover:border-zinc-500 transition-colors">Developer Tools</Link>
                    </div>
                    
                    <div className="mt-8 px-4">
                        <Link href="/validate/industries" className="inline-flex items-center text-sm font-medium text-cyan-500 hover:text-cyan-400 transition-colors">
                            Explore all 49 Startup Validation Niches →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
