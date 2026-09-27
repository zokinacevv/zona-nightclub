import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForDatabase = globalThis as unknown as {
  database?: PrismaClient;
};

function createDatabaseClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL must be configured before using the database.",
    );
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });
}

export function getDatabase() {
  if (!globalForDatabase.database) {
    globalForDatabase.database = createDatabaseClient();
  }

  return globalForDatabase.database;
}
