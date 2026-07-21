import { NextResponse } from 'next/server';
import { getSystemSetting } from '@/lib/settings';

// Public endpoint — returns only the public Turnstile site key
export async function GET() {
  try {
    const siteKey = await getSystemSetting('TURNSTILE_SITE_KEY');
    return NextResponse.json({ siteKey: siteKey || '' });
  } catch {
    return NextResponse.json({ siteKey: '' });
  }
}
