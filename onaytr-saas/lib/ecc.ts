// lib/ecc.ts
import prisma from './db';
import { getSystemSetting } from './settings';

interface ExchangeRateCache {
  rate: number;
  timestamp: number;
}

export class ECCEngine {
  private static cache: ExchangeRateCache | null = null;
  private static CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

  /**
   * Fetches the current exchange rate from USD to TRY
   * Uses an in-memory cache to avoid rate limits
   */
  public static async getUsdToTryRate(): Promise<number> {
    const now = Date.now();

    if (this.cache && (now - this.cache.timestamp < this.CACHE_DURATION_MS)) {
      return this.cache.rate;
    }

    try {
      // Using a free open API for exchange rates
      const response = await fetch('https://open.er-api.com/v6/latest/USD', {
        next: { revalidate: 300 } // Next.js fetch cache (5 mins)
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }

      const data = await response.json();
      let rate = data.rates.TRY;

      if (!rate) {
        throw new Error('TRY rate not found in response');
      }

      // Apply dynamic exchange rate protection buffer (default 2%)
      try {
        const bufferSetting = await prisma.systemSetting.findUnique({
          where: { key: 'USD_EXCHANGE_BUFFER' }
        });
        const buffer = bufferSetting ? parseFloat(bufferSetting.value) : 2.0;
        rate = rate * (1 + (buffer / 100));
      } catch (e) {
        rate = rate * 1.02; // fallback to 2%
      }

      this.cache = {
        rate: Number(rate.toFixed(4)),
        timestamp: now
      };

      return rate;
    } catch (error) {
      console.error('ECC Engine: Error fetching exchange rate:', error);
      
      try {
        const dbFallback = await prisma.systemSetting.findUnique({
          where: { key: 'USD_FALLBACK_RATE' }
        });
        if (dbFallback) {
          return parseFloat(dbFallback.value);
        }
      } catch (dbError) {
        console.error('ECC Engine: DB Fallback query failed:', dbError);
      }

      // Fallback rate if API and DB fail (default 50.0 TRY)
      return this.cache?.rate || 50.0; 
    }
  }

  /**
   * Calculates the final sell price based on provider cost and system margins.
   * costPriceUsd: The raw price from 5sim in USD
   * globalMarginPercentage: The base margin (e.g. 100 for 100% markup)
   * specificMarginOverride: Optional override for a specific service/country
   */
  public static async calculateSellPrice(
    costPriceUsd: number,
    globalMarginPercentage: number = 50,
    specificMarginOverride?: number | null
  ): Promise<{
    costPriceTry: number;
    sellPriceTry: number;
    exchangeRate: number;
  }> {
    const rate = await this.getUsdToTryRate();
    const costPriceTry = costPriceUsd * rate;

    // Use specific margin if provided, otherwise fallback to global
    const margin = specificMarginOverride ?? globalMarginPercentage;

    // Calculate sell price: cost + (cost * margin / 100)
    const sellPriceTry = costPriceTry * (1 + (margin / 100));

    return {
      costPriceTry: Number(costPriceTry.toFixed(4)),
      sellPriceTry: Number(sellPriceTry.toFixed(4)), // We can round to 2 decimals later for UI
      exchangeRate: rate
    };
  }

  /**
   * Gets the system's global margin setting from DB
   */
  public static async getGlobalMargin(): Promise<number> {
    try {
      const setting = await prisma.systemSetting.findUnique({
        where: { key: 'GLOBAL_MARGIN' }
      });
      return setting ? parseFloat(setting.value) : 50; // default 50%
    } catch (error) {
      console.error('ECC Engine: Error fetching global margin:', error);
      return 50; // Fallback
    }
  }

  /**
   * Resolves the margin percentage for a user based on their role and tier level.
   */
  public static async getTierMargin(role: string, tier: string): Promise<number> {
    try {
      if (role === 'ADMIN') {
        return 0; // Admins get at cost
      }
      if (role === 'RESELLER') {
        const setting = await prisma.systemSetting.findUnique({
          where: { key: 'TIER_RESELLER_MARGIN' }
        });
        return setting ? parseFloat(setting.value) : 25; // default 25%
      }

      // Check user tier
      const key = `TIER_${tier.toUpperCase()}_MARGIN`;
      const setting = await prisma.systemSetting.findUnique({
        where: { key }
      });

      if (setting) {
        return parseFloat(setting.value);
      }

      // Fallbacks if setting doesn't exist
      switch (tier.toUpperCase()) {
        case 'GOLD': return 30;
        case 'SILVER': return 40;
        case 'BRONZE':
        default:
          return await this.getGlobalMargin(); // Fallback to global margin
      }
    } catch (e) {
      console.error("ECC Engine: Failed to resolve tier margin:", e);
      return await this.getGlobalMargin();
    }
  }
}
