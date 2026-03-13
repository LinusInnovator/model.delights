/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'promo_db.json');

export async function GET() {
    try {
        if (!fs.existsSync(DB_PATH)) {
            return NextResponse.json({ stats: [] });
        }

        let db = { promotions: [], events: [] };
        try {
            const dbContent = fs.readFileSync(DB_PATH, 'utf-8');
            db = JSON.parse(dbContent);
        } catch (e) {
            console.warn('[Admin API] Could not read promo_db.json. Proceeding with empty stats matrix.');
        }

        const promos = db.promotions || [];
        const events = db.events || [];

        const stats = promos.map((promo: any  ) => {
            const promoEvents = events.filter((e: any  ) => e.promoId === promo.id);
            const views = promoEvents.filter((e: any  ) => e.eventType === 'view').length;
            const hovers = promoEvents.filter((e: any  ) => e.eventType === 'hover').length;
            const clicks = promoEvents.filter((e: any  ) => e.eventType === 'click').length;

            const ctr = views > 0 ? ((clicks / views) * 100).toFixed(2) : '0.00';

            return {
                id: promo.id,
                company: promo.title,
                status: promo.status,
                views,
                hovers,
                clicks,
                ctr: parseFloat(ctr)
            };
        });

        // Sort by CTR descending, then by views descending
        stats.sort((a: any  , b: any  ) => {
            if (b.ctr !== a.ctr) return b.ctr - a.ctr;
            return b.views - a.views;
        });

        return NextResponse.json({ stats });
    } catch (error) {
        console.error('Error in /api/admin/stats:', error);
        return NextResponse.json({ error: 'Failed to aggregate stats' }, { status: 500 });
    }
}
