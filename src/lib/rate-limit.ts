const hits = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

export function rateLimit(
  request: Request,
  key: string,
  maxAttempts: number,
  windowMs: number
): boolean {
  const ip = getClientIp(request);
  const fullKey = `${key}:${ip}`;
  const now = Date.now();
  const entry = hits.get(fullKey);

  if (!entry || now > entry.resetAt) {
    hits.set(fullKey, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count++;
  if (entry.count > maxAttempts) {
    return true;
  }
  return false;
}

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of hits) {
    if (now > entry.resetAt) hits.delete(key);
  }
}, 60_000);
