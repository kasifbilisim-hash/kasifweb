import type { Metadata } from "next";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { LogoMark } from "@/components/logo";
import { requireUser } from "@/lib/session";
import "../../app-shell.css";
import { PanelNav } from "./panel-nav";

export const metadata: Metadata = { title: { default: "Panel", template: "%s | Panel" }, robots: { index: false, follow: false } };

// Not: layout, sayfa geçişlerinde yeniden çalışmaz. Veri okuyan her sayfa ve server action
// kendi içinde requireUser() çağırmalı; bu guard yalnızca ilk kapıdır.
// Müşteri paneli de yönetim paneli gibi sitenin üst menü ve alt bilgisinden bağımsız, kendi yan menülü kabuğundadır.
async function Shell({ children }: { children: ReactNode }) {
  const user = await requireUser();
  return (
    <div className="admin-root">
      <aside className="adm-side">
        <div className="adm-brand">
          <LogoMark height={34} />
          <span>
            <span className="block text-[15px] font-bold leading-tight">Kaşif Yazılım</span>
            <span className="block text-xs text-[var(--a-muted)]">Müşteri paneli</span>
          </span>
        </div>
        <PanelNav />
        <div className="adm-user">
          <p className="truncate text-sm font-semibold" title={user.name}>{user.name}</p>
          <p className="truncate text-sm text-[var(--a-muted)]" title={user.email}>{user.email}</p>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <Link href="/" className="underline underline-offset-4">Siteye dön</Link>
            <SignOutButton />
          </p>
        </div>
      </aside>
      <div className="adm-main">{children}</div>
    </div>
  );
}

export default function PanelLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<p className="p-8">Panel yükleniyor</p>}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}
