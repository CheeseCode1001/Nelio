import { defineConfig } from "prisma/config";

// The connection string is read from the environment and never committed.
// `prisma generate` and `prisma migrate diff --from-migrations` do not connect, so an empty value is fine for them.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: process.env.NELIO_DIRECT_URL || process.env.NELIO_DATABASE_URL || "postgresql://unset:unset@localhost:5432/unset" },
});
