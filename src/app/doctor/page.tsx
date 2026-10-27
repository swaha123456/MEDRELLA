import { asc, eq } from "drizzle-orm";
import { db, appointments, doctors, users } from "@/db";
import { requireRole } from "@/lib/auth";
import { fmt, dayRange, nextDates, badge } from "@/lib/slots";
import { saveProfile, setStatus } from "../actions";

export const dynamic = "force-dynamic";
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default async function DoctorDashboard() {
  const s = await requireRole("doctor");
  const [doc] = await db.select().from(doctors).where(eq(doctors.userId, s.uid));
  const rows = await db.select({ a: appointments, patient: users.name, phone: users.phone, email: users.email })
    .from(appointments).innerJoin(users, eq(users.id, appointments.patientId))
    .where(eq(appointments.doctorId, doc.id)).orderBy(asc(appointments.startsAt));
  const { start, end } = dayRange(nextDates(1)[0]);
  const active = rows.filter((r) => r.a.status === "booked");
  const today = active.filter((r) => r.a.startsAt >= start && r.a.startsAt <= end).length;
  const days = doc.workDays.split(",");

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Dr. {s.name}&apos;s dashboard</h1>
      <div className="grid grid-cols-3 gap-4">
        {[["Today", today], ["Upcoming", active.length], ["Total", rows.length]].map(([l, n]) => (
          <div key={l} className="card"><p className="text-sm text-slate-500">{l}</p><p className="text-2xl font-semibold">{n}</p></div>
        ))}
      </div>
      <section>
        <h2 className="mb-3 font-semibold">Appointments</h2>
        <div className="space-y-3">
          {rows.map(({ a, patient, phone, email }) => (
            <div key={a.id} className="card flex items-center justify-between">
              <div>
                <p className="font-medium">{patient} <span className="text-sm text-slate-500">· {phone || email}</span></p>
                <p className="text-sm text-slate-600">{fmt(a.startsAt)}{a.reason && ` — ${a.reason}`}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${badge[a.status]}`}>{a.status}</span>
                {a.status === "booked" && ["completed", "cancelled"].map((st) => (
                  <form key={st} action={setStatus}><input type="hidden" name="id" value={a.id} /><input type="hidden" name="status" value={st} /><button className="btn-ghost capitalize">{st === "completed" ? "Complete" : "Cancel"}</button></form>
                ))}
              </div>
            </div>
          ))}
          {rows.length === 0 && <p className="text-slate-500">No appointments yet.</p>}
        </div>
      </section>
      <section>
        <h2 className="mb-3 font-semibold">Profile &amp; availability</h2>
        <form action={saveProfile} className="card grid gap-4 sm:grid-cols-2">
          <div><label className="label">Specialty</label><input name="specialty" defaultValue={doc.specialty} className="input" required /></div>
          <div><label className="label">Clinic</label><input name="clinic" defaultValue={doc.clinic} className="input" /></div>
          <div className="sm:col-span-2"><label className="label">Bio</label><textarea name="bio" defaultValue={doc.bio} rows={3} className="input" /></div>
          <div><label className="label">Fee (₹)</label><input name="fee" type="number" min={0} defaultValue={doc.fee} className="input" /></div>
          <div><label className="label">Slot length (min)</label>
            <select name="slotMinutes" defaultValue={doc.slotMinutes} className="input">{[15, 20, 30, 45, 60].map((m) => <option key={m}>{m}</option>)}</select></div>
          <div><label className="label">Start hour</label><input name="startHour" type="number" min={0} max={23} defaultValue={doc.startHour} className="input" /></div>
          <div><label className="label">End hour</label><input name="endHour" type="number" min={1} max={24} defaultValue={doc.endHour} className="input" /></div>
          <div className="sm:col-span-2"><span className="label">Working days</span>
            <div className="flex flex-wrap gap-3 text-sm">{DAYS.map((d, i) => <label key={d}><input type="checkbox" name="workDays" value={i} defaultChecked={days.includes(String(i))} /> {d}</label>)}</div></div>
          <div><button className="btn">Save</button></div>
        </form>
      </section>
    </div>
  );
}
