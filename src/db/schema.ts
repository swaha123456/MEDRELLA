import { pgTable, uuid, text, integer, timestamp, pgEnum, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const roleEnum = pgEnum("role", ["patient", "doctor"]);
export const statusEnum = pgEnum("status", ["booked", "completed", "cancelled"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull(),
  phone: text("phone"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const doctors = pgTable("doctors", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  specialty: text("specialty").notNull(),
  bio: text("bio").notNull().default(""),
  clinic: text("clinic").notNull().default(""),
  fee: integer("fee").notNull().default(500),
  startHour: integer("start_hour").notNull().default(9),
  endHour: integer("end_hour").notNull().default(17),
  slotMinutes: integer("slot_minutes").notNull().default(30),
  workDays: text("work_days").notNull().default("1,2,3,4,5"),
});

export const appointments = pgTable(
  "appointments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    doctorId: uuid("doctor_id").notNull().references(() => doctors.id, { onDelete: "cascade" }),
    patientId: uuid("patient_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    reason: text("reason").notNull().default(""),
    status: statusEnum("status").notNull().default("booked"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    // prevents double booking of an active slot
    activeSlot: uniqueIndex("uniq_active_slot").on(t.doctorId, t.startsAt).where(sql`${t.status} <> 'cancelled'`),
  })
);
