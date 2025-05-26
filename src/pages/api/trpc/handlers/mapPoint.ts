import { z } from 'zod';
import prisma from '../../../../utils/db';

export const mapPointHandlers = {
	create: async (input: z.infer<typeof createMapPointSchema>) => {
		return await prisma.mapPoint.create({ data: input });
	},
	read: async (id: number) => {
		return await prisma.mapPoint.findUnique({
			where: { id },
			include: {
				name: {
					include: {
						translations: true,
					},
				},
				description: {
					include: {
						translations: true,
					},
				},
				category: {
					include: {
						name: {
							include: {
								translations: true,
							},
						},
					},
				},
			},
		});
	},
	update: async (input: z.infer<typeof updateMapPointSchema>) => {
		return await prisma.mapPoint.update({ where: { id: input.id }, data: input });
	},
	delete: async (id: number) => {
		return await prisma.mapPoint.delete({ where: { id } });
	},
	list: async () => {
		return await prisma.mapPoint.findMany({
			include: {
				name: {
					include: {
						translations: true,
					},
				},
				description: {
					include: {
						translations: true,
					},
				},
				category: {
					include: {
						name: {
							include: {
								translations: true,
							},
						},
					},
				},
			},
		});
	},
};

const createMapPointSchema = z.object({
	nameRawTranslationId: z.number(),
	descriptionRawTranslationId: z.number().optional(),
	categoryId: z.number(),
	latitude: z.number(),
	longitude: z.number(),
});

const updateMapPointSchema = z.object({
	id: z.number(),
	nameRawTranslationId: z.number().optional(),
	descriptionRawTranslationId: z.number().optional().nullable(),
	categoryId: z.number().optional(),
	latitude: z.number().optional(),
	longitude: z.number().optional(),
});
