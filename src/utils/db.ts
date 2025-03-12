import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
    log: ['warn', 'error'], // Logs queries and errors
});

export default prisma;
