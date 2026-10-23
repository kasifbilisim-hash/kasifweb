import { addMonthsUTC } from "@/lib/dates";

/**
 * Tahmini sonraki çekim tarihi: başlangıç + (başarılı ödeme sayısı) ay.
 * Taahhüt bitişine ulaşıldıysa ya da abonelik başlamadıysa null. Kesin tarih iyzico'dadır;
 * bu yalnızca panelde gösterilen tahmindir.
 */
export function estimateNextPayment(args: {
  startedAt: Date | null;
  commitmentEndsAt: Date | null;
  successfulPayments: number;
}): Date | null {
  if (!args.startedAt) return null;
  const next = addMonthsUTC(args.startedAt, args.successfulPayments);
  if (args.commitmentEndsAt && next.getTime() >= args.commitmentEndsAt.getTime()) return null;
  return next;
}
