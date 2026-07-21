import { getSystemSetting } from "./settings";

export async function sendWebhookNotification(event: string, details: string) {
  try {
    const discordUrl = await getSystemSetting("DISCORD_WEBHOOK_URL", "");
    const slackUrl = await getSystemSetting("SLACK_WEBHOOK_URL", "");

    const tz = await getSystemSetting("SYSTEM_TIMEZONE", "Europe/Istanbul");
    const formattedDate = new Date().toLocaleString('tr-TR', { timeZone: tz });
    const message = `🔔 **[${event}]**\n${details}\n📅 Tarih: ${formattedDate}`;

    if (discordUrl && discordUrl.startsWith('http')) {
      await fetch(discordUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: message }),
      });
    }

    if (slackUrl && slackUrl.startsWith('http')) {
      await fetch(slackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: message }),
      });
    }
  } catch (error) {
    console.error("Webhook notification failed:", error);
  }
}
