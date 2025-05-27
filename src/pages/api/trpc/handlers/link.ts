import { z } from 'zod';
import prisma from '../../../../utils/db';

export const linkHandlers = {
	create: async (input: z.infer<typeof createLinkSchema>) => {
		return await prisma.link.create({ data: input });
	},
	read: async (id: number) => {
		return await prisma.link.findUnique({
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
			},
		});
	},
	read_by_language: async (id: number, language: string) => {
		return await prisma.link.findUnique({
			where: { id },
			include: {
				name: {
					include: {
						translations: {
							where: { language: language },
						},
					},
				},
				description: {
					include: {
						translations: {
							where: { language: language },
						},
					},
				},
			},
		});
	},
	update: async (input: z.infer<typeof updateLinkSchema>) => {
		return await prisma.link.update({ where: { id: input.id }, data: input });
	},
	delete: async (id: number) => {
		return await prisma.link.delete({ where: { id } });
	},
	list: async () => {
		return await prisma.link.findMany({
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
			},
		});
	},
	list_by_language: async (language: string) => {
		return await prisma.link.findMany({
			include: {
				name: {
					include: {
						translations: {
							where: { language: language },
						},
					},
				},
				description: {
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

const createLinkSchema = z.object({
	nameRawTranslationId: z.number(),
	descriptionRawTranslationId: z.number().optional(),
	url: z.string(),
});

const updateLinkSchema = z.object({
	id: z.number(),
	nameRawTranslationId: z.number().optional(),
	descriptionRawTranslationId: z.number().optional().nullable(),
	url: z.string().optional(),
});
