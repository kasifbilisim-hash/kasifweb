import "server-only";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { del, get, put } from "@vercel/blob";

/*
 * Dosya depolama. Tüm dosyalar ÖZEL tutulur; erişim yalnızca /api/dosya üzerinden, oturum ve firma
 * sahipliği kontrolüyle verilir. Veritabanında URL değil `pathname` saklanır.
 *   - BLOB_READ_WRITE_TOKEN varsa: Vercel Blob (access: "private")
 *   - yoksa ve geliştirme ortamındaysa: .uploads/ klasörü
 *   - yoksa ve canlıdaysa: hata (sessizce yerel diske yazmayız)
 */

const LOCAL_ROOT = path.resolve(process.cwd(), ".uploads");

function blobEnabled(): boolean {
  if (process.env.BLOB_READ_WRITE_TOKEN) return true;
  if (process.env.NODE_ENV === "production") {
    throw new Error("BLOB_READ_WRITE_TOKEN tanımlı değil. Canlıda dosya depolaması kapalı.");
  }
  return false;
}

/** Yerel modda pathname'in LOCAL_ROOT dışına çıkmasını engeller. */
function localPath(pathname: string): string {
  const full = path.resolve(LOCAL_ROOT, pathname);
  if (full !== LOCAL_ROOT && !full.startsWith(LOCAL_ROOT + path.sep)) {
    throw new Error("Geçersiz dosya yolu");
  }
  return full;
}

export async function saveFile(pathname: string, bytes: Uint8Array, contentType: string): Promise<void> {
  if (blobEnabled()) {
    await put(pathname, Buffer.from(bytes), {
      access: "private",
      contentType,
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return;
  }
  const full = localPath(pathname);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, bytes);
  await writeFile(full + ".type", contentType);
}

export type StoredFile = { stream: ReadableStream<Uint8Array>; contentType: string; size: number };

export async function readStoredFile(pathname: string): Promise<StoredFile | null> {
  if (blobEnabled()) {
    const result = await get(pathname, { access: "private" });
    if (!result || result.statusCode !== 200) return null;
    return { stream: result.stream, contentType: result.blob.contentType, size: result.blob.size };
  }
  const full = localPath(pathname);
  try {
    const [info, type] = await Promise.all([
      stat(full),
      readFile(full + ".type", "utf8").catch(() => "application/octet-stream"),
    ]);
    return {
      stream: Readable.toWeb(Readable.from(await readFile(full))) as ReadableStream<Uint8Array>,
      contentType: type,
      size: info.size,
    };
  } catch {
    return null;
  }
}

export async function removeFile(pathname: string): Promise<void> {
  if (blobEnabled()) {
    await del(pathname);
    return;
  }
  const full = localPath(pathname);
  await rm(full, { force: true });
  await rm(full + ".type", { force: true });
}

/** Bir firmanın dosya yolu öneki. Erişim kontrolü bu önekle yapılır. */
export const companyPrefix = (companyId: string) => `companies/${companyId}/`;
