import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const maxDuration = 60; 

const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  const { prompt, model } = await req.json();
  const targetModel = model || "anthropic/claude-3.5-sonnet";

  const result = await streamText({
    model: openrouter.chat(targetModel),
    messages: [
      {
        role: "system",
        content: `You are a world-class expert writer showcasing the absolute pinnacle of current AI capabilities.
        
Your task is to take the user's manifesto article and rewrite it to be utterly phenomenal. Maintain the exact same paragraph structure, core message, and factual data points (McKinsey, Gallup, MIT stats). Do not add or remove paragraphs. 

Elevate the vocabulary. Make sentences punchier and more kinetic. Make it sound like it was written by the most articulate, brilliant essayist possible. 

Return ONLY the rewritten text, with paragraphs separated by exactly one blank line.`
      },
      { role: "user", content: prompt }
    ]
  });

  return result.toTextStreamResponse();
}
