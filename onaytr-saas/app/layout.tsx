import type { Metadata } from "next";
import "./globals.css";
import "flag-icons/css/flag-icons.min.css";
import { SessionProvider } from "next-auth/react";
import MeshBackground from "@/components/MeshBackground";
import { ToastProvider } from "@/components/ToastProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/components/LanguageProvider";

import { getSystemSetting } from "@/lib/settings";
import { headers } from "next/headers";
import { auth } from "@/auth";
import prisma from "@/lib/db";
import MaintenanceScreen from "@/components/MaintenanceScreen";

export async function generateMetadata(): Promise<Metadata> {
  const siteName = await getSystemSetting("SITE_NAME", "OnayTR");
  const title = await getSystemSetting("SEO_META_TITLE", "OnayTR - Numara Onay Sistemi");
  const description = await getSystemSetting("SEO_META_DESCRIPTION", "Hızlı, Güvenilir ve Uygun Fiyatlı Numara Onay Servisi");
  const keywords = await getSystemSetting("SEO_META_KEYWORDS", "sms onay, numara onay, mobil onay, fake numara");
  const robots = await getSystemSetting("SEO_ROBOTS", "index, follow");
  const gSiteVerification = await getSystemSetting("GOOGLE_VERIFICATION_ID", "");

  return {
    title: {
      default: title,
      template: `%s | ${siteName}`,
    },
    description,
    keywords,
    robots,
    verification: gSiteVerification ? {
      google: gSiteVerification,
    } : undefined,
  };
}

import AppLayoutWrapper from "@/components/AppLayoutWrapper";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = await getSystemSetting("GOOGLE_ANALYTICS_ID", "");
  const customHeaderScript = await getSystemSetting("CUSTOM_HEADER_SCRIPT", "");
  const customFooterScript = await getSystemSetting("CUSTOM_FOOTER_SCRIPT", "");

  const defaultLangSetting = await getSystemSetting("DEFAULT_LANGUAGE", "tr");
  const defaultLang = (defaultLangSetting === "tr" || defaultLangSetting === "en" || defaultLangSetting === "az") ? defaultLangSetting : "tr";

  const trActiveSetting = await getSystemSetting("SUPPORTED_LANG_TR", "true");
  const enActiveSetting = await getSystemSetting("SUPPORTED_LANG_EN", "true");
  const azActiveSetting = await getSystemSetting("SUPPORTED_LANG_AZ", "true");
  const supportedLangs = {
    tr: trActiveSetting !== "false",
    en: enActiveSetting !== "false",
    az: azActiveSetting !== "false"
  };

  // 1. Get current path from middleware header
  const headersList = await headers();
  const pathname = headersList.get("x-url") || "";

  // 2. Check if Maintenance Mode is active
  const isMaintenanceActiveSetting = await getSystemSetting("MAINTENANCE_MODE_ACTIVE", "false");
  const isMaintenanceActive = isMaintenanceActiveSetting === "true";

  // Bypass paths: admin dashboard, auth endpoints, API routes (so API calls & callbacks still work)
  const isBypassPath = 
    pathname.startsWith('/admin') || 
    pathname.startsWith('/auth') || 
    pathname.startsWith('/api');

  // Check if current user is admin
  const session = await auth();
  const dbUser = session?.user?.email ? await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true }
  }) : null;
  const isAdmin = dbUser?.role === 'ADMIN';

  const isMaintenanceTriggered = isMaintenanceActive && !isAdmin && !isBypassPath;

  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        {/* Google Analytics GA4 */}
        {gaId && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}');
                `,
              }}
            />
          </>
        )}
        {/* Custom Header Script */}
        {customHeaderScript && (
          <script dangerouslySetInnerHTML={{ __html: customHeaderScript }} />
        )}
      </head>
      <body className="antialiased min-h-screen relative font-sans text-slate-800">
        {isMaintenanceTriggered ? (
          <MaintenanceScreen message={await getSystemSetting("MAINTENANCE_MODE_MESSAGE", "Sistemimiz güncelleme ve iyileştirme çalışmaları nedeniyle geçici olarak hizmet dışıdır. En kısa sürede tekrar çevrimiçi olacağız.")} />
        ) : (
          <SessionProvider>
            <ThemeProvider>
              <LanguageProvider defaultLang={defaultLang} supportedLangs={supportedLangs}>
                <ToastProvider>
                  <MeshBackground />
                  <AppLayoutWrapper>
                    {children}
                  </AppLayoutWrapper>
                </ToastProvider>
              </LanguageProvider>
            </ThemeProvider>
          </SessionProvider>
        )}

        {/* Custom Footer Script */}
        {customFooterScript && (
          <script dangerouslySetInnerHTML={{ __html: customFooterScript }} />
        )}
      </body>
    </html>
  );
}

