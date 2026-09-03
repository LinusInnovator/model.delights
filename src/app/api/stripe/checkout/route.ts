import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
    console.error("[Stripe API] CRITICAL: STRIPE_SECRET_KEY is missing from environment variables.");
    // We cannot instantiate Stripe without a key in production
}

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY, {
    // @ts-expect-error Stripe types
    apiVersion: '2023-10-16',
}) : null;

export async function POST(req: NextRequest) {
    try {
        if (!stripe) {
            return NextResponse.json({ error: "Billing system is currently down for maintenance (Missing API Key)." }, { status: 503 });
        }

        // Real Stripe API integration
        const origin = req.headers.get('origin') || 'http://localhost:3000';

        // Grab the authenticated user from Clerk
        const { userId } = await auth();
        
        // Check if the client requested a custom redirect URL
        let customSuccessUrl = null;
        let selectedPlan = 'pro';
        try {
            const body = await req.json();
            customSuccessUrl = body.success_url;
            if (body.plan) selectedPlan = String(body.plan).toLowerCase();
        } catch (e) {
            // body is optional or not json
        }

        const isScale = selectedPlan === 'scale';
        const planName = isScale ? 'Snell Scale & Swarms Gateway' : 'Snell Pro Intelligence Engine';
        const planDescription = isScale 
            ? '300M tokens/mo included, +$0.04/1M overage, sub-20ms edge gateway, custom policies, team seats.'
            : '50M tokens/mo included, +$0.05/1M overage, semantic routing, BFCL tool gating, prompt cache discounts.';
        const unitAmount = isScale ? 24900 : 4900; // $249.00 vs $49.00

        const session = await stripe.checkout.sessions.create({
            metadata: {
                clerk_user_id: userId || 'anonymous',
                plan: selectedPlan,
            },
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: planName,
                            description: planDescription,
                        },
                        unit_amount: unitAmount,
                        recurring: {
                            interval: 'month',
                        },
                    },
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: customSuccessUrl || `${origin}/enterprise/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/pricing`,
        });

        return NextResponse.json({ url: session.url });
    } catch (error: unknown) {
        console.error('[Stripe API Error]', error);
        return new NextResponse(JSON.stringify({ error: (error as Error).message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
