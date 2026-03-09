import React from 'react';
import Link from 'next/link';
import { CheckCircle } from '@phosphor-icons/react';

export default function SuccessPage() {
    return (
        <div className="min-h-screen bg-black text-white font-sans flex flex-col items-center justify-center p-6 text-center">
            <div className="max-w-md w-full bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl flex flex-col items-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle size={32} className="text-green-500" />
                </div>
                <h1 className="text-3xl font-bold mb-4">Enterprise Secured</h1>
                <p className="text-zinc-400 mb-8">
                    Your Stripe payment was successful. We are provisioning your unified zero-latency API key and bootstrapping the intelligence node on your account.
                </p>
                <Link
                    href="/architect"
                    className="w-full bg-white text-black py-4 rounded-full font-bold hover:bg-zinc-200 transition-colors block"
                >
                    Return to Blueprint Architect
                </Link>
            </div>
        </div>
    );
}
