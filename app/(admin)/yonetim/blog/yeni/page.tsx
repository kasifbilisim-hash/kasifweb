import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/session";
import { NewPostForm } from "../post-form";

export const metadata: Metadata = { title: "Yeni yazı", robots: { index: false } };

export default function YeniYaziPage() {
  return (
    <Suspense fallback={<p className="mx-auto max-w-6xl px-5 py-16">Yükleniyor</p>}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  await requireAdmin();
  return (
    <section className="mx-auto max-w-6xl px-5 py-14">
      <p><Link href="/yonetim/blog" className="underline underline-offset-4">Blog yazıları</Link></p>
      <h1 className="display mb-8 mt-4 text-4xl text-emaye sm:text-5xl">Yeni yazı</h1>
      <NewPostForm />
    </section>
  );
}
