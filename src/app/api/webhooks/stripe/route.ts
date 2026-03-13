import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { clerkClient } from '@clerk/nextjs/server';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
    // @ts-expect-error ignore node types
    apiVersion: '2023-10-16',
}) : null;

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
    if (!stripe || !webhookSecret) {
        return new NextResponse('Stripe or Webhook Secret missing', { status: 500 });
    }

    const payload = await req.text();
    const signature = req.headers.get('stripe-signature');

    let event: Stripe.Event;

    try {
        if (!signature) throw new Error('No signature provided in headers');
        event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: unknown) {
        console.error(`⚠️  Webhook signature verification failed: ${(err as Error).message}`);
        return new NextResponse(`Webhook Error: ${(err as Error).message}`, { status: 400 });
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const clerkUserId = session.metadata?.clerk_user_id;

        if (clerkUserId && clerkUserId !== 'anonymous') {
            try {
                // Instantly grant PRO tier via publicMetadata
                const client = await clerkClient();
                await client.users.updateUserMetadata(clerkUserId, {
                    publicMetadata: {
                        tier: 'PRO',
                    }
                });
                console.log(`✅ Successfully upgraded Clerk User: ${clerkUserId} to PRO Tier via Webhook.`);
            } catch (clerkErr) {
                console.error(`❌ Failed to update Clerk User Metadata for ${clerkUserId}: `, clerkErr);
            }
        } else {
            console.warn('Checkout completed but no valid clerk_user_id was attached to session metadata.');
        }
    }

    // Acknowledge receipt of the event
    return NextResponse.json({ received: true }, { status: 200 });
}
