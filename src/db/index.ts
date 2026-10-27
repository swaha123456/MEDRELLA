import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const g = globalThis as unknown as { _pg?: ReturnType<typeof postgres> };
const client = g._pg ?? postgres(process.env.DATABASE_URL ?? "postgres://x:x@localhost/x", { prepare: false, max: 5 });
if (process.env.NODE_ENV !== "production") g._pg = client;
export const db = drizzle(client, { schema });
export * from "./schema";
