import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ─── In-Memory Rate Limiter ─────────────────────────────────────────────────
// Per-IP sliding window rate limiter. Resets on server restart (acceptable for
// a self-hosted Node process). For multi-instance deployments, swap with Redis.

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes to prevent memory growth
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

function isRateLimited(
  ip: string,
  route: string,
  maxRequests: number,
  windowMs: number
): boolean {
  const key = `${ip}:${route}`;
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count++;
  if (entry.count > maxRequests) {
    return true;
  }

  return false;
}

// ─── Rate Limit Configuration ───────────────────────────────────────────────
// [pathPrefix, maxRequests, windowMs]
const RATE_LIMIT_RULES: [string, number, number][] = [
  // Auth endpoints — tight limits to prevent brute force
  ['/api/auth/register', 5, 60_000],           // 5 per minute
  ['/api/auth/forgot-password', 5, 60_000],    // 5 per minute
  ['/api/auth/', 20, 60_000],                  // 20 per minute (login etc.)

  // Purchase endpoints — moderate limits
  ['/api/orders/buy', 10, 60_000],             // 10 per minute
  ['/api/orders/rent', 10, 60_000],            // 10 per minute
  ['/api/orders/cancel', 15, 60_000],          // 15 per minute
  ['/api/orders/check', 60, 60_000],           // 60 per minute (polling)
  ['/api/orders/resend', 10, 60_000],          // 10 per minute

  // Payment endpoints
  ['/api/payment/', 10, 60_000],               // 10 per minute

  // Public API (v1) — generous but bounded
  ['/api/v1/', 30, 60_000],                    // 30 per minute

  // Pricing — allows reasonable browsing
  ['/api/pricing', 30, 60_000],                // 30 per minute

  // Admin endpoints
  ['/api/admin/', 60, 60_000],                 // 60 per minute

  // Contact
  ['/api/contact', 3, 60_000],                 // 3 per minute

  // Catch-all for other API routes
  ['/api/', 60, 60_000],                       // 60 per minute
];

function findRateLimit(pathname: string): [number, number] | null {
  for (const [prefix, max, window] of RATE_LIMIT_RULES) {
    if (pathname.startsWith(prefix)) {
      return [max, window];
    }
  }
  return null;
}

// ─── Middleware ──────────────────────────────────────────────────────────────

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Create request headers to pass pathname to server layout
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-url', pathname);

  // Only apply rate limiting to API routes
  if (pathname.startsWith('/api/')) {
    // Skip payment callbacks (they come from payment providers, not users)
    if (pathname.includes('/callback')) {
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        }
      });
    }

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const rule = findRateLimit(pathname);
    if (rule) {
      const [maxRequests, windowMs] = rule;
      if (isRateLimited(ip, pathname, maxRequests, windowMs)) {
        return NextResponse.json(
          { error: 'Çok fazla istek gönderdiniz. Lütfen bir süre bekleyin.' },
          { status: 429 }
        );
      }
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    }
  });
}

export const config = {
  matcher: [
    // Apply to all paths except static assets
    '/((?!_next/static|_next/image|favicon.ico|images).*)',
  ],
};
