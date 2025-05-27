import { z } from 'zod';
import prisma from '../../../../utils/db';
import { getTranslation } from '../../../../utils';

export const mapPointCategoryHandlers = {
	create: async (input: z.infer<typeof createMapPointCategorySchema>) => {
		return await prisma.mapPointCategory.create({ data: input });
	},
	read: async (id: number, language?: string) => {
		const mapPointCategory = await prisma.mapPointCategory.findUnique({
			where: { id },
			include: {
				name: {
					include: {
						translations: true,
					},
				},
			},
		});

		if (!mapPointCategory) {
			return null;
		}

		const name = language ? await getTranslation(mapPointCategory.nameRawTranslationId, language) : mapPointCategory.name.translations[0]?.value;

		return {
			...mapPointCategory,
			name: name ?? mapPointCategory.name.translations[0]?.value,
		};
	},
	read_by_language: async (id: number, language: string) => {
		const mapPointCategory = await prisma.mapPointCategory.findUnique({
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

		if (!mapPointCategory) {
			return null;
		}

		const name = await getTranslation(mapPointCategory.nameRawTranslationId, language);

		return {
			...mapPointCategory,
			name: name ?? mapPointCategory.name.translations[0]?.value,
		};
	},
	update: async (input: z.infer<typeof updateMapPointCategorySchema>) => {
		return await prisma.mapPointCategory.update({ where: { id: input.id }, data: input });
	},
	delete: async (id: number) => {
		return await prisma.mapPointCategory.delete({ where: { id } });
	},
	list: async (language?: string) => {
		const mapPointCategories = await prisma.mapPointCategory.findMany({
			include: {
				name: {
					include: {
						translations: true,
					},
				},
			},
		});

		if (!mapPointCategories || mapPointCategories.length === 0) {
			return [];
		}

		const rawTranslationIds = mapPointCategories.map((mapPointCategory) => mapPointCategory.nameRawTranslationId);

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

		return mapPointCategories.map((mapPointCategory) => {
			const name = language ? translations[mapPointCategory.nameRawTranslationId] : mapPointCategory.name.translations[0]?.value;
			return {
				...mapPointCategory,
				name: name ?? mapPointCategory.name.translations[0]?.value,
			};
		});
	},
	list_by_language: async (language: string) => {
		const mapPointCategories = await prisma.mapPointCategory.findMany({
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

		if (!mapPointCategories || mapPointCategories.length === 0) {
			return [];
		}

		const rawTranslationIds = mapPointCategories.map((mapPointCategory) => mapPointCategory.nameRawTranslationId);

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

		return mapPointCategories.map((mapPointCategory) => {
			const name = translations[mapPointCategory.nameRawTranslationId];
			return {
				...mapPointCategory,
				name: name ?? mapPointCategory.name.translations[0]?.value,
			};
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
