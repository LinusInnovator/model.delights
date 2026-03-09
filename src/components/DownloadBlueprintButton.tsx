"use client";

import React, { useState } from 'react';
import { DownloadCloud, Loader2 } from 'lucide-react';

interface DownloadBlueprintButtonProps {
    blueprint: any;
}

export default function DownloadBlueprintButton({ blueprint }: DownloadBlueprintButtonProps) {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        try {
            setIsDownloading(true);

            const response = await fetch('/api/download-blueprint', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(blueprint),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || "Failed to download blueprint");
            }

            // Create a temporary Blob link to trigger the file download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;

            // Extract the filename from the Content-Disposition header if possible
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = 'custom-architecture.zip';
            if (contentDisposition && contentDisposition.includes('filename="')) {
                const match = contentDisposition.match(/filename="([^"]+)"/);
                if (match && match[1]) filename = match[1];
            }

            a.download = filename;
            document.body.appendChild(a);
            a.click();

            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (error: any) {
            console.error("Download failed:", error);
            alert(`Download Error: ${error.message}`);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <button
            onClick={handleDownload}
            disabled={isDownloading}
            className={`w-full max-w-sm mt-4 bg-cyan-500 hover:bg-cyan-400 text-black px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-colors shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_30px_rgba(0,229,255,0.5)] ${isDownloading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
            {isDownloading ? (
                <>
                    <Loader2 size={20} className="animate-spin text-black" />
                    Packaging Codebase...
                </>
            ) : (
                <>
                    <DownloadCloud size={20} />
                    Download $49 Architecture
                </>
            )}
        </button>
    );
}
