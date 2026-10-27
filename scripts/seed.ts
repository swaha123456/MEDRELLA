import "./env";
import bcrypt from "bcryptjs";
import { db, users, doctors } from "../src/db";

const docs = [
  ["Asha Rao", "Cardiology", "Heart specialist with 12 years of experience.", "Rao Heart Clinic"],
  ["Vikram Mehta", "Dermatology", "Skin, hair and cosmetic dermatology.", "Clear Skin Centre"],
  ["Sneha Iyer", "Paediatrics", "Child health, vaccination and growth.", "Little Steps Clinic"],
  ["Rahul Das", "General Medicine", "Family physician for everyday care.", "City Polyclinic"],
];
(async () => {
  const hash = await bcrypt.hash("password123", 10);
  for (const [name, specialty, bio, clinic] of docs) {
    const email = name.toLowerCase().replace(" ", ".") + "@medrella.test";
    const [u] = await db.insert(users).values({ name, email, passwordHash: hash, role: "doctor" }).onConflictDoNothing().returning();
    if (u) await db.insert(doctors).values({ userId: u.id, specialty, bio, clinic, fee: 400 + Math.floor(Math.random() * 6) * 100 });
  }
  await db.insert(users).values({ name: "Demo Patient", email: "patient@medrella.test", passwordHash: hash, role: "patient", phone: "9000000000" }).onConflictDoNothing();
  console.log("Seeded. Logins: asha.rao@medrella.test / patient@medrella.test — password123");
  process.exit(0);
})();
