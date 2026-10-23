import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { requireUser } from "@/lib/session";
import { PanelNav } from "./panel-nav";

export const metadata: Metadata = { title: "Panel", robots: { index: false } };

// Not: layout, sayfa geçişlerinde yeniden çalışmaz. Veri okuyan her sayfa ve server action
// kendi içinde requireUser() çağırmalı; bu guard yalnızca ilk kapıdır.
async function Guard({ children }: { children: ReactNode }) {
  const user = await requireUser();
  return (
    <>
      <div className="border-b-2 border-murekkep">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-3">
          <p>
            <span className="ui">{user.name}</span>
            <span className="text-soluk"> ({user.email})</span>
          </p>
          <SignOutButton />
        </div>
      </div>
      <PanelNav />
      {children}
    </>
  );
}

export default function PanelLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<p className="mx-auto max-w-6xl px-5 py-16">Panel yükleniyor</p>}>
      <Guard>{children}</Guard>
    </Suspense>
  );
}
