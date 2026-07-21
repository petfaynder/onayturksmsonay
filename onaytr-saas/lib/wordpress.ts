import { getSystemSetting } from "@/lib/settings";

export interface WordPressPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  featuredImage: string | null;
  categories: Array<{ id: number; name: string; slug: string }>;
  readTime: number; // in minutes
}

export interface WordPressCategory {
  id: number;
  name: string;
  slug: string;
  count?: number;
}

// ---------------------------------------------------------
// Multi-Language Mock Data (TR, EN, AZ)
// ---------------------------------------------------------

const MOCK_CATEGORIES = {
  tr: [
    { id: 1, name: "Rehberler", slug: "guides" },
    { id: 2, name: "Güvenlik", slug: "security" },
    { id: 3, name: "SaaS & API", slug: "saas-api" },
  ],
  en: [
    { id: 1, name: "Guides", slug: "guides" },
    { id: 2, name: "Security", slug: "security" },
    { id: 3, name: "SaaS & API", slug: "saas-api" },
  ],
  az: [
    { id: 1, name: "Təlimatlar", slug: "guides" },
    { id: 2, name: "Təhlükəsizlik", slug: "security" },
    { id: 3, name: "SaaS & API", slug: "saas-api" },
  ],
};

const MOCK_POSTS: Record<string, WordPressPost[]> = {
  tr: [
    {
      id: 101,
      slug: "sanal-numara-nedir-nasil-alinir",
      title: "Sanal Numara Nedir ve Nasıl Alınır? Adım Adım Rehber",
      excerpt: "Sanal telefon numarası (virtual number) hakkında merak edilenler, nasıl çalıştığı ve SMS onay almak için nasıl kullanılacağını bu rehberimizde inceliyoruz.",
      content: `
        <p>Gelişen dijital dünyada internet üzerindeki platformlara üye olurken kişisel verilerimizi korumak her zamankinden daha önemli hale geldi. Neredeyse üye olduğumuz her web sitesi veya uygulama bizden bir telefon numarası doğrulama (SMS onay) talep ediyor. Kendi kişisel numarasını paylaşmak istemeyenler için en ideal çözüm ise <strong>sanal numara</strong> kullanmaktır.</p>
        
        <h2>Sanal Numara Nedir?</h2>
        <p>Sanal numara, fiziksel bir SIM karta bağlı olmayan, internet protokolü (VoIP) veya bulut altyapısı üzerinden çalışan telefon numaralarıdır. Bu numaralar sadece internet bağlantısına ihtiyaç duyar ve gelen SMS veya çağrıları doğrudan web tarayıcınıza veya bir uygulamaya yönlendirir.</p>
        
        <h2>Sanal Numara Ne İşe Yarar?</h2>
        <ul>
          <li><strong>Anonimlik ve Güvenlik:</strong> Sosyal medya platformlarında (WhatsApp, Telegram, Instagram vb.) kendi numaranızı vermeden hesap açmanızı sağlar.</li>
          <li><strong>Spam Engelleme:</strong> Alışveriş siteleri veya forumlara üye olurken spam SMS'lerden kurtulursunuz.</li>
          <li><strong>Global Erişim:</strong> Türkiye'de yaşasanız bile ABD, İngiltere veya Almanya numarası alarak o ülkelere özel servisleri kullanabilirsiniz.</li>
        </ul>

        <h2>OnayTR ile Sanal Numara Nasıl Alınır?</h2>
        <p>OnayTR paneli üzerinden sanal numara almak sadece birkaç saniye sürer:</p>
        <ol>
          <li>OnayTR hesabınıza giriş yapın ve bakiye yükleyin.</li>
          <li>Soldaki menüden onay almak istediğiniz servisi seçin (Örn: WhatsApp).</li>
          <li>Numaranın ait olacağı ülkeyi seçin (Örn: Birleşik Krallık) ve "Numara Satın Al" butonuna basın.</li>
          <li>Size tahsis edilen numarayı kopyalayıp uygulamaya yapıştırın ve kodun panelinize gelmesini bekleyin!</li>
        </ol>
        <p>Eğer SMS kodu 5 dakika içinde gelmezse siparişinizi iptal edip bakiyenizi anında geri alabilirsiniz. OnayTR'de risk tamamen sıfırdır.</p>
      `,
      date: "2026-07-15T10:00:00.000Z",
      featuredImage: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80",
      categories: [{ id: 1, name: "Rehberler", slug: "guides" }],
      readTime: 4,
    },
    {
      id: 102,
      slug: "whatsapp-sms-onay-kodu-gelmiyor-cozumu",
      title: "WhatsApp SMS Onay Kodu Gelmiyor: Kesin Çözüm Yolları",
      excerpt: "Yeni bir WhatsApp hesabı kurarken SMS doğrulama kodunun gelmemesi sorunuyla karşılaşıyorsanız, bu sorunu çözebilecek pratik adımları öğrenin.",
      content: `
        <p>WhatsApp dünyada en çok kullanılan anlık mesajlaşma uygulamasıdır. Ancak yeni bir hesap kurarken veya telefon değiştirirken bazen <strong>"SMS onay kodu gelmiyor"</strong> hatası can sıkıcı olabilir. Bu yazımızda, bu sorunu aşmak için uygulayabileceğiniz adımları anlatıyoruz.</p>
        
        <h2>Kod Gelmemesinin Temel Nedenleri</h2>
        <p>Gecikmenin arkasında şebeke problemleri, yanlış numara formatı veya servis engellemeleri olabilir. İşte en yaygın durumlar:</p>
        <ul>
          <li><strong>Şebeke ve Çekim Gücü:</strong> Cihazınızın SMS altyapısında anlık gecikmeler yaşanıyor olabilir.</li>
          <li><strong>Yurt Dışı Kısıtlamaları:</strong> Kullandığınız hattın uluslararası SMS alımına kapalı olması.</li>
          <li><strong>Spam Koruması:</strong> Çok fazla üst üste kod talebinde bulunursanız WhatsApp numaranızı 24 saatliğine askıya alabilir.</li>
        </ul>

        <h2>SMS Kodu Sorunu Nasıl Çözülür?</h2>
        <p>Sorunu gidermek için şu yöntemleri deneyebilirsiniz:</p>
        <ol>
          <li><strong>"Beni Ara" Seçeneğini Kullanın:</strong> Eğer SMS gelmiyorsa, süre dolduğunda "Beni Ara" seçeneği aktifleşecektir. WhatsApp sizi otomatik arayarak kodu sesli olarak okur.</li>
          <li><strong>Uçak Modunu Açıp Kapatın:</strong> Şebeke bağlantınızı tazelemek için telefonunuzu 10 saniye uçak moduna alın ve tekrar deneyin.</li>
          <li><strong>OnayTR Sanal Numaralarını Deneyin:</strong> Eğer kendi numaranızda kalıcı bir sorun varsa, OnayTR üzerinden fiziksel SIM kart kalitesinde çalışan yeni bir sanal numara tahsis ederek doğrulama yapabilirsiniz.</li>
        </ol>
      `,
      date: "2026-07-12T14:30:00.000Z",
      featuredImage: "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=800&auto=format&fit=crop&q=80",
      categories: [{ id: 1, name: "Rehberler", slug: "guides" }],
      readTime: 3,
    },
    {
      id: 103,
      slug: "telegram-ikinci-hesap-acma-hilesi",
      title: "Numarasız Telegram İkinci Hesap Açma Rehberi",
      excerpt: "Tek bir telefonda birden fazla Telegram hesabı kullanmak istiyor ancak ekstra SIM kart almak istemiyorsanız, sanal numara ile bunu nasıl yapacağınızı anlatıyoruz.",
      content: `
        <p>Telegram, sunduğu gelişmiş gizlilik ve kanal özellikleri sayesinde günümüzde en popüler mesajlaşma servislerinden biri. Birçok kullanıcı kişisel işleri, iş süreçleri veya kripto toplulukları için <strong>ikinci bir Telegram hesabı</strong> kullanmak istiyor. Peki, yeni bir fiziksel SIM kart hattı satın almadan bu nasıl mümkün olur?</p>
        
        <h2>Neden İkinci Bir Hesaba İhtiyaç Duyulur?</h2>
        <p>İş ve özel hayatı birbirinden ayırmak, gruplarda kimliğinizi korumak veya farklı ilgi alanları için ayrı profiller yönetmek oldukça faydalıdır. Telegram uygulaması zaten tek telefonda 3 hesaba kadar aynı onda oturum açmayı desteklemektedir. Ancak her hesap için benzersiz bir telefon numarası gerekir.</p>

        <h2>Sanal Numara ile Telegram Kurulumu</h2>
        <p>Yeni bir hat almak yüksek fatura ve vergi maliyetleri demektir. Bunun yerine OnayTR sanal SMS onay numarası kullanarak tek kullanımlık maliyetle saniyeler içinde hesap açabilirsiniz:</p>
        <ul>
          <li>OnayTR paneline gidin, <strong>Telegram</strong> servisini aratın.</li>
          <li>İstediğiniz bir ülkeyi seçerek (Örn: Hollanda veya Rusya) satın alımı tamamlayın.</li>
          <li>Telegram uygulamasında "Hesap Ekle" diyerek bu numarayı girin.</li>
          <li>OnayTR panelinize düşen SMS doğrulama kodunu girerek ikinci hesabınızı anında aktif edin!</li>
        </ul>
        <p><strong>İpucu:</strong> İkinci hesabınızın güvenliğini artırmak için mutlaka Telegram ayarlarından "İki Adımlı Doğrulama" (şifre) özelliğini aktif edin.</p>
      `,
      date: "2026-07-09T08:15:00.000Z",
      featuredImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
      categories: [{ id: 2, name: "Güvenlik", slug: "security" }],
      readTime: 5,
    },
  ],
  en: [
    {
      id: 101,
      slug: "sanal-numara-nedir-nasil-alinir",
      title: "What is a Virtual Number & How to Get One? Step by Step",
      excerpt: "Discover what virtual phone numbers are, how they function, and how to use them for secure SMS verification online.",
      content: `
        <p>In the growing digital landscape, protecting personal data when signing up for online platforms is more critical than ever. Almost every web app or social media channel requires a phone number to send a verification code. For those who value privacy, <strong>virtual numbers</strong> are the ultimate solution.</p>
        
        <h2>What is a Virtual Number?</h2>
        <p>A virtual number is a phone number that is not linked to a physical SIM card. Instead, it runs on cloud infrastructure or VoIP protocols. These numbers only require an internet connection and route incoming calls/SMS directly to your browser or app dashboard.</p>
        
        <h2>Benefits of Virtual Numbers:</h2>
        <ul>
          <li><strong>Anonymity:</strong> Protect your real identity when creating WhatsApp, Telegram, or Twitter accounts.</li>
          <li><strong>No Spam:</strong> Avoid endless promotional SMS from online e-commerce platforms.</li>
          <li><strong>Global Connectivity:</strong> Obtain USA, UK, or Germany numbers from anywhere in the world to access geo-restricted services.</li>
        </ul>
      `,
      date: "2026-07-15T10:00:00.000Z",
      featuredImage: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80",
      categories: [{ id: 1, name: "Guides", slug: "guides" }],
      readTime: 4,
    },
  ],
  az: [
    {
      id: 101,
      slug: "sanal-numara-nedir-nasil-alinir",
      title: "Virtual Nömrə Nədir və Necə Alınır? Addım-Addım Təlimat",
      excerpt: "Virtual telefon nömrəsi haqqında maraqlı məlumatlar, onun necə işlədiyi və SMS təsdiqi almaq üçün necə istifadə olunacağını öyrənin.",
      content: `
        <p>Rəqəmsal dünyada internet platformalarına üzv olarkən şəxsi məlumatlarımızı qorumaq hər zamankından daha vacibdir. Öz şəxsi nömrəsini paylaşmaq istəməyənlər üçün ən ideal həll yolu isə <strong>virtual nömrə</strong> istifadə etməkdir.</p>
        
        <h2>Virtual Nömrə Nədir?</h2>
        <p>Virtual nömrə, fiziki SIM karta bağlı olmayan, bulud infrastrukturu üzərindən işləyən telefon nömrəsidir.</p>
      `,
      date: "2026-07-15T10:00:00.000Z",
      featuredImage: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80",
      categories: [{ id: 1, name: "Təlimatlar", slug: "guides" }],
      readTime: 4,
    },
  ],
};

