import type { Metadata } from "next";
import { PageHead } from "@/components/page-head";
import { site } from "@/lib/site";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "İletişim",
  description: "Kaşif Yazılım ile iletişime geçin: paketler, fiyatlar ve sorularınız için yazın.",
  alternates: { canonical: "/iletisim" },
};

export default function IletisimPage() {
  return (
    <>
      <PageHead title="Bize yazın" lead="Paketler ya da koşullar hakkında sorunuz varsa buradan ulaşın." />
      <section className="mx-auto grid max-w-6xl gap-14 px-5 pb-24 md:grid-cols-[1.3fr_1fr]">
        <ContactForm />
        <dl className="h-fit space-y-5 border-t-4 border-murekkep pt-6">
          {[
            ["E-posta", site.email],
            ["Telefon", site.phone],
            ["Adres", site.address],
          ]
            .filter(([, v]) => !v.includes("[İÇERİK"))
            .map(([k, v]) => (
              <div key={k}>
                <dt className="ui">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          <div>
            <dt className="ui">Müşteriyseniz</dt>
            <dd>Panelinizdeki Destek bölümünden talep açın, yanıtı oradan takip edin.</dd>
          </div>
        </dl>
      </section>
    </>
  );
}
