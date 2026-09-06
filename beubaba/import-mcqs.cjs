const fs = require("fs");
const { Client } = require("pg");

const client = new Client({
  host: "aws-0-ap-northeast-2.pooler.supabase.com",
  port: 5432,
  database: "postgres",
  user: "postgres.dofacwecyespkfjlwnhp",
  password: process.env.SUPABASE_DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

const sqlFile =
  "../mcq_generated/import_questions.sql";

async function main() {
  if (!process.env.SUPABASE_DB_PASSWORD) {
    throw new Error(
      "SUPABASE_DB_PASSWORD is not set."
    );
  }

  if (!fs.existsSync(sqlFile)) {
    throw new Error(`SQL file not found: ${sqlFile}`);
  }

  const stats = fs.statSync(sqlFile);

  console.log("==============================================");
  console.log("BEU BABA — MCQ SUPABASE IMPORT");
  console.log("==============================================");
  console.log(`SQL file: ${sqlFile}`);
  console.log(`File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  console.log("");
  console.log("Connecting to Supabase...");

  await client.connect();

  console.log("Connected successfully.");
  console.log("");
  console.log("Starting atomic MCQ import...");
  console.log("This may take several minutes.");
  console.log("DO NOT close this terminal.");
  console.log("");

  const sql = fs.readFileSync(sqlFile, "utf8");

  await client.query(sql);

  console.log("");
  console.log("==============================================");
  console.log("MCQ IMPORT COMPLETED SUCCESSFULLY");
  console.log("==============================================");
}

main()
  .catch(async (error) => {
    console.error("");
    console.error("==============================================");
    console.error("MCQ IMPORT FAILED");
    console.error("==============================================");
    console.error(error.message);
    console.error("");
    console.error(
      "Because the generated SQL uses a transaction, a failed import should roll back."
    );

    try {
      await client.end();
    } catch {}

    process.exit(1);
  })
  .finally(async () => {
    try {
      await client.end();
    } catch {}
  });