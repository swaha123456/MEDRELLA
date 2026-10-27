import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type Session = { uid: string; role: "patient" | "doctor"; name: string };
const key = () => new TextEncoder().encode(process.env.AUTH_SECRET ?? "dev-secret-change-me");

export async function createSession(s: Session) {
  const token = await new SignJWT({ ...s }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("7d").sign(key());
  cookies().set("session", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
}
export async function getSession(): Promise<Session | null> {
  const t = cookies().get("session")?.value;
  if (!t) return null;
  try { return (await jwtVerify(t, key())).payload as unknown as Session; } catch { return null; }
}
export async function requireRole(role: Session["role"]) {
  const s = await getSession();
  if (!s) redirect("/login");
  if (s.role !== role) redirect(s.role === "doctor" ? "/doctor" : "/patient");
  return s;
}
