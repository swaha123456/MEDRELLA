import React from "react";
import Link from "next/link";
import { eq, ilike, or } from "drizzle-orm";
import { db, doctors, users } from "@/db";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q?.trim();

  const rows = await db
    .select({ d: doctors, name: users.name })
    .from(doctors)
    .innerJoin(users, eq(users.id, doctors.userId))
    .where(
      q
        ? or(ilike(users.name, `%${q}%`), ilike(doctors.specialty, `%${q}%`))
        : undefined,
    );

  return (
    <div className="w-full bg-slate-50 font-sans text-slate-800">
      {/* 🌟 HERO SECTION - COMPLETELY FULL WIDTH */}
      <section
        className="w-full bg-cover bg-center bg-no-repeat py-32 md:py-44 flex items-center justify-center text-center px-4"
        style={{
          // Uses the live medrella campus image URL directly with a smooth dark overlay
          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.65), rgba(15, 23, 42, 0.75)), url('https://medrella.com/images/hospital-campus.webp')`,
        }}
      >
        <div className="max-w-3xl w-full z-10 space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white">
            More time for{" "}
            <span className="italic text-sky-400 font-serif font-normal">
              care.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-200 max-w-xl mx-auto">
            Find a doctor and book an appointment in a few clicks.
          </p>

          {/* 🔍 GOOGLE-STYLE CENTERED SEARCH INTERFACE */}
          <form method="GET" className="max-w-xl mx-auto mt-8 relative">
            <div className="flex items-center bg-white rounded-full shadow-xl border border-slate-200 overflow-hidden pl-6 pr-2 py-2 focus-within:ring-2 focus-within:ring-sky-500 transition-all duration-200">
              <svg
                className="w-5 h-5 text-slate-400 mr-3 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                name="q"
                type="text"
                defaultValue={q}
                placeholder="Search by name or specialty..."
                className="w-full text-base bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none py-1 pr-4"
              />
              <button
                type="submit"
                className="bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm px-6 py-2.5 rounded-full shadow-md transition-colors duration-150 shrink-0"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* 🩺 CLINICIAN DIRECTORY GRID */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-20">
        <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Available Medical Practitioners
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Book certified specialists on our connected network.
            </p>
          </div>
          <span className="text-xs font-semibold bg-sky-50 text-sky-700 px-3 py-1.5 rounded-md uppercase tracking-wider">
            {rows.length} {rows.length === 1 ? "provider" : "providers"} found
          </span>
        </div>

        {/* Changed grid setup to grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 for single row scaling */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {rows.map(({ d, name }) => (
            <Link
              key={d.id}
              href={`/doctors/${d.id}`}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-sky-500 transition-all duration-200 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-1">
                      Dr. {name}
                    </h3>
                    <p className="text-sky-600 font-semibold text-xs tracking-wide mt-0.5">
                      {d.specialty}
                    </p>
                  </div>
                  <span className="text-xs font-bold bg-slate-100 px-2 py-0.5 rounded-full text-slate-700 shrink-0">
                    ₹{d.fee}
                  </span>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">
                  {d.bio || d.clinic || "Available for consultation"}
                </p>
              </div>

              <div className="mt-5 w-full bg-slate-900 text-white text-center text-xs font-medium py-2.5 rounded-xl group-hover:bg-sky-600 transition-colors">
                Book Consultation
              </div>
            </Link>
          ))}

          {rows.length === 0 && (
            <div className="col-span-full py-12 text-center bg-white border border-slate-200 rounded-2xl">
              <p className="text-slate-500 font-medium">
                No medical practitioners found matching your query.
              </p>
              {q && (
                <Link
                  href="/"
                  className="text-sky-600 text-sm font-semibold mt-2 inline-block hover:underline"
                >
                  Clear filters
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 💬 CAPABILITIES & FAQ SECTION */}
      <section className="w-full bg-white border-t border-b border-slate-200 py-24 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* 📸 LEFT SIDE: STICKY BRAND IMAGE LAYER */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8">
            <div className="space-y-2">
              <span className="text-xs font-bold text-sky-600 uppercase tracking-widest block">
                Platform Support
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-slate-500 text-sm">
                Everything you need to know about booking, profiles, and
                operations on the Schedula system.
              </p>
            </div>

            {/* Hospital Care Image Container */}
            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-md border border-slate-100">
              <img
                src="https://medrella.com/images/connected-care.webp"
                alt="Connected Care Team"
                className="w-full h-full object-cover object-center"
                loading="lazy"
              />
            </div>
          </div>

          {/* ❓ RIGHT SIDE: ASYMMETRIC QUESTION & ANSWER LIST */}
          <div className="lg:col-span-7 divide-y divide-slate-100">
            {/* FAQ Item 01 */}
            <div className="pb-6 pt-2 flex items-start justify-between group">
              <div className="space-y-2 pr-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-mono text-sky-600 font-bold">
                    01
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    How do I book an appointment on Schedula?
                  </h3>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed pl-9">
                  Simply search for a provider by their name or medical
                  specialty directly on the home page search engine. Pick an
                  open schedule timeframe from their available calendar grid,
                  fill out your primary medical visit reasons, and confirm to
                  secure your slot instantly.
                </p>
              </div>
            </div>

            {/* FAQ Item 02 */}
            <div className="py-6 flex items-start justify-between group">
              <div className="space-y-2 pr-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-mono text-sky-600 font-bold">
                    02
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    Can a different patient book a slot that I already reserved?
                  </h3>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed pl-9">
                  No. The scheduling engine features built-in transactional
                  protection layer blocks. The moment you confirm your
                  appointment, that specific time interval shifts state to{" "}
                  <strong className="text-slate-700 font-semibold">
                    BOOKED
                  </strong>{" "}
                  instantly within our Neon database to eliminate any
                  double-booking conflicts.
                </p>
              </div>
            </div>

            {/* FAQ Item 03 */}
            <div className="py-6 flex items-start justify-between group">
              <div className="space-y-2 pr-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-mono text-sky-600 font-bold">
                    03
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    How do I cancel or review my upcoming consultations?
                  </h3>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed pl-9">
                  Log in to your account dashboard framework using your patient
                  registration credentials. Your dashboard tracks all your
                  historical ledger sessions where you can check records or
                  click the cancellation button to instantly release a slot back
                  to an open status.
                </p>
              </div>
            </div>

            {/* FAQ Item 04 */}
            <div className="py-6 flex items-start justify-between group">
              <div className="space-y-2 pr-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-mono text-sky-600 font-bold">
                    04
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    How are doctor profiles and specialties managed?
                  </h3>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed pl-9">
                  Healthcare provider information is systematically divided
                  between licensing states and metadata profiles to maximize
                  system lookup speeds. This data layer allows patients to find
                  their matching medical specialties easily while keeping
                  platform search workflows direct and fast.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
