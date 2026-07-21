import { cookies } from "next/headers";
import Link from "next/link";
import { Calendar, Clock, ChevronLeft, ChevronRight, BookOpen, Search, ArrowUpRight, ShieldCheck, Sparkles, Zap, TrendingUp } from "lucide-react";
import { getPosts, getCategories } from "@/lib/wordpress";
import { getSystemSetting } from "@/lib/settings";
import { translations } from "@/lib/translations";

export const dynamic = "force-dynamic";

export default async function BlogPage(props: {
  searchParams: Promise<{ page?: string; category?: string; q?: string }>;
}) {
  const searchParams = await props.searchParams;
  const currentPage = parseInt(searchParams.page || "1", 10) || 1;
  const currentCategorySlug = searchParams.category || "";
  const searchQuery = searchParams.q || "";

  // 1. Get current language from cookies
  const cookieStore = await cookies();
  const preferredLanguage = cookieStore.get("preferred_language")?.value;
  const lang = (preferredLanguage === "tr" || preferredLanguage === "en" || preferredLanguage === "az") ? preferredLanguage : "tr";
  
  const t = (key: keyof typeof translations["tr"]): string => {
    return (translations[lang] as any)[key] || (translations["tr"] as any)[key] || key;
  };

  // 2. Fetch data
  const { posts: allPosts, totalPages, totalPosts } = await getPosts({
    page: currentPage,
    limit: 7, // Fetch 7 posts per page so we have enough for a beautiful layout
    categorySlug: currentCategorySlug,
    lang,
  });

  const categories = await getCategories(lang);

  // 3. System settings for blog header
  const defaultTitle = t("blog_title_default");
  const defaultDesc = t("blog_desc_default");
  const blogTitle = await getSystemSetting("BLOG_TITLE", defaultTitle);
  const blogDescription = await getSystemSetting("BLOG_DESCRIPTION", defaultDesc);

  // Filter posts client-side if a search query is provided
  let posts = allPosts;
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    posts = posts.filter(
      p => p.title.toLowerCase().includes(query) || p.excerpt.toLowerCase().includes(query)
    );
  }

  // Identify featured post (only on page 1, when no category and search query is applied)
  const featuredPost = (currentPage === 1 && !currentCategorySlug && !searchQuery && posts.length > 0) ? posts[0] : null;
  const gridPosts = featuredPost ? posts.slice(1) : posts;

  // Format date helper
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(lang === "en" ? "en-US" : lang === "az" ? "az-AZ" : "tr-TR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Get color configurations for categories to make them look distinct
  const getCategoryTheme = (slug: string) => {
    switch (slug) {
      case "guides":
        return { bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20", dot: "bg-emerald-500" };
      case "security":
        return { bg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20", dot: "bg-rose-500" };
      case "saas-api":
        return { bg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20", dot: "bg-indigo-500" };
      default:
        return { bg: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20", dot: "bg-pink-500" };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b13] relative overflow-hidden transition-colors duration-300">
      
      {/* Decorative Aurora Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-indigo-600/10 to-transparent blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-pink-600/10 to-transparent blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] bg-gradient-to-br from-teal-600/5 to-transparent blur-[100px] rounded-full pointer-events-none" />

      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 relative z-10 text-left">
        
        {/* EDITORIAL HERO HEADER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
          
          <div className="lg:col-span-8 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 dark:border-indigo-400/20 text-xs font-black uppercase tracking-wider animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ONAYTR KNOWLEDGE HUB</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight text-slate-900 dark:text-white display-font leading-[1.05] drop-shadow-sm">
              Sanal İletişim <br />
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Fikirleri & Rehberler
              </span>
            </h1>
            
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-medium max-w-2xl">
              {blogDescription}
            </p>

            {/* Search Input bar */}
            <form action="/blog" method="GET" className="max-w-md relative group">
              <input
                type="text"
                name="q"
                defaultValue={searchQuery}
                placeholder="Yazılarda ara... (Örn: WhatsApp, Güvenlik)"
                className="w-full pl-12 pr-10 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl text-slate-800 dark:text-slate-200 outline-none shadow-sm text-sm font-semibold transition-all"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-500 transition-colors" />
              {currentCategorySlug && <input type="hidden" name="category" value={currentCategorySlug} />}
            </form>
          </div>

          {/* Quick SaaS Stats Widget */}
          <div className="lg:col-span-4 bg-white/40 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50 pb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-pink-500" />
                <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Hızlı İstatistikler</span>
              </div>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-500">Ortalama SMS Teslimatı</span>
                <span className="font-extrabold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">0.8 saniye</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-500">Aktif Operatör Hattı</span>
                <span className="font-extrabold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20">100+ Ülke</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-500">Kullanıcı Güvenlik Derecesi</span>
                <span className="font-extrabold text-slate-700 dark:text-slate-350 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-500" /> %100 Uyumlu
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
              <Link 
                href="/dashboard"
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-2xl text-xs font-bold shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-1.5 transition-all"
              >
                <span>Hemen Panel'e Git</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* CATEGORY BAR */}
        <div className="mb-12 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-none">
          <div className="flex items-center gap-2 border-b border-slate-200/50 dark:border-slate-800/50 pb-4 min-w-max">
            <Link
              href="/blog"
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all border ${
                !currentCategorySlug
                  ? "bg-slate-900 border-slate-900 dark:bg-white dark:border-white text-white dark:text-slate-950 shadow-md"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {t("blog_all")}
            </Link>
            {categories.map((cat) => {
              const theme = getCategoryTheme(cat.slug);
              return (
                <Link
                  key={cat.id}
                  href={`/blog?category=${cat.slug}`}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all border flex items-center gap-1.5 ${
                    currentCategorySlug === cat.slug
                      ? "bg-[#4648d4] border-[#4648d4] text-white shadow-md shadow-[#4648d4]/10"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-[#4648d4] hover:text-[#4648d4]"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${theme.dot}`} />
                  {cat.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Empty State */}
        {posts.length === 0 && (
          <div className="text-center py-24 bg-white/40 dark:bg-slate-900/10 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md max-w-md mx-auto shadow-sm">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">{t("blog_not_found")}</h3>
            <p className="text-sm text-slate-500 mt-1">Lütfen farklı bir kelimeyle arama yapın veya kategorileri sıfırlayın.</p>
            <Link href="/blog" className="mt-6 inline-flex text-xs font-extrabold text-indigo-500 hover:underline">Geri Dön</Link>
          </div>
        )}

        {/* BILLBOARD FEATURED POST SECTION */}
        {featuredPost && (
          <div className="mb-20 relative rounded-[32px] overflow-hidden border border-slate-200/60 dark:border-slate-800/80 shadow-2xl group">
            <Link href={`/blog/${featuredPost.slug}`}>
              {/* Aspect Ratio container */}
              <div className="relative aspect-[16/9] min-h-[400px] w-full flex flex-col justify-end p-8 sm:p-12 md:p-16">
                
                {/* Background Image with Zoom on hover */}
                <div className="absolute inset-0 -z-20 overflow-hidden">
                  {featuredPost.featuredImage ? (
                    <img
                      src={featuredPost.featuredImage}
                      alt={featuredPost.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700 brightness-[0.6] dark:brightness-[0.4]"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950" />
                  )}
                </div>

                {/* Dark Gradient Overlay for perfect readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent -z-10" />

                {/* Content Box */}
                <div className="max-w-3xl space-y-6">
                  {/* Category Pills */}
                  <div className="flex gap-2">
                    {featuredPost.categories.map((cat) => {
                      const theme = getCategoryTheme(cat.slug);
                      return (
                        <span
                          key={cat.id}
                          className="px-3.5 py-1 bg-white/10 dark:bg-white/5 backdrop-blur-md text-white border border-white/20 text-[10px] font-extrabold uppercase tracking-widest rounded-lg"
                        >
                          {cat.name}
                        </span>
                      );
                    })}
                  </div>

                  {/* Title */}
                  <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] display-font group-hover:text-pink-300 transition-colors">
                    {featuredPost.title}
                  </h2>

                  {/* Excerpt */}
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed line-clamp-3 font-medium">
                    {featuredPost.excerpt}
                  </p>

                  {/* Meta items */}
                  <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400 font-bold pt-4 border-t border-white/10">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4.5 h-4.5 text-pink-400" />
                      {formatDate(featuredPost.date)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4.5 h-4.5 text-indigo-400" />
                      {featuredPost.readTime} {t("blog_read_time")}
                    </span>
                    <span className="ml-auto inline-flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl border border-white/10 text-xs font-bold transition-all">
                      <span>Devamını Oku</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* POSTS GRID GRID LAYOUT */}
        {gridPosts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            
            {gridPosts.map((post, index) => {
              const theme = getCategoryTheme(post.categories[0]?.slug || "");
              
              return (
                <article 
                  key={post.id} 
                  className="group flex flex-col justify-between bg-white dark:bg-slate-900/40 hover:bg-[#ffffff] dark:hover:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 hover:border-indigo-500/30 dark:hover:border-indigo-500/20 transition-all duration-350 rounded-[24px] overflow-hidden shadow-sm hover:shadow-xl relative"
                >
                  <Link href={`/blog/${post.slug}`} className="flex flex-col h-full">
                    {/* Visual aspect */}
                    <div className="relative aspect-[16/10] overflow-hidden">
                      {post.featuredImage ? (
                        <img
                          src={post.featuredImage}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-[#0B1C30] flex items-center justify-center text-white/5" />
                      )}
                      
                      {/* Floating Category Pill */}
                      <div className="absolute top-4 left-4">
                        {post.categories.map((cat) => (
                          <span
                            key={cat.id}
                            className={`px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg border backdrop-blur-md ${theme.bg}`}
                          >
                            {cat.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                      <div className="space-y-3">
                        {/* Date and Read Time */}
                        <div className="flex items-center gap-4 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-pink-500" />
                            {formatDate(post.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-indigo-500" />
                            {post.readTime} {t("blog_read_time")}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug line-clamp-2 display-font">
                          {post.title}
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                          {post.excerpt}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1 group-hover:text-[#4648d4] dark:group-hover:text-indigo-400 transition-colors">
                          {t("blog_read_more")}
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              );
            })}

            {/* SYMMETRY BREAKER: INTERACTIVE AD/CTA CARD IN GRID */}
            <div className="relative overflow-hidden rounded-[24px] border border-slate-800 dark:border-indigo-500/20 bg-[#0B1C30] p-8 shadow-2xl flex flex-col justify-between group min-h-[350px]">
              {/* Background gradient mesh */}
              <div className="absolute top-[-30%] right-[-30%] w-[250px] h-[250px] bg-indigo-500/30 blur-[60px] rounded-full pointer-events-none" />
              <div className="absolute bottom-[-10%] left-[-10%] w-[200px] h-[200px] bg-pink-500/20 blur-[50px] rounded-full pointer-events-none" />
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800d_1px,transparent_1px),linear-gradient(to_bottom,#8080800d_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/20 border border-pink-500/30 text-[10px] font-black text-pink-400 uppercase tracking-widest">
                  <Zap className="w-3 h-3 animate-bounce" />
                  <span>KOLAY ENTEGRASYON</span>
                </div>
                <h3 className="text-2xl font-black text-white leading-tight display-font">
                  Saniyeler İçinde <br />
                  Sanal Numara Tahsis Et!
                </h3>
                <p className="text-xs text-slate-350 leading-relaxed font-medium">
                  Kişisel bilgilerinizi saklı tutun. 200'den fazla popüler servis için anında doğrulama kodu alın.
                </p>
              </div>

              <div className="space-y-3 pt-6 border-t border-white/10">
                <Link
                  href="/auth/register"
                  className="w-full py-3 bg-white hover:bg-slate-100 text-slate-900 text-xs font-black rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-white/5 transition-all"
                >
                  <span>Hemen Ücretsiz Kaydol</span>
                  <ArrowUpRight className="w-4 h-4 text-slate-900" />
                </Link>
                <Link
                  href="/help"
                  className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-bold rounded-xl flex items-center justify-center transition-all"
                >
                  Nasıl Çalışır?
                </Link>
              </div>
            </div>

          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12 border-t border-slate-200/50 dark:border-slate-800/50 pt-8">
            {/* Previous */}
            {currentPage > 1 ? (
              <Link
                href={`/blog?page=${currentPage - 1}${currentCategorySlug ? `&category=${currentCategorySlug}` : ""}${searchQuery ? `&q=${searchQuery}` : ""}`}
                className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors shadow-sm"
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
            ) : (
              <button
                disabled
                className="p-3 rounded-2xl border border-slate-100 dark:border-slate-900 bg-slate-100/50 dark:bg-slate-900/10 text-slate-300 dark:text-slate-700 cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {/* Numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/blog?page=${p}${currentCategorySlug ? `&category=${currentCategorySlug}` : ""}${searchQuery ? `&q=${searchQuery}` : ""}`}
                className={`w-11 h-11 flex items-center justify-center rounded-2xl text-xs font-black transition-all border ${
                  currentPage === p
                    ? "bg-[#4648d4] border-[#4648d4] text-white shadow-lg shadow-[#4648d4]/20"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {p}
              </Link>
            ))}

            {/* Next */}
            {currentPage < totalPages ? (
              <Link
                href={`/blog?page=${currentPage + 1}${currentCategorySlug ? `&category=${currentCategorySlug}` : ""}${searchQuery ? `&q=${searchQuery}` : ""}`}
                className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors shadow-sm"
              >
                <ChevronRight className="w-5 h-5" />
              </Link>
            ) : (
              <button
                disabled
                className="p-3 rounded-2xl border border-slate-100 dark:border-slate-900 bg-slate-100/50 dark:bg-slate-900/10 text-slate-300 dark:text-slate-700 cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
