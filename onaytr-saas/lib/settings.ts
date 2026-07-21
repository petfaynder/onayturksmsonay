import prisma from '@/lib/db';

// Cache for system settings to avoid DB queries on every request
let settingsCache: Record<string, string> = {};
let lastFetch = 0;
const CACHE_TTL = 60_000; // 1 minute cache

/**
 * Get a system setting from DB with in-memory caching.
 * Falls back to env variable if not found in DB.
 */
export async function getSystemSetting(key: string, fallback?: string): Promise<string> {
  const now = Date.now();
  
  // Refresh cache if stale
  if (now - lastFetch > CACHE_TTL) {
    try {
      const all = await prisma.systemSetting.findMany();
      settingsCache = {};
      for (const s of all) {
        settingsCache[s.key] = s.value;
      }
      lastFetch = now;
    } catch (e) {
      console.error('[Settings] Failed to fetch settings from DB:', e);
    }
  }

  // 1. Check DB value (cached)
  if (settingsCache[key] && settingsCache[key].trim() !== '') {
    return settingsCache[key];
  }
  
  // 2. Fallback to env variable
  if (process.env[key] && process.env[key]!.trim() !== '') {
    return process.env[key]!;
  }
  
  // 3. Use provided fallback
  return fallback || '';
}

/**
 * Invalidate the settings cache (call after admin saves settings)
 */
export function invalidateSettingsCache() {
  lastFetch = 0;
}
