import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/** Giriş yapmış kullanıcıyı döndürür, yoksa /giris'e yönlendirir. */
export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/giris");
  return session.user;
}

/** Yalnızca admin. Müşteri /panel'e, ziyaretçi /giris'e gider. */
export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/panel");
  return user;
}
