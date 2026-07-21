export class FiveSimProvider {
  private apiKey: string;
  private baseUrl = 'https://5sim.net/v1/guest'; 
  // In production, user endpoints use /v1/user
  private userUrl = 'https://5sim.net/v1/user';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async fetchApi(
    endpoint: string, 
    method: string = 'GET', 
    isUserEndpoint: boolean = true, 
    timeoutMs: number = 15000
  ) {
    const url = `${isUserEndpoint ? this.userUrl : this.baseUrl}${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json',
        },
        cache: 'no-store',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(responseText || `Status: ${response.status} ${response.statusText}`);
      }

      try {
        return JSON.parse(responseText);
      } catch (e) {
        // If it's not valid JSON, it's a plain text error message (e.g. "no free phones")
        throw new Error(responseText);
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        console.error(`5Sim Request Timeout [${endpoint}] after ${timeoutMs}ms`);
        throw new Error(`Request timed out after ${timeoutMs}ms`);
      }
      console.error(`5Sim Request Failed [${endpoint}]:`, error);
      throw error;
    }
  }


  // 1. Get Profile (Balance & Rating)
  async getProfile() {
    return this.fetchApi('/profile', 'GET', true);
  }

  // 2. Buy a Number
  async buyNumber(country: string, operator: string, product: string) {
    // e.g. /buy/activation/russia/any/whatsapp
    const endpoint = `/buy/activation/${country}/${operator}/${product}`;
    return this.fetchApi(endpoint, 'GET', true);
  }

  // Buy a Rent Number (Hosting)
  async buyHosting(country: string, operator: string, product: string) {
    // e.g. /buy/hosting/russia/any/whatsapp
    const endpoint = `/buy/hosting/${country}/${operator}/${product}`;
    return this.fetchApi(endpoint, 'GET', true);
  }

  // 3. Check Order Status (Get SMS)
  async checkOrder(orderId: string) {
    return this.fetchApi(`/check/${orderId}`, 'GET', true);
  }

  // 4. Finish/Cancel Order
  async finishOrder(orderId: string) {
    return this.fetchApi(`/finish/${orderId}`, 'GET', true);
  }

  async cancelOrder(orderId: string) {
    return this.fetchApi(`/cancel/${orderId}`, 'GET', true);
  }

  async banOrder(orderId: string) {
    return this.fetchApi(`/ban/${orderId}`, 'GET', true);
  }

  // 5. Get Pricing (Guest endpoint usually)
  async getPrices(country?: string, product?: string) {
    let endpoint = '/prices';
    if (country) endpoint += `?country=${country}`;
    if (product) endpoint += country ? `&product=${product}` : `?product=${product}`;
    return this.fetchApi(endpoint, 'GET', false, 8000);
  }
}
