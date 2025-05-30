import { Role } from '@prisma/client';
import { z } from 'zod';
import { hash } from 'bcrypt';
import prisma from '@/utils/db';

export const userHandlers = {
  register: async (input: z.infer<typeof registerUserSchema>) => {
    if ((await prisma.user.count()) === 0) {
      input.role = Role.SUPERADMIN;
    }

    return await prisma.user.create({
      data: {
        ...input,
        passwordHash: await hash(input.password, 12),
      }
    });
  },
  read: async (id: number) => {
    return await prisma.user.findUnique({ where: { id } });
  },
  update: async (input: z.infer<typeof updateUserSchema>) => {
    // In a real application, handle password updates securely
    return await prisma.user.update({
      where: { id: input.id }, data: {
        ...input,
        passwordHash: input.password ? await hash(input.password, 12) : undefined,
      }
    });
  },
  delete: async (id: number) => {
    return await prisma.user.delete({ where: { id } });
  },
  list: async () => {
    return await prisma.user.findMany();
  },
};

const registerUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string(), // Remember to hash in a real app
  role: z.nativeEnum(Role).default(Role.EDITOR),
});

const updateUserSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  password: z.string().optional(),
  role: z.nativeEnum(Role).optional(),
});

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
