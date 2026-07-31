import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // better-sqlite3 ships a native binary; keep it an external require rather
  // than letting the bundler try to process it. Only touched by the local
  // dev/local-file DB path (see src/lib/prisma.ts) — unused when deployed
  // against a hosted libSQL database.
  serverExternalPackages: ["better-sqlite3", "@prisma/adapter-better-sqlite3"],
};

export default nextConfig;
