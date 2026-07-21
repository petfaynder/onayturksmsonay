import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { getSystemSetting } from "@/lib/settings";
import { generateReferralCode } from "@/lib/referral";
import { sendWebhookNotification } from "@/lib/webhook";

export async function POST(req: Request) {
  try {
    const { email, password, turnstileToken, referralCode: refCode } = await req.json();

    const turnstileSecret = await getSystemSetting("TURNSTILE_SECRET_KEY");
    if (turnstileSecret) {
      if (!turnstileToken) {
        return NextResponse.json({ error: "Bot dogrulamas gereklidir" }, { status: 400 });
      }
      const isValid = await verifyTurnstileToken(turnstileToken);
      if (!isValid) {
        return NextResponse.json({ error: "Bot dogrulamas basarisiz. Lutfen tekrar deneyin." }, { status: 400 });
      }
    }

    if (!email || !password) {
      return NextResponse.json({ error: "E-posta ve sifre zorunludur" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Sifreniz en az 6 karakter olmalidir" }, { status: 400 });
    }

    const pwdStrengthCheckSetting = await getSystemSetting("PASSWORD_STRENGTH_CHECK", "false");
    if (pwdStrengthCheckSetting === "true") {
      const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/;
      if (!strongPasswordRegex.test(password)) {
        return NextResponse.json({ 
          error: "Sifreniz en az 8 karakter olmali, en az bir buyuk harf, bir rakam ve bir ozel karakter icermelidir." 
        }, { status: 400 });
      }
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Bu e-posta adresi zaten kullaniliyor" }, { status: 400 });
    }

    let referredById: string | undefined = undefined;
    if (refCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: refCode.toUpperCase() },
        select: { id: true },
      });
      if (referrer) referredById = referrer.id;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const newReferralCode = generateReferralCode();

    // Get signup bonus balance dynamically (e.g. "5.00" or "0")
    const signupBonusSetting = await getSystemSetting("SIGNUP_BONUS_BALANCE", "0");
    const signupBonus = parseFloat(signupBonusSetting);
    const initialBalance = isNaN(signupBonus) ? 0.0 : signupBonus;

    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: { email, passwordHash, balance: initialBalance, referralCode: newReferralCode, referredById },
      });

      if (initialBalance > 0) {
        await tx.transaction.create({
          data: {
            userId: createdUser.id,
            amount: initialBalance,
            type: "BONUS",
            description: "Kayıt hediyesi bakiye",
          },
        });
      }

      return createdUser;
    });

    // Send webhook notification in background
    sendWebhookNotification("Yeni Üye Kaydı", `Yeni kullanıcı başarıyla kaydoldu.\n📧 E-posta: ${email}\n🎁 Kayıt Hediyesi: ${initialBalance} ₺`).catch(err => console.error("Register Webhook error:", err));

    return NextResponse.json({ success: true, message: "Kayit islemi basarili", userId: user.id }, { status: 201 });
  } catch (error: any) {
    console.error("Registration API Error:", error);
    return NextResponse.json({ error: "Kayit sirasinda bir hata olustu" }, { status: 500 });
  }
}