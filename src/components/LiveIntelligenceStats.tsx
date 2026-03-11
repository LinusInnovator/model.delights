"use client";

import React, { useState, useEffect } from 'react';

const STATS = [
    "synthesizing 14,204 models",
    "benchmarking $0.002/1M metrics",
    "enforcing 1250+ ELO routines",
    "weights updated 14ms ago"
];

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*+><";

export default function LiveIntelligenceStats() {
    const [displayText, setDisplayText] = useState(STATS[0]);
    const [statIndex, setStatIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            const nextIndex = (statIndex + 1) % STATS.length;
            const targetText = STATS[nextIndex];
            setStatIndex(nextIndex);

            // Scramble animation
            let iteration = 0;
            const maxIterations = 15;

            const scrambleInterval = setInterval(() => {
                setDisplayText(() => {
                    return targetText.split("").map((char, index) => {
                        // Reveal correct characters incrementally
                        if (index < (iteration / maxIterations) * targetText.length) {
                            return targetText[index];
                        }
                        // Keep spaces as spaces to prevent shifting lengths too wildly
                        return char === " " ? " " : CHARS[Math.floor(Math.random() * CHARS.length)];
                    }).join("");
                });

                if (iteration >= maxIterations) {
                    clearInterval(scrambleInterval);
                    setDisplayText(targetText); // lock final
                }
                iteration++;
            }, 30);

        }, 3500); // transition every 3.5s

        return () => clearInterval(interval);
    }, [statIndex]);

    return (
        <span className="inline-flex items-center text-cyan-400 font-mono text-sm px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/30 shadow-[0_0_12px_rgba(0,229,255,0.1)] mx-1 relative top-[-2px] tracking-tight w-[285px] justify-start overflow-hidden whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse mr-2 shadow-[0_0_5px_rgba(0,229,255,0.8)] shrink-0"></span>
            [{displayText}]
        </span>
    );
}
