import "server-only";
import { randomUUID } from "node:crypto";
import { companyPrefix, saveFile } from "@/lib/storage";

export const MAX_UPLOAD_BYTES = 3.5 * 1024 * 1024;

export type FileKind = "pdf" | "jpg" | "png" | "webp";

const MIME: Record<FileKind, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

/** İçeriğe (magic bytes) bakar; dosya adına ya da istemcinin bildirdiği türe güvenmez. */
export function sniffFileKind(b: Uint8Array): FileKind | null {
  const starts = (...sig: number[]) => sig.every((v, i) => b[i] === v);
  if (starts(0x25, 0x50, 0x44, 0x46)) return "pdf"; // %PDF
  if (starts(0xff, 0xd8, 0xff)) return "jpg";
  if (starts(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return "png";
  if (starts(0x52, 0x49, 0x46, 0x46) && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return "webp";
  return null;
}

export type UploadResult =
  | { ok: true; file: { path: string; name: string; size: number } }
  | { ok: false; error: string };

/** Yükleneni doğrular ve firmanın klasörüne yazar. `allowed` dışındaki türler reddedilir. */
export async function storeUpload(args: {
  companyId: string;
  folder: string;
  file: unknown;
  allowed: FileKind[];
}): Promise<UploadResult> {
  const { file } = args;
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Dosya seçin." };
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false, error: "Dosya 3,5 MB'tan büyük olamaz." };

  const bytes = new Uint8Array(await file.arrayBuffer());
  const kind = sniffFileKind(bytes);
  if (!kind || !args.allowed.includes(kind)) {
    const names = args.allowed.map((k) => (k === "jpg" ? "JPG" : k.toUpperCase())).join(", ");
    return { ok: false, error: `Dosya türü kabul edilmiyor. İzin verilen: ${names}.` };
  }

  // Yol dosya adından türetilmez; yalnızca rastgele kimlik + sniff edilen uzantı.
  const pathname = `${companyPrefix(args.companyId)}${args.folder}/${randomUUID()}.${kind}`;
  await saveFile(pathname, bytes, MIME[kind]);
  const name = file.name.replace(/[^\p{L}\p{N}._ -]/gu, "").slice(0, 120) || `dosya.${kind}`;
  return { ok: true, file: { path: pathname, name, size: file.size } };
}
