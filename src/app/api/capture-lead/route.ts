import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const runtime = 'edge';

export async function POST(req: Request) {
    if (!supabase) {
        // Fallback: If Supabase isn't configured, gracefully accept the lead and pretend success
        // This prevents the front-end flow from hard-crashing if env vars are missing
        console.warn("Supabase not configured. Lead capture skipped.");
        return NextResponse.json({ success: true, warning: 'db_not_connected' });
    }

    try {
        const body = await req.json();
        const { email, query } = body;

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('founder_leads')
            .insert({
                email,
                intent_query: query || null
            });

        if (error) {
            console.error("Supabase insert error:", error);
            return NextResponse.json({ error: 'Failed to capture lead', details: (error as Error).message }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (e: unknown) {
        console.error("Lead capture failed:", e);
        return NextResponse.json({ error: 'Internal server error', details: (e as Error).message }, { status: 500 });
    }
}
