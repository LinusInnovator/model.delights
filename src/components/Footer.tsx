import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    const coreTools = [
        { name: 'Intelligence Directory', path: '/models' },
        { name: 'Pricing & Plans', path: '/pricing' },
        { name: 'Architecture Gallery', path: '/architect' },
        { name: 'VS Engine (Compare)', path: '/vs/openai__gpt-4o/anthropic__claude-fable-5.1' },
        { name: 'Enterprise API', path: '/enterprise' },
        { name: 'Live Changelog', path: '/changelog' },
        { name: 'Snell Gateway FAQ', path: '/pricing' },
        { name: 'Admin Dashboard', path: '/admin' },
    ];

    const ecosystemLinks = [
        { name: 'sell.delights.pro', url: 'https://sell.delights.pro' },
        { name: 'improve.delights.pro', url: 'https://improve.delights.pro' },
        { name: 'share.delights.pro', url: 'https://share.delights.pro' },
    ];

    return (
        <footer className="relative z-50 w-full bg-zinc-950/80 border-t border-white/5 backdrop-blur-md py-12 px-6 mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
                
                {/* Brand & Copyright */}
                <div className="flex flex-col gap-2">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <Image src="/logo.png" alt="Model Delights Logo" width={24} height={24} className="rounded-md" />
                        <span className="text-white font-bold tracking-tight text-lg">model.delights.pro</span>
                    </Link>
                    <p className="text-zinc-500 text-sm">
                        The intelligent LLM routing &amp; pricing engine.<br/>
                        &copy; {currentYear} All rights reserved.
                    </p>
                </div>

                {/* Core Tools Navigation */}
                <div className="flex flex-col gap-3">
                    <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-2">Core Platform</h4>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                        {coreTools.map((tool) => (
                            tool.path === '/admin' ? (
                                <a
                                    key={tool.path}
                                    href={tool.path}
                                    className="text-zinc-400 hover:text-cyan-400 text-sm transition-colors"
                                >
                                    {tool.name}
                                </a>
                            ) : (
                                <Link 
                                    key={tool.path} 
                                    href={tool.path}
                                    className="text-zinc-400 hover:text-cyan-400 text-sm transition-colors"
                                >
                                    {tool.name}
                                </Link>
                            )
                        ))}
                    </div>
                </div>

                {/* Categories Navigation (SEO Anchor) */}
                <div className="flex flex-col gap-3">
                    <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-2">Model Categories</h4>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                        {[
                            { name: 'Top Tier', path: '/categories/top-tier' },
                            { name: 'Coding & Logic', path: '/categories/coding-logic' },
                            { name: 'Vision', path: '/categories/vision' },
                            { name: 'Drafting', path: '/categories/drafting' },
                            { name: 'Roleplay', path: '/categories/roleplay' },
                            { name: 'Image Gen', path: '/categories/image-gen' }
                        ].map((cat) => (
                            <Link 
                                key={cat.path} 
                                href={cat.path}
                                className="text-zinc-400 hover:text-cyan-400 text-sm transition-colors cursor-pointer"
                            >
                                {cat.name}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* FinOps & Gateway Resources (SEO Anchor) */}
                <div className="flex flex-col gap-3">
                    <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-2">FinOps &amp; Gateway</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                        {[
                            { name: 'Predictable Pricing', path: '/pricing' },
                            { name: 'Agent-Safe Guarantee', path: '/pricing' },
                            { name: 'OpenAI Drop-In Proxy', path: '/pricing' },
                            { name: 'Prompt Cache Savings', path: '/pricing' },
                            { name: 'Machine Docs (llms.txt)', path: '/llms.txt' },
                            { name: 'Frontier ELO Matrix', path: '/models' }
                        ].map((cat) => (
                            <Link 
                                key={cat.name} 
                                href={cat.path}
                                className="text-zinc-400 hover:text-cyan-400 text-sm transition-colors cursor-pointer"
                            >
                                {cat.name}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Ecosystem Links */}
                <div className="flex flex-col gap-3">
                    <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-2">Delights Ecosystem</h4>
                    <div className="flex flex-col gap-2">
                        {ecosystemLinks.map((link) => (
                            <a 
                                key={link.name} 
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-zinc-400 hover:text-cyan-400 text-sm transition-colors flex items-center gap-2"
                            >
                                {link.name}
                                <span className="text-zinc-600 text-[10px]">↗</span>
                            </a>
                        ))}
                    </div>
                </div>

            </div>
        </footer>
    );
}
