import React from 'react';
import { SnellConfigurator } from '@/components/SnellConfigurator';

export const metadata = {
    title: "Snell SDK | White-Box Visual Configurator",
    description: "Generate intelligent routing logic visually.",
};

export default function ConfiguratorPage() {
    return (
        <div className="w-full pt-32 pb-24 px-6 md:px-12 lg:px-24 bg-black text-white selection:bg-primary/30 font-sans">
            <SnellConfigurator />
        </div>
    );
}