// Clean HTML tag helpers
function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "");
}

// Convert HTML content into short snippet
function createExcerpt(html: string, length = 160): string {
  const text = stripHtml(html);
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
}

// Calculate reading time based on text length
function calculateReadTime(html: string): number {
  const words = stripHtml(html).split(/\s+/).length;
  const time = Math.ceil(words / 200); // 200 words per minute average
  return time || 1;
}

// Map WP API post into our standard WordPressPost format
function mapWordPressPost(wpPost: any): WordPressPost {
  let featuredImage = null;
  
  // Try to extract featured image from embedded content
  if (wpPost._embedded && wpPost._embedded["wp:featuredmedia"]) {
    const media = wpPost._embedded["wp:featuredmedia"][0];
    featuredImage = media.source_url || media.media_details?.sizes?.large?.source_url || media.media_details?.sizes?.full?.source_url || null;
  }

  // Try to parse categories
  let categories: Array<{ id: number; name: string; slug: string }> = [];
  if (wpPost._embedded && wpPost._embedded["wp:term"]) {
    // wp:term contains taxonomies, index 0 is typically categories
    const terms = wpPost._embedded["wp:term"][0] || [];
    categories = terms.map((term: any) => ({
      id: term.id,
      name: term.name,
      slug: term.slug,
    }));
  }

  const content = wpPost.content?.rendered || "";
  const title = wpPost.title?.rendered || "";
  const excerpt = wpPost.excerpt?.rendered ? stripHtml(wpPost.excerpt.rendered) : createExcerpt(content);

  return {
    id: wpPost.id,
    slug: wpPost.slug,
    title,
    excerpt,
    content,
    date: wpPost.date,
    featuredImage,
    categories,
    readTime: calculateReadTime(content),
  };
}

