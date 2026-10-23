import type { Metadata } from "next";
import { count, eq, inArray } from "drizzle-orm";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { db, schema } from "@/lib/db";
import { LogoMark } from "@/components/logo";
import { requireAdmin } from "@/lib/session";
import "./admin.css";
import { AdminNav } from "./admin-nav";

export const metadata: Metadata = { title: { default: "Yönetim", template: "%s | Yönetim" }, robots: { index: false, follow: false } };

const n = async (q: PromiseLike<{ n: number }[]>) => (await q)[0]?.n ?? 0;

// Not: layout, sayfa geçişlerinde yeniden çalışmaz. Her admin sayfası ve server action
// kendi içinde requireAdmin() çağırmalı; bu guard yalnızca ilk kapıdır.
async function Shell({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();
  const [commitments, tickets, cancellations] = await Promise.all([
    n(db.select({ n: count() }).from(schema.commitmentDocuments).where(eq(schema.commitmentDocuments.status, "yuklendi"))),
    n(db.select({ n: count() }).from(schema.tickets).where(inArray(schema.tickets.status, ["acik", "yanit_bekliyor"]))),
    n(db.select({ n: count() }).from(schema.subscriptions).where(eq(schema.subscriptions.status, "cancel_requested"))),
  ]);

  return (
    <div className="admin-root">
      <aside className="adm-side">
        <div className="adm-brand">
          <LogoMark height={34} />
          <span>
            <span className="block text-[15px] font-bold leading-tight">Kaşif Yönetim</span>
            <span className="block text-xs text-[var(--a-muted)]">Yönetim paneli</span>
          </span>
        </div>
        <AdminNav badges={{ commitments, tickets, cancellations }} />
        <div className="adm-user">
          <p className="truncate text-sm" title={admin.email}>{admin.email}</p>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <Link href="/" target="_blank" rel="noopener" className="underline underline-offset-4">Siteyi aç</Link>
            <SignOutButton />
          </p>
        </div>
      </aside>
      <div className="adm-main">{children}</div>
    </div>
  );
}

export default function YonetimLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<p className="p-8">Yönetim paneli yükleniyor</p>}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}
