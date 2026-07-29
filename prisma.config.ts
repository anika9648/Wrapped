import path from "node:path";
import { defineConfig, env } from "prisma/config";

if (!process.env.DATABASE_URL) {
  process.loadEnvFile(path.join(__dirname, ".env"));
}

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: env("DATABASE_URL"),
  },
});
