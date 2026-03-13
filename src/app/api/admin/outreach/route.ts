import { NextResponse } from 'next/server';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { topPerformer, allStats } = body;

        if (!topPerformer || !allStats) {
            return NextResponse.json({ error: 'Missing performance data' }, { status: 400 });
        }

        if (!OPENROUTER_API_KEY) {
            return NextResponse.json({ error: 'OPENROUTER_API_KEY is not configured on the server.' }, { status: 500 });
        }

         
        const statsStr = allStats.map((s: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) =>
            `- ${s.company}: ${s.views} views, ${s.clicks} clicks (${s.ctr}% CTR)`
        ).join("\n");

        const prompt = `
        We run a highly targeted directory for AI developers comparing LLMs (model.delights.pro).
        We inject native "Promotion Gems" into our grid instead of traditional ads.
        
        Our recent top performing sponsor is '${topPerformer.company}' which achieved a ${topPerformer.ctr}% Click-Through Rate from ${topPerformer.views} guaranteed views in our grid.
        
        Here is the full performance context of our site's native slot:
        ${statsStr}

        Your task:
        1. Identify 3 completely different scaling startups/companies (NOT '${topPerformer.company}') in the AI developer tools space (e.g. vector DBs, LLM observability, orchestration, deployment). These should be hungry scale-ups, not massive giants.
        2. Write a short, highly personalized, and punchy cold outreach email for EACH of the 3 companies. 
        3. The email should cite the exact success of '${topPerformer.company}' on our platform as proof of ROI, and pitch them a native "Featured Gem" slot to capture our audience of technical builders.

        Format the output exclusively as a clean Markdown document so it renders perfectly on a dashboard.
        `;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "HTTP-Referer": "https://model.delights.pro",
                "X-Title": "model.delights admin proactive outreach",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "openai/gpt-4o",
                messages: [{ role: "user", content: prompt }]
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`OpenRouter API error: ${response.status} ${errorData}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        return NextResponse.json({ drafts: content });
    } catch (error: unknown) {
        console.error('Error generating outreach:', error);
        return NextResponse.json({ error: (error as Error).message || 'Failed to generate outreach' }, { status: 500 });
    }
}
