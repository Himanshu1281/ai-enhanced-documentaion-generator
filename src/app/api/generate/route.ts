import { NextRequest } from 'next/server';
import { z } from 'zod';
import { buildSystemPrompt, buildUserPrompt } from '@/lib/ai/prompt';
import { getOpenAIClient, getProviderConfig } from '@/lib/ai/providers';
import { rateLimit } from '@/lib/rate-limit/ratelimiter';

const RequestSchema = z.object({
  sources: z
    .array(z.object({ filename: z.string(), content: z.string() }))
    .min(1, 'At least one source file is required')
    .max(24),
  goal: z.string().min(8),
  style: z.enum(['reference', 'tutorial', 'changelog']).default('reference'),
  language: z.string().default('en'),
});

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
        } catch (err: any) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: any) {
    const message = err?.message || 'Internal Server Error';
    const status = message.includes('rate') ? 429 : 500;
    return new Response(message, { status });
  }
}

