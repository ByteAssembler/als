import { z } from 'zod';
import prisma from '../../../../utils/db';

export const blogHandlers = {
	create: async (input: z.infer<typeof createBlogSchema>) => {
		return await prisma.blog.create({ data: input });
	},
	read: async (id: number) => {
		return await prisma.blog.findUnique({
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
	update: async (input: z.infer<typeof updateBlogSchema>) => {
		return await prisma.blog.update({ where: { id: input.id }, data: input });
	},
	delete: async (id: number) => {
		return await prisma.blog.delete({ where: { id } });
	},
	list: async () => {
		return await prisma.blog.findMany({
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

const createBlogSchema = z.object({
	titleRawTranslationId: z.number(),
	slug: z.string(),
	authors: z.array(z.string()),
	contentRawTranslationId: z.number(),
	coverImage: z.string().optional(),
});

const updateBlogSchema = z.object({
	id: z.number(),
	titleRawTranslationId: z.number().optional(),
	slug: z.string().optional(),
	authors: z.array(z.string()).optional(),
	contentRawTranslationId: z.number().optional(),
	coverImage: z.string().optional().nullable(),
});
