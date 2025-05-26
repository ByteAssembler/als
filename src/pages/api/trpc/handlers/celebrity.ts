import { z } from 'zod';
import prisma from '../../../../utils/db';

export const celebrityHandlers = {
	create: async (input: z.infer<typeof createCelebritySchema>) => {
		return await prisma.celebrity.create({ data: input });
	},
	read: async (id: number) => {
		return await prisma.celebrity.findUnique({
			where: { id },
			include: {
				bio: {
					include: {
						translations: true,
					},
				},
				profession: {
					include: {
						translations: true,
					},
				},
			},
		});
	},
	update: async (input: z.infer<typeof updateCelebritySchema>) => {
		return await prisma.celebrity.update({ where: { id: input.id }, data: input });
	},
	delete: async (id: number) => {
		return await prisma.celebrity.delete({ where: { id } });
	},
	list: async () => {
		return await prisma.celebrity.findMany({
			include: {
				bio: {
					include: {
						translations: true,
					},
				},
				profession: {
					include: {
						translations: true,
					},
				},
			},
		});
	},
};

const createCelebritySchema = z.object({
	image: z.string().optional(),
	name: z.string(),
	bioRawTranslationId: z.number(),
	professionRawTranslationId: z.number(),
	born: z.string().datetime(), // Or z.date()
	died: z.string().datetime().optional().nullable(), // Or z.date()
	alsYear: z.number(),
});

const updateCelebritySchema = z.object({
	id: z.number(),
	image: z.string().optional().nullable(),
	name: z.string().optional(),
	bioRawTranslationId: z.number().optional(),
	professionRawTranslationId: z.number().optional(),
	born: z.string().datetime().optional(), // Or z.date()
	died: z.string().datetime().optional().nullable(), // Or z.date()
	alsYear: z.number().optional(),
});
