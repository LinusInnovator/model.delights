import React from 'react';
import Link from 'next/link';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    const coreTools = [
        { name: 'Intelligence Directory', path: '/' },
        { name: 'The 10x Validator', path: '/validate' },
        { name: 'Architecture Gallery', path: '/architect' },
        { name: 'VS Engine (Compare)', path: '/vs/openai/gpt-4o/anthropic/claude-3-5-sonnet' },
        { name: 'Enterprise API', path: '/enterprise' },
        { name: 'Admin Dashboard', path: '/admin' },
    ];

    const ecosystemLinks = [
        { name: 'sell.delights.pro', url: 'https://sell.delights.pro' },
        { name: 'improve.delights.pro', url: 'https://improve.delights.pro' },
        { name: 'share.delights.pro', url: 'https://share.delights.pro' },
    ];

    return (
        <footer className="w-full bg-zinc-950/80 border-t border-white/5 backdrop-blur-md py-12 px-6 mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
                
                {/* Brand & Copyright */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-cyan-500 rounded-sm opacity-80" />
                        <span className="text-white font-bold tracking-tight text-lg">model.delights.pro</span>
                    </div>
                    <p className="text-zinc-500 text-sm">
                        Delights.pro is a DreamValidator brand. <br/>
                        &copy; {currentYear} All rights reserved.
                    </p>
                </div>

                {/* Core Tools Navigation */}
                <div className="flex flex-col gap-3">
                    <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-2">Core Tools</h4>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                        {coreTools.map((tool) => (
                            <Link 
                                key={tool.path} 
                                href={tool.path}
                                className="text-zinc-400 hover:text-cyan-400 text-sm transition-colors"
                            >
                                {tool.name}
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
