import { PrismaClient } from "../prisma/generated/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } = process.env;

if (!TURSO_DATABASE_URL || !TURSO_AUTH_TOKEN) {
  throw new Error("Missing Turso environment variables!");
}

const adapter = new PrismaLibSql(
  {
    url: TURSO_DATABASE_URL,
    authToken: TURSO_AUTH_TOKEN,
    intMode: "bigint",
  },
  { timestampFormat: "unixepoch-ms" },
);

export const prisma = new PrismaClient({ adapter });
