import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/admin',
                    '/api/',
                    '/enterprise/dashboard',
                    '/enterprise/cancel',
                    '/enterprise/success',
                    '/validate/',
                ],
            },
            {
                // Explicitly welcome AI Search & LLM scrapers
                userAgent: [
                    'ChatGPT-User',
                    'GPTBot',
                    'PerplexityBot',
                    'ClaudeBot',
                    'Anthropic-ai',
                    'Bytespider',
                    'GoogleOther',
                    'Applebot-Extended',
                    'Cohere-ai',
                ],
                allow: '/',
                disallow: [
                    '/admin',
                    '/api/',
                    '/enterprise/dashboard',
                    '/validate/',
                ],
            }
        ],
        sitemap: 'https://model.delights.pro/sitemap.xml',
    };
}
