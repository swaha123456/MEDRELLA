import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db, appointments, doctors, users } from "@/db";
import { requireRole } from "@/lib/auth";
import { fmt, badge } from "@/lib/slots";
import { setStatus } from "../actions";

export const dynamic = "force-dynamic";

export default async function PatientDashboard({ searchParams }: { searchParams: { booked?: string } }) {
  const s = await requireRole("patient");
  const rows = await db.select({ a: appointments, doctor: users.name, specialty: doctors.specialty })
    .from(appointments).innerJoin(doctors, eq(doctors.id, appointments.doctorId)).innerJoin(users, eq(users.id, doctors.userId))
    .where(eq(appointments.patientId, s.uid)).orderBy(desc(appointments.startsAt));
  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My appointments</h1>
        <Link href="/" className="btn">Book new</Link>
      </div>
      {searchParams.booked && <p className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">Appointment booked successfully.</p>}
      <div className="space-y-3">
        {rows.map(({ a, doctor, specialty }) => (
          <div key={a.id} className="card flex items-center justify-between">
            <div>
              <p className="font-medium">Dr. {doctor} <span className="text-sm text-slate-500">· {specialty}</span></p>
              <p className="text-sm text-slate-600">{fmt(a.startsAt)}{a.reason && ` — ${a.reason}`}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${badge[a.status]}`}>{a.status}</span>
              {a.status === "booked" && (
                <form action={setStatus}><input type="hidden" name="id" value={a.id} /><input type="hidden" name="status" value="cancelled" /><button className="btn-ghost">Cancel</button></form>
              )}
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="text-slate-500">No appointments yet. <Link href="/" className="text-brand underline">Find a doctor</Link>.</p>}
      </div>
    </>
  );
}
