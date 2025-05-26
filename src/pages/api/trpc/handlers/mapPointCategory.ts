import { z } from 'zod';
import prisma from '../../../../utils/db';

export const mapPointCategoryHandlers = {
	create: async (input: z.infer<typeof createMapPointCategorySchema>) => {
		return await prisma.mapPointCategory.create({ data: input });
	},
	read: async (id: number) => {
		return await prisma.mapPointCategory.findUnique({
			where: { id },
			include: {
				name: {
					include: {
						translations: true,
					},
				},
			},
		});
	},
	update: async (input: z.infer<typeof updateMapPointCategorySchema>) => {
		return await prisma.mapPointCategory.update({ where: { id: input.id }, data: input });
	},
	delete: async (id: number) => {
		return await prisma.mapPointCategory.delete({ where: { id } });
	},
	list: async () => {
		return await prisma.mapPointCategory.findMany({
			include: {
				name: {
					include: {
						translations: true,
					},
				},
			},
		});
	},
};

const createMapPointCategorySchema = z.object({
	nameRawTranslationId: z.number(),
});

const updateMapPointCategorySchema = z.object({
	id: z.number(),
	nameRawTranslationId: z.number().optional(),
});
