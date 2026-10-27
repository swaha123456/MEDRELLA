# Medrella Appointment Booking
Next.js 14 (App Router) · TypeScript · Tailwind · Server Actions · Zod · Drizzle ORM · Postgres (Neon) · JWT cookie auth (jose + bcryptjs)

## Run locally
1. `cp .env.example .env.local` and fill `DATABASE_URL` (Neon) and `AUTH_SECRET`
2. `npm install && npm run db:push && npm run db:seed && npm run dev`

## Deploy (Vercel + Neon)
1. Create a Neon project, copy the pooled connection string.
2. Push this repo to GitHub, import in Vercel, set env vars `DATABASE_URL` and `AUTH_SECRET`.
3. Run `npm run db:push && npm run db:seed` once locally with the Neon URL.

Demo logins after seeding (password `password123`): `asha.rao@medrella.test` (doctor), `patient@medrella.test` (patient).
