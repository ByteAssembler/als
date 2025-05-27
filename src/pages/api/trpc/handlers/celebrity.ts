import { z } from 'zod';
import prisma from '../../../../utils/db';
import { getTranslation } from '../../../../utils';

export const celebrityHandlers = {
	create: async (input: z.infer<typeof createCelebritySchema>) => {
		return await prisma.celebrity.create({ data: input });
	},
	read: async (id: number, language?: string) => {
		const celebrity = await prisma.celebrity.findUnique({
			where: { id },
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

		if (!celebrity) {
			return null;
		}

		const bio = language ? await getTranslation(celebrity.bioRawTranslationId, language) : celebrity.bio.translations[0]?.value;
		const profession = language ? await getTranslation(celebrity.professionRawTranslationId, language) : celebrity.profession.translations[0]?.value;

		return {
			...celebrity,
			bio: bio ?? celebrity.bio.translations[0]?.value,
			profession: profession ?? celebrity.profession.translations[0]?.value,
		};
	},
	read_by_language: async (id: number, language: string) => {
		const celebrity = await prisma.celebrity.findUnique({
			where: { id },
			include: {
				bio: {
					include: {
						translations: {
							where: { language: language },
						},
					},
				},
				profession: {
					include: {
						translations: {
							where: { language: language },
						},
					},
				},
			},
		});

		if (!celebrity) {
			return null;
		}

		const bio = await getTranslation(celebrity.bioRawTranslationId, language);
		const profession = await getTranslation(celebrity.professionRawTranslationId, language);

		return {
			...celebrity,
			bio: bio ?? celebrity.bio.translations[0]?.value,
			profession: profession ?? celebrity.profession.translations[0]?.value,
		};
	},
	update: async (input: z.infer<typeof updateCelebritySchema>) => {
		return await prisma.celebrity.update({ where: { id: input.id }, data: input });
	},
	delete: async (id: number) => {
		return await prisma.celebrity.delete({ where: { id } });
	},
	list: async (language?: string) => {
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

		const rawTranslationIds: number[] = [];
		celebrities.forEach((celebrity) => {
			rawTranslationIds.push(celebrity.bioRawTranslationId);
			rawTranslationIds.push(celebrity.professionRawTranslationId);
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

		return celebrities.map((celebrity) => {
			const bio = language ? translations[celebrity.bioRawTranslationId] : celebrity.bio.translations[0]?.value;
			const profession = language ? translations[celebrity.professionRawTranslationId] : celebrity.profession.translations[0]?.value;

			return {
				...celebrity,
				bio: bio ?? celebrity.bio.translations[0]?.value,
				profession: profession ?? celebrity.profession.translations[0]?.value,
			};
		});
	},
	list_by_language: async (language: string) => {
		const celebrities = await prisma.celebrity.findMany({
			include: {
				bio: {
					include: {
						translations: {
							where: { language: language },
						},
					},
				},
				profession: {
					include: {
						translations: {
							where: { language: language },
						},
					},
				},
			},
		});

		if (!celebrities || celebrities.length === 0) {
			return [];
		}

		const rawTranslationIds: number[] = [];
		celebrities.forEach((celebrity) => {
			rawTranslationIds.push(celebrity.bioRawTranslationId);
			rawTranslationIds.push(celebrity.professionRawTranslationId);
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

		return celebrities.map((celebrity) => {
			const bio = translations[celebrity.bioRawTranslationId];
			const profession = translations[celebrity.professionRawTranslationId];

			return {
				...celebrity,
				bio: bio ?? celebrity.bio.translations[0]?.value,
				profession: profession ?? celebrity.profession.translations[0]?.value,
			};
		});
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
