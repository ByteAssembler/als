import { z } from 'zod';
import prisma from '../../../../utils/db';

export const blogHandlers = {
	create: async (input: z.infer<typeof createBlogSchema>) => {
		const { coverImage, ...blogData } = input;
		await prisma.blog.create({
			data: {
				...blogData,
				title: {
					create: {
						translations: {
							create: Object.entries(input.title || {}).map(([language, value]) => ({
								language,
								value: value as string,
							})),
						},
					},
				},
				content: {
					create: {
						translations: {
							create: Object.entries(input.content || {}).map(([language, value]) => ({
								language,
								value: value as string,
							})),
						},
					},
				},
				...(coverImage && {
					coverImage: {
						connect: { id: coverImage }
					}
				})
			}
		});
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

		if (!blog) return null;

		return {
			...blog,
			titles: blog.title.translations.map(t => ({
				text: t.value,
				language: t.language
			}))
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
				coverImage: true,
			},
		});

		if (!blog) return null;

		return {
			...blog,
			title: blog.title.translations.length > 0 ?
				blog.title.translations[0].value
				: null,
			content: blog.content.translations.length > 0 ?
				blog.content.translations[0].value
				: null,
		};
	},
	read_by_slug_and_language: async (slug: string, language: string) => {
		const blog = await prisma.blog.findUnique({
			where: { slug },
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
				coverImage: true,
			},
		});

		if (!blog) return null;

		return {
			...blog,
			title: blog.title.translations.length > 0 ?
				blog.title.translations[0].value
				: null,
			content: blog.content.translations.length > 0 ?
				blog.content.translations[0].value
				: null,
		};
	},
	update: async (input: z.infer<typeof updateBlogSchema>) => {
		const { id, coverImage, title, content, ...blogData } = input;

		return await prisma.blog.update({
			where: { id },
			data: {
				...blogData,
				...(title && {
					title: {
						update: {
							translations: {
								deleteMany: {},
								create: Object.entries(title).map(([language, value]) => ({
									language,
									value: value as string,
								})),
							},
						},
					},
				}),
				...(content && {
					content: {
						update: {
							translations: {
								deleteMany: {},
								create: Object.entries(content).map(([language, value]) => ({
									language,
									value: value as string,
								})),
							},
						},
					},
				}),
				...(coverImage !== undefined && {
					coverImage: coverImage ? {
						connect: { id: coverImage }
					} : {
						disconnect: true
					}
				})
			}
		});
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
				coverImage: true,
			},
		});

		if (!blogs || blogs.length === 0) return [];

		return blogs.map((blog) => {
			return {
				...blog,
				titles: blog.title.translations.map(t => ({
					text: t.value,
					language: t.language
				})),
				contents: blog.content.translations.map(t => ({
					text: t.value,
					language: t.language
				})),
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
				coverImage: true,
			},
		});

		return blogs.map((blog) => {
			return {
				...blog,
				title: blog.title.translations.length > 0 ?
					blog.title.translations[0].value
					: null,
				content: blog.content.translations.length > 0 ?
					blog.content.translations[0].value
					: null,
				coverImage: blog.coverImage ? blog.coverImage : null,
			};
		});
	},
};

const createBlogSchema = z.object({
	title: z.record(z.string(), z.string()).optional(),
	slug: z.string(),
	authors: z.array(z.string()),
	content: z.record(z.string(), z.string()).optional(),
	coverImage: z.string().optional(),
});

const updateBlogSchema = z.object({
	id: z.number(),
	title: z.record(z.string(), z.string()).optional(),
	slug: z.string().optional(),
	authors: z.array(z.string()).optional(),
	content: z.record(z.string(), z.string()).optional(),
	coverImage: z.string().optional().nullable(),
});
