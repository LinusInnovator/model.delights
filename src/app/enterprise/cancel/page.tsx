import React from 'react';
import Link from 'next/link';
import { XCircle } from '@phosphor-icons/react/dist/ssr';

export default function CancelPage() {
    return (
        <div className="min-h-screen bg-black text-white font-sans flex flex-col items-center justify-center p-6 text-center">
            <div className="max-w-md w-full bg-white/5 border border-white/10 p-8 rounded-3xl flex flex-col items-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                    <XCircle size={32} className="text-red-500" />
                </div>
                <h1 className="text-3xl font-bold mb-4">Checkout Incomplete</h1>
                <p className="text-zinc-400 mb-8">
                    Your Stripe payment session was closed before completion. If you experienced a billing error, please try again or contact support at engineering@model.delights.pro.
                </p>
                <div className="flex flex-col space-y-3 w-full">
                    <Link
                        href="/enterprise"
                        className="w-full bg-white text-black py-4 rounded-full font-bold hover:bg-zinc-200 transition-colors block"
                    >
                        Return to Enterprise Page
                    </Link>
                    <Link
                        href="/"
                        className="text-zinc-500 hover:text-white transition-colors text-sm mt-4 inline-block"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