// ---------------------------------------------------------
// API Export Methods
// ---------------------------------------------------------

/**
 * Fetch list of posts from Headless WordPress.
 * Fallback to multi-language mock data if API is down or config is empty.
 */
export async function getPosts(options: {
  page?: number;
  limit?: number;
  categorySlug?: string;
  lang?: "tr" | "en" | "az";
}): Promise<{ posts: WordPressPost[]; totalPages: number; totalPosts: number }> {
  const page = options.page || 1;
  const limit = options.limit || 6;
  const categorySlug = options.categorySlug || "";
  const lang = options.lang || "tr";

  const apiUrl = await getSystemSetting("WORDPRESS_API_URL", "");

  // If WordPress URL is not configured, load mock posts
  if (!apiUrl || apiUrl.trim() === "") {
    console.log("[WordPress Service] No API URL set. Serving mock posts.");
    return getMockPosts({ page, limit, categorySlug, lang });
  }

  try {
    let url = `${apiUrl.replace(/\/$/, "")}/wp-json/wp/v2/posts?_embed&page=${page}&per_page=${limit}`;

    // Get categories first if a category filter is applied
    if (categorySlug) {
      const catId = await getCategoryIdBySlug(apiUrl, categorySlug);
      if (catId) {
        url += `&categories=${catId}`;
      } else {
        // Category slug was provided but not found on WordPress. Return empty results.
        return { posts: [], totalPages: 0, totalPosts: 0 };
      }
    }

    const res = await fetch(url, {
      next: { revalidate: 600 }, // Cache on Next.js server for 10 minutes
    });

    if (!res.ok) {
      throw new Error(`WordPress API returned ${res.status}`);
    }

    const data = await res.json();
    const posts = data.map(mapWordPressPost);

    // Get total posts and pages from WP headers
    const totalPosts = parseInt(res.headers.get("x-wp-total") || "0", 10) || posts.length;
    const totalPages = parseInt(res.headers.get("x-wp-totalpages") || "0", 10) || 1;

    return { posts, totalPages, totalPosts };
  } catch (error) {
    console.error("[WordPress Service] Fetching posts failed, falling back to mock posts:", error);
    return getMockPosts({ page, limit, categorySlug, lang });
  }
}

