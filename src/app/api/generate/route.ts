import { NextRequest } from 'next/server';
import { z } from 'zod';
import { buildSystemPrompt, buildUserPrompt } from '@/lib/ai/prompt';
import { getOpenAIClient, getProviderConfig } from '@/lib/ai/providers';
import { rateLimit } from '@/lib/rate-limit/ratelimiter';

const RequestSchema = z.object({
  sources: z
    .array(z.object({ filename: z.string(), content: z.string() }))
    .max(24)
    .optional()
    .default([]),
  goal: z.string().min(1, 'Please describe your goal'),
  style: z.enum(['reference', 'tutorial', 'changelog']).default('reference'),
  language: z.string().default('en'),
});

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await rateLimit(req, { id: 'generate', limit: 20, intervalMs: 60_000 });

    const json = await req.json();
    const parsed = RequestSchema.safeParse(json);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid request', details: parsed.error.flatten() }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    const { sources, goal, style, language } = parsed.data;

    const cfg = getProviderConfig();
    const openai = getOpenAIClient();

    const system = buildSystemPrompt(style);
    const user = buildUserPrompt({ goal, language, sources });

    const stream = await openai.chat.completions.create({
      model: cfg.model,
      temperature: 0.2,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      stream: true,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices?.[0]?.delta?.content || '';
            if (delta) controller.enqueue(encoder.encode(delta));
          }
          controller.close();
        } catch (err: unknown) {
          if (err instanceof Error) {
            controller.error(err);
          } else {
            controller.error(new Error('Unknown stream error'));
          }
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: unknown) {
    let message = 'Internal Server Error';
    if (err instanceof Error) {
      message = err.message;
    }
    const status = message.includes('rate') ? 429 : 500;
    return new Response(message, { status });
  }
}

