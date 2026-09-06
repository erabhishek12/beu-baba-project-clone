const fs = require("fs");
const { Client } = require("pg");

const password = process.env.SUPABASE_DB_PASSWORD;

if (!password) {
  console.error("ERROR: SUPABASE_DB_PASSWORD is not set.");
  console.error("Set it in this terminal and run the script again.");
  process.exit(1);
}

const sqlFile = "supabase/seed/seed_data.sql";

if (!fs.existsSync(sqlFile)) {
  console.error(`ERROR: Seed file not found: ${sqlFile}`);
  process.exit(1);
}

const sql = fs.readFileSync(sqlFile, "utf8");

console.log("========================================");
console.log(" BEU BABA - SUPABASE SEED IMPORT");
console.log("========================================");
console.log(`Seed file : ${sqlFile}`);
console.log(`File size : ${(Buffer.byteLength(sql) / 1024 / 1024).toFixed(2)} MB`);
console.log("Database  : Supabase hosted PostgreSQL");
console.log("");
console.log("Connecting...");

const client = new Client({
  host: "aws-0-ap-northeast-2.pooler.supabase.com",
  port: 5432,
  database: "postgres",
  user: "postgres.dofacwecyespkfjlwnhp",
  password,
  ssl: {
    rejectUnauthorized: false,
  },
  connectionTimeoutMillis: 30000,
});

async function main() {
  try {
    await client.connect();

    console.log("Connected successfully.");
    console.log("Importing seed_data.sql...");
    console.log("Please wait. Do NOT close this terminal.");
    console.log("");

    await client.query(sql);

    console.log("");
    console.log("========================================");
    console.log(" SEED IMPORT COMPLETED SUCCESSFULLY");
    console.log("========================================");
  } catch (error) {
    console.error("");
    console.error("========================================");
    console.error(" SEED IMPORT FAILED");
    console.error("========================================");
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => {});
  }
}

main();