/**
 * Fetch a single blog post by its slug.
 * Fallback to mock data if API is down or not found in live WP.
 */
export async function getPostBySlug(slug: string, lang: "tr" | "en" | "az" = "tr"): Promise<WordPressPost | null> {
  const apiUrl = await getSystemSetting("WORDPRESS_API_URL", "");

  if (!apiUrl || apiUrl.trim() === "") {
    const mockPosts = MOCK_POSTS[lang] || MOCK_POSTS["tr"];
    return mockPosts.find(p => p.slug === slug) || null;
  }

  try {
    const url = `${apiUrl.replace(/\/$/, "")}/wp-json/wp/v2/posts?_embed&slug=${slug}`;
    const res = await fetch(url, {
      next: { revalidate: 600 },
    });

    if (!res.ok) {
      throw new Error(`WordPress API returned ${res.status}`);
    }

    const data = await res.json();
    if (!data || data.length === 0) {
      // Not found on WordPress. Fallback to mock if it matches
      const mockPosts = MOCK_POSTS[lang] || MOCK_POSTS["tr"];
      return mockPosts.find(p => p.slug === slug) || null;
    }

    return mapWordPressPost(data[0]);
  } catch (error) {
    console.error(`[WordPress Service] Fetching post "${slug}" failed, falling back to mock:`, error);
    const mockPosts = MOCK_POSTS[lang] || MOCK_POSTS["tr"];
    return mockPosts.find(p => p.slug === slug) || null;
  }
}

