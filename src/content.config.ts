// src/content.config.ts
import { defineCollection, z } from 'astro:content';
import prisma from './utils/db';

const SiteSchema = z.object({
	id: z.string(),
	slug: z.string(),
	title: z.string(),
	description: z.string(),
	keywords: z.string(),
	createdAt: z.date(),
	updatedAt: z.date(),
	sections: z.array(z.object({
		html: z.string(),
		css: z.string(),
		contents: z.array(z.object({
			langCode: z.string(),
			content: z.record(z.string(), z.string()),
		})),
	})),
});

const siteLoader = async () => {
	return await prisma.site.findMany({
		include: {
			sections: {
				include: {
					contents: true,
				},
			},
		},
	});
};

export async function singleSiteLoader(slugSite: string | undefined) {
	if (!slugSite) return null;

	return prisma.site.findUnique({
		where: { slug: slugSite },
		include: {
			sections: {
				include: {
					contents: true,
				},
			},
		},
	});
}

const siteCollection = defineCollection({
	loader: siteLoader,
	schema: SiteSchema,
});

export const collections = {
	site: siteCollection,
};
