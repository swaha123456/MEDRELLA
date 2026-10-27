import postgres from "postgres";

const url =
  "postgresql://neondb_owner:npg_SzrGwq1CORK9@ep-dark-surf-b40tvpl2-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require";

console.log("Attempting to connect to Neon...");
const sql = postgres(url);

async function test() {
  try {
    const result = await sql`SELECT NOW();`;
    console.log("✅ Success! Connected to Neon. Database time:", result[0].now);
    process.exit(0);
  } catch (error) {
    console.error("❌ Connection failed!");
    console.error(error);
    process.exit(1);
  }
}

test();
