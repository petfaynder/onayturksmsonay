export class HeroSmsProvider {
  private apiKey: string;
  private baseUrl = 'https://hero-sms.com/stubs/handler_api.php';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async fetchApi(params: Record<string, any>, timeoutMs = 12000): Promise<string> {
    const queryParams = new URLSearchParams({
      api_key: this.apiKey,
      ...params
    });

    const url = `${this.baseUrl}?${queryParams.toString()}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const text = await response.text();

      if (!response.ok) {
        throw new Error(text || `Status: ${response.status} ${response.statusText}`);
      }

      return text;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        console.error(`HeroSMS Request Timeout [${params.action}] after ${timeoutMs}ms`);
        throw new Error(`Request timed out after ${timeoutMs}ms`);
      }
      console.error(`HeroSMS Request Failed [${params.action}]:`, error);
      throw error;
    }
  }

  // ─── ACTIVATION (Tek Kullanımlık) ────────────────────────────────────────────

  // 1. Get Balance
  async getBalance(): Promise<number> {
    const text = await this.fetchApi({ action: 'getBalance' });
    if (text.startsWith('ACCESS_BALANCE:')) {
      return parseFloat(text.split(':')[1]);
    }
    throw new Error(`Bakiye çekilemedi: ${text}`);
  }

  // 2. Buy a Number
  async buyNumber(countryId: number | string, serviceCode: string) {
    const text = await this.fetchApi({
      action: 'getNumber',
      country: countryId,
      service: serviceCode
    });

    if (text.startsWith('ACCESS_NUMBER:')) {
      const [_, id, phone] = text.split(':');
      return {
        id: id,
        phone: phone,
        expires: new Date(Date.now() + 20 * 60 * 1000).toISOString() // 20 minute limit
      };
    }
    throw new Error(`Numara alınamadı: ${text}`);
  }

  // 3. Check Order Status
  async checkOrder(orderId: string) {
    const text = await this.fetchApi({
      action: 'getStatus',
      id: orderId
    });

    if (text === 'STATUS_WAIT_CODE') {
      return { status: 'PENDING', smsCode: null };
    }
    if (text.startsWith('STATUS_OK:')) {
      return { status: 'RECEIVED', smsCode: text.split(':')[1] };
    }
    if (text === 'STATUS_CANCEL') {
      return { status: 'CANCELED', smsCode: null };
    }

    return { status: 'PENDING', smsCode: null };
  }

  // 4. Cancel/Refund Order (status = 8)
  async cancelOrder(orderId: string): Promise<boolean> {
    const text = await this.fetchApi({
      action: 'setStatus',
      id: orderId,
      status: 8
    });
    return text === 'ACCESS_CANCEL';
  }

  // 5. Finish/Complete Order (status = 6)
  async finishOrder(orderId: string): Promise<boolean> {
    const text = await this.fetchApi({
      action: 'setStatus',
      id: orderId,
      status: 6
    });
    return text === 'ACCESS_ACTIVATION';
  }

  // 6. Request another SMS (resend - status = 3)
  async resendSms(orderId: string): Promise<boolean> {
    const text = await this.fetchApi({
      action: 'setStatus',
      id: orderId,
      status: 3
    });
    return text === 'ACCESS_READY';
  }

  // 7. Get Prices (returns JSON object)
  async getPrices(countryId?: number | string, serviceCode?: string) {
    const params: any = { action: 'getPrices' };
    if (countryId !== undefined) params.country = countryId;
    if (serviceCode) params.service = serviceCode;

    const text = await this.fetchApi(params, 8000);
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error(`Fiyat verisi ayrıştırılamadı: ${text}`);
    }
  }

  // ─── RENTAL (Kiralık Numara) ──────────────────────────────────────────────────

  /**
   * Get available rental services and countries for a given duration.
   * HeroSMS uses 'duration' parameter (not 'rent_time').
   * @param duration Duration in hours: 24, 72, 168, 336, 720, 1440, 2160, 4320
   * @param country Optional country code to filter
   */
  async getRentServicesAndCountries(duration: number = 24, country?: string | number) {
    const params: Record<string, any> = {
      action: 'getRentServicesAndCountries',
      duration: duration
    };
    if (country !== undefined) {
      params.country = country;
    }
    const text = await this.fetchApi(params, 15000);

    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error(`Kiralama fiyat verisi ayrıştırılamadı: ${text}`);
    }
  }

  /**
   * Get rent number availability by service.
   */
  async getServiceCountRent(service?: string) {
    const params: any = { action: 'serviceCountRent' };
    if (service) params.service = service;
    const text = await this.fetchApi(params, 8000);
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error(`Stok verisi ayrıştırılamadı: ${text}`);
    }
  }

  /**
   * Rent a number.
   * @param country Country code (e.g. "russia", "england") or numeric ID
   * @param operator Operator name (e.g. "any")
   * @param product Service code (e.g. "wa", "tg")
   * @param rentTime Duration in hours: 24, 72, 168, 336, 720, 1440, 2160, 4320
   */
  async getRentNumber(
    country: string | number,
    operator: string,
    product: string,
    rentTime: number = 24
  ) {
    const text = await this.fetchApi({
      action: 'getRentNumber',
      country,
      operator,
      service: product,
      duration: rentTime
    }, 15000);

    // SMS-Activate format: ACCESS_NUMBER:id:phone OR JSON
    if (text.startsWith('ACCESS_NUMBER:')) {
      const parts = text.split(':');
      return { id: parts[1], phone: parts[2] };
    }

    // Try JSON format (HeroSMS may return JSON)
    try {
      const json = JSON.parse(text);
      if (json.phone || json.number) {
        return {
          id: json.id || json.activation_id || '',
          phone: json.phone || json.number
        };
      }
      throw new Error(`Kiralık numara alınamadı: ${text}`);
    } catch {
      throw new Error(`Kiralık numara alınamadı: ${text}`);
    }
  }

  /**
   * Get all SMS messages for a rented number.
   * @param orderId Provider order ID
   */
  async getAllSms(orderId: string) {
    const text = await this.fetchApi({
      action: 'getAllSms',
      id: orderId
    });

    try {
      const json = JSON.parse(text);
      // Returns array of SMS messages or { values: [...] }
      if (Array.isArray(json)) return json;
      if (json.values) return json.values;
      return [];
    } catch {
      return [];
    }
  }

  /**
   * Get the current status of a rented number, including all received SMS messages.
   * @param orderId Provider order ID
   * @returns Object with status and array of SMS messages
   */
  async getRentStatus(orderId: string): Promise<{ status: string; smsMessages: any[] }> {
    const text = await this.fetchApi({
      action: 'getRentStatus',
      id: orderId
    }, 10000);

    try {
      const json = JSON.parse(text);
      // SMS-Activate compatible format:
      // { status: "active"/"finish"/"cancel", values: [{phoneFrom, text, date}] }
      const status = json.status || 'active';
      const smsMessages = json.values || [];
      return { status, smsMessages };
    } catch {
      // If not JSON, check for text responses
      if (text === 'STATUS_WAIT_CODE') {
        return { status: 'active', smsMessages: [] };
      }
      if (text === 'STATUS_CANCEL') {
        return { status: 'cancel', smsMessages: [] };
      }
      return { status: 'active', smsMessages: [] };
    }
  }

  /**
   * Finish / release a rented number.
   * @param orderId Provider order ID
   */
  async finishRent(orderId: string): Promise<boolean> {
    const text = await this.fetchApi({
      action: 'setStatus',
      id: orderId,
      status: 6
    });
    return text === 'ACCESS_ACTIVATION' || text === 'ACCESS_READY';
  }
}
