// Next.js Instrumentation Hook
// This file runs once when the server starts (both in dev and production).
// We use it to start the background cron job that auto-expires pending orders.
// Works on any self-hosted environment (Dokploy, Docker, VPS, etc.) — no Vercel required.

export async function register() {
  // Only run in the Node.js runtime (not Edge), and only on the server.
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startExpiryCron } = await import('@/lib/cron/expiry');
    startExpiryCron();
  }
}
