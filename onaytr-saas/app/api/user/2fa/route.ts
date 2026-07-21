import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";
import * as OTPAuth from "otpauth";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

async function getUser(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: { id: true, twoFASecret: true, twoFAEnabled: true, email: true },
  });
}

// GET: returns current 2FA status + QR code if not enabled
export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await getUser(session.user.email);
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (user.twoFAEnabled) {
    return NextResponse.json({ enabled: true });
  }

  // Generate a new secret for setup
  const secret = new OTPAuth.Secret();
  const totp = new OTPAuth.TOTP({
    issuer: "OnayTR",
    label: user.email,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret,
  });
  const otpauthUrl = totp.toString();
  const qrDataUrl = await QRCode.toDataURL(otpauthUrl);

  // Save secret temporarily (not yet enabled)
  await prisma.user.update({ where: { id: user.id }, data: { twoFASecret: secret.base32 } });

  return NextResponse.json({ enabled: false, qrDataUrl, secret: secret.base32 });
}

// POST: verify and enable 2FA
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await getUser(session.user.email);
  if (!user || !user.twoFASecret) return NextResponse.json({ error: "No secret" }, { status: 400 });

  const { token } = await req.json();

  const totp = new OTPAuth.TOTP({
    issuer: "OnayTR",
    label: user.email,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(user.twoFASecret),
  });
  const delta = totp.validate({ token, window: 1 });
  if (delta === null) return NextResponse.json({ error: "Geçersiz kod" }, { status: 400 });

  await prisma.user.update({ where: { id: user.id }, data: { twoFAEnabled: true } });
  return NextResponse.json({ ok: true });
}

// DELETE: disable 2FA
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await getUser(session.user.email);
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { token } = await req.json();
  if (user.twoFAEnabled && user.twoFASecret) {
    const totp = new OTPAuth.TOTP({
      issuer: "OnayTR",
      label: user.email,
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(user.twoFASecret),
    });
    const delta = totp.validate({ token, window: 1 });
    if (delta === null) return NextResponse.json({ error: "Geçersiz kod" }, { status: 400 });
  }

  await prisma.user.update({ where: { id: user.id }, data: { twoFAEnabled: false, twoFASecret: null } });
  return NextResponse.json({ ok: true });
}