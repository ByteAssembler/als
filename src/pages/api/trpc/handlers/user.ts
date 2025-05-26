import { Role } from '@prisma/client';
import { z } from 'zod';
import prisma from '../../../../utils/db';

export const userHandlers = {
	create: async (input: z.infer<typeof createUserSchema>) => {
		// In a real application, hash the password before saving
		return await prisma.user.create({ data: input });
	},
	read: async (id: number) => {
		return await prisma.user.findUnique({ where: { id } });
	},
	update: async (input: z.infer<typeof updateUserSchema>) => {
		// In a real application, handle password updates securely
		return await prisma.user.update({ where: { id: input.id }, data: input });
	},
	delete: async (id: number) => {
		return await prisma.user.delete({ where: { id } });
	},
	list: async () => {
		return await prisma.user.findMany();
	},
};

const createUserSchema = z.object({
	name: z.string(),
	passwordHash: z.string(), // Remember to hash in a real app
	role: z.nativeEnum(Role).default(Role.EDITOR),
});

const updateUserSchema = z.object({
	id: z.number(),
	name: z.string().optional(),
	passwordHash: z.string().optional(), // Remember to hash in a real app
	role: z.nativeEnum(Role).optional(),
});
