// Run migrations against Neon. Reads .env.local and executes every .sql in
// db/migrations in alphabetical order. Idempotent (each migration uses
// IF NOT EXISTS / on conflict).
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Pool } from "@neondatabase/serverless";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// Load .env.local (Node 22 doesn't auto-load it for plain scripts)
const envPath = join(root, ".env.local");
const envText = readFileSync(envPath, "utf8");
for (const line of envText.split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL not found in .env.local");
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const migrationsDir = join(root, "db", "migrations");
const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

for (const file of files) {
  console.log(`\n→ ${file}`);
  const content = readFileSync(join(migrationsDir, file), "utf8");

  // Split on `;` outside of $$ blocks. Postgres dollar-quoted strings (used
  // for plpgsql functions) contain semicolons that we must preserve.
  const statements = splitSqlStatements(content);

  for (const stmt of statements) {
    const trimmed = stmt.trim();
    if (!trimmed || trimmed.startsWith("--")) continue;
    try {
      await pool.query(trimmed);
    } catch (e) {
      console.error(`✗ failed:\n${trimmed.slice(0, 200)}...\n  → ${e.message}`);
      await pool.end();
      process.exit(1);
    }
  }
  console.log(`  ✓ ran ${statements.filter((s) => s.trim()).length} statements`);
}

// Verify
const { rows: [c] } = await pool.query("select count(*)::int as count from public.clinic_profiles");
const { rows: [k] } = await pool.query("select count(*)::int as count from public.campaigns");
console.log(`\n✓ clinics: ${c.count}, campaigns: ${k.count}`);
await pool.end();

function splitSqlStatements(input) {
  const out = [];
  let current = "";
  let inDollar = false;
  let dollarTag = "";
  let i = 0;
  while (i < input.length) {
    if (!inDollar && input[i] === "-" && input[i + 1] === "-") {
      // strip line comment entirely — don't include in `current`,
      // so a leading comment doesn't fool the "startsWith --" filter below
      while (i < input.length && input[i] !== "\n") i++;
      continue;
    }
    if (input[i] === "$") {
      // detect $$ or $tag$
      const m = input.slice(i).match(/^\$([A-Za-z_]*)\$/);
      if (m) {
        const tag = m[0];
        if (!inDollar) {
          inDollar = true;
          dollarTag = tag;
        } else if (tag === dollarTag) {
          inDollar = false;
          dollarTag = "";
        }
        current += tag;
        i += tag.length;
        continue;
      }
    }
    if (input[i] === ";" && !inDollar) {
      out.push(current);
      current = "";
      i++;
      continue;
    }
    current += input[i];
    i++;
  }
  if (current.trim()) out.push(current);
  return out;
}
