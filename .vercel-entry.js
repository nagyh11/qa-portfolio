import { Pool } from "pg";
import server from './dist/server/server.js';

// Dedicated pool for image serving — avoids importing the SSR bundle just for /api/img
const imgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

export default async function handler(req, res) {
  // ── Serve stored images directly, bypassing TanStack Start ──────────────────
  if (req.url && req.url.includes("/api/img")) {
    const rawUrl = req.url.startsWith("http")
      ? req.url
      : `https://localhost${req.url}`;
    const url = new URL(rawUrl);
    const key = url.searchParams.get("key");
    if (!key) {
      res.statusCode = 400;
      res.end("Missing key");
      return;
    }
    try {
      const result = await imgPool.query(
        "SELECT data, mime_type FROM cms_images WHERE key = $1",
        [key]
      );
      if (!result.rows.length) {
        res.statusCode = 404;
        res.end("Not found");
        return;
      }
      const { data, mime_type } = result.rows[0];
      const buf = Buffer.from(data, "base64");
      res.statusCode = 200;
      res.setHeader("Content-Type", mime_type);
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      res.setHeader("Content-Length", String(buf.byteLength));
      res.end(buf);
      return;
    } catch (e) {
      console.error("[vercel-entry] /api/img error:", e);
      res.statusCode = 500;
      res.end("Internal error");
      return;
    }
  }

  // ── All other requests → TanStack Start SSR server ──────────────────────────
  const proto = req.headers['x-forwarded-proto'] ?? 'https';
  const host = req.headers['x-forwarded-host'] ?? req.headers.host ?? 'localhost';
  const url = new URL(req.url ?? '/', `${proto}://${host}`).toString();

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const buf = Buffer.concat(chunks);

  const request = new Request(url, {
    method: req.method,
    headers: req.headers,
    body: buf.length > 0 && !['GET', 'HEAD'].includes(req.method ?? '') ? buf : undefined,
  });

  const response = await server.fetch(request, {}, {});

  res.statusCode = response.status;
  for (const [k, v] of response.headers.entries()) {
    res.setHeader(k, v);
  }
  const body = await response.arrayBuffer();
  res.end(Buffer.from(body));
}
