import { z } from 'zod';
import prisma from '../../../../utils/db';
import type { Prisma } from '@prisma/client';

// Helper function to get book with translated fields
async function getBookWithTranslatedFields(
	whereClause: Prisma.BookWhereUniqueInput,
	language?: string
) {
	const book = await prisma.book.findUnique({
		where: whereClause,
		include: {
			title: {
				include: {
					translations: language ? { where: { language } } : true,
				},
			},
			content: {
				include: {
					translations: language ? { where: { language } } : true,
				},
			},
		},
	});

	if (!book) return null;

	const title = language && book.title.translations.length > 0
		? book.title.translations[0].value
		: book.title.translations[0]?.value;
	const content = language && book.content.translations.length > 0
		? book.content.translations[0].value
		: book.content.translations[0]?.value;

	return {
		...book,
		title: title ?? null,
		content: content ?? null,
	};
}

export const bookHandlers = {
	create: async (input: z.infer<typeof createBookSchema>) => {
		const { titles, contents, authors, ...restInput } = input;
		return await prisma.book.create({
			data: {
				...restInput,
				title: {
					create: {
						translations: {
							create: Object.entries(titles ?? {}).map(([language, value]) => ({
								language,
								value: value as string,
							})),
						},
					},
				},
				content: {
					create: {
						translations: {
							create: Object.entries(contents ?? {}).map(([language, value]) => ({
								language,
								value: value as string,
							})),
						},
					},
				},
				author: authors,
			}
		});
	},

	read: async (id: number, language?: string) => {
		return getBookWithTranslatedFields({ id }, language);
	},

	read_by_language: async (id: number, language: string) => {
		return getBookWithTranslatedFields({ id }, language);
	},

	update: async (input: z.infer<typeof updateBookSchema>) => {
		const { id, coverImage, ...otherUpdateData } = input;
		// Special handling for coverImage to create the proper connect structure
		return await prisma.book.update({
			where: { id },
			data: {
				...otherUpdateData,
			}
		});
	},

	delete: async (id: number) => {
		return await prisma.book.delete({ where: { id } });
	},

	list: async () => {
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

		return books.map((book) => ({
			...book,
			titles: book.title.translations.map(t => ({
				text: t.value,
				language: t.language
			})),
			contents: book.content.translations.map(t => ({
				text: t.value,
				language: t.language
			})),
		}));
	},

	list_by_language: async (language: string) => {
		const books = await prisma.book.findMany({
			include: {
				title: {
					include: {
						translations: {
							where: { language },
						},
					},
				},
				content: {
					include: {
						translations: {
							where: { language },
						},
					},
				},
			},
		});

		if (!books || books.length === 0) {
			return [];
		}

		return books.map((book) => ({
			...book,
			title: book.title.translations.length > 0 ? book.title.translations[0].value : null,
			content: book.content.translations.length > 0 ? book.content.translations[0].value : null,
		}));
	},
};

const createBookSchema = z.object({
	titles: z.record(z.string(), z.string()).optional(),
	slug: z.string(),
	authors: z.string(),
	contents: z.record(z.string(), z.string()).optional(),
	coverImage: z.string().optional(),
});

const updateBookSchema = z.object({
	id: z.number(),
	title: z.record(z.string(), z.string()).optional(),
	slug: z.string().optional(),
	authors: z.array(z.string()).optional(),
	content: z.record(z.string(), z.string()).optional(),
	coverImage: z.string().optional(),
});
