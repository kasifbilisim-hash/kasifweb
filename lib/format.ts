// Tarihler UTC saklanır, Europe/Istanbul gösterilir.
const date = new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", day: "numeric", month: "long", year: "numeric" });
const dateTime = new Intl.DateTimeFormat("tr-TR", {
  timeZone: "Europe/Istanbul",
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export const formatDate = (d: Date) => date.format(d);
export const formatDateTime = (d: Date) => dateTime.format(d);
