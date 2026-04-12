import React from 'react';
import { SnellConfigurator } from '@/components/SnellConfigurator';
import TopBarAuth from '@/components/TopBarAuth';
import Footer from '@/components/Footer';

export const metadata = {
    title: "Snell SDK | White-Box Visual Configurator",
    description: "Generate intelligent routing logic visually.",
};

export default function ConfiguratorPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-primary/30 font-sans flex flex-col">
            <TopBarAuth />
            
            <main className="flex-1 w-full pt-32 pb-24 px-6 md:px-12 lg:px-24">
                <SnellConfigurator />
            </main>
            
            <Footer />
        </div>
    );
}
