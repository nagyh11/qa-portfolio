import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getAllCmsSections, saveCmsSection } from "@/lib/cms-db";
import type { CmsContent } from "@/lib/cms-types";

export const loadCmsFn = createServerFn({ method: "GET" }).handler(async () => {
  return getAllCmsSections();
});

function checkAdmin(password: string) {
  const adminPw = process.env.ADMIN_PASSWORD ?? "admin123";
  if (password !== adminPw) throw new Error("Unauthorized");
}

export const saveCmsFn = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) =>
    z
      .object({
        password: z.string(),
        section: z.string(),
        content: z.unknown(),
      })
      .parse(raw)
  )
  .handler(async ({ data }) => {
    checkAdmin(data.password);
    await saveCmsSection(data.section as keyof CmsContent, data.content as CmsContent[keyof CmsContent]);
    return { success: true };
  });
