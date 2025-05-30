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

// Helper function to get celebrity with translated fields
async function getCelebrityWithTranslatedFields(
	whereClause: Prisma.CelebrityWhereUniqueInput,
	language?: string
) {
	const celebrity = await prisma.celebrity.findUnique({
		where: whereClause,
		include: {
			bio: {
				include: {
					translations: language ? { where: { language } } : true,
				},
			},
			profession: {
				include: {
					translations: language ? { where: { language } } : true,
				},
			},
		},
	});

	if (!celebrity) return null;

	return {
		...celebrity,
		bio: celebrity.bio.translations.length > 0 ? celebrity.bio.translations[0]?.value : null,
		profession: celebrity.profession.translations.length > 0 ? celebrity.profession.translations[0]?.value : null,
	};
}

export const celebrityHandlers = {
	create: async (input: z.infer<typeof createCelebritySchema>) => {
		const { image, bios, professions, ...rest } = input;
		return await prisma.celebrity.create({
			data: {
				...rest,
				imageKey: image,
				bio: {
					create: {
						translations: {
							create: mapTranslationsForPrisma(bios),
						},
					},
				},
				profession: {
					create: {
						translations: {
							create: mapTranslationsForPrisma(professions),
						},
					},
				},
			},
		});
	},

	read: async (id: number, language?: string) => {
		return getCelebrityWithTranslatedFields({ id }, language);
	},

	read_by_language: async (id: number, language: string) => {
		return getCelebrityWithTranslatedFields({ id }, language);
	},

	update: async (input: z.infer<typeof updateCelebritySchema>) => {
		const { id, image, bios, professions, ...rest } = input;
		return await prisma.celebrity.update({
			where: { id },
			data: {
				...rest,
				...(image !== undefined && { imageKey: image }),
				...(bios && {
					bio: {
						update: {
							translations: {
								deleteMany: {},
								create: mapTranslationsForPrisma(bios),
							},
						},
					},
				}),
				...(professions && {
					profession: {
						update: {
							translations: {
								deleteMany: {},
								create: mapTranslationsForPrisma(professions),
							},
						},
					},
				}),
			}
		});
	},

	delete: async (id: number) => {
		return await prisma.celebrity.delete({ where: { id } });
	},

	list: async () => {
		const celebrities = await prisma.celebrity.findMany({
			include: {
				bio: {
					include: {
						translations: true,
					},
				},
				profession: {
					include: {
						translations: true,
					},
				},
			},
		});

		if (!celebrities || celebrities.length === 0) {
			return [];
		}

		return celebrities.map((celebrity) => ({
			...celebrity,
			bios: celebrity.bio.translations.map(t => ({
				text: t.value,
				language: t.language
			})),
			professions: celebrity.profession.translations.map(t => ({
				text: t.value,
				language: t.language
			})),
		}));
	},

	list_by_language: async (language: string) => {
		const celebrities = await prisma.celebrity.findMany({
			include: {
				bio: {
					include: {
						translations: {
							where: { language },
						},
					},
				},
				profession: {
					include: {
						translations: {
							where: { language },
						},
					},
				},
			},
		});

		if (!celebrities || celebrities.length === 0) {
			return [];
		}

		return celebrities.map((celebrity) => ({
			...celebrity,
			bio: celebrity.bio.translations.length > 0 ? celebrity.bio.translations[0].value : null,
			profession: celebrity.profession.translations.length > 0 ? celebrity.profession.translations[0].value : null,
		}));
	},
};

const createCelebritySchema = z.object({
	image: z.string().optional().nullable(),
	name: z.string(),
	bios: z.record(z.string(), z.string()),
	professions: z.record(z.string(), z.string()),
	born: z.string().datetime(), // Or z.date()
	died: z.string().datetime().optional().nullable(), // Or z.date()
	alsYear: z.number(),
});

const updateCelebritySchema = z.object({
	id: z.number(),
	image: z.string().optional().nullable(),
	name: z.string().optional(),
	bios: z.record(z.string(), z.string()).optional(),
	professions: z.record(z.string(), z.string()).optional(),
	born: z.string().datetime().optional(), // Or z.date()
	died: z.string().datetime().optional().nullable(), // Or z.date()
	alsYear: z.number().optional(),
});
