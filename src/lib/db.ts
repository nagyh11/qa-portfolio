import { Pool } from "pg";

let pool: Pool | null = null;
let migrationsRan = false;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    });
  }
  return pool;
}

export async function runMigrations(): Promise<void> {
  if (migrationsRan) return;
  const db = getPool();
  await db.query(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      company TEXT,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'unread',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS cms_sections (
      section TEXT PRIMARY KEY,
      content JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS cms_images (
      key TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      mime_type TEXT NOT NULL DEFAULT 'image/jpeg',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  migrationsRan = true;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  company: string | null;
  subject: string;
  message: string;
  created_at: Date;
  status: "unread" | "read";
}

export async function insertContactMessage(data: {
  name: string;
  email: string;
  company: string;
  subject: string;
  message: string;
}): Promise<ContactMessage> {
  await runMigrations();
  const db = getPool();
  const result = await db.query<ContactMessage>(
    `INSERT INTO contact_messages (name, email, company, subject, message)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [data.name, data.email, data.company || null, data.subject, data.message]
  );
  return result.rows[0];
}

export async function getAllMessages(): Promise<ContactMessage[]> {
  await runMigrations();
  const db = getPool();
  const result = await db.query<ContactMessage>(
    "SELECT * FROM contact_messages ORDER BY created_at DESC"
  );
  return result.rows;
}

export async function updateMessageStatus(id: number, status: "read" | "unread"): Promise<boolean> {
  await runMigrations();
  const db = getPool();
  const result = await db.query(
    "UPDATE contact_messages SET status = $1 WHERE id = $2",
    [status, id]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function deleteMessage(id: number): Promise<boolean> {
  await runMigrations();
  const db = getPool();
  const result = await db.query("DELETE FROM contact_messages WHERE id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
}
