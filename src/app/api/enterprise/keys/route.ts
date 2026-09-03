import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

export async function GET() {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const metadata = (await auth()).sessionClaims?.metadata as Record<string, unknown>;
    const isPro = metadata?.tier === 'PRO' || metadata?.has_ltd === true;

    try {
        const { data, error } = await supabase!
            .from('snell_api_keys')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return NextResponse.json({ keys: data || [], isPro });
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const { userId, sessionClaims } = await auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const metadata = sessionClaims?.metadata as Record<string, unknown>;
    const isPro = metadata?.tier === 'PRO' || metadata?.has_ltd === true;

    // Free Tier allows 1 key with 10k routes/mo. Pro tier allows unlimited keys.
    if (!isPro) {
        const { data: existingKeys, error: countError } = await supabase!
            .from('snell_api_keys')
            .select('id')
            .eq('user_id', userId);

        if (countError) throw countError;
        if (existingKeys && existingKeys.length >= 1) {
            return NextResponse.json({ 
                error: 'Free Tier accounts are limited to 1 active Snell API Key. Upgrade to Pro for unlimited keys, team access, and higher throughput.' 
            }, { status: 403 });
        }
    }

    try {
        const { name } = await req.json();
        if (!name) return NextResponse.json({ error: 'Key name is required' }, { status: 400 });

        const rawKey = crypto.randomBytes(32).toString('hex');
        const generatedKey = `sk_snell_${rawKey}`;

        const { data, error } = await supabase!
            .from('snell_api_keys')
            .insert([{
                user_id: userId,
                api_key: generatedKey,
                name: name.trim()
            }])
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json({ key: data, isPro });
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        
        if (!id) return NextResponse.json({ error: 'Key ID is required' }, { status: 400 });

        const { error } = await supabase!
            .from('snell_api_keys')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}
