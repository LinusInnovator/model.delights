import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const maxDuration = 60; 

const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  const { prompt, model, articleContext } = await req.json();
  const targetModel = model || "anthropic/claude-3.5-sonnet";

  const systemPrompt = `You are a world-class expert writer showcasing the absolute pinnacle of current AI capabilities.
        
Your task is to take a section of "The Delights Manifesto" and rewrite it to be utterly phenomenal. Maintain the exact same paragraph structure, core message, and factual data points. Do not add or remove paragraphs. 

Elevate the vocabulary. Make sentences punchier and more kinetic. Make it sound like it was written by the most articulate, brilliant essayist and tech visionary possible. 

BACKGROUND CONTEXT FOR DEEP UNDERSTANDING (Weave this intellectual depth into the subtext of your rewrite):
- This text is part of "The Delights Manifesto", written by Linus Öhman (a Strategic Designer turned AI Architect).
- Linus built model.delights.pro (live AI model tracking, ELO routing, Next.js ISR) from scratch in exactly 11 days using Agentic AI pair programming.
- During those SAME 11 days, he simultaneously built 3 other full systems: spell.delights.pro (Feedback analytics), improve.delights.pro (Autonomous Bayesian A/B testing), and an unannounced stealth project.
- The core philosophy: Traditional corporate silos (Strategist -> UX -> Engineer) and slow procurement are completely obsolete. A single human orchestrating AI algorithms now possesses the asymmetric output of a 50-person agency.
- The tone should be revolutionary, anti-bureaucratic, cinematic, and unapologetic.

${articleContext ? `SPECIFIC ARTICLE CONTEXT:\n${articleContext}\n\n` : ''}
Return ONLY the rewritten text, with paragraphs separated by exactly one blank line. Do not include any conversational filler.`;

  const result = await streamText({
    model: openrouter.chat(targetModel),
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      { role: "user", content: prompt }
    ]
  });

  return result.toTextStreamResponse();
}
