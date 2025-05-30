import { z } from 'zod';
import prisma from '../../../../utils/db';
import type { Prisma } from '@prisma/client';

// Helper function to map translations for Prisma
const mapTranslationsForPrisma = (translations: Record<string, string> | undefined) => {
	if (!translations) return [];
	return Object.entries(translations).map(([language, value]) => ({
		language,
		value,
	}));
};

// Helper function to get mapPoint with translated fields
async function getMapPointWithTranslatedFields(
	whereClause: Prisma.MapPointWhereUniqueInput,
	language?: string
) {
	const mapPoint = await prisma.mapPoint.findUnique({
		where: whereClause,
		include: {
			name: {
				include: {
					translations: language ? { where: { language } } : true,
				},
			},
			description: {
				include: {
					translations: language ? { where: { language } } : true,
				},
			},
			category: {
				include: {
					name: {
						include: {
							translations: language ? { where: { language } } : true,
						},
					},
				},
			},
		},
	});

	if (!mapPoint) return null;

	return {
		...mapPoint,
		name: mapPoint.name.translations.length > 0 ? mapPoint.name.translations[0]?.value : null,
		description: mapPoint.description?.translations && mapPoint.description.translations.length > 0
			? mapPoint.description.translations[0]?.value
			: null,
	};
}

export const mapPointHandlers = {
	create: async (input: z.infer<typeof createMapPointSchema>) => {
		const { names, descriptions, categoryId, ...rest } = input;
		return await prisma.mapPoint.create({
			data: {
				...rest,
				name: {
					create: {
						translations: {
							create: mapTranslationsForPrisma(names),
						},
					},
				},
				...(descriptions && Object.keys(descriptions).length > 0 && {
					description: {
						create: {
							translations: {
								create: mapTranslationsForPrisma(descriptions),
							},
						},
					},
				}),
				category: {
					connect: { id: categoryId }
				}
			},
		});
	},

	read: async (id: number, language?: string) => {
		return getMapPointWithTranslatedFields({ id }, language);
	},

	read_by_language: async (id: number, language: string) => {
		return getMapPointWithTranslatedFields({ id }, language);
	},

	update: async (input: z.infer<typeof updateMapPointSchema>) => {
		const { id, names, descriptions, categoryId, ...rest } = input;

		return await prisma.mapPoint.update({
			where: { id },
			data: {
				...rest,
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
				...(descriptions !== undefined && {
					description: descriptions ? {
						upsert: {
							create: {
								translations: {
									create: mapTranslationsForPrisma(descriptions),
								},
							},
							update: {
								translations: {
									deleteMany: {},
									create: mapTranslationsForPrisma(descriptions),
								},
							},
						},
					} : {
						disconnect: true,
					},
				}),
				...(categoryId !== undefined && {
					category: {
						connect: { id: categoryId }
					}
				})
			},
		});
	},

	delete: async (id: number) => {
		return await prisma.mapPoint.delete({ where: { id } });
	},

	list: async () => {
		const mapPoints = await prisma.mapPoint.findMany({
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

		if (!mapPoints || mapPoints.length === 0) {
			return [];
		}

		return mapPoints.map((mapPoint) => ({
			...mapPoint,
			names: mapPoint.name.translations.map(t => ({
				text: t.value,
				language: t.language
			})),
			descriptions: mapPoint.description?.translations.map(t => ({
				text: t.value,
				language: t.language
			})) || [],
			category: {
				...mapPoint.category,
				names: mapPoint.category.name.translations.map(t => ({
					text: t.value,
					language: t.language
				})),
			},
		}));
	},

	list_by_language: async (language: string) => {
		const mapPoints = await prisma.mapPoint.findMany({
			include: {
				name: {
					include: {
						translations: {
							where: { language },
						},
					},
				},
				description: {
					include: {
						translations: {
							where: { language },
						},
					},
				},
				category: {
					include: {
						name: {
							include: {
								translations: {
									where: { language },
								},
							},
						},
					},
				},
			},
		});

		if (!mapPoints || mapPoints.length === 0) {
			return [];
		}

		return mapPoints.map((mapPoint) => ({
			...mapPoint,
			name: mapPoint.name.translations.length > 0 ? mapPoint.name.translations[0]?.value : null,
			description: mapPoint.description ? mapPoint.description.translations.length > 0 ? mapPoint.description?.translations[0]?.value : null : null,
			category: {
				...mapPoint.category,
				name: mapPoint.category.name.translations.length > 0 ? mapPoint.category.name.translations[0]?.value : null,
			},
		}));
	},
};

// Fix: Ensure proper number types in schema
const createMapPointSchema = z.object({
	names: z.record(z.string(), z.string()),
	descriptions: z.record(z.string(), z.string()).optional(),
	categoryId: z.number(),
	latitude: z.number(),
	longitude: z.number(),
});

const updateMapPointSchema = z.object({
	id: z.number(),
	names: z.record(z.string(), z.string()).optional(),
	descriptions: z.record(z.string(), z.string()).optional().nullable(),
	categoryId: z.number().optional(),
	latitude: z.number().optional(),
	longitude: z.number().optional(),
});
