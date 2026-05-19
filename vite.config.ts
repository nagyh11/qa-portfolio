// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// cloudflare is DISABLED here so the app builds for Vercel (Node.js) instead.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import type { Plugin } from "vite";

function imageServePlugin(): Plugin {
  return {
    name: "img-serve",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.includes("/api/img")) { next(); return; }
        const { searchParams } = new URL(req.url, "http://localhost");
        const key = searchParams.get("key");
        if (!key) { res.statusCode = 400; res.end("Missing key"); return; }
        try {
          const mod = await server.ssrLoadModule("/src/lib/db.ts");
          await mod.runMigrations();
          const db = mod.getPool();
          const result = await db.query(
            "SELECT data, mime_type FROM cms_images WHERE key = $1",
            [key]
          );
          if (!result.rows.length) { res.statusCode = 404; res.end("Not found"); return; }
          const { data, mime_type } = result.rows[0];
          const buf = Buffer.from(data, "base64");
          res.setHeader("Content-Type", mime_type);
          res.setHeader("Cache-Control", "public, max-age=86400");
          res.setHeader("Content-Length", String(buf.byteLength));
          res.statusCode = 200;
          res.end(buf);
        } catch (e) {
          console.error("[img-serve]", e);
          next();
        }
      });
    },
  };
}

export default defineConfig({
  cloudflare: false,
  tanstackStart: {
    server: {
      preset: "vercel",
    },
  },
  vite: {
    server: {
      host: "0.0.0.0",
      port: 5000,
      allowedHosts: true,
    },
    build: {
      chunkSizeWarningLimit: 1000,
      reportCompressedSize: false,
    },
    plugins: [imageServePlugin()],
  },
});
