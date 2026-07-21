import prisma from "@/lib/db";

/**
 * Validates the API Request by checking the apiToken parameter or Bearer token header.
 * Returns the verified user object, or null if authentication fails.
 */
export async function authenticateApiRequest(req: Request) {
  try {
    let token = "";

    // 1. Check Authorization Header
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
      token = authHeader.substring(7).trim();
    }

    // 2. Fallback to URL search parameters
    if (!token) {
      const { searchParams } = new URL(req.url);
      token = searchParams.get("apiToken") || "";
    }

    if (!token) {
      return null;
    }

    // Find user with this token
    const user = await prisma.user.findUnique({
      where: { apiToken: token },
      select: {
        id: true,
        email: true,
        balance: true,
        role: true,
        tierLevel: true,
        autoFallback: true,
        isBanned: true
      }
    });

    if (!user || user.isBanned) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("authenticateApiRequest Error:", error);
    return null;
  }
}
