import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { webhookUrl } = await req.json();

    if (!webhookUrl || (!webhookUrl.startsWith("http://") && !webhookUrl.startsWith("https://"))) {
      return NextResponse.json({ error: "Geçersiz Webhook URL" }, { status: 400 });
    }

    const testPayload = {
      event: "webhook_test",
      timestamp: new Date().toISOString(),
      message: "Bu OnayTR tarafından gönderilen bir test webhook mesajıdır.",
      testData: {
        orderId: "test_order_id_12345",
        phoneNumber: "+905551234567",
        smsCode: "123456",
        serviceCode: "whatsapp",
        countryCode: "turkey",
        status: "RECEIVED"
      }
    };

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 6000); // 6 seconds timeout

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "OnayTR-Webhook-Tester/1.0"
      },
      body: JSON.stringify(testPayload),
      signal: controller.signal
    });

    clearTimeout(id);

    const responseText = await response.text();

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      responseBody: responseText.slice(0, 500) // limit to 500 chars
    });

  } catch (error: any) {
    console.error("Test Webhook API Error:", error.message);
    let errMsg = error.message;
    if (error.name === "AbortError") {
      errMsg = "İstek zaman aşımına uğradı (6 saniye). Hedef sunucu yanıt vermedi.";
    }
    return NextResponse.json({
      success: false,
      error: errMsg
    });
  }
}
