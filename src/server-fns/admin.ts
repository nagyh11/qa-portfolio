import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getAllMessages, updateMessageStatus, deleteMessage } from "@/lib/db";

function checkAdmin(password: string) {
  const adminPw = process.env.ADMIN_PASSWORD ?? "admin123";
  if (password !== adminPw) throw new Error("Unauthorized");
}

export const adminLoginFn = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => z.object({ password: z.string() }).parse(raw))
  .handler(async ({ data }) => {
    checkAdmin(data.password);
    return { success: true };
  });

export const getMessagesFn = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => z.object({ password: z.string() }).parse(raw))
  .handler(async ({ data }) => {
    checkAdmin(data.password);
    const messages = await getAllMessages();
    return { messages };
  });

export const updateStatusFn = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) =>
    z
      .object({
        password: z.string(),
        id: z.number(),
        status: z.enum(["read", "unread"]),
      })
      .parse(raw)
  )
  .handler(async ({ data }) => {
    checkAdmin(data.password);
    const ok = await updateMessageStatus(data.id, data.status);
    return { success: ok };
  });

export const deleteMessageFn = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) =>
    z.object({ password: z.string(), id: z.number() }).parse(raw)
  )
  .handler(async ({ data }) => {
    checkAdmin(data.password);
    const ok = await deleteMessage(data.id);
    return { success: ok };
  });
