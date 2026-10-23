import { z } from "zod";

/** 05XX, 5XX, +905XX, 905XX biçimlerini +905XXXXXXXXX'e çevirir; geçersizse null. */
export function normalizeTrPhone(input: string): string | null {
  const digits = input.replace(/[^\d]/g, "");
  const local = digits.startsWith("90") ? digits.slice(2) : digits.startsWith("0") ? digits.slice(1) : digits;
  return /^5\d{9}$/.test(local) ? `+90${local}` : null;
}

const checked = z.literal("on", { error: "Onaylamanız gerekiyor." });

export const checkoutSchema = z.object({
  slug: z.string().min(1).max(50),
  legalName: z.string().trim().min(2, "Firma unvanını yazın.").max(200),
  taxOffice: z.string().trim().min(2, "Vergi dairesini yazın.").max(100),
  taxNumber: z.string().trim().regex(/^\d{10,11}$/, "Vergi numarası 10, T.C. kimlik numarası 11 haneli olmalı."),
  address: z.string().trim().min(10, "Açık adresi yazın.").max(500),
  city: z.string().trim().min(2, "İli yazın.").max(100),
  contactName: z
    .string()
    .trim()
    .max(150)
    .refine((v) => v.split(/\s+/).length >= 2, "Yetkilinin adını ve soyadını yazın."),
  contactPhone: z
    .string()
    .trim()
    .refine((v) => normalizeTrPhone(v) !== null, "Cep telefonu numarasını 05XX XXX XX XX biçiminde yazın."),
  identityNumber: z.string().trim().regex(/^\d{11}$/, "T.C. kimlik numarası 11 haneli olmalı."),
  mesafeli_satis: checked,
  on_bilgilendirme: checked,
  kvkk: checked,
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type CheckoutField = keyof CheckoutInput;
