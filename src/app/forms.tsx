"use client";
import { useFormState, useFormStatus } from "react-dom";
import { useState } from "react";
import { login, register } from "./actions";

function Submit({ children }: { children: string }) {
  const { pending } = useFormStatus();
  return <button className="btn w-full" disabled={pending}>{pending ? "Please wait…" : children}</button>;
}
const Err = ({ msg }: { msg?: string }) => (msg ? <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{msg}</p> : null);

export function LoginForm() {
  const [st, action] = useFormState(login, {});
  return (
    <form action={action} className="card space-y-4">
      <Err msg={st.error} />
      <div><label className="label">Email</label><input name="email" type="email" required className="input" /></div>
      <div><label className="label">Password</label><input name="password" type="password" required className="input" /></div>
      <Submit>Sign in</Submit>
    </form>
  );
}

export function RegisterForm() {
  const [st, action] = useFormState(register, {});
  const [role, setRole] = useState("patient");
  return (
    <form action={action} className="card space-y-4">
      <Err msg={st.error} />
      <div className="grid grid-cols-2 gap-2">
        {["patient", "doctor"].map((r) => (
          <label key={r} className={`cursor-pointer rounded-lg border p-2 text-center text-sm capitalize ${role === r ? "border-brand bg-brand-light" : "border-slate-300"}`}>
            <input type="radio" name="role" value={r} checked={role === r} onChange={() => setRole(r)} className="sr-only" />I&apos;m a {r}
          </label>
        ))}
      </div>
      <div><label className="label">Full name</label><input name="name" required className="input" /></div>
      <div><label className="label">Email</label><input name="email" type="email" required className="input" /></div>
      <div><label className="label">Phone (optional)</label><input name="phone" className="input" /></div>
      {role === "doctor" && <div><label className="label">Specialty</label><input name="specialty" placeholder="e.g. Cardiology" className="input" /></div>}
      <div><label className="label">Password</label><input name="password" type="password" minLength={8} required className="input" /></div>
      <Submit>Create account</Submit>
    </form>
  );
}
