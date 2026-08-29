import { PrismaClient } from '@prisma/client';

// Reuse one Prisma client while developing, instead of opening a new connection per request.
export const prisma = new PrismaClient();
