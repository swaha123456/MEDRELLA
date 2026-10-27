import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { logout } from "./actions";

export const metadata: Metadata = {
  title: "Medrella — Book a doctor",
  description: "Appointment booking for patients and doctors",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const s = await getSession();
  return (
    <html lang="en">
      <body>
        <header className="bg-brand-dark text-white">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-lg font-semibold">
              m+medrella.
            </Link>
            <div className="flex items-center gap-4 text-sm">
              {s ? (
                <>
                  <Link href={s.role === "doctor" ? "/doctor" : "/patient"}>
                    Dashboard
                  </Link>
                  <span className="opacity-70">{s.name}</span>
                  <form action={logout}>
                    <button className="rounded-lg border border-white/40 px-3 py-1">
                      Sign out
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/login">Sign in</Link>
                  <Link
                    href="/register"
                    className="rounded-lg bg-white px-3 py-1 font-medium text-brand-dark"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </nav>
        </header>
        <main className="w-full min-h-screen bg-slate-50">{children}</main>{" "}
      </body>
    </html>
  );
}
