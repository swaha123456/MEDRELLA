import Link from "next/link";
import { RegisterForm } from "../forms";
export default function Page() {
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-4 text-2xl font-semibold">Create your account</h1>
      <RegisterForm />
      <p className="mt-4 text-center text-sm text-slate-600">Have an account? <Link href="/login" className="text-brand underline">Sign in</Link></p>
    </div>
  );
}
