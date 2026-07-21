import { NextResponse } from "next/server";
import { authenticateApiRequest } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await authenticateApiRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const service = searchParams.get("service")?.toLowerCase();
  const country = searchParams.get("country")?.toLowerCase();

  try {
    // Fetch dynamic pricing compiled data from local pricing endpoint
    const host = req.headers.get("host") || "localhost:3000";
    const proto = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
    
    const pricingRes = await fetch(`${proto}://${host}/api/pricing`, {
      cache: "no-store",
      headers: {
        "Accept": "application/json"
      }
    });

    if (!pricingRes.ok) {
      throw new Error(`Failed to fetch pricing data: ${pricingRes.status}`);
    }

    const pricingData = await pricingRes.json();
    const detailed = pricingData.detailedPricing || {};

    // Apply VIP Tier discounts based on user level
    // Bronze: no discount, Silver: 2% discount, Gold: 4% discount, Platinum: 6% discount
    const tierDiscounts: Record<string, number> = {
      BRONZE: 0,
      SILVER: 0.02,
      GOLD: 0.04,
      PLATINUM: 0.06
    };
    const discount = tierDiscounts[user.tierLevel] || 0;

    const adjustPrice = (price: number) => {
      if (discount > 0) {
        return parseFloat((price * (1 - discount)).toFixed(2));
      }
      return price;
    };

    // Filter results based on parameters
    if (service && country) {
      const lines = detailed[country]?.[service] || [];
      const discountedLines = lines.map((l: any) => ({
        ...l,
        priceTry: adjustPrice(l.priceTry)
      }));
      return NextResponse.json({
        success: true,
        service,
        country,
        pricing: discountedLines
      });
    }

    if (service) {
      const filtered: Record<string, any> = {};
      for (const [c, servicesMap] of Object.entries(detailed)) {
        const lines = (servicesMap as any)[service];
        if (lines && lines.length > 0) {
          filtered[c] = lines.map((l: any) => ({
            ...l,
            priceTry: adjustPrice(l.priceTry)
          }));
        }
      }
      return NextResponse.json({
        success: true,
        service,
        pricing: filtered
      });
    }

    if (country) {
      const servicesMap = detailed[country] || {};
      const filtered: Record<string, any> = {};
      for (const [s, lines] of Object.entries(servicesMap)) {
        if (lines && (lines as any).length > 0) {
          filtered[s] = (lines as any).map((l: any) => ({
            ...l,
            priceTry: adjustPrice(l.priceTry)
          }));
        }
      }
      return NextResponse.json({
        success: true,
        country,
        pricing: filtered
      });
    }

    // Return all pricing
    const adjustedDetailed: Record<string, any> = {};
    for (const [c, servicesMap] of Object.entries(detailed)) {
      adjustedDetailed[c] = {};
      for (const [s, lines] of Object.entries(servicesMap as any)) {
        if (lines && (lines as any).length > 0) {
          adjustedDetailed[c][s] = (lines as any).map((l: any) => ({
            ...l,
            priceTry: adjustPrice(l.priceTry)
          }));
        }
      }
    }

    return NextResponse.json({
      success: true,
      tierLevel: user.tierLevel,
      discountPercent: discount * 100,
      pricing: adjustedDetailed
    });

  } catch (error: any) {
    console.error("v1/pricing API Error:", error.message);
    return NextResponse.json({ error: "Failed to retrieve pricing data" }, { status: 500 });
  }
}
