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

// Helper function to get mapPointCategory with translated fields
async function getMapPointCategoryWithTranslatedFields(
	whereClause: Prisma.MapPointCategoryWhereUniqueInput,
	language?: string
) {
	const mapPointCategory = await prisma.mapPointCategory.findUnique({
		where: whereClause,
		include: {
			name: {
				include: {
					translations: language ? { where: { language } } : true,
				},
			},
			mapPoints: true,
		},
	});

	if (!mapPointCategory) return null;

	return {
		...mapPointCategory,
		name: mapPointCategory.name.translations.length > 0 ? mapPointCategory.name.translations[0]?.value : null,
	};
}

export const mapPointCategoryHandlers = {
	create: async (input: z.infer<typeof createMapPointCategorySchema>) => {
		const { names } = input;
		return await prisma.mapPointCategory.create({
			data: {
				name: {
					create: {
						translations: {
							create: mapTranslationsForPrisma(names),
						},
					},
				},
			},
		});
	},

	read: async (id: number, language?: string) => {
		return getMapPointCategoryWithTranslatedFields({ id }, language);
	},

	read_by_language: async (id: number, language: string) => {
		return getMapPointCategoryWithTranslatedFields({ id }, language);
	},

	update: async (input: z.infer<typeof updateMapPointCategorySchema>) => {
		const { id, names } = input;

		return await prisma.mapPointCategory.update({
			where: { id },
			data: {
				...(names && {
					name: {
						update: {
							translations: {
								deleteMany: {},
								create: mapTranslationsForPrisma(names),
							},
						},
					},
				}),
			},
		});
	},

	delete: async (id: number) => {
		return await prisma.mapPointCategory.delete({ where: { id } });
	},

	list: async () => {
		const mapPointCategories = await prisma.mapPointCategory.findMany({
			include: {
				name: {
					include: {
						translations: true,
					},
				},
				mapPoints: true,
			},
		});

		if (!mapPointCategories || mapPointCategories.length === 0) {
			return [];
		}

		return mapPointCategories.map((mapPointCategory) => ({
			...mapPointCategory,
			names: mapPointCategory.name.translations.map(t => ({
				text: t.value,
				language: t.language
			})),
		}));
	},

	list_by_language: async (language: string) => {
		const mapPointCategories = await prisma.mapPointCategory.findMany({
			include: {
				name: {
					include: {
						translations: {
							where: { language },
						},
					},
				},
				mapPoints: true,
			},
		});

		if (!mapPointCategories || mapPointCategories.length === 0) {
			return [];
		}

		return mapPointCategories.map((mapPointCategory) => ({
			...mapPointCategory,
			name: mapPointCategory.name.translations.length > 0 ? mapPointCategory.name.translations[0].value : null,
		}));
	},
};

const createMapPointCategorySchema = z.object({
	names: z.record(z.string(), z.string()),
});

const updateMapPointCategorySchema = z.object({
	id: z.number(),
	names: z.record(z.string(), z.string()).optional(),
});
