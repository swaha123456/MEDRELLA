"use server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { db, users, doctors, appointments } from "@/db";
import { createSession, getSession } from "@/lib/auth";

export type FormState = { error?: string };
const first = (e: z.ZodError) => e.issues[0]?.message ?? "Invalid input";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name is too short"),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["patient", "doctor"]),
  phone: z.string().trim().optional(),
  specialty: z.string().trim().optional(),
});

export async function register(_: FormState, fd: FormData): Promise<FormState> {
  const p = registerSchema.safeParse(Object.fromEntries(fd));
  if (!p.success) return { error: first(p.error) };
  const d = p.data;
  if (d.role === "doctor" && !d.specialty) return { error: "Specialty is required for doctors" };
  const [exists] = await db.select({ id: users.id }).from(users).where(eq(users.email, d.email));
  if (exists) return { error: "An account with this email already exists" };
  const [u] = await db.insert(users).values({
    name: d.name, email: d.email, role: d.role, phone: d.phone || null,
    passwordHash: await bcrypt.hash(d.password, 10),
  }).returning();
  if (d.role === "doctor") await db.insert(doctors).values({ userId: u.id, specialty: d.specialty! });
  await createSession({ uid: u.id, role: u.role, name: u.name });
  redirect(u.role === "doctor" ? "/doctor" : "/patient");
}

const loginSchema = z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1) });
export async function login(_: FormState, fd: FormData): Promise<FormState> {
  const p = loginSchema.safeParse(Object.fromEntries(fd));
  if (!p.success) return { error: "Enter your email and password" };
  const [u] = await db.select().from(users).where(eq(users.email, p.data.email));
  if (!u || !(await bcrypt.compare(p.data.password, u.passwordHash))) return { error: "Incorrect email or password" };
  await createSession({ uid: u.id, role: u.role, name: u.name });
  redirect(u.role === "doctor" ? "/doctor" : "/patient");
}

export async function logout() {
  cookies().delete("session");
  redirect("/");
}

const bookSchema = z.object({
  doctorId: z.string().uuid(),
  slot: z.string().datetime({ offset: true }),
  reason: z.string().trim().max(300).optional(),
});
export async function bookAppointment(fd: FormData) {
  const s = await getSession();
  const doctorId = String(fd.get("doctorId"));
  if (!s) redirect("/login");
  if (s.role !== "patient") redirect(`/doctors/${doctorId}?error=Only patients can book appointments`);
  const p = bookSchema.safeParse(Object.fromEntries(fd));
  if (!p.success) redirect(`/doctors/${doctorId}?error=Please pick a time slot`);
  const startsAt = new Date(p.data.slot);
  if (startsAt.getTime() < Date.now()) redirect(`/doctors/${doctorId}?error=That time has passed`);
  let ok = true;
  try {
    await db.insert(appointments).values({ doctorId, patientId: s.uid, startsAt, reason: p.data.reason ?? "" });
  } catch { ok = false; } // unique index violation => slot already taken
  if (!ok) redirect(`/doctors/${doctorId}?error=Sorry, that slot was just taken. Please pick another`);
  revalidatePath("/patient"); revalidatePath("/doctor");
  redirect("/patient?booked=1");
}

export async function setStatus(fd: FormData) {
  const s = await getSession();
  if (!s) redirect("/login");
  const id = String(fd.get("id"));
  const status = z.enum(["completed", "cancelled"]).parse(fd.get("status"));
  if (s.role === "patient") {
    if (status !== "cancelled") return;
    await db.update(appointments).set({ status }).where(and(eq(appointments.id, id), eq(appointments.patientId, s.uid)));
  } else {
    const [doc] = await db.select({ id: doctors.id }).from(doctors).where(eq(doctors.userId, s.uid));
    if (!doc) return;
    await db.update(appointments).set({ status }).where(and(eq(appointments.id, id), eq(appointments.doctorId, doc.id)));
  }
  revalidatePath("/patient"); revalidatePath("/doctor");
}

const profileSchema = z.object({
  specialty: z.string().trim().min(2), clinic: z.string().trim().max(120), bio: z.string().trim().max(500),
  fee: z.coerce.number().int().min(0).max(100000),
  startHour: z.coerce.number().int().min(0).max(23), endHour: z.coerce.number().int().min(1).max(24),
  slotMinutes: z.coerce.number().int().refine((n) => [15, 20, 30, 45, 60].includes(n)),
}).refine((d) => d.endHour > d.startHour, { message: "End must be after start" });
export async function saveProfile(fd: FormData) {
  const s = await getSession();
  if (!s || s.role !== "doctor") redirect("/login");
  const p = profileSchema.safeParse(Object.fromEntries(fd));
  if (!p.success) return;
  const workDays = fd.getAll("workDays").map(String).filter((d) => /^[0-6]$/.test(d)).join(",");
  await db.update(doctors).set({ ...p.data, workDays }).where(eq(doctors.userId, s.uid));
  revalidatePath("/doctor"); revalidatePath("/");
}
