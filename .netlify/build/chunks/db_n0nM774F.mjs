import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"]
  // Logs queries and errors
});

export { prisma as p };
