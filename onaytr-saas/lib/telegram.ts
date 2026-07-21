// Telegram bot utility - sends messages to users
const TELEGRAM_API = "https://api.telegram.org/bot";

export async function sendTelegramMessage(botToken: string, chatId: string, message: string): Promise<boolean> {
  try {
    const res = await fetch(`${TELEGRAM_API}${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function sendSmsNotification(
  botToken: string,
  chatId: string,
  phoneNumber: string,
  smsCode: string,
  serviceCode: string
) {
  const msg = `
<b>OnayTR - SMS Alindi!</b>

Servis: <b>${serviceCode.toUpperCase()}</b>
Numara: <code>${phoneNumber}</code>
Kod: <b>${smsCode}</b>

<i>Bu bildirim OnayTR tarafindan gonderildi.</i>
  `.trim();
  return sendTelegramMessage(botToken, chatId, msg);
}

export async function sendBalanceNotification(
  botToken: string,
  chatId: string,
  balance: number
) {
  const msg = `
<b>OnayTR - Bakiye Bilgisi</b>

Mevcut Bakiyeniz: <b>${balance.toFixed(2)} TL</b>

Bakiye yüklemek için: /balance komutu kullanin.
  `.trim();
  return sendTelegramMessage(botToken, chatId, msg);
}