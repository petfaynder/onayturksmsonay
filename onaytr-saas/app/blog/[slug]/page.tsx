import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Clock, ArrowLeft, Send, Link2, BookOpen, User, ChevronRight, HelpCircle, ShieldAlert, CheckCircle } from "lucide-react";
import { getPostBySlug, getPosts } from "@/lib/wordpress";
import { translations } from "@/lib/translations";
import ShareButtons from "./ShareButtons";
import ReadingProgressBar from "./ReadingProgressBar";

export const dynamic = "force-dynamic";

export default async function BlogPostDetailPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const slug = params.slug;

  // 1. Get current language from cookies
  const cookieStore = await cookies();
  const preferredLanguage = cookieStore.get("preferred_language")?.value;
  const lang = (preferredLanguage === "tr" || preferredLanguage === "en" || preferredLanguage === "az") ? preferredLanguage : "tr";
  
  const t = (key: keyof typeof translations["tr"]): string => {
    return (translations[lang] as any)[key] || (translations["tr"] as any)[key] || key;
  };

  // 2. Fetch post
  const post = await getPostBySlug(slug, lang);

  if (!post) {
    notFound();
  }

  // 3. Fetch related posts (same category)
  const categorySlug = post.categories[0]?.slug || "";
  const { posts: relatedPostsRaw } = await getPosts({
    page: 1,
    limit: 4,
    categorySlug,
    lang,
  });

  // Filter out current post
  const relatedPosts = relatedPostsRaw.filter(p => p.id !== post.id).slice(0, 3);

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b13] relative overflow-hidden transition-colors duration-300">
      
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-gradient-to-br from-indigo-500/5 to-transparent blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-pink-500/5 to-transparent blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Reading Progress Indicator (Fixed on top of article page) */}
      <ReadingProgressBar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 relative z-10 text-left">
        
        {/* Back Button */}
        <div className="mb-8">
          <Link 
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-black text-[#4648d4] dark:text-indigo-400 hover:text-[#32349e] dark:hover:text-indigo-300 uppercase tracking-widest group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform" />
            <span>{t("blog_go_back")}</span>
          </Link>
        </div>

        {/* HERO TITLE CONTAINER */}
        <div className="space-y-6 mb-12">
          <div className="flex flex-wrap gap-2">
            {post.categories.map((cat) => (
              <span 
                key={cat.id}
                className="px-3.5 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-[10px] font-extrabold uppercase tracking-widest rounded-lg"
              >
                {cat.name}
              </span>
            ))}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white leading-[1.1] display-font">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-slate-500 dark:text-slate-400 border-y border-slate-200/50 dark:border-slate-800/60 py-5">
            <span className="flex items-center gap-2">
              <Calendar className="w-4.5 h-4.5 text-pink-500" />
              {formatDate(post.date)}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4.5 h-4.5 text-indigo-500" />
              {post.readTime} {t("blog_read_time")}
            </span>
            <span className="flex items-center gap-2 ml-auto text-slate-400">
              <User className="w-4.5 h-4.5" />
              <span>OnayTR Editor</span>
            </span>
          </div>
        </div>

        {/* FEATURED IMAGE WITH FLOATING SHADOW */}
        <div className="mb-16 rounded-[32px] overflow-hidden border border-slate-200/50 dark:border-slate-800/80 shadow-2xl relative aspect-[21/9] min-h-[250px]">
          {post.featuredImage ? (
            <img 
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-950 via-[#0B1C30] to-slate-950 flex items-center justify-center text-white/5">
              <BookOpen className="w-32 h-32" />
            </div>
          )}
        </div>

        {/* ARTICLE LAYOUT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main content body */}
          <div className="lg:col-span-8 space-y-8 bg-white/40 dark:bg-slate-900/10 border border-slate-200/40 dark:border-slate-800/40 backdrop-blur-md rounded-[28px] p-6 sm:p-10 shadow-sm">
            <div 
              className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed font-sans text-[15.5px] sm:text-base
              [&_p]:mb-6 [&_p]:leading-relaxed
              [&_h2]:text-2xl [&_h2]:sm:text-3xl [&_h2]:font-black [&_h2]:text-slate-900 [&_h2]:dark:text-white [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:display-font [&_h2]:border-l-4 [&_h2]:border-[#4648d4] [&_h2]:pl-3
              [&_h3]:text-xl [&_h3]:font-black [&_h3]:text-slate-900 [&_h3]:dark:text-white [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:display-font
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-6 [&_ul]:space-y-2
              [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-6 [&_ol]:space-y-2
              [&_li]:text-slate-700 [&_li]:dark:text-slate-350
              [&_strong]:font-extrabold [&_strong]:text-slate-900 [&_strong]:dark:text-white
              [&_a]:text-[#4648d4] [&_a]:dark:text-indigo-400 [&_a]:underline [&_a]:font-bold [&_a]:hover:text-pink-500 [&_a]:transition-colors
              [&_blockquote]:border-l-4 [&_blockquote]:border-pink-500 [&_blockquote]:bg-pink-500/5 [&_blockquote]:p-6 [&_blockquote]:rounded-r-2xl [&_blockquote]:italic [&_blockquote]:my-8 [&_blockquote]:text-slate-600 [&_blockquote]:dark:text-slate-400 [&_blockquote]:font-medium"
              dangerouslySetInnerHTML={{ __html: post.content }} 
            />
          </div>

          {/* Sticky Sidebar */}
          <div className="lg:col-span-4 space-y-8 h-fit lg:sticky lg:top-28">
            
            {/* Share Post Panel */}
            <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <span>Makaleyi Paylaş</span>
              </h4>
              <ShareButtons title={post.title} />
            </div>

            {/* Sidebar SaaS CTA Callout */}
            <div className="bg-gradient-to-br from-[#0B1C30] to-[#122e50] border border-indigo-500/20 p-6 rounded-2xl shadow-lg text-left text-white space-y-6 relative overflow-hidden group">
              <div className="absolute top-[-30%] right-[-30%] w-[150px] h-[150px] bg-indigo-500/30 blur-[40px] rounded-full pointer-events-none" />
              
              <div className="space-y-3">
                <span className="inline-flex items-center gap-1 bg-pink-500/20 text-pink-400 border border-pink-500/30 text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                  OnayTR Özel
                </span>
                <h4 className="text-xl font-black display-font leading-snug">
                  SMS Onay Kodunu Hemen Al!
                </h4>
                <p className="text-xs text-slate-350 leading-relaxed font-medium">
                  WhatsApp, Telegram, Google veya Discord için anında, tamamen güvenli ve anonim sanal numaralar.
                </p>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-white/10">
                <Link 
                  href="/dashboard"
                  className="w-full py-3 bg-[#4648d4] hover:bg-[#3436a5] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md"
                >
                  <span>Sistem Panelini Aç</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <Link 
                  href="/balance"
                  className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl border border-white/10 flex items-center justify-center transition-all"
                >
                  Bakiye Yükle (TL)
                </Link>
              </div>
            </div>

            {/* Helpful Box */}
            <div className="bg-white/40 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl text-xs text-slate-500 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-350">
                <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>Yardıma mı İhtiyacınız Var?</span>
              </div>
              <p className="leading-relaxed">
                SMS onayı veya sanal numaralar hakkında sorularınız mı var? 7/24 aktif olan canlı destek ekibimiz ile iletişime geçebilirsiniz.
              </p>
              <Link href="/support" className="inline-block text-[#4648d4] dark:text-indigo-400 font-extrabold hover:underline">Destek Talebi Oluştur →</Link>
            </div>
            
          </div>
        </div>

        {/* RELATED POSTS GRID */}
        {relatedPosts.length > 0 && (
          <div className="border-t border-slate-200/50 dark:border-slate-800/80 pt-16 mt-20 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white display-font">{t("blog_related")}</h3>
              <Link href="/blog" className="text-xs font-black text-[#4648d4] dark:text-indigo-400 hover:underline uppercase tracking-wider">Tüm Yazıları Gör</Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost) => {
                return (
                  <Link 
                    key={relatedPost.id}
                    href={`/blog/${relatedPost.slug}`}
                    className="group block space-y-4 bg-white dark:bg-slate-900/40 hover:bg-white/80 dark:hover:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/80 hover:border-indigo-500/20 rounded-2xl p-4 transition-all duration-350 shadow-sm hover:shadow-md"
                  >
                    {/* Image */}
                    <div className="aspect-[16/10] w-full rounded-xl overflow-hidden relative">
                      {relatedPost.featuredImage ? (
                        <img 
                          src={relatedPost.featuredImage}
                          alt={relatedPost.title}
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-950 to-slate-950 flex items-center justify-center text-white/5" />
                      )}
                    </div>
                    
                    {/* Meta */}
                    <div className="flex items-center gap-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      <span>{formatDate(relatedPost.date)}</span>
                      <span>•</span>
                      <span>{relatedPost.readTime} {t("blog_read_time")}</span>
                    </div>
                    
                    {/* Title */}
                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug line-clamp-2 display-font">
                      {relatedPost.title}
                    </h4>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}