/**
 * Fetch list of categories from WordPress (or mock if no URL).
 */
export async function getCategories(lang: "tr" | "en" | "az" = "tr"): Promise<WordPressCategory[]> {
  const apiUrl = await getSystemSetting("WORDPRESS_API_URL", "");

  if (!apiUrl || apiUrl.trim() === "") {
    return MOCK_CATEGORIES[lang] || MOCK_CATEGORIES["tr"];
  }

  try {
    const url = `${apiUrl.replace(/\/$/, "")}/wp-json/wp/v2/categories?hide_empty=true&per_page=20`;
    const res = await fetch(url, {
      next: { revalidate: 3600 }, // Cache categories for 1 hour
    });

    if (!res.ok) throw new Error(`WordPress categories API returned ${res.status}`);

    const data = await res.json();
    return data.map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      count: cat.count,
    }));
  } catch (error) {
    console.error("[WordPress Service] Fetching categories failed, falling back to mock:", error);
    return MOCK_CATEGORIES[lang] || MOCK_CATEGORIES["tr"];
  }
}

// ---------------------------------------------------------
// Private Helper Methods
// ---------------------------------------------------------

async function getCategoryIdBySlug(apiUrl: string, slug: string): Promise<number | null> {
  try {
    const url = `${apiUrl.replace(/\/$/, "")}/wp-json/wp/v2/categories?slug=${slug}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.length > 0) return data[0].id;
    return null;
  } catch {
    return null;
  }
}

function getMockPosts(options: {
  page: number;
  limit: number;
  categorySlug: string;
  lang: "tr" | "en" | "az";
}): { posts: WordPressPost[]; totalPages: number; totalPosts: number } {
  const lang = options.lang;
  let list = MOCK_POSTS[lang] || MOCK_POSTS["tr"];

  // Filter by category slug if provided
  if (options.categorySlug) {
    list = list.filter(post => 
      post.categories.some(cat => cat.slug === options.categorySlug)
    );
  }

  const totalPosts = list.length;
  const totalPages = Math.ceil(totalPosts / options.limit) || 1;
  const startIdx = (options.page - 1) * options.limit;
  const posts = list.slice(startIdx, startIdx + options.limit);

  return { posts, totalPages, totalPosts };
}
