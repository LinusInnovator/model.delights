import React, { useState, useEffect } from 'react';
import { Terminal } from 'lucide-react';

interface TerminalSizzleProps {
    isComplete: boolean;
}

const TERMINAL_LINES = [
    { text: "> Initializes AST Engine v4.2.0...", delay: 100 },
    { text: "[sys] Connecting to model.delights.pro architectural core...", delay: 300 },
    { text: "✓ Secured 0ms routing channel", delay: 200, color: "text-emerald-400" },
    { text: "> Parsing natural language intent graph...", delay: 400 },
    { text: "[graph] Identified 4 core semantic nodes", delay: 200, color: "text-zinc-400" },
    { text: "✓ Cross-referencing ELO scores across 94 global models", delay: 500, color: "text-emerald-400" },
    { text: "> Cloning Golden Boilerplate repository space...", delay: 600 },
    { text: "[fs] Unpacking Next.js 14 App Router (baseline)", delay: 300, color: "text-zinc-400" },
    { text: "[fs] Unpacking Tailwind CSS configured theme", delay: 100, color: "text-zinc-400" },
    { text: "[fs] Unpacking Vercel AI SDK ^3.1.0", delay: 100, color: "text-zinc-400" },
    { text: "> Injecting Architecture via AST (Abstract Syntax Tree)...", delay: 500 },
    { text: "[ast] Mutating `src/app/api/chat/route.ts`...", delay: 200, color: "text-purple-400" },
    { text: "✓ Hardwiring target provider API keys", delay: 300, color: "text-emerald-400" },
    { text: "[ast] Injecting Edge Middleware for Latency Optimization...", delay: 300, color: "text-purple-400" },
    { text: "✓ Constructing deterministic fallback matrix", delay: 400, color: "text-emerald-400" },
    { text: "> Compiling `.env.local` securely...", delay: 400 },
    { text: "[sys] Pre-populating instructional README.md", delay: 200, color: "text-zinc-400" },
    { text: "✓ Running strict TypeScript validation checks", delay: 500, color: "text-emerald-400" },
    { text: "> Archiving executable payload...", delay: 600 },
    { text: "[zip] Compressing 28 directories, 114 files", delay: 300, color: "text-zinc-400" },
    { text: "✓ Final Architecture locked and verified.", delay: 400, color: "text-cyan-400 font-bold" }
];

export default function TerminalSizzle({ isComplete }: TerminalSizzleProps) {
    const [visibleLines, setVisibleLines] = useState<number>(0);
    const [isBlinking, setIsBlinking] = useState(true);

    useEffect(() => {
        if (isComplete) {
            setVisibleLines(TERMINAL_LINES.length);
            return;
        }

        let currentLine = 0;
        let timeoutId: NodeJS.Timeout;

        const processNextLine = () => {
            if (currentLine < TERMINAL_LINES.length) {
                setVisibleLines(currentLine + 1);
                timeoutId = setTimeout(() => {
                    currentLine++;
                    processNextLine();
                }, TERMINAL_LINES[currentLine].delay);
            }
        };

        // Start processing after a small initial delay
        timeoutId = setTimeout(processNextLine, 500);

        return () => clearTimeout(timeoutId);
    }, [isComplete]);

    // Blinking cursor effect
    useEffect(() => {
        const interval = setInterval(() => setIsBlinking(b => !b), 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full max-w-3xl mt-6 p-1 bg-gradient-to-br from-zinc-800 to-black rounded-lg shadow-[0_0_30px_rgba(0,0,0,0.8)] relative overflow-hidden group">
            {/* Top Bar */}
            <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border-b border-white/10 rounded-t-md">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                </div>
                <div className="mx-auto flex items-center gap-2 text-zinc-500 text-xs font-mono">
                    <Terminal size={12} />
                    <span>cto-factory-compiler ~ bash</span>
                </div>
            </div>

            {/* Terminal Body */}
            <div className="p-4 bg-black/90 min-h-[250px] max-h-[350px] overflow-y-auto font-mono text-sm sm:text-base leading-relaxed text-left flex flex-col justify-start relative scrollbar-thin scrollbar-thumb-zinc-700">
                <div className="space-y-1">
                    {TERMINAL_LINES.slice(0, visibleLines).map((line, idx) => (
                        <div key={idx} className={`animate-fade-in-up ${line.color || 'text-zinc-200'}`}>
                            {line.text}
                        </div>
                    ))}
                    {!isComplete && visibleLines < TERMINAL_LINES.length && (
                        <div className="text-zinc-400 mt-1">
                            <span className={isBlinking ? 'opacity-100' : 'opacity-0'}>█</span>
                        </div>
                    )}
                </div>
            </div>
            {/* Glass reflection */}
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded-t-lg"></div>
        </div>
    );
}
