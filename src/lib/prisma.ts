import path from "node:path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Local/default: a SQLite file on disk via better-sqlite3 (used for local dev
// and any host with a real, persistent filesystem). Unchanged from before.
function createLocalFileClient() {
  const dbUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const filePath = dbUrl.replace(/^file:/, "");
  const adapter = new PrismaBetterSqlite3({
    url: path.isAbsolute(filePath)
      ? filePath
      : path.join(/* turbopackIgnore: true */ process.cwd(), filePath),
  });
  return new PrismaClient({ adapter });
}

// Serverless hosts (e.g. Vercel) have no persistent local filesystem, so a
// SQLite file can't work there. If TURSO_DATABASE_URL is set, connect to a
// hosted libSQL (Turso) database instead — same SQLite schema, no code
// changes needed elsewhere. Local dev is untouched unless this var is set.
function createTursoClient(url: string) {
  const adapter = new PrismaLibSql({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  return new PrismaClient({ adapter });
}

function createClient() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  return tursoUrl ? createTursoClient(tursoUrl) : createLocalFileClient();
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
