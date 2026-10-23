"use client";

import { useActionState } from "react";
import { createPackage, deletePackage, updatePackage, type PackageState, type PackageValues } from "./actions";

const box = "mt-1.5 w-full border-2 border-murekkep bg-duvar px-3 py-2 focus-visible:outline-tabela";

export type PackageRow = { id: string; slug: string; values: PackageValues; canDelete: boolean; planRef: string | null };

export const emptyValues: PackageValues = { name: "", description: "", features: "", price: "", sortOrder: "0", active: true, featured: false, includesAds: false, billingType: "subscription", domainFeeExtra: true, domainFee: "" };

function Fields({ v, e, p }: { v: PackageValues; e: Record<string, string>; p: string }) {
  const err = (k: string) => (e[k] ? <p id={`${p}-${k}-err`} className="mt-1 text-red-800">{e[k]}</p> : null);
  const d = (k: string) => (e[k] ? `${p}-${k}-err` : undefined);
  return (
    <>
      <div>
        <label htmlFor={`${p}-name`} className="ui">Ad</label>
        <input id={`${p}-name`} name="name" defaultValue={v.name} aria-invalid={!!e.name} aria-describedby={d("name")} className={box} />
        {err("name")}
      </div>
      <div>
        <label htmlFor={`${p}-description`} className="ui">Kısa özet</label>
        <textarea id={`${p}-description`} name="description" rows={2} defaultValue={v.description} aria-invalid={!!e.description} aria-describedby={d("description")} className={box} />
        {err("description")}
      </div>
      <div>
        <label htmlFor={`${p}-features`} className="ui">Pakete dahil olanlar</label>
        <p className="text-sm text-soluk">Her satır bir madde. Pakette ve fiyat sayfasında liste olarak görünür.</p>
        <textarea id={`${p}-features`} name="features" rows={6} defaultValue={v.features} aria-invalid={!!e.features} aria-describedby={d("features")} className={box} />
        {err("features")}
      </div>
      <div>
        <label htmlFor={`${p}-billingType`} className="ui">Ödeme biçimi</label>
        <select id={`${p}-billingType`} name="billingType" defaultValue={v.billingType} aria-invalid={!!e.billingType} aria-describedby={d("billingType")} className={box}>
          <option value="subscription">Aylık abonelik (12 ay taahhüt, otomatik çekim)</option>
          <option value="one_time">Tek seferlik ödeme</option>
        </select>
        <p className="mt-1 text-sm text-soluk">Tek seferlik paketlerde abonelik başlatılmaz; sitede &quot;Teklif al&quot; düğmesi görünür.</p>
        {err("billingType")}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${p}-price`} className="ui">{v.billingType === "one_time" ? "Fiyat (TL, tek seferlik)" : "Aylık fiyat (TL)"}</label>
          <input id={`${p}-price`} name="price" inputMode="decimal" defaultValue={v.price} aria-invalid={!!e.price} aria-describedby={d("price")} className={box} />
          {err("price")}
          <p className="mt-1 text-sm text-soluk">Boşsa fiyat belirlenmemiştir, abonelik açılmaz.</p>
        </div>
        <div>
          <label htmlFor={`${p}-sortOrder`} className="ui">Sıra</label>
          <input id={`${p}-sortOrder`} name="sortOrder" inputMode="numeric" defaultValue={v.sortOrder} aria-invalid={!!e.sortOrder} aria-describedby={d("sortOrder")} className={box} />
          {err("sortOrder")}
        </div>
      </div>
      <div>
        <label htmlFor={`${p}-domainFee`} className="ui">Yıllık alan adı ücreti (TL, isteğe bağlı)</label>
        <input id={`${p}-domainFee`} name="domainFee" inputMode="decimal" defaultValue={v.domainFee} aria-invalid={!!e.domainFee} aria-describedby={e.domainFee ? `${p}-domainFee-err` : `${p}-domainFee-hint`} className={box} />
        <p id={`${p}-domainFee-hint`} className="mt-1 text-sm text-soluk">Yazarsanız fiyatın altında &quot;+ alan adı ücreti: X TL / yıl&quot; görünür. Boşsa &quot;kayıttan önce bildirilir&quot; yazar.</p>
        {err("domainFee")}
      </div>
      <fieldset className="space-y-2">
        <legend className="ui">Ayarlar</legend>
        <label className="flex items-center gap-2"><input type="checkbox" name="domainFeeExtra" defaultChecked={v.domainFeeExtra} className="h-4 w-4 accent-emaye" /> Alan adı ücreti ayrıca (sitede &quot;+ alan adı ücreti&quot; gösterilir)</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="active" defaultChecked={v.active} className="h-4 w-4 accent-emaye" /> Sitede göster, yeni abone al</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="featured" defaultChecked={v.featured} className="h-4 w-4 accent-emaye" /> Öne çıkar</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="includesAds" defaultChecked={v.includesAds} className="h-4 w-4 accent-emaye" /> Google Ads yönetimi içerir (başlangıç formuna reklam adımı ekler)</label>
      </fieldset>
    </>
  );
}

export function PackageForm({ pkg }: { pkg: PackageRow }) {
  const [state, action, pending] = useActionState<PackageState, FormData>(updatePackage.bind(null, pkg.id), {});
  const v = state.values ?? pkg.values;

  return (
    <div className="space-y-4">
      <form key={state.version ?? 0} action={action} className="space-y-4" noValidate>
        <Fields v={v} e={state.errors ?? {}} p={`p-${pkg.id}`} />
        {state.message ? <p role={state.ok ? "status" : "alert"} className={state.ok ? "text-emaye" : "text-red-800"}>{state.message}</p> : null}
        <button type="submit" disabled={pending} className="ui bg-emaye px-6 py-3 text-beyaz hover:bg-murekkep disabled:opacity-60">
          {pending ? "Kaydediliyor" : "Kaydet"}
        </button>
      </form>
      {pkg.canDelete ? (
        <form action={deletePackage.bind(null, pkg.id)}>
          <button type="submit" className="text-sm text-red-800 underline underline-offset-4">Paketi sil (aboneliği yok)</button>
        </form>
      ) : (
        <p className="text-sm text-soluk">Aboneliği olan paket silinemez; sitede göstermemek için pasife alın.</p>
      )}
    </div>
  );
}

export function NewPackageForm() {
  const [state, action, pending] = useActionState<PackageState, FormData>(createPackage, {});
  return (
    <form key={state.version ?? 0} action={action} className="space-y-4" noValidate>
      <Fields v={state.values ?? emptyValues} e={state.errors ?? {}} p="new" />
      {state.message ? <p role="alert" className="text-red-800">{state.message}</p> : null}
      <button type="submit" disabled={pending} className="ui bg-emaye px-6 py-3 text-beyaz hover:bg-murekkep disabled:opacity-60">
        {pending ? "Ekleniyor" : "Paketi ekle"}
      </button>
    </form>
  );
}
