import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
            },
            {
                // Explicitly welcome AI crawlers
                userAgent: ['ChatGPT-User', 'GPTBot', 'PerplexityBot', 'ClaudeBot', 'Anthropic-ai', 'Bytespider', 'GoogleOther'],
                allow: '/',
            }
        ],
        sitemap: 'https://model.delights.pro/sitemap.xml',
    };
}
