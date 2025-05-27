import { z } from 'zod';
import prisma from '../../../../utils/db';
import { getTranslation } from '../../../../utils';

export const linkHandlers = {
	findAll: async () => {
		return await prisma.link.findMany();
	},
	create: async (input: z.infer<typeof createLinkSchema>) => {
		return await prisma.link.create({ data: input });
	},
	read: async (id: number, language?: string) => {
		const link = await prisma.link.findUnique({
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

		if (!link) {
			return null;
		}

		const name = language ? await getTranslation(link.nameRawTranslationId, language) : link.name.translations[0]?.value;
		const description = link.descriptionRawTranslationId ? (language ? await getTranslation(link.descriptionRawTranslationId, language) : link.description?.translations[0]?.value) : null;

		return {
			...link,
			name: name ?? link.name.translations[0]?.value,
			description: description ?? link.description?.translations[0]?.value ?? null,
		};
	},
	read_by_language: async (id: number, language: string) => {
		const link = await prisma.link.findUnique({
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

		if (!link) {
			return null;
		}

		const name = await getTranslation(link.nameRawTranslationId, language);
		const description = link.descriptionRawTranslationId ? await getTranslation(link.descriptionRawTranslationId, language) : null;

		return {
			...link,
			name: name ?? link.name.translations[0]?.value,
			description: description ?? link.description?.translations[0]?.value ?? null,
		};
	},
	update: async (input: z.infer<typeof updateLinkSchema>) => {
		return await prisma.link.update({ where: { id: input.id }, data: input });
	},
	delete: async (id: number) => {
		return await prisma.link.delete({ where: { id } });
	},
	list: async (language?: string) => {
		const links = await prisma.link.findMany({
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

		if (!links || links.length === 0) {
			return [];
		}

		const rawTranslationIds: number[] = [];
		links.forEach((link) => {
			rawTranslationIds.push(link.nameRawTranslationId);
			if (link.descriptionRawTranslationId) {
				rawTranslationIds.push(link.descriptionRawTranslationId);
			}
		});

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

		return links.map((link) => {
			const name = language ? translations[link.nameRawTranslationId] : link.name.translations[0]?.value;
			const description = link.descriptionRawTranslationId
				? language
					? translations[link.descriptionRawTranslationId]
					: link.description?.translations[0]?.value
				: null;

			return {
				...link,
				name: name ?? link.name.translations[0]?.value,
				description: description ?? link.description?.translations[0]?.value ?? null,
			};
		});
	},
	list_by_language: async (language: string) => {
		const links = await prisma.link.findMany({
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

		if (!links || links.length === 0) {
			return [];
		}

		const rawTranslationIds: number[] = [];
		links.forEach((link) => {
			rawTranslationIds.push(link.nameRawTranslationId);
			if (link.descriptionRawTranslationId) {
				rawTranslationIds.push(link.descriptionRawTranslationId);
			}
		});

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

		return links.map((link) => {
			const name = translations[link.nameRawTranslationId];
			const description = link.descriptionRawTranslationId ? translations[link.descriptionRawTranslationId] : null;

			return {
				...link,
				name: name ?? link.name.translations[0]?.value,
				description: description ?? link.description?.translations[0]?.value ?? null,
			};
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
