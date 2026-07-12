import type { Metadata } from "next";
import Script from "next/script";
import { Cairo } from "next/font/google";
import "./globals.css";
import { prisma } from "@/lib/prisma";
import { buildThemeCss } from "@/lib/theme";

const NO_FLASH_THEME = `(function(){try{var t=localStorage.getItem('theme')||'light';var r=document.documentElement;if(t==='dark')r.classList.add('dark');r.style.colorScheme=t;}catch(e){}})();`;

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "نظام كنوال المالي",
  description: "نظام إدارة الشؤون المالية لأسطول الشاحنات",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let settings: { primaryColor?: string; accentColor?: string } | null = null;
  try {
    settings = await prisma.companySettings.findUnique({
      where: { id: "singleton" },
      select: { primaryColor: true, accentColor: true },
    });
  } catch {
    // أثناء البناء (build time) لا توجد قاعدة بيانات — استخدم القيم الافتراضية
    settings = null;
  }
  const themeCss = buildThemeCss(
    settings?.primaryColor ?? "#1d4ed8",
    settings?.accentColor ?? "#10b981"
  );

  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full`} suppressHydrationWarning>
      <body className="h-full antialiased">
        <Script id="theme-no-flash" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: NO_FLASH_THEME }} />
        <style dangerouslySetInnerHTML={{ __html: themeCss }} />
        {children}
      </body>
    </html>
  );
}
