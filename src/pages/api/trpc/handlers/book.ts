import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

export const bookHandlers = {
	create: async (input: z.infer<typeof createBookSchema>) => {
		return await prisma.book.create({ data: input });
	},
	read: async (id: number) => {
		return await prisma.book.findUnique({
			where: { id },
			include: {
				title: {
					include: {
						translations: true,
					},
				},
				content: {
					include: {
						translations: true,
					},
				},
			},
		});
	},
	update: async (input: z.infer<typeof updateBookSchema>) => {
		return await prisma.book.update({ where: { id: input.id }, data: input });
	},
	delete: async (id: number) => {
		return await prisma.book.delete({ where: { id } });
	},
	list: async () => {
		return await prisma.book.findMany({
			include: {
				title: {
					include: {
						translations: true,
					},
				},
				content: {
					include: {
						translations: true,
					},
				},
			},
		});
	},
};

const createBookSchema = z.object({
	titleRawTranslationId: z.number(),
	author: z.string(),
	isbn: z.string().optional(),
	coverImage: z.string().optional(),
	published: z.string().datetime(), // Or z.date() if you handle conversion
	contentRawTranslationId: z.number(),
	links: z.array(z.string()),
});

const updateBookSchema = z.object({
	id: z.number(),
	titleRawTranslationId: z.number().optional(),
	author: z.string().optional(),
	isbn: z.string().optional().nullable(),
	coverImage: z.string().optional().nullable(),
	published: z.string().datetime().optional(), // Or z.date()
	contentRawTranslationId: z.number().optional(),
	links: z.array(z.string()).optional(),
});
