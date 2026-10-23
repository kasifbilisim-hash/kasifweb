import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/blog";
import { legalPages, nav, services, site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublishedPosts();
  const paths = ["/", ...nav.map((n) => n.href), "/sss", ...services.map((s) => s.href), ...legalPages.map((l) => l.href)];
  return [
    ...paths.map((path) => ({ url: `${site.url}${path === "/" ? "" : path}` })),
    ...posts.map((p) => ({ url: `${site.url}/blog/${p.slug}`, lastModified: p.publishedAt })),
  ];
}
