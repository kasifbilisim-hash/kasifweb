"use client";

import { useActionState } from "react";
import { createPost, deletePost, updatePost, type PostState, type PostValues } from "./actions";

const box = "mt-1.5 w-full border-2 border-murekkep bg-duvar px-3 py-2 focus-visible:outline-tabela";

export const emptyPost: PostValues = { title: "", slug: "", excerpt: "", category: "Genel", body: "", published: false };

function Fields({ v, e }: { v: PostValues; e: Record<string, string> }) {
  const err = (k: string) => (e[k] ? <p id={`${k}-err`} className="mt-1 text-red-800">{e[k]}</p> : null);
  const d = (k: string) => (e[k] ? `${k}-err` : undefined);
  return (
    <>
      <div>
        <label htmlFor="title" className="ui">Başlık</label>
        <input id="title" name="title" defaultValue={v.title} aria-invalid={!!e.title} aria-describedby={d("title")} className={box} />
        {err("title")}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="slug" className="ui">Adres (boşsa başlıktan üretilir)</label>
          <input id="slug" name="slug" defaultValue={v.slug} placeholder="ornek-yazi-adresi" aria-invalid={!!e.slug} aria-describedby={d("slug")} className={box} />
          {err("slug")}
        </div>
        <div>
          <label htmlFor="category" className="ui">Kategori</label>
          <input id="category" name="category" defaultValue={v.category} aria-invalid={!!e.category} aria-describedby={d("category")} className={box} />
          {err("category")}
        </div>
      </div>
      <div>
        <label htmlFor="excerpt" className="ui">Özet</label>
        <p className="text-sm text-soluk">Liste, ana sayfa ve Google sonuçlarında görünür. En fazla 300 karakter.</p>
        <textarea id="excerpt" name="excerpt" rows={3} defaultValue={v.excerpt} aria-invalid={!!e.excerpt} aria-describedby={d("excerpt")} className={box} />
        {err("excerpt")}
      </div>
      <div>
        <label htmlFor="body" className="ui">Metin (Markdown)</label>
        <p className="text-sm text-soluk">
          Başlık: <code>## Başlık</code> · kalın: <code>**metin**</code> · liste: satır başında <code>- </code> · bağlantı: <code>[yazı](/paketler)</code>. Ham HTML çalışmaz.
        </p>
        <textarea id="body" name="body" rows={22} defaultValue={v.body} aria-invalid={!!e.body} aria-describedby={d("body")} className={`${box} font-mono text-sm leading-relaxed`} />
        {err("body")}
      </div>
      <label className="flex items-center gap-2">
        <input type="checkbox" name="published" defaultChecked={v.published} className="h-4 w-4 accent-emaye" /> Yayında (işaretli değilse taslak, sitede görünmez)
      </label>
    </>
  );
}

export function NewPostForm() {
  const [state, action, pending] = useActionState<PostState, FormData>(createPost, {});
  return (
    <form key={state.version ?? 0} action={action} className="max-w-4xl space-y-5" noValidate>
      <Fields v={state.values ?? emptyPost} e={state.errors ?? {}} />
      {state.message ? <p role="alert" className="text-red-800">{state.message}</p> : null}
      <button type="submit" disabled={pending} className="ui bg-emaye px-6 py-3 text-beyaz hover:bg-murekkep disabled:opacity-60">{pending ? "Kaydediliyor" : "Oluştur"}</button>
    </form>
  );
}

export function EditPostForm({ id, values }: { id: string; values: PostValues }) {
  const [state, action, pending] = useActionState<PostState, FormData>(updatePost.bind(null, id), {});
  return (
    <div className="max-w-4xl space-y-6">
      <form key={state.version ?? 0} action={action} className="space-y-5" noValidate>
        <Fields v={state.values ?? values} e={state.errors ?? {}} />
        {state.message ? <p role={state.errors ? "alert" : "status"} className={state.errors || !state.message.startsWith("Kaydedildi") ? "text-red-800" : "text-emaye"}>{state.message}</p> : null}
        <button type="submit" disabled={pending} className="ui bg-emaye px-6 py-3 text-beyaz hover:bg-murekkep disabled:opacity-60">{pending ? "Kaydediliyor" : "Kaydet"}</button>
      </form>
      <form action={deletePost.bind(null, id)}>
        <button type="submit" className="text-sm text-red-800 underline underline-offset-4">Yazıyı sil (geri alınamaz)</button>
      </form>
    </div>
  );
}
