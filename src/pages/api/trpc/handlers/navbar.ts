import { z } from 'zod';
import prisma from '../../../../utils/db';
import { getTranslation } from '../../../../utils';

export const navbarHandlers = {
	create: async (input: z.infer<typeof createNavbarSchema>) => {
		return await prisma.navbar.create({ data: input });
	},
	read: async (id: number, language?: string) => {
		const navbar = await prisma.navbar.findUnique({
			where: { id },
			include: {
				text: {
					include: {
						translations: true,
					},
				},
			},
		});

		if (!navbar) {
			return null;
		}

		const text = language ? await getTranslation(navbar.textRawTranslationId, language) : navbar.text.translations[0]?.value;

		return {
			...navbar,
			text: text ?? navbar.text.translations[0]?.value,
		};
	},
	read_by_language: async (id: number, language: string) => {
		const navbar = await prisma.navbar.findUnique({
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

		if (!navbar) {
			return null;
		}

		const text = await getTranslation(navbar.textRawTranslationId, language);

		return {
			...navbar,
			text: text ?? navbar.text.translations[0]?.value,
		};
	},
	update: async (input: z.infer<typeof updateNavbarSchema>) => {
		return await prisma.navbar.update({ where: { id: input.id }, data: input });
	},
	delete: async (id: number) => {
		return await prisma.navbar.delete({ where: { id } });
	},
	list: async (language?: string) => {
		const navbars = await prisma.navbar.findMany({
			include: {
				text: {
					include: {
						translations: true,
					},
				},
			},
		});

		if (!navbars || navbars.length === 0) {
			return [];
		}

		const rawTranslationIds = navbars.map((navbar) => navbar.textRawTranslationId);

		let translations: { [key: number]: string | null } = {};

		if (language) {
			const translationRecords = await prisma.rawTranslation.findMany({
				where: {
					id: {
						in: rawTranslationIds,
					},
				},
				include: {
					translations: {
						where: {
							language: language,
						},
					},
				},
			});

			translations = translationRecords.reduce((acc: { [key: number]: string | null }, record) => {
				acc[record.id] = record.translations.length > 0 ? record.translations[0].value : null;
				return acc;
			}, {});
		}

		return navbars.map((navbar) => {
			const text = language ? translations[navbar.textRawTranslationId] : navbar.text.translations[0]?.value;
			return {
				...navbar,
				text: text ?? navbar.text.translations[0]?.value,
			};
		});
	},
	list_by_language: async (language: string) => {
		const navbars = await prisma.navbar.findMany({
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

		if (!navbars || navbars.length === 0) {
			return [];
		}

		const rawTranslationIds = navbars.map((navbar) => navbar.textRawTranslationId);

		const translationRecords = await prisma.rawTranslation.findMany({
			where: {
				id: {
					in: rawTranslationIds,
				},
			},
			include: {
				translations: {
					where: {
						language: language,
					},
				},
			},
		});

		const translations = translationRecords.reduce((acc: { [key: number]: string | null }, record) => {
			acc[record.id] = record.translations.length > 0 ? record.translations[0].value : null;
			return acc;
		}, {});

		return navbars.map((navbar) => {
			const text = translations[navbar.textRawTranslationId];
			return {
				...navbar,
				text: text ?? navbar.text.translations[0]?.value,
			};
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
