import { z } from 'zod';
import prisma from '../../../../utils/db';
import { Language } from '@prisma/client';

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
	read_by_language: async (id: number, language: Language) => {
		return await prisma.mapPointCategory.findUnique({
			where: { id },
			include: {
				name: {
					include: {
						translations: {
							where: { language: language },
						},
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
	list_by_language: async (language: Language) => {
		return await prisma.mapPointCategory.findMany({
			include: {
				name: {
					include: {
						translations: {
							where: { language: language },
						},
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
