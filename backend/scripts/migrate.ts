// scripts/migrate.ts
// Executes SQL files under ../../database against a Postgres database (e.g., Supabase)
// Order: migrations -> functions -> triggers -> seed

import path from 'path';
import fs from 'fs/promises';
import { Client } from 'pg';

async function readSqlFiles(dir: string): Promise<{ name: string; sql: string }[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = entries
      .filter((e) => e.isFile() && e.name.toLowerCase().endsWith('.sql'))
      .map((e) => e.name)
      .sort((a, b) => a.localeCompare(b));
    const out: { name: string; sql: string }[] = [];
    for (const f of files) {
      const sql = await fs.readFile(path.join(dir, f), 'utf8');
      out.push({ name: f, sql });
    }
    return out;
  } catch (e: any) {
    if (e?.code === 'ENOENT') return [];
    throw e;
  }
}

async function runCategory(client: Client, title: string, dir: string) {
  const files = await readSqlFiles(dir);
  if (files.length === 0) {
    console.log(`- ${title}: (none)`);
    return;
  }
  console.log(`- ${title}: ${files.length} file(s)`);
  for (const f of files) {
    console.log(`  > ${f.name}`);
    try {
      // Run each file in its own transaction for isolation
      await client.query('BEGIN');
      await client.query(f.sql);
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`  ! Failed on ${f.name}:`, (err as any)?.message || err);
      throw err;
    }
  }
}

async function main() {
  const conn = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
  if (!conn) {
    console.error('Missing SUPABASE_DB_URL (or DATABASE_URL) in env');
    process.exit(1);
  }

  // Resolve database folder from this script location
  const base = path.resolve(__dirname, '../../database');
  const migrationsDir = path.join(base, 'migrations');
  const functionsDir = path.join(base, 'functions');
  const triggersDir = path.join(base, 'triggers');
  const seedDir = path.join(base, 'seed');

  const client = new Client({ connectionString: conn, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    // Ensure we are on the expected schema
    await client.query("SET search_path TO public");
    console.log('Connected. Applying SQL from', base);
    await runCategory(client, 'Migrations', migrationsDir);
    await runCategory(client, 'Functions', functionsDir);
    await runCategory(client, 'Triggers', triggersDir);
    if (String(process.env.RUN_SEED || 'false').toLowerCase() === 'true') {
      await runCategory(client, 'Seed', seedDir);
    } else {
      console.log('- Seed: skipped (set RUN_SEED=true to enable)');
    }
    console.log('Done.');
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});

