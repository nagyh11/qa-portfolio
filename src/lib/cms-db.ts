import { getPool, runMigrations } from "./db";
import { CMS_DEFAULTS } from "./cms-defaults";
import type { CmsContent } from "./cms-types";

const SECTIONS = Object.keys(CMS_DEFAULTS) as (keyof CmsContent)[];

export async function getCmsSection<K extends keyof CmsContent>(section: K): Promise<CmsContent[K]> {
  await runMigrations();
  const db = getPool();
  const result = await db.query<{ content: CmsContent[K] }>(
    "SELECT content FROM cms_sections WHERE section = $1",
    [section]
  );
  if (result.rows.length === 0) return CMS_DEFAULTS[section];
  return result.rows[0].content as CmsContent[K];
}

function stripBase64<T>(obj: T): T {
  if (typeof obj === "string") {
    return (obj.startsWith("data:") ? "" : obj) as T;
  }
  if (Array.isArray(obj)) {
    return obj.map(stripBase64) as unknown as T;
  }
  if (obj !== null && typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      result[k] = stripBase64(v);
    }
    return result as T;
  }
  return obj;
}

export async function getAllCmsSections(): Promise<CmsContent> {
  await runMigrations();
  const db = getPool();
  const result = await db.query<{ section: string; content: unknown }>(
    "SELECT section, content FROM cms_sections WHERE section = ANY($1)",
    [SECTIONS]
  );
  const saved: Partial<Record<string, unknown>> = {};
  for (const row of result.rows) saved[row.section] = stripBase64(row.content);

  const out: Partial<CmsContent> = {};
  for (const key of SECTIONS) {
    (out as Record<string, unknown>)[key] = saved[key] ?? CMS_DEFAULTS[key];
  }
  return out as CmsContent;
}

export async function saveCmsSection<K extends keyof CmsContent>(section: K, content: CmsContent[K]): Promise<void> {
  const db = getPool();
  await db.query(
    `INSERT INTO cms_sections (section, content, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (section) DO UPDATE SET content = $2, updated_at = NOW()`,
    [section, JSON.stringify(content)]
  );
}
