import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'promo_db.json');

export async function GET() {
    try {
        const dbContent = fs.readFileSync(DB_PATH, 'utf-8');
        const db = JSON.parse(dbContent);

        const activePromos = db.promotions.filter((p: any) => p.status === 'active');
        if (activePromos.length === 0) {
            return NextResponse.json({ promo: null });
        }

        // Smart Rotation Logic
        // Calculate views for each active promo to prioritize ones with fewer views (discovery)
        // or higher CTR (performance).
        const stats = activePromos.map((promo: any) => {
            const promoEvents = db.events.filter((e: any) => e.promoId === promo.id);
            const views = promoEvents.filter((e: any) => e.eventType === 'view').length;
            const clicks = promoEvents.filter((e: any) => e.eventType === 'click').length;
            const ctr = views > 0 ? (clicks / views) : 0;
            return { ...promo, views, clicks, ctr };
        });

        // Simple algorithm: sort primarily by lowest views to ensure fair rotation,
        // then as views grow (>100), we could switch to sorting by highest CTR.
        stats.sort((a: any, b: any) => a.views - b.views);

        // Select the one that needs impressions the most
        const selectedPromo = stats[0];

        // Strip out the stats from the return object so frontend doesn't need to know
        const { views, clicks, ctr, ...cleanPromo } = selectedPromo;

        return NextResponse.json({ promo: cleanPromo });
    } catch (error) {
        console.error('Error in /api/promotions:', error);
        return NextResponse.json({ promo: null }, { status: 500 });
    }
}
