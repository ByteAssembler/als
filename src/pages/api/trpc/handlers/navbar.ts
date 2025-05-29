import { z } from 'zod';
import prisma from '../../../../utils/db';
import type { Prisma } from '@prisma/client';

const mapTranslationsForPrisma = (translations: Record<string, string> | undefined) => {
	if (!translations) return [];
	return Object.entries(translations).map(([language, value]) => ({
		language,
		value,
	}));
};

// Helper function to get navbar with translated fields
async function getNavbarWithTranslatedFields(
	whereClause: Prisma.NavbarWhereUniqueInput,
	language?: string
) {
	const navbar = await prisma.navbar.findUnique({
		where: whereClause,
		include: {
			text: {
				include: {
					translations: language ? { where: { language } } : true,
				},
			},
		},
	});

	if (!navbar) return null;

	return {
		...navbar,
		text: navbar.text.translations.length > 0 ? navbar.text.translations[0]?.value : null,
	};
}

export const navbarHandlers = {
	create: async (input: z.infer<typeof createNavbarSchema>) => {
		const { texts, ...rest } = input;
		return await prisma.navbar.create({
			data: {
				...rest,
				text: {
					create: {
						translations: {
							create: mapTranslationsForPrisma(texts),
						},
					},
				},
			},
		});
	},

	read: async (id: number, language?: string) => {
		return getNavbarWithTranslatedFields({ id }, language);
	},

	read_by_language: async (id: number, language: string) => {
		return getNavbarWithTranslatedFields({ id }, language);
	},

	update: async (input: z.infer<typeof updateNavbarSchema>) => {
		const { id, texts, ...rest } = input;

		return await prisma.navbar.update({
			where: { id },
			data: {
				...rest,
				...(texts && {
					text: {
						update: {
							translations: {
								deleteMany: {},
								create: mapTranslationsForPrisma(texts),
							},
						},
					},
				}),
			},
		});
	},

	delete: async (id: number) => {
		return await prisma.navbar.delete({ where: { id } });
	},

	list: async (language?: string) => {
		const navbars = await prisma.navbar.findMany({
			include: {
				text: {
					include: {
						translations: language ? { where: { language } } : true,
					},
				},
			},
		});

		if (!navbars || navbars.length === 0) {
			return [];
		}

		return navbars.map((navbar) => ({
			...navbar,
			text: navbar.text.translations.length > 0 ? navbar.text.translations[0]?.value : null,
		}));
	},

	list_by_language: async (language: string) => {
		return navbarHandlers.list(language);
	},
};

const createNavbarSchema = z.object({
	texts: z.record(z.string(), z.string()),
	href: z.string(),
	withLanguagePrefix: z.boolean(),
});

const updateNavbarSchema = z.object({
	id: z.number(),
	texts: z.record(z.string(), z.string()).optional(),
	href: z.string().optional(),
	withLanguagePrefix: z.boolean().optional(),
});
