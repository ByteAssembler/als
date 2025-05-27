import { z } from 'zod';
import prisma from '../../../../utils/db';
import { getTranslation } from '../../../../utils';

export const mapPointHandlers = {
	create: async (input: z.infer<typeof createMapPointSchema>) => {
		return await prisma.mapPoint.create({ data: input });
	},
	read: async (id: number, language?: string) => {
		const mapPoint = await prisma.mapPoint.findUnique({
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

		if (!mapPoint) {
			return null;
		}

		const name = language ? await getTranslation(mapPoint.nameRawTranslationId, language) : mapPoint.name.translations[0]?.value;
		const description = mapPoint.descriptionRawTranslationId ? (language ? await getTranslation(mapPoint.descriptionRawTranslationId, language) : mapPoint.description?.translations[0]?.value) : null;

		return {
			...mapPoint,
			name: name ?? mapPoint.name.translations[0]?.value,
			description: description ?? mapPoint.description?.translations[0]?.value ?? null,
		};
	},
	read_by_language: async (id: number, language: string) => {
		const mapPoint = await prisma.mapPoint.findUnique({
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
				category: {
					include: {
						name: {
							include: {
								translations: {
									where: { language: language },
								},
							},
						},
					},
				},
			},
		});

		if (!mapPoint) {
			return null;
		}

		const name = await getTranslation(mapPoint.nameRawTranslationId, language);
		const description = mapPoint.descriptionRawTranslationId ? await getTranslation(mapPoint.descriptionRawTranslationId, language) : null;

		return {
			...mapPoint,
			name: name ?? mapPoint.name.translations[0]?.value,
			description: description ?? mapPoint.description?.translations[0]?.value ?? null,
		};
	},
	update: async (input: z.infer<typeof updateMapPointSchema>) => {
		return await prisma.mapPoint.update({ where: { id: input.id }, data: input });
	},
	delete: async (id: number) => {
		return await prisma.mapPoint.delete({ where: { id } });
	},
	list: async (language?: string) => {
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

		const rawTranslationIds: number[] = [];
		mapPoints.forEach((mapPoint) => {
			rawTranslationIds.push(mapPoint.nameRawTranslationId);
			if (mapPoint.descriptionRawTranslationId) {
				rawTranslationIds.push(mapPoint.descriptionRawTranslationId);
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

		return mapPoints.map((mapPoint) => {
			const name = language ? translations[mapPoint.nameRawTranslationId] : mapPoint.name.translations[0]?.value;
			const description = mapPoint.descriptionRawTranslationId
				? language
					? translations[mapPoint.descriptionRawTranslationId]
					: mapPoint.description?.translations[0]?.value
				: null;

			return {
				...mapPoint,
				name: name ?? mapPoint.name.translations[0]?.value,
				description: description ?? mapPoint.description?.translations[0]?.value ?? null,
			};
		});
	},
	list_by_language: async (language: string) => {
		const mapPoints = await prisma.mapPoint.findMany({
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
				category: {
					include: {
						name: {
							include: {
								translations: {
									where: { language: language },
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

		const rawTranslationIds: number[] = [];
		mapPoints.forEach((mapPoint) => {
			rawTranslationIds.push(mapPoint.nameRawTranslationId);
			if (mapPoint.descriptionRawTranslationId) {
				rawTranslationIds.push(mapPoint.descriptionRawTranslationId);
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

		return mapPoints.map((mapPoint) => {
			const name = translations[mapPoint.nameRawTranslationId];
			const description = mapPoint.descriptionRawTranslationId ? translations[mapPoint.descriptionRawTranslationId] : null;

			return {
				...mapPoint,
				name: name ?? mapPoint.name.translations[0]?.value,
				description: description ?? mapPoint.description?.translations[0]?.value ?? null,
			};
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
