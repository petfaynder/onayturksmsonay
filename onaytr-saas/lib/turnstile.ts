import { getSystemSetting } from '@/lib/settings';

// Server-side Cloudflare Turnstile token verification
export async function verifyTurnstileToken(token: string): Promise<boolean> {
  const secret = await getSystemSetting('TURNSTILE_SECRET_KEY');
  
  // Turnstile key yoksa kontrolü atla (development)
  if (!secret) {
    console.warn('[Turnstile] TURNSTILE_SECRET_KEY not set, skipping verification');
    return true;
  }

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret,
        response: token,
      }),
    });

    const data = await res.json();
    return data.success === true;
  } catch (error) {
    console.error('[Turnstile] Verification error:', error);
    return false;
  }
}
