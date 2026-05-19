import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { insertContactMessage } from "@/lib/db";
import { sendOwnerNotification, sendRecruiterConfirmation } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";
import { sanitize, sanitizeEmail } from "@/lib/sanitize";

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(320),
  company: z.string().max(200).optional().default(""),
  subject: z.string().min(3).max(300),
  message: z.string().min(10).max(5000),
});

export const submitContactFn = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => schema.parse(raw))
  .handler(async ({ data }) => {
    const req = getRequest();
    const ip =
      req?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req?.headers.get("x-real-ip") ??
      "unknown";

    if (!checkRateLimit(ip)) {
      throw new Error("Too many requests. Please wait a minute before trying again.");
    }

    const clean = {
      name: sanitize(data.name),
      email: sanitizeEmail(data.email),
      company: sanitize(data.company),
      subject: sanitize(data.subject),
      message: sanitize(data.message),
    };

    const saved = await insertContactMessage(clean);
    const date = new Date(saved.created_at).toLocaleString("en-US", {
      dateStyle: "long",
      timeStyle: "short",
    });

    await Promise.allSettled([
      sendOwnerNotification({ ...clean, date }),
      sendRecruiterConfirmation({ ...clean, date }),
    ]);

    return { success: true, id: saved.id };
  });
