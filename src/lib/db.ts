import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not defined in environment variables.");
  }
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
} else {
  // Prevent multiple instances in development due to hot-reloading
  const globalWithPrisma = global as typeof globalThis & {
    prisma?: PrismaClient;
  };
  
  if (!globalWithPrisma.prisma) {
    const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/keralammatch_dev";
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    globalWithPrisma.prisma = new PrismaClient({ adapter });
  }
  
  prisma = globalWithPrisma.prisma;
}

export { prisma };
