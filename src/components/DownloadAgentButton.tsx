"use client";

import React, { useState } from 'react';
import { Robot, Spinner } from '@phosphor-icons/react';

interface DownloadAgentButtonProps {
    blueprint: any;
    prdText: string;
}

export default function DownloadAgentButton({ blueprint, prdText }: DownloadAgentButtonProps) {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        try {
            setIsDownloading(true);

            const response = await fetch('/api/download-agent-scaffold', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ blueprint, prdText }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || "Failed to download agent scaffold");
            }

            // Create a temporary Blob link to trigger the file download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;

            // Extract the filename from the Content-Disposition header if possible
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = 'agent-scaffold.zip';
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
            className={`w-full max-w-sm mt-3 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(108,43,217,0.4)] hover:shadow-[0_0_30px_rgba(108,43,217,0.7)] ${isDownloading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
            {isDownloading ? (
                <>
                    <Spinner size={20} className="animate-spin text-white" weight="bold" />
                    Packaging Agent...
                </>
            ) : (
                <>
                    <Robot size={22} weight="fill" />
                    Download BYOA Workspace
                </>
            )}
        </button>
    );
}
