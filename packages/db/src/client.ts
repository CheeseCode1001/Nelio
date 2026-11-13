import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/client";

const globalForDb = globalThis as unknown as { __nelioPrisma?: PrismaClient };

export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super("NELIO_DATABASE_URL is not set. Add it to apps/web/.env.local (see .env.example).");
    this.name = "DatabaseNotConfiguredError";
  }
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.NELIO_DATABASE_URL);
}

/** Server-only Prisma client. One instance per process; reused across hot reloads in development. */
export function db(): PrismaClient {
  if (globalForDb.__nelioPrisma) return globalForDb.__nelioPrisma;
  const connectionString = process.env.NELIO_DATABASE_URL;
  if (!connectionString) throw new DatabaseNotConfiguredError();
  // Interactive transactions hold row locks across several round trips; 5 s (the default) is too tight
  // over a long network path to the database region. Local development far from the database can raise it
  // with NELIO_TX_TIMEOUT_MS; production workers run next to the database.
  const client = new PrismaClient({ adapter: new PrismaPg({ connectionString }), transactionOptions: { maxWait: 15_000, timeout: Number(process.env.NELIO_TX_TIMEOUT_MS) || 20_000 } });
  globalForDb.__nelioPrisma = client;
  return client;
}

export type Db = PrismaClient;
export type Tx = Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0];
