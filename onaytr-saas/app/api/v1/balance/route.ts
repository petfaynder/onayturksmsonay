import { NextResponse } from "next/server";
import { authenticateApiRequest } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await authenticateApiRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized (Invalid or missing apiToken)" }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    email: user.email,
    balance: user.balance,
    tierLevel: user.tierLevel
  });
}
