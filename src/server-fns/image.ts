import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { randomUUID } from "crypto";
import { getPool, runMigrations } from "@/lib/db";

function checkAdmin(password: string) {
  const adminPw = process.env.ADMIN_PASSWORD ?? "admin123";
  if (password !== adminPw) throw new Error("Unauthorized");
}

export const uploadImageFn = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) =>
    z
      .object({
        password: z.string(),
        data: z.string(),
        mimeType: z.string(),
      })
      .parse(raw)
  )
  .handler(async ({ data }) => {
    checkAdmin(data.password);
    await runMigrations();
    const key = randomUUID();
    const db = getPool();
    await db.query(
      `INSERT INTO cms_images (key, data, mime_type, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [key, data.data, data.mimeType]
    );
    return { key, url: `/api/img?key=${key}` };
  });
