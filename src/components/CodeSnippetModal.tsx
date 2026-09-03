"use client";

import React, { useState } from 'react';
import { Model } from '@/lib/api';

interface CodeSnippetModalProps {
    model: Model;
    fallbackModels: Model[];
    onClose: () => void;
}

export default function CodeSnippetModal({ model, fallbackModels, onClose }: CodeSnippetModalProps) {
    const [activeTab, setActiveTab] = useState<'vercel' | 'node' | 'python' | 'curl'>('vercel');
    const [copied, setCopied] = useState(false);

    const fallbackIds = fallbackModels.map(m => m.id);
    const allModelsArray = [model.id, ...fallbackIds];

    const getSnippet = () => {
        switch (activeTab) {
            case 'vercel':
                return `import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

// OpenRouter unified gateway client with automatic routing
const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    "HTTP-Referer": "https://model.delights.pro",
    "X-Title": "Model Delights Production App"
  }
});

const { text } = await generateText({
  model: openrouter("${model.id}"),
  prompt: "Synthesize the production telemetry logs.",
  experimental_providerMetadata: {
    openrouter: {
      models: ${JSON.stringify(allModelsArray, null, 6)}
    }
  }
});

console.log(text);`;

            case 'node':
                return `import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://model.delights.pro",
    "X-Title": "Model Delights Production App"
  }
});

async function run() {
  const completion = await openai.chat.completions.create({
    model: "${model.id}",
    messages: [
      { role: "system", content: "You are an autonomous engineering agent." },
      { role: "user", content: "Analyze system invariants." }
    ],
    // OpenRouter bulletproof fallback array
    extra_body: {
      models: ${JSON.stringify(allModelsArray, null, 6)}
    }
  });

  console.log(completion.choices[0].message.content);
}

run();`;

            case 'python':
                return `import os
from openai import OpenAI

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.environ.get("OPENROUTER_API_KEY"),
    default_headers={
        "HTTP-Referer": "https://model.delights.pro",
        "X-Title": "Model Delights Python Runner"
    }
)

response = client.chat.completions.create(
    model="${model.id}",
    messages=[
        {"role": "system", "content": "You are a production reasoning engine."},
        {"role": "user", "content": "Execute workflow validation."}
    ],
    extra_body={
        "models": ${JSON.stringify(allModelsArray)}
    }
)

print(response.choices[0].message.content)`;

            case 'curl':
                return `curl https://openrouter.ai/api/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \\
  -H "HTTP-Referer: https://model.delights.pro" \\
  -H "X-Title: Model Delights cURL" \\
  -d '{
    "model": "${model.id}",
    "models": ${JSON.stringify(allModelsArray)},
    "messages": [
      {
        "role": "user",
        "content": "Hello world from production router"
      }
    ]
  }'`;
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(getSnippet()).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div 
            className="code-modal-backdrop"
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(8px)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px'
            }}
        >
            <div 
                className="code-modal-content"
                onClick={e => e.stopPropagation()}
                style={{
                    background: 'rgba(13, 17, 23, 0.95)',
                    border: '1px solid rgba(0, 229, 255, 0.25)',
                    borderRadius: '20px',
                    width: '100%',
                    maxWidth: '720px',
                    boxShadow: '0 25px 60px -15px rgba(0, 229, 255, 0.2), 0 0 40px rgba(0, 0, 0, 0.8)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(255, 255, 255, 0.02)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <i className="ph ph-code" style={{ fontSize: '1.4rem', color: 'var(--accent)' }}></i>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                                1-Click SDK Integration
                            </h3>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                Ready-to-paste for <strong style={{ color: '#fff' }}>{model.name}</strong> with bulletproof fallback array
                            </span>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            fontSize: '1.4rem',
                            cursor: 'pointer',
                            padding: '4px 8px',
                            borderRadius: '8px'
                        }}
                    >
                        &times;
                    </button>
                </div>

                {/* Tabs */}
                <div style={{
                    display: 'flex',
                    gap: '4px',
                    padding: '8px 24px 0 24px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    background: 'rgba(0, 0, 0, 0.2)'
                }}>
                    {[
                        { id: 'vercel', label: 'Vercel AI SDK', icon: 'ph-lightning' },
                        { id: 'node', label: 'OpenAI (Node.js)', icon: 'ph-file-ts' },
                        { id: 'python', label: 'OpenAI (Python)', icon: 'ph-file-py' },
                        { id: 'curl', label: 'cURL', icon: 'ph-terminal-window' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            style={{
                                background: activeTab === tab.id ? 'rgba(0, 229, 255, 0.12)' : 'transparent',
                                color: activeTab === tab.id ? '#00e5ff' : 'var(--text-secondary)',
                                border: 'none',
                                borderBottom: activeTab === tab.id ? '2px solid #00e5ff' : '2px solid transparent',
                                padding: '10px 16px',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s ease',
                                borderTopLeftRadius: '6px',
                                borderTopRightRadius: '6px'
                            }}
                        >
                            <i className={`ph ${tab.icon}`}></i> {tab.label}
                        </button>
                    ))}
                </div>

                {/* Snippet Body */}
                <div style={{ position: 'relative', padding: '16px 24px', maxHeight: '420px', overflowY: 'auto' }}>
                    <pre style={{
                        margin: 0,
                        padding: '16px',
                        background: '#07090e',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        color: '#d1d5db',
                        fontSize: '0.85rem',
                        lineHeight: 1.5,
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                        overflowX: 'auto',
                        whiteSpace: 'pre'
                    }}>
                        {getSnippet()}
                    </pre>
                </div>

                {/* Footer */}
                <div style={{
                    padding: '14px 24px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(255, 255, 255, 0.02)'
                }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Includes <strong>{allModelsArray.length} models</strong> in automatic failover sequence
                    </span>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                color: '#fff',
                                padding: '8px 16px',
                                borderRadius: '10px',
                                fontSize: '0.85rem',
                                cursor: 'pointer'
                            }}
                        >
                            Close
                        </button>
                        <button
                            onClick={handleCopy}
                            style={{
                                background: copied ? '#10b981' : 'var(--accent)',
                                border: 'none',
                                color: copied ? '#fff' : '#000',
                                padding: '8px 20px',
                                borderRadius: '10px',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {copied ? (
                                <><i className="ph ph-check"></i> Copied to Clipboard!</>
                            ) : (
                                <><i className="ph ph-copy"></i> Copy Code Snippet</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
