import { z } from 'zod';
import prisma from '../../../../utils/db';

export const navbarHandlers = {
	create: async (input: z.infer<typeof createNavbarSchema>) => {
		return await prisma.navbar.create({ data: input });
	},
	read: async (id: number) => {
		return await prisma.navbar.findUnique({
			where: { id },
			include: {
				text: {
					include: {
						translations: true,
					},
				},
			},
		});
	},
	read_by_language: async (id: number, language: string) => {
		return await prisma.navbar.findUnique({
			where: { id },
			include: {
				text: {
					include: {
						translations: {
							where: { language: language },
						},
					},
				},
			},
		});
	},
	update: async (input: z.infer<typeof updateNavbarSchema>) => {
		return await prisma.navbar.update({ where: { id: input.id }, data: input });
	},
	delete: async (id: number) => {
		return await prisma.navbar.delete({ where: { id } });
	},
	list: async () => {
		return await prisma.navbar.findMany({
			include: {
				text: {
					include: {
						translations: true,
					},
				},
			},
		});
	},
	list_by_language: async (language: string) => {
		return await prisma.navbar.findMany({
			include: {
				text: {
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

const createNavbarSchema = z.object({
	textRawTranslationId: z.number(),
	href: z.string(),
	withLanguagePrefix: z.boolean(),
});

const updateNavbarSchema = z.object({
	id: z.number(),
	textRawTranslationId: z.number().optional(),
	href: z.string().optional(),
	withLanguagePrefix: z.boolean().optional(),
});
