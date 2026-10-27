// Clinic timezone is fixed to IST for simplicity.
export const TZ = "Asia/Kolkata";
const OFFSET = "+05:30";
export const fmt = (d: Date) => d.toLocaleString("en-IN", { timeZone: TZ, dateStyle: "medium", timeStyle: "short" });
export const fmtTime = (d: Date) => d.toLocaleTimeString("en-IN", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });

export function nextDates(n = 14): string[] {
  const base = new Date(Date.now() + 5.5 * 3600e3);
  return Array.from({ length: n }, (_, i) => new Date(base.getTime() + i * 86400e3).toISOString().slice(0, 10));
}
export function dayRange(date: string) {
  return { start: new Date(`${date}T00:00:00${OFFSET}`), end: new Date(`${date}T23:59:59${OFFSET}`) };
}
type Sched = { startHour: number; endHour: number; slotMinutes: number; workDays: string };
export function slotsFor(s: Sched, date: string): Date[] {
  const dow = new Date(`${date}T12:00:00${OFFSET}`).getUTCDay();
  if (!s.workDays.split(",").map(Number).includes(dow)) return [];
  const out: Date[] = [];
  for (let m = s.startHour * 60; m + s.slotMinutes <= s.endHour * 60; m += s.slotMinutes) {
    const hh = String(Math.floor(m / 60)).padStart(2, "0"), mm = String(m % 60).padStart(2, "0");
    const d = new Date(`${date}T${hh}:${mm}:00${OFFSET}`);
    if (d.getTime() > Date.now()) out.push(d);
  }
  return out;
}
export const badge: Record<string, string> = { booked: "bg-blue-100 text-blue-800", completed: "bg-green-100 text-green-800", cancelled: "bg-slate-200 text-slate-600" };
