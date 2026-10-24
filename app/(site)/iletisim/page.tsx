import type { Metadata } from "next";
import { PageHead } from "@/components/page-head";
import { CallButton, PhoneIcon, WhatsAppIcon, WhatsAppButton } from "@/components/contact-buttons";
import { getContact, isPlaceholder } from "@/lib/contact";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "İletişim",
  description: "Kaşif Yazılım'ı arayın ya da WhatsApp'tan yazın: paketler, fiyatlar ve sorularınız için doğrudan konuşalım.",
  alternates: { canonical: "/iletisim" },
};

export default function IletisimPage() {
  const c = getContact();
  const others = [
    ["E-posta", site.email],
    ["Adres", site.address],
  ].filter(([, v]) => !isPlaceholder(v));

  return (
    <>
      <PageHead title="Bizi arayın ya da WhatsApp'tan yazın" lead="Paketler, fiyatlar ve koşullar hakkında formla uğraşmadan, doğrudan konuşalım." />

      <section className="mx-auto max-w-6xl px-5 py-16">
        {c.tel ? (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col border-2 border-murekkep bg-tabela p-8 md:p-10">
              <span className="text-murekkep"><PhoneIcon className="h-9 w-9" /></span>
              <h2 className="display mt-5 text-3xl text-murekkep">Hemen arayın</h2>
              <a href={c.tel} className="display mt-4 block text-3xl text-murekkep underline-offset-4 hover:underline sm:text-4xl">{c.phoneText}</a>
              <p className="mt-3 text-murekkep/85">Paket seçimi, fiyat ve kurulum süreci için bize doğrudan ulaşın.</p>
              <div className="mt-auto pt-8">
                <CallButton surface="yellow" showNumber={false} label="Şimdi ara" />
              </div>
            </div>
            <div className="flex flex-col border-2 border-murekkep bg-beyaz p-8 md:p-10">
              <span className="text-emaye"><WhatsAppIcon className="h-9 w-9" /></span>
              <h2 className="display mt-5 text-3xl text-emaye">WhatsApp&apos;tan yazın</h2>
              <p className="mt-4 text-lg">Mesajınızı yazın, size dönüş yapalım. Logo, fotoğraf ya da mevcut sitenizin adresini de buradan gönderebilirsiniz.</p>
              <div className="mt-auto pt-8">
                <WhatsAppButton surface="light" label="WhatsApp'ı aç" />
              </div>
            </div>
          </div>
        ) : (
          <p className="border-2 border-dashed border-murekkep p-8 text-lg">
            Telefon ve WhatsApp numarası site ayarlarına eklenecek (<code>lib/site.ts</code>, <code>site.phone</code>).
          </p>
        )}

        {others.length > 0 ? (
          <dl className="mt-12 grid gap-6 border-t-2 border-murekkep pt-8 sm:grid-cols-2">
            {others.map(([k, v]) => (
              <div key={k}>
                <dt className="ui">{k}</dt>
                <dd className="mt-1">{v}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        <p className="mt-12 max-w-2xl text-soluk">
          Zaten müşterimizseniz destek taleplerinizi panelinizden açabilir, yanıtları oradan takip edebilirsiniz.
        </p>
      </section>
    </>
  );
}
