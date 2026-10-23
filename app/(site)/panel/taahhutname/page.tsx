import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getPanelData } from "@/lib/panel-data";
import { requireUser } from "@/lib/session";
import { UploadForm } from "./upload-form";

export const metadata: Metadata = { title: "Taahhütname", robots: { index: false } };

export default function TaahhutnamePage() {
  return (
    <Suspense fallback={<p className="mx-auto max-w-6xl px-5 py-16">Yükleniyor</p>}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const user = await requireUser();
  const data = await getPanelData(user.id);

  if (!data?.subscription || !data.commitment) {
    return (
      <section className="mx-auto max-w-6xl px-5 py-14">
        <h1 className="display text-4xl text-emaye sm:text-5xl">Taahhütname</h1>
        <p className="mt-6 max-w-xl text-xl">
          Taahhütname aboneliğinizden sonra burada açılır.{" "}
          <Link href="/paketler" className="underline underline-offset-4">
            Paketlere göz atın
          </Link>
          .
        </p>
      </section>
    );
  }

  const { commitment } = data;
  const approved = commitment.status === "onaylandi";

  return (
    <section className="mx-auto grid max-w-6xl gap-12 px-5 py-14 md:grid-cols-[1fr_1.3fr]">
      <div>
        <h1 className="display text-4xl text-emaye sm:text-5xl">Taahhütname</h1>
        <p className="mt-5 max-w-md text-xl">
          Taahhütname onaylanmadan projeniz tasarım aşamasına geçmez.
        </p>
      </div>

      <div className="space-y-8">
        {commitment.status === "reddedildi" && (
          <div role="alert" className="border-4 border-red-800 p-5">
            <p className="ui text-red-800">Taahhütnameniz kabul edilmedi</p>
            <p className="mt-2">{commitment.rejectionReason ?? "[Neden belirtilmedi]"}</p>
            <p className="mt-2 text-soluk">Aşağıdan düzeltilmiş nüshayı yeniden yükleyebilirsiniz.</p>
          </div>
        )}
        {commitment.status === "yuklendi" && (
          <p role="status" className="levha bg-tabela p-5">
            Dosyanız bize ulaştı, yöneticimizin onayını bekliyor.
          </p>
        )}
        {approved && (
          <p role="status" className="levha bg-emaye p-5 text-beyaz">
            Taahhütnameniz onaylandı.
          </p>
        )}

        <ol className="space-y-6">
          <li className="border-t-4 border-murekkep pt-4">
            <h2 className="ui text-2xl">Taahhütnameyi indirin</h2>
            <p className="mt-2 text-soluk">Firma bilgilerinizle hazırlandı.</p>
            <form method="post" action="/api/taahhutname">
              <button type="submit" className="ui mt-4 inline-block bg-emaye px-7 py-4 text-lg text-beyaz hover:bg-murekkep">
                PDF indir
              </button>
            </form>
          </li>
          <li className="border-t-4 border-murekkep pt-4">
            <h2 className="ui text-2xl">Çıktı alın, kaşe basıp imzalayın</h2>
          </li>
          <li className="border-t-4 border-murekkep pt-4">
            <h2 className="ui text-2xl">İmzalı nüshayı yükleyin</h2>
            {commitment.signedUploadUrl && (
              <p className="mt-2">
                Yüklenen dosya:{" "}
                <a
                  href={`/api/dosya?p=${encodeURIComponent(commitment.signedUploadUrl)}`}
                  className="underline underline-offset-4"
                >
                  indir
                </a>
              </p>
            )}
            {approved ? null : (
              <div className="mt-4">
                {commitment.generatedPdfUrl ? (
                  <UploadForm replacing={commitment.status === "yuklendi"} />
                ) : (
                  <p className="text-soluk">Yükleme, taahhütnameyi indirdikten sonra açılır.</p>
                )}
              </div>
            )}
          </li>
        </ol>
      </div>
    </section>
  );
}
