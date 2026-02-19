// Prisma client singleton for production use.
// Uncomment when DATABASE_URL is configured.

// import { PrismaClient } from "@prisma/client";
//
// const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
//
// export const prisma = globalForPrisma.prisma || new PrismaClient();
//
// if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// For now, we export the mock data store as our "database"
export { mockDb } from "./mock-data";
