import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalPage } from "@/components/legal-page";
import { legalDocs } from "@/lib/legal-docs";

export function generateStaticParams() {
  return legalDocs.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: PageProps<"/yasal/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const doc = legalDocs.find((d) => d.slug === slug);
  if (!doc) return {};
  return { title: doc.title, description: doc.description, alternates: { canonical: `/yasal/${doc.slug}` } };
}

export default async function YasalPage({ params }: PageProps<"/yasal/[slug]">) {
  const { slug } = await params;
  const doc = legalDocs.find((d) => d.slug === slug);
  if (!doc) notFound();
  return <LegalPage doc={doc} />;
}
