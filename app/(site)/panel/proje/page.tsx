import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { Suspense } from "react";
import { db, schema } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { getPanelData } from "@/lib/panel-data";
import { requireUser } from "@/lib/session";
import { PreviewForm } from "./preview-form";

export const metadata: Metadata = { title: "Proje", robots: { index: false } };

const STAGES: [string, string][] = [
  ["bilgi_bekleniyor", "Bilgileriniz bekleniyor"],
  ["taahhutname_bekleniyor", "Taahhütname bekleniyor"],
  ["tasarim", "Tasarım"],
  ["musteri_onayi", "Onayınız bekleniyor"],
  ["gelistirme", "Geliştirme"],
  ["yayinda", "Yayında"],
];

export default function ProjePage() {
  return (
    <Suspense fallback={<p className="mx-auto max-w-6xl px-5 py-16">Yükleniyor</p>}>
      <Content />
    </Suspense>
  );
}

/** Yalnızca http(s) adresleri bağlantı olarak gösterilir. */
function safeHttpUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    const u = new URL(value);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}

async function Content() {
  const user = await requireUser();
  const data = await getPanelData(user.id);

  if (!data?.subscription || !data.project) {
    return (
      <section className="mx-auto max-w-6xl px-5 py-14">
        <h1 className="display text-4xl text-emaye sm:text-5xl">Proje</h1>
        <p className="mt-6 max-w-xl text-xl">
          Projeniz aboneliğinizden sonra başlar.{" "}
          <Link href="/paketler" className="underline underline-offset-4">Paketlere göz atın</Link>.
        </p>
      </section>
    );
  }

  const { project } = data;
  const events = await db
    .select()
    .from(schema.projectEvents)
    .where(eq(schema.projectEvents.projectId, project.id))
    .orderBy(desc(schema.projectEvents.createdAt));
  const currentIdx = STAGES.findIndex(([k]) => k === project.stage);
  const preview = safeHttpUrl(project.previewUrl);

  return (
    <section className="mx-auto grid max-w-6xl gap-12 px-5 py-14 md:grid-cols-[1fr_1.3fr]">
      <div>
        <h1 className="display text-4xl text-emaye sm:text-5xl">Proje</h1>
        <ol className="mt-8 border-l-4 border-murekkep">
          {STAGES.map(([key, label], i) => {
            const done = currentIdx > i || project.stage === "yayinda";
            const current = key === project.stage;
            return (
              <li
                key={key}
                aria-current={current ? "step" : undefined}
                className={`-ml-1 border-l-4 py-2 pl-4 ${current ? "border-tabela bg-tabela/30" : done ? "border-emaye" : "border-transparent text-soluk"}`}
              >
                {label}
                {done ? <span className="sr-only"> (tamamlandı)</span> : null}
              </li>
            );
          })}
        </ol>
        {project.stage === "sonlandirildi" && <p className="mt-6">Proje sonlandırıldı.</p>}
      </div>

      <div className="space-y-10">
        {project.stage === "musteri_onayi" && (
          <div className="levha space-y-5 bg-beyaz p-6">
            <h2 className="ui text-2xl">Tasarım onayınızı bekliyor</h2>
            {preview ? (
              <a href={preview} target="_blank" rel="noopener noreferrer" className="ui inline-block bg-tabela px-6 py-3 hover:bg-murekkep hover:text-beyaz">
                Önizlemeyi aç (yeni sekme)
              </a>
            ) : (
              <p className="text-soluk">Önizleme bağlantısı henüz eklenmedi, ekibimiz ekleyince burada görünür.</p>
            )}
            <PreviewForm />
          </div>
        )}

        {project.notes ? (
          <div>
            <h2 className="ui text-2xl">Ekibimizden not</h2>
            <p className="mt-2 max-w-prose whitespace-pre-wrap">{project.notes}</p>
          </div>
        ) : null}

        <div>
          <h2 className="ui text-2xl">Geçmiş</h2>
          {events.length === 0 ? (
            <p className="mt-3 text-soluk">Henüz kayıt yok.</p>
          ) : (
            <ul className="mt-3 divide-y-2 divide-murekkep border-y-2 border-murekkep">
              {events.map((e) => (
                <li key={e.id} className="py-3">
                  <p className="text-soluk">{formatDateTime(e.createdAt)}</p>
                  <p className="whitespace-pre-wrap">{e.description}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
