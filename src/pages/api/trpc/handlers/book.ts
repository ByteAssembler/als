import { z } from 'zod';
import prisma from '../../../../utils/db';
import { getTranslation } from '../../../../utils';

export const bookHandlers = {
	create: async (input: z.infer<typeof createBookSchema>) => {
		return await prisma.book.create({ data: input });
	},
	read: async (id: number, language?: string) => {
		const book = await prisma.book.findUnique({
			where: { id },
			include: {
				title: {
					include: {
						translations: true,
					},
				},
				content: {
					include: {
						translations: true,
					},
				},
			},
		});

		if (!book) {
			return null;
		}

		const title = language ? await getTranslation(book.titleRawTranslationId, language) : book.title.translations[0]?.value;
		const content = language ? await getTranslation(book.contentRawTranslationId, language) : book.content.translations[0]?.value;

		return {
			...book,
			title: title ?? book.title.translations[0]?.value,
			content: content ?? book.content.translations[0]?.value,
		};
	},
	read_by_language: async (id: number, language: string) => {
		const book = await prisma.book.findUnique({
			where: { id },
			include: {
				title: {
					include: {
						translations: {
							where: { language: language },
						},
					},
				},
				content: {
					include: {
						translations: {
							where: { language: language },
						},
					},
				},
			},
		});

		if (!book) {
			return null;
		}

		const title = await getTranslation(book.titleRawTranslationId, language);
		const content = await getTranslation(book.contentRawTranslationId, language);

		return {
			...book,
			title: title ?? book.title.translations[0]?.value,
			content: content ?? book.content.translations[0]?.value,
		};
	},
	update: async (input: z.infer<typeof updateBookSchema>) => {
		return await prisma.book.update({ where: { id: input.id }, data: input });
	},
	delete: async (id: number) => {
		return await prisma.book.delete({ where: { id } });
	},
	list: async (language?: string) => {
		const books = await prisma.book.findMany({
			include: {
				title: {
					include: {
						translations: true,
					},
				},
				content: {
					include: {
						translations: true,
					},
				},
			},
		});

		if (!books || books.length === 0) {
			return [];
		}

		const rawTranslationIds: number[] = [];
		books.forEach((book) => {
			rawTranslationIds.push(book.titleRawTranslationId);
			rawTranslationIds.push(book.contentRawTranslationId);
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

		return books.map((book) => {
			const title = language ? translations[book.titleRawTranslationId] : book.title.translations[0]?.value;
			const content = language ? translations[book.contentRawTranslationId] : book.content.translations[0]?.value;

			return {
				...book,
				title: title ?? book.title.translations[0]?.value,
				content: content ?? book.content.translations[0]?.value,
			};
		});
	},
	list_by_language: async (language: string) => {
		const books = await prisma.book.findMany({
			include: {
				title: {
					include: {
						translations: {
							where: { language: language },
						},
					},
				},
				content: {
					include: {
						translations: {
							where: { language: language },
						},
					},
				},
			},
		});

		if (!books || books.length === 0) {
			return [];
		}

		const rawTranslationIds: number[] = [];
		books.forEach((book) => {
			rawTranslationIds.push(book.titleRawTranslationId);
			rawTranslationIds.push(book.contentRawTranslationId);
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

		return books.map((book) => {
			const title = translations[book.titleRawTranslationId];
			const content = translations[book.contentRawTranslationId];

			return {
				...book,
				title: title ?? book.title.translations[0]?.value,
				content: content ?? book.content.translations[0]?.value,
			};
		});
	},
};

const createBookSchema = z.object({
	titleRawTranslationId: z.number(),
	author: z.string(),
	isbn: z.string().optional(),
	coverImage: z.string().optional(),
	published: z.string().datetime(), // Or z.date() if you handle conversion
	contentRawTranslationId: z.number(),
	links: z.array(z.string()),
});

const updateBookSchema = z.object({
	id: z.number(),
	titleRawTranslationId: z.number().optional(),
	author: z.string().optional(),
	isbn: z.string().optional().nullable(),
	coverImage: z.string().optional().nullable(),
	published: z.string().datetime().optional(), // Or z.date()
	contentRawTranslationId: z.number().optional(),
	links: z.array(z.string()).optional(),
});
