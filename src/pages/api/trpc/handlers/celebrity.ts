import { z } from 'zod';
import prisma from '../../../../utils/db';
import type { Prisma } from '@prisma/client';

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
			image: true,
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
		const { image, ...celebrityData } = input;
		return await prisma.celebrity.create({
			data: {
				...celebrityData,
				...(image && {
					imageId: image // Assuming imageId is the field in the database
				})
			}
		});
	},

	read: async (id: number, language?: string) => {
		return getCelebrityWithTranslatedFields({ id }, language);
	},

	read_by_language: async (id: number, language: string) => {
		return getCelebrityWithTranslatedFields({ id }, language);
	},

	update: async (input: z.infer<typeof updateCelebritySchema>) => {
		const { id, image, ...updateData } = input;
		return await prisma.celebrity.update({
			where: { id },
			data: {
				...updateData,
				...(image !== undefined && {
					imageId: image // Use imageId directly instead of nested image.connect
				})
			}
		});
	},

	delete: async (id: number) => {
		return await prisma.celebrity.delete({ where: { id } });
	},

	list: async (language?: string) => {
		const celebrities = await prisma.celebrity.findMany({
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
				image: true,
			},
		});

		if (!celebrities || celebrities.length === 0) {
			return [];
		}

		return celebrities.map((celebrity) => ({
			...celebrity,
			bio: celebrity.bio.translations.length > 0 ? celebrity.bio.translations[0]?.value : null,
			profession: celebrity.profession.translations.length > 0 ? celebrity.profession.translations[0]?.value : null,
		}));
	},

	list_by_language: async (language: string) => {
		return celebrityHandlers.list(language);
	},
};

const createCelebritySchema = z.object({
	image: z.string().optional(),
	name: z.string(),
	bioRawTranslationId: z.number(),
	professionRawTranslationId: z.number(),
	born: z.string().datetime(), // Or z.date()
	died: z.string().datetime().optional().nullable(), // Or z.date()
	alsYear: z.number(),
});

const updateCelebritySchema = z.object({
	id: z.number(),
	image: z.string().optional().nullable(),
	name: z.string().optional(),
	bioRawTranslationId: z.number().optional(),
	professionRawTranslationId: z.number().optional(),
	born: z.string().datetime().optional(), // Or z.date()
	died: z.string().datetime().optional().nullable(), // Or z.date()
	alsYear: z.number().optional(),
});
