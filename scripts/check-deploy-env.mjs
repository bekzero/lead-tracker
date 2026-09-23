const problems = [];

if (!process.env.DATABASE_URL) {
  problems.push("DATABASE_URL is missing (connect a PostgreSQL database and expose its pooled URL under this name)");
} else if (!/^postgres(ql)?:\/\//i.test(process.env.DATABASE_URL)) {
  problems.push("DATABASE_URL must be a PostgreSQL connection URL");
}

if (!process.env.EVENT_NAME?.trim()) {
  problems.push("EVENT_NAME is missing (for example: GMM Convention)");
}

if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD.length < 12) {
  problems.push("ADMIN_PASSWORD is missing or shorter than 12 characters");
}

if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
  problems.push("SESSION_SECRET is missing or shorter than 32 characters");
}

if (problems.length) {
  console.error("\nKZero deployment configuration is incomplete:\n");
  for (const problem of problems) console.error(`  - ${problem}`);
  console.error("\nAdd these under Vercel → Project Settings → Environment Variables, then redeploy.\n");
  process.exit(1);
}

console.log("KZero deployment environment is configured.");
