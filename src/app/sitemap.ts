import { MetadataRoute } from 'next';
import { fetchModels } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const data = await fetchModels();
    const models = data.models;

    const baseUrl = 'https://model.delights.pro';

    // Base routes
    const routes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 1,
        },
    ];

    // We want to generate some of the top comparisons automatically.
    // We'll take the top 50 by ELO and cross them to generate 1,225 popular "vs" pages
    const topModels = [...models]
        .filter(m => m.elo !== null)
        .sort((a, b) => (b.elo || 0) - (a.elo || 0))
        .slice(0, 50);

    // Generate unique pairs
    const pairs = [];
    for (let i = 0; i < topModels.length; i++) {
        for (let j = i + 1; j < topModels.length; j++) {
            const idA = topModels[i].id.replace(/\//g, '__');
            const idB = topModels[j].id.replace(/\//g, '__');
            pairs.push(`${idA}/${idB}`);
        }
    }

    // Create sitemap entries for the "VS" pages
    pairs.forEach(pair => {
        routes.push({
            url: `${baseUrl}/vs/${pair}`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        });
    });

    return routes;
}
