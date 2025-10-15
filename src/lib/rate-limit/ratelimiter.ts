type Rule = { id: string; limit: number; intervalMs: number };

const ipBuckets = new Map<string, { count: number; resetAt: number }>();

function getClientKey(req: Request) {
  // Rely on x-forwarded-for if behind proxy; fallback to remote address
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0]?.trim();
  return ip || 'anon';
}

export async function rateLimit(req: Request, rule: Rule) {
  const key = `${rule.id}:${getClientKey(req)}`;
  const now = Date.now();
  const bucket = ipBuckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    ipBuckets.set(key, { count: 1, resetAt: now + rule.intervalMs });
    return;
  }
  if (bucket.count >= rule.limit) {
    throw new Error('rate limit exceeded');
  }
  bucket.count += 1;
}

