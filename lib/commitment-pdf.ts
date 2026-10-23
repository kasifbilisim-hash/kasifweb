import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";

/*
 * Taahhütname PDF'i. Metin docs/taahhutname.md şablonundan gelir:
 *   "# " belge başlığı, "## " madde başlığı, boş satır paragraf ayırır, {{alan}} yer tutucudur.
 * Türkçe karakterler (ş, ğ, İ, ı) için DejaVu Sans gömülür (assets/fonts, Bitstream Vera lisansı).
 */

export type CommitmentFields = {
  legal_name: string;
  tax_office: string;
  tax_number: string;
  address: string;
  city: string;
  contact_name: string;
  package_name: string;
  monthly_price: string;
  commitment_months: string;
  provider_details: string;
};

const PAGE = { w: 595.28, h: 841.89, margin: 56 };
const SIZES = { title: 20, h2: 12.5, body: 10.5, small: 8.5 };

export function fillTemplate(template: string, fields: CommitmentFields): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    if (!(key in fields)) throw new Error(`Şablonda bilinmeyen alan: {{${key}}}`);
    return fields[key as keyof CommitmentFields];
  });
}

/** Metni verilen genişliğe göre satırlara böler (kelime sınırında; çok uzun kelimeyi harften keser). */
export function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = "";
  const push = () => {
    lines.push(line);
    line = "";
  };
  for (const word of text.split(/\s+/).filter(Boolean)) {
    let candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      line = candidate;
      continue;
    }
    if (line) push();
    candidate = word;
    while (font.widthOfTextAtSize(candidate, size) > maxWidth) {
      let cut = candidate.length - 1;
      while (cut > 1 && font.widthOfTextAtSize(candidate.slice(0, cut), size) > maxWidth) cut--;
      lines.push(candidate.slice(0, cut));
      candidate = candidate.slice(cut);
    }
    line = candidate;
  }
  if (line) push();
  return lines;
}

export async function loadTemplate(): Promise<string> {
  return readFile(path.join(process.cwd(), "docs", "taahhutname.md"), "utf8");
}

async function loadFonts(pdf: PDFDocument) {
  pdf.registerFontkit(fontkit);
  const dir = path.join(process.cwd(), "assets", "fonts");
  const [regular, bold] = await Promise.all([
    readFile(path.join(dir, "DejaVuSans.ttf")),
    readFile(path.join(dir, "DejaVuSans-Bold.ttf")),
  ]);
  return { regular: await pdf.embedFont(regular, { subset: true }), bold: await pdf.embedFont(bold, { subset: true }) };
}

export async function generateCommitmentPdf(fields: CommitmentFields, generatedAt: Date): Promise<Uint8Array> {
  const filled = fillTemplate(await loadTemplate(), fields);
  const pdf = await PDFDocument.create();
  pdf.setTitle("Taahhütname");
  pdf.setProducer("Kaşif Yazılım");
  const font = await loadFonts(pdf);

  const contentWidth = PAGE.w - PAGE.margin * 2;
  const footerText = `${fields.legal_name} | Kaşif Yazılım taahhütnamesi | ${new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "long",
    timeZone: "Europe/Istanbul",
  }).format(generatedAt)}`;

  let page!: PDFPage;
  let y = 0;
  const newPage = () => {
    page = pdf.addPage([PAGE.w, PAGE.h]);
    y = PAGE.h - PAGE.margin;
  };
  const ensure = (needed: number) => {
    if (y - needed < PAGE.margin + 24) newPage();
  };
  const draw = (text: string, f: PDFFont, size: number, gap: number, color = rgb(0.1, 0.1, 0.09)) => {
    const lh = size * 1.45;
    for (const line of wrapText(text, f, size, contentWidth)) {
      ensure(lh);
      y -= lh;
      page.drawText(line, { x: PAGE.margin, y, size, font: f, color });
    }
    y -= gap;
  };

  newPage();
  for (const block of filled.split(/\n{2,}/)) {
    const text = block.trim();
    if (!text) continue;
    if (text.startsWith("## ")) {
      ensure(40);
      y -= 6;
      draw(text.slice(3), font.bold, SIZES.h2, 4);
    } else if (text.startsWith("# ")) {
      draw(text.slice(2), font.bold, SIZES.title, 10);
    } else {
      // Aynı bloktaki satırlar ayrı satır olarak korunur (taraf bilgileri gibi)
      for (const line of text.split("\n")) draw(line.trim(), font.regular, SIZES.body, 2);
      y -= 6;
    }
  }

  // İmza alanı: bölünmesin diye gerekirse yeni sayfa
  ensure(150);
  y -= 24;
  const boxW = contentWidth / 2;
  page.drawRectangle({ x: PAGE.margin, y: y - 110, width: boxW, height: 110, borderColor: rgb(0.1, 0.1, 0.09), borderWidth: 1 });
  page.drawText("Müşteri: kaşe ve imza", { x: PAGE.margin + 8, y: y - 16, size: SIZES.small, font: font.regular, color: rgb(0.33, 0.33, 0.31) });

  pdf.getPages().forEach((p, i, all) => {
    p.drawText(`${footerText}   Sayfa ${i + 1}/${all.length}`, {
      x: PAGE.margin,
      y: PAGE.margin - 20,
      size: SIZES.small,
      font: font.regular,
      color: rgb(0.33, 0.33, 0.31),
    });
  });

  return pdf.save();
}
