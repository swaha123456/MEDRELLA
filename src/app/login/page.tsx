import Link from "next/link";
import { LoginForm } from "../forms";
export default function Page() {
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-4 text-2xl font-semibold">Sign in</h1>
      <LoginForm />
      <p className="mt-4 text-center text-sm text-slate-600">New here? <Link href="/register" className="text-brand underline">Create an account</Link></p>
    </div>
  );
}
