import type { Metadata } from "next";
import { Archivo, Figtree } from "next/font/google";
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
      <body className="flex min-h-screen flex-col">{children}</body>
    </html>
  );
}
