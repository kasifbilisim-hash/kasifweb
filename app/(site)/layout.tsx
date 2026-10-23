import { Suspense } from "react";
import { Kepenk } from "@/components/kepenk";
import { PageTransition } from "@/components/page-transition";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { jsonLdString } from "@/lib/jsonld";
import { site } from "@/lib/site";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  url: site.url,
  description: site.description,
};

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      {/* Kepenk açılışı oturum başına bir kez: gösterildiyse sonraki yüklemelerde gizlenir (boyamadan önce çalışır). */}
      <script
        dangerouslySetInnerHTML={{
          __html: "try{if(sessionStorage.getItem('kepenk')){document.documentElement.classList.add('kepenk-yok')}else{sessionStorage.setItem('kepenk','1')}}catch(e){}",
        }}
      />
      <Kepenk />
      <Suspense fallback={null}>
        <PageTransition />
      </Suspense>
      <a
        href="#icerik"
        className="ui absolute left-2 top-2 z-50 -translate-y-20 bg-tabela px-4 py-2 text-murekkep focus:translate-y-0"
      >
        İçeriğe geç
      </a>
      <SiteHeader />
      <main id="icerik" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(organizationJsonLd) }} />
    </>
  );
}
