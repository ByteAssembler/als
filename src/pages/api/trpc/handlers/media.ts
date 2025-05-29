import { z } from 'zod';
import prisma from '../../../../utils/db';

export const mediaHandlers = {
	create: async (input: z.infer<typeof createMediaSchema>) => {
		return await prisma.mediaItem.create({ data: input });
	},
	read: async (id: string) => {
		return await prisma.mediaItem.findUnique({ where: { id } });
	},
	update: async (input: z.infer<typeof updateMediaSchema>) => {
		return await prisma.mediaItem.update({ where: { id: input.id }, data: input });
	},
	delete: async (id: string) => {
		return await prisma.mediaItem.delete({ where: { id } });
	},
	list: async () => {
		return await prisma.mediaItem.findMany();
	},
};

const createMediaSchema = z.object({
	filename: z.string(),
	storageKey: z.string(),
	storageBucket: z.string(),
	storageRegion: z.string(),
	mimeType: z.string(),
	size: z.number(),
	width: z.number().optional(),
	height: z.number().optional(),
	altTextRawTranslationId: z.number().optional(),
	captionRawTranslationId: z.number().optional(),
	uploaderId: z.number().optional(),
	showInMediaGallery: z.boolean().optional(),
	mediaType: z.string().optional(),
});

const updateMediaSchema = z.object({
	id: z.string(),
	filename: z.string().optional(),
	storageKey: z.string().optional(),
	storageBucket: z.string().optional(),
	storageRegion: z.string().optional(),
	mimeType: z.string().optional(),
	size: z.number().optional(),
	width: z.number().optional(),
	height: z.number().optional(),
	altTextRawTranslationId: z.number().optional(),
	captionRawTranslationId: z.number().optional(),
	uploaderId: z.number().optional(),
	showInMediaGallery: z.boolean().optional(),
	mediaType: z.string().optional(),
});
