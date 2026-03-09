"use client";

import { useChat } from 'ai/react';
import { Send, Bot, User } from 'lucide-react';
import { FormEvent } from 'react';

export default function Home() {
    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();

    const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        handleSubmit(e);
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-between bg-zinc-950 text-white font-sans">
            <div className="w-full max-w-4xl flex-1 flex flex-col pt-12 pb-32 px-4 sm:px-6">

                {/* Header */}
                <div className="mb-12 text-center">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-tight">
                        __PROJECT_NAME__
                    </h1>
                    <p className="mt-4 text-zinc-400">
                        Powered by model.delights.pro Super-Architect
                    </p>
                </div>

                {/* Chat Log */}
                <div className="flex-1 flex flex-col gap-6 overflow-y-auto">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-500 mt-20">
                            <Bot size={48} className="mb-4 opacity-20" />
                            <p>Start a conversation to test your generated routing pipeline.</p>
                        </div>
                    )}

                    {messages.map((m) => (
                        <div key={m.id} className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex gap-4 max-w-[85%] sm:max-w-[75%] rounded-2xl p-5 shadow-sm ${m.role === 'user'
                                    ? 'bg-zinc-800/80 text-zinc-100 rounded-tr-none'
                                    : 'bg-cyan-950/30 border border-cyan-500/20 text-zinc-100 rounded-tl-none shadow-[0_0_15px_rgba(0,229,255,0.05)]'
                                }`}>
                                {m.role === 'assistant' && (
                                    <div className="w-8 h-8 rounded-full bg-cyan-900/50 flex items-center justify-center flex-shrink-0 mt-1">
                                        <Bot size={16} className="text-cyan-400" />
                                    </div>
                                )}
                                <div className="leading-relaxed whitespace-pre-wrap">{m.content}</div>
                                {m.role === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0 mt-1">
                                        <User size={16} className="text-zinc-300" />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex gap-4 justify-start">
                            <div className="flex gap-4 max-w-[85%] rounded-2xl p-5 bg-cyan-950/30 border border-cyan-500/20 rounded-tl-none items-center">
                                <div className="w-8 h-8 rounded-full bg-cyan-900/50 flex items-center justify-center flex-shrink-0">
                                    <Bot size={16} className="text-cyan-400" />
                                </div>
                                <div className="flex gap-2 items-center h-full pt-1">
                                    <div className="w-2 h-2 rounded-full bg-cyan-500/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 rounded-full bg-cyan-500/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 rounded-full bg-cyan-500/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Input Form */}
            <div className="fixed bottom-0 left-0 w-full bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent pt-12 pb-6 px-4">
                <form onSubmit={handleFormSubmit} className="max-w-4xl mx-auto relative flex items-end gap-2 group">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={input}
                            onChange={handleInputChange}
                            className="w-full bg-zinc-900/80 backdrop-blur-md border border-zinc-800 text-white rounded-2xl px-6 py-4 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-lg placeholder:text-zinc-600"
                            placeholder="Test your active architecture pipeline..."
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="bg-cyan-500 hover:bg-cyan-400 text-zinc-950 h-[58px] px-6 rounded-2xl flex items-center justify-center font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(0,229,255,0.2)] hover:shadow-[0_0_30px_rgba(0,229,255,0.4)]"
                    >
                        <Send size={20} className="mr-2" />
                        Send
                    </button>
                </form>
            </div>
        </main>
    );
}
