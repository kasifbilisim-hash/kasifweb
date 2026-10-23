import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { Suspense } from "react";
import { db, schema } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Denetim kaydı", robots: { index: false } };

export default function DenetimPage() {
  return (
    <Suspense fallback={<p className="mx-auto max-w-6xl px-5 py-16">Yükleniyor</p>}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  await requireAdmin();
  const rows = await db
    .select({ log: schema.auditLog, email: schema.user.email })
    .from(schema.auditLog)
    .leftJoin(schema.user, eq(schema.user.id, schema.auditLog.actorUserId))
    .orderBy(desc(schema.auditLog.createdAt))
    .limit(200);

  return (
    <section className="mx-auto max-w-6xl px-5 py-14">
      <h1 className="display text-4xl text-emaye sm:text-5xl">Denetim kaydı</h1>
      <p className="mt-4 text-soluk">Son 200 kayıt. Yönetici işlemleri ve abonelik durum değişiklikleri. &quot;Sistem&quot;, webhook ve otomatik işlemlerdir.</p>
      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[44rem] border-y-2 border-murekkep text-left">
          <caption className="sr-only">Denetim kaydı</caption>
          <thead>
            <tr className="border-b-2 border-murekkep">
              <th scope="col" className="ui py-3 pr-4">Zaman</th>
              <th scope="col" className="ui py-3 pr-4">Kim</th>
              <th scope="col" className="ui py-3 pr-4">İşlem</th>
              <th scope="col" className="ui py-3">Ayrıntı</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-murekkep align-top">
            {rows.map(({ log, email }) => (
              <tr key={log.id}>
                <td className="py-3 pr-4 whitespace-nowrap">{formatDateTime(log.createdAt)}</td>
                <td className="py-3 pr-4">{email ?? "Sistem"}</td>
                <td className="py-3 pr-4">{log.action}</td>
                <td className="py-3">
                  <span className="text-soluk">{log.targetTable}{log.targetId ? ` · ${log.targetId.slice(0, 8)}` : ""}</span>
                  {log.details ? (
                    <details className="mt-1">
                      <summary className="cursor-pointer underline underline-offset-4">Ayrıntı</summary>
                      <pre className="mt-2 max-w-md overflow-x-auto whitespace-pre-wrap text-sm">{JSON.stringify(log.details, null, 2)}</pre>
                    </details>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
