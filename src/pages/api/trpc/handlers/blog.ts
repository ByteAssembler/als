import { z } from 'zod';
import prisma from '../../../../utils/db';
import { fetchDataFromServer } from '../../../../pages/api/trpc/serverHelpers';
import { getTranslation } from '../../../../utils';

export const blogHandlers = {
	create: async (input: z.infer<typeof createBlogSchema>) => {
		return await prisma.blog.create({ data: input });
	},
	read: async (id: number, language?: string) => {
		const blog = await prisma.blog.findUnique({
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

		if (!blog) {
			return null;
		}

		const title = language ? await getTranslation(blog.titleRawTranslationId, language) : blog.title.translations[0]?.value;
		const content = language ? await getTranslation(blog.contentRawTranslationId, language) : blog.content.translations[0]?.value;

		return {
			...blog,
			title: title ?? blog.title.translations[0]?.value,
			content: content ?? blog.content.translations[0]?.value,
		};
	},
	read_by_language: async (id: number, language: string) => {
		const blog = await prisma.blog.findUnique({
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

		if (!blog) {
			return null;
		}

		const title = await getTranslation(blog.titleRawTranslationId, language);
		const content = await getTranslation(blog.contentRawTranslationId, language);

		return {
			...blog,
			title: title ?? blog.title.translations[0]?.value,
			content: content ?? blog.content.translations[0]?.value,
		};
	},
	update: async (input: z.infer<typeof updateBlogSchema>) => {
		return await prisma.blog.update({ where: { id: input.id }, data: input });
	},
	delete: async (id: number) => {
		return await prisma.blog.delete({ where: { id } });
	},
	list: async (language?: string) => {
		const blogs = await prisma.blog.findMany({
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

		if (!blogs || blogs.length === 0) {
			return [];
		}

		const rawTranslationIds: number[] = [];
		blogs.forEach((blog) => {
			rawTranslationIds.push(blog.titleRawTranslationId);
			rawTranslationIds.push(blog.contentRawTranslationId);
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

		return blogs.map((blog) => {
			const title = language ? translations[blog.titleRawTranslationId] : blog.title.translations[0]?.value;
			const content = language ? translations[blog.contentRawTranslationId] : blog.content.translations[0]?.value;

			return {
				...blog,
				title: title ?? blog.title.translations[0]?.value,
				content: content ?? blog.content.translations[0]?.value,
			};
		});
	},
	list_by_language: async (language: string) => {
		const blogs = await prisma.blog.findMany({
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

		if (!blogs || blogs.length === 0) {
			return [];
		}

		const rawTranslationIds: number[] = [];
		blogs.forEach((blog) => {
			rawTranslationIds.push(blog.titleRawTranslationId);
			rawTranslationIds.push(blog.contentRawTranslationId);
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

		return blogs.map((blog) => {
			const title = translations[blog.titleRawTranslationId];
			const content = translations[blog.contentRawTranslationId];

			return {
				...blog,
				title: title ?? blog.title.translations[0]?.value,
				content: content ?? blog.content.translations[0]?.value,
			};
		});
	},
};

const createBlogSchema = z.object({
	titleRawTranslationId: z.number(),
	slug: z.string(),
	authors: z.array(z.string()),
	contentRawTranslationId: z.number(),
	coverImage: z.string().optional(),
});

const updateBlogSchema = z.object({
	id: z.number(),
	titleRawTranslationId: z.number().optional(),
	slug: z.string().optional(),
	authors: z.array(z.string()).optional(),
	contentRawTranslationId: z.number().optional(),
	coverImage: z.string().optional().nullable(),
});
