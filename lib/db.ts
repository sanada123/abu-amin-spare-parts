import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | null };

function createClient(): PrismaClient | null {
  try {
    if (!process.env.DATABASE_URL) return null;
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
    return new PrismaClient({ adapter });
  } catch {
    console.warn('[db] Failed to create Prisma client — falling back to static data');
    return null;
  }
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== 'production' && prisma) globalForPrisma.prisma = prisma;
