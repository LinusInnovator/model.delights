import { MetadataRoute } from 'next';
import { fetchModels } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://model.delights.pro';
    const now = new Date();

    // 1. High-Value Core Platform Routes
    const routes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/pricing`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.95,
        },
        {
            url: `${baseUrl}/models`,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 0.95,
        },
        {
            url: `${baseUrl}/architect`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.85,
        },
        {
            url: `${baseUrl}/changelog`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.75,
        },
        {
            url: `${baseUrl}/enterprise`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
    ];

    // 2. Add Category Hubs
    const categories = ['top-tier', 'coding-logic', 'fictional', 'drafting', 'roleplay', 'vision', 'image-gen'];
    categories.forEach(slug => {
        routes.push({
            url: `${baseUrl}/categories/${slug}`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.85,
        });
    });

    try {
        const data = await fetchModels();
        const models = data?.models || [];

        // 3. Filter Clean, High-Value Models for Profile Indexation
        // Purge batch variants (:batch), internal checkpoints, and deprecated duplicates
        const cleanModels = models.filter(m => {
            if (!m.id || !m.name) return false;
            if (m.id.includes(':batch')) return false;
            if (m.id.includes(':free') && models.some(other => other.id === m.id.replace(':free', ''))) return false;
            if (m.id.startsWith('~')) return false;
            return true;
        });

        // Add distinct model profile pages
        cleanModels.forEach(model => {
            routes.push({
                url: `${baseUrl}/models/${model.id}`,
                lastModified: now,
                changeFrequency: 'weekly',
                priority: model.elo && model.elo > 1200 ? 0.8 : 0.6,
            });
        });

        // 4. Curate High-Intent VS Comparison Pages (Top 25 Frontier Flagships)
        // Crossing top 25 models yields 300 highly targeted, non-spam comparison URLs
        const topFlagships = cleanModels
            .filter(m => m.elo !== null && !m.id.includes(':'))
            .sort((a, b) => (b.elo || 0) - (a.elo || 0))
            .slice(0, 25);

        for (let i = 0; i < topFlagships.length; i++) {
            for (let j = i + 1; j < topFlagships.length; j++) {
                const idA = topFlagships[i].id.replace(/\//g, '__');
                const idB = topFlagships[j].id.replace(/\//g, '__');
                routes.push({
                    url: `${baseUrl}/vs/${idA}/${idB}`,
                    lastModified: now,
                    changeFrequency: 'weekly',
                    priority: 0.7,
                });
            }
        }
    } catch (e) {
        console.error('[Sitemap Generation Error]', e);
    }

    return routes;
}
