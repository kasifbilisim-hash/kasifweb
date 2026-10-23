/** Better Auth hata kodlarını Türkçe kullanıcı mesajına çevirir. */
const messages: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "E-posta veya şifre hatalı.",
  USER_ALREADY_EXISTS: "Bu e-posta ile zaten bir hesap var. Giriş yapmayı deneyin.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "Bu e-posta ile zaten bir hesap var. Giriş yapmayı deneyin.",
  PASSWORD_TOO_SHORT: "Şifre en az 8 karakter olmalı.",
  INVALID_TOKEN: "Bağlantı geçersiz veya süresi dolmuş. Yeni bir bağlantı isteyin.",
  INVALID_EMAIL: "Geçerli bir e-posta yazın.",
};

export function authErrorMessage(error: { code?: string } | null | undefined): string {
  return (error?.code && messages[error.code]) || "İşlem tamamlanamadı. Biraz sonra tekrar deneyin.";
}
