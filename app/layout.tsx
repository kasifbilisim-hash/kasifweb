import type { Metadata } from "next";
import { Archivo, Figtree } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { site } from "@/lib/site";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
  display: "swap",
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Kaşif Yazılım | Kurumsal web sitesi ve Google Ads, abonelik ya da tek seferlik paketle",
    template: "%s | Kaşif Yazılım",
  },
  description: site.description,
  openGraph: {
    siteName: site.name,
    locale: "tr_TR",
    type: "website",
  },
};

// Kök yerleşim yalnızca belge kabuğudur. Site (üst menü, alt bilgi) (site) grubunda, yönetim paneli
// (admin) grubunda kendi kabuğuyla gelir: ikisi birbirinden bağımsızdır.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" suppressHydrationWarning className={`${archivo.variable} ${figtree.variable}`}>
      <body className="flex min-h-screen flex-col">
        {/* Kepenk açılışı oturum başına bir kez: gösterildiyse sonraki yüklemelerde gizlenir (boyamadan önce çalışır).
            Kök yerleşimde olmalı: React, istemcide yeniden çizilen yerleşimdeki script etiketi için uyarı verir. */}
        <Script id="kepenk-oturum" strategy="beforeInteractive">
          {"try{if(sessionStorage.getItem('kepenk')){document.documentElement.classList.add('kepenk-yok')}else{sessionStorage.setItem('kepenk','1')}}catch(e){}"}
        </Script>
        {children}
      </body>
    </html>
  );
}
