import Link from "next/link";
import { notFound } from "next/navigation";
import { and, between, eq, ne } from "drizzle-orm";
import { db, doctors, users, appointments } from "@/db";
import { getSession } from "@/lib/auth";
import { dayRange, fmtTime, nextDates, slotsFor } from "@/lib/slots";
import { bookAppointment } from "../../actions";

export const dynamic = "force-dynamic";
const DAY = new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });

export default async function DoctorPage({ params, searchParams }: { params: { id: string }; searchParams: { date?: string; error?: string } }) {
  if (!/^[0-9a-f-]{36}$/.test(params.id)) notFound();
  const [row] = await db.select({ d: doctors, name: users.name }).from(doctors).innerJoin(users, eq(users.id, doctors.userId)).where(eq(doctors.id, params.id));
  if (!row) notFound();
  const { d, name } = row;
  const dates = nextDates();
  const date = searchParams.date && dates.includes(searchParams.date) ? searchParams.date : dates[0];
  const { start, end } = dayRange(date);
  const taken = await db.select({ t: appointments.startsAt }).from(appointments)
    .where(and(eq(appointments.doctorId, d.id), ne(appointments.status, "cancelled"), between(appointments.startsAt, start, end)));
  const takenSet = new Set(taken.map((x) => x.t.getTime()));
  const slots = slotsFor(d, date);
  const s = await getSession();

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <aside className="card h-fit">
        <h1 className="text-xl font-semibold">Dr. {name}</h1>
        <p className="text-brand">{d.specialty}</p>
        {d.clinic && <p className="mt-1 text-sm text-slate-600">{d.clinic}</p>}
        <p className="mt-3 text-sm text-slate-700">{d.bio || "No bio yet."}</p>
        <p className="mt-3 text-sm">Consultation fee: <b>₹{d.fee}</b></p>
      </aside>
      <section className="md:col-span-2">
        <h2 className="mb-3 font-semibold">Choose a date</h2>
        <div className="mb-6 flex flex-wrap gap-2">
          {dates.map((x) => (
            <Link key={x} href={`?date=${x}`} className={`rounded-lg border px-3 py-1.5 text-sm ${x === date ? "border-brand bg-brand text-white" : "bg-white hover:bg-slate-50"}`}>
              {DAY.format(new Date(x))}
            </Link>
          ))}
        </div>
        {searchParams.error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{searchParams.error}</p>}
        {!s && <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm">Please <Link href="/login" className="underline">sign in</Link> or <Link href="/register" className="underline">register</Link> as a patient to book.</p>}
        <form action={bookAppointment} className="card space-y-4">
          <input type="hidden" name="doctorId" value={d.id} />
          <h2 className="font-semibold">Pick a time</h2>
          {slots.length === 0 ? <p className="text-sm text-slate-500">No slots available on this day.</p> : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.map((sl) => {
                const busy = takenSet.has(sl.getTime());
                return (
                  <label key={sl.toISOString()} className={busy ? "cursor-not-allowed opacity-40" : "cursor-pointer"}>
                    <input type="radio" name="slot" value={sl.toISOString()} disabled={busy} required className="peer sr-only" />
                    <span className="block rounded-lg border px-2 py-1.5 text-center text-sm peer-checked:border-brand peer-checked:bg-brand peer-checked:text-white">{fmtTime(sl)}</span>
                  </label>
                );
              })}
            </div>
          )}
          <div><label className="label">Reason for visit (optional)</label><textarea name="reason" rows={2} maxLength={300} className="input" /></div>
          <button className="btn" disabled={slots.length === 0}>Confirm booking</button>
        </form>
      </section>
    </div>
  );
}
