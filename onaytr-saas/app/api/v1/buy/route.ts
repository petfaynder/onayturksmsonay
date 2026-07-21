import { NextResponse } from "next/server";
import { authenticateApiRequest } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const user = await authenticateApiRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { service, country, provider, operator } = body;

    if (!service || !country) {
      return NextResponse.json({ error: "Missing required fields: service and country are required." }, { status: 400 });
    }

    const operatorKey = provider && operator ? `${provider}__${operator}` : undefined;

    // Call internal buy endpoint with validated user ID
    const host = req.headers.get("host") || "localhost:3000";
    const proto = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";

    const internalRes = await fetch(`${proto}://${host}/api/orders/buy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-key": process.env.NEXTAUTH_SECRET || ""
      },
      body: JSON.stringify({
        userId: user.id,
        country: country.toLowerCase(),
        product: service.toLowerCase(),
        operatorKey
      }),
      cache: "no-store"
    });

    const data = await internalRes.json();
    if (!internalRes.ok) {
      return NextResponse.json(data, { status: internalRes.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("v1/buy API Error:", error.message);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
