'use client';

import React, { useState } from 'react';
interface Props {
    label?: string;
    successUrl?: string;
    className?: string;
}

export default function CheckoutButton({ label, successUrl, className }: Props = {}) {
    const [isLoading, setIsLoading] = useState(false);

    const handleCheckout = async () => {
        try {
            setIsLoading(true);
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ success_url: successUrl })
            });
            const data = await res.json();

            if (data.url) {
                window.location.href = data.url;
            } else if (data.error) {
                alert(`Error: ${data.error}`);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to initiate checkout");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleCheckout}
            disabled={isLoading}
            className={className || `bg-white text-black px-8 py-4 rounded-full font-bold text-lg transition-colors shadow-[0_0_40px_rgba(255,255,255,0.2)] ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-zinc-200'}`}
        >
            {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connecting...
                </span>
            ) : (label || "Start Routing for $99/mo")}
        </button>
    );
}
