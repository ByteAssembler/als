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
			// iconKey is a scalar field, Prisma includes it by default
		},
	});

	if (!mapPointCategory) return null;

	return {
		...mapPointCategory, // iconKey will be part of this spread
		name: mapPointCategory.name.translations.length > 0 ? mapPointCategory.name.translations[0]?.value : null,
	};
}

export const mapPointCategoryHandlers = {
	create: async (input: z.infer<typeof createMapPointCategorySchema>) => {
		const { names, iconKey } = input; // Destructure iconKey
		return await prisma.mapPointCategory.create({
			data: {
				iconKey, // Save iconKey
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
		const { id, names, iconKey } = input; // Destructure iconKey

		return await prisma.mapPointCategory.update({
			where: { id },
			data: {
				...(iconKey !== undefined && { iconKey }), // Update iconKey if provided
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
		// First delete all map points that reference this category
		await prisma.mapPoint.deleteMany({
			where: {
				categoryId: id
			}
		});

		// Then delete the category
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
				// iconKey is a scalar field, Prisma includes it by default
			},
		});

		if (!mapPointCategories || mapPointCategories.length === 0) {
			return [];
		}

		return mapPointCategories.map((mapPointCategory) => ({
			...mapPointCategory, // iconKey will be part of this spread
			names: mapPointCategory.name.translations.map(t => ({
				text: t.value,
				language: t.language
			})),
			mapPoints: mapPointCategory.mapPoints,
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
				// iconKey is a scalar field, Prisma includes it by default
			},
		});

		if (!mapPointCategories || mapPointCategories.length === 0) {
			return [];
		}

		return mapPointCategories.map((mapPointCategory) => ({
			...mapPointCategory, // iconKey will be part of this spread
			name: mapPointCategory.name.translations.length > 0 ? mapPointCategory.name.translations[0].value : null,
		}));
	},
};

const createMapPointCategorySchema = z.object({
	names: z.record(z.string(), z.string()),
	iconKey: z.string().optional().nullable(), // Added iconKey
});

const updateMapPointCategorySchema = z.object({
	id: z.number(),
	names: z.record(z.string(), z.string()).optional(),
	iconKey: z.string().optional().nullable(), // Added iconKey
});
