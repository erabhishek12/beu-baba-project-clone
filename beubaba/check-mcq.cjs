const { Client } = require("pg");

const client = new Client({
  host: "aws-0-ap-northeast-2.pooler.supabase.com",
  port: 5432,
  database: "postgres",
  user: "postgres.dofacwecyespkfjlwnhp",
  password: process.env.SUPABASE_DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await client.connect();

  const result = await client.query(`
    SELECT
      (SELECT COUNT(*) FROM public.question_bank) AS questions,
      (SELECT COUNT(*) FROM public.question_bank_options) AS options,
      (SELECT COUNT(*) FROM public.question_bank_subjects) AS placements,
      (SELECT COUNT(*) FROM public.question_quarantine) AS quarantine;
  `);

  console.table(result.rows);

  await client.end();
}

main().catch(async (error) => {
  console.error("ERROR:", error.message);
  try {
    await client.end();
  } catch {}
  process.exit(1);
});