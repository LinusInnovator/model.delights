import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'promo_db.json');

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { promoId, eventType } = body;

        if (!promoId || !eventType) {
            return NextResponse.json({ error: 'Missing promoId or eventType' }, { status: 400 });
        }

        const validEvents = ['view', 'hover', 'click'];
        if (!validEvents.includes(eventType)) {
            return NextResponse.json({ error: 'Invalid eventType' }, { status: 400 });
        }

        let db = { promotions: [], events: [] as any[] };
        try {
            const dbContent = fs.readFileSync(DB_PATH, 'utf-8');
            db = JSON.parse(dbContent);
        } catch (e) {
            console.warn("[Promotions API] Could not read promo_db.json, using fallback.");
        }

        const newEvent = {
            id: crypto.randomUUID(),
            promoId,
            eventType,
            timestamp: new Date().toISOString()
        };

        db.events.push(newEvent);

        try {
            fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
        } catch (e) {
            console.warn("[Promotions API] Vercel read-only filesystem: Telemetry persistence skipped.");
        }

        return NextResponse.json({ success: true, event: newEvent });
    } catch (error) {
        console.error('Error tracking promotion:', error);
        return NextResponse.json({ error: 'Failed to track event' }, { status: 500 });
    }
}
