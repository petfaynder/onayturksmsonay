import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSystemSetting } from "@/lib/settings";
import { sendTelegramMessage, sendBalanceNotification } from "@/lib/telegram";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const msg = body?.message;
    if (!msg) return NextResponse.json({ ok: true });

    const chatId = String(msg.chat?.id);
    const text = (msg.text ?? "").trim();
    const botToken = await getSystemSetting("TELEGRAM_BOT_TOKEN");
    if (!botToken) return NextResponse.json({ ok: true });

    // /start <userId> - link account
    if (text.startsWith("/start")) {
      const parts = text.split(" ");
      const userId = parts[1];
      if (userId) {
        await prisma.user.update({ where: { id: userId }, data: { telegramChatId: chatId } }).catch(() => null);
        await sendTelegramMessage(botToken, chatId,
          "<b>OnayTR hesabiniz Telegram ile basariyla baglandi!</b>\n\nBundan sonra SMS kodlariniz burada gorunecek.\n\n<b>Komutlar:</b>\n/balance - Bakiyenizi goruntuleyin\n/help - Yardim");
      } else {
        await sendTelegramMessage(botToken, chatId,
          "<b>Hos geldiniz!</b>\n\nHesabinizi baglamak icin profil sayfanizdan Telegram baglantisina tiklayin.");
      }
    } else if (text === "/balance") {
      const user = await prisma.user.findFirst({ where: { telegramChatId: chatId }, select: { balance: true } });
      if (user) {
        await sendBalanceNotification(botToken, chatId, user.balance);
      } else {
        await sendTelegramMessage(botToken, chatId, "Hesabiniz henuz bagli degil. Profil sayfasindan Telegram baglantin yapiniz.");
      }
    } else if (text === "/help") {
      await sendTelegramMessage(botToken, chatId,
        "<b>OnayTR Bot Komutlari:</b>\n\n/balance - Bakiyenizi goruntule\n/help - Bu yardim mesajini goster");
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Telegram webhook error:", err);
    return NextResponse.json({ ok: true });
  }
}