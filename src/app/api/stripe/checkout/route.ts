import { NextResponse, NextRequest } from 'next/server';
import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
    console.error("[Stripe API] CRITICAL: STRIPE_SECRET_KEY is missing from environment variables.");
    // We cannot instantiate Stripe without a key in production
}

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY, {
    // @ts-ignore
    apiVersion: '2023-10-16',
}) : null;

export async function POST(req: NextRequest) {
    try {
        if (!stripe) {
            return NextResponse.json({ error: "Billing system is currently down for maintenance (Missing API Key)." }, { status: 503 });
        }

        // Real Stripe API integration
        const origin = req.headers.get('origin') || 'http://localhost:3000';

        // This assumes you have created a product in Stripe and have its Price ID.
        // For a generic demo without a hardcoded price ID, we create an ad-hoc price.
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Model Delights Enterprise Routing',
                            description: 'Unified billing, fallback APIs, and zero-latency routing proxies.',
                        },
                        unit_amount: 9900, // $99.00
                        recurring: {
                            interval: 'month',
                        },
                    },
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${origin}/enterprise/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/enterprise/cancel`,
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error('[Stripe API Error]', error);
        return new NextResponse(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
