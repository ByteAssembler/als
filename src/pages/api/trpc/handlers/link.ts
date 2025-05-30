import { z } from 'zod';
import prisma from '@/utils/db';
import type { Prisma } from '@prisma/client';

const mapTranslationsForPrisma = (translations: Record<string, string> | undefined) => {
  if (!translations) return [];
  return Object.entries(translations).map(([language, value]) => ({
    language,
    value,
  }));
};

async function getLinkWithTranslatedFields(
  whereClause: Prisma.LinkWhereUniqueInput,
  language?: string
) {
  const link = await prisma.link.findUnique({
    where: whereClause,
    include: {
      name: {
        include: {
          translations: language ? { where: { language } } : true,
        },
      },
      description: {
        include: {
          translations: language ? { where: { language } } : true,
        },
      },
    },
  });

  if (!link) return null;

  const name = link.name.translations.length > 0 ? link.name.translations[0].value : null;
  const description = link.description?.translations && link.description.translations.length > 0
    ? link.description.translations[0].value
    : null;

  return {
    ...link,
    name,
    description,
  };
}

export const linkHandlers = {
  findAll: async () => {
    return await prisma.link.findMany();
  },

  create: async (input: z.infer<typeof createLinkSchema>) => {
    // Create the link with nested creation of translations
    return await prisma.link.create({
      data: {
        url: input.url,
        name: {
          create: {
            translations: {
              create: mapTranslationsForPrisma(input.name),
            },
          },
        },
        ...(input.description && Object.keys(input.description).length > 0 && {
          description: {
            create: {
              translations: {
                create: mapTranslationsForPrisma(input.description),
              },
            },
          },
        }),
      },
    });
  },

  read: async (id: number, language?: string) => {
    return getLinkWithTranslatedFields({ id }, language);
  },

  read_by_language: async (id: number, language: string) => {
    return getLinkWithTranslatedFields({ id }, language);
  },

  update: async (input: z.infer<typeof updateLinkSchema>) => {
    const { id, name, description, url } = input;

    return await prisma.link.update({
      where: { id },
      data: {
        ...(url !== undefined && { url }),
        ...(name && {
          name: {
            update: {
              translations: {
                deleteMany: {},
                create: mapTranslationsForPrisma(name),
              },
            },
          },
        }),
        ...(description !== undefined && {
          description: description ? {
            upsert: {
              create: {
                translations: {
                  create: mapTranslationsForPrisma(description),
                },
              },
              update: {
                translations: {
                  deleteMany: {},
                  create: mapTranslationsForPrisma(description),
                },
              },
            },
          } : {
            disconnect: true,
          },
        }),
      },
    });
  },

  delete: async (id: number) => {
    return await prisma.link.delete({ where: { id } });
  },

  list: async () => {
    const linksFromDb = await prisma.link.findMany({
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
      },
    });

    if (!linksFromDb || linksFromDb.length === 0) {
      return [];
    }

    return linksFromDb.map((link) => ({
      ...link,
      names: link.name.translations.map(t => ({
        text: t.value,
        language: t.language
      })),
      descriptions: link.description?.translations.map(t => ({
        text: t.value,
        language: t.language
      })) || [],
    }));
  },

  list_by_language: async (language: string) => {
    const links = await prisma.link.findMany({
      include: {
        name: {
          include: {
            translations: {
              where: { language },
            },
          },
        },
        description: {
          include: {
            translations: {
              where: { language },
            },
          },
        },
      },
    });

    if (!links || links.length === 0) {
      return [];
    }

    return links.map((link) => ({
      ...link,
      name: link.name.translations.length > 0 ? link.name.translations[0]?.value : null,
      description: link.description ? (link.description.translations?.length > 0 ? link.description.translations[0]?.value : null) : null,
    }));
  },
};

const createLinkSchema = z.object({
  name: z.record(z.string(), z.string())
    .refine(obj => Object.keys(obj).length > 0, {
      message: "Name must have at least one translation.",
    }),
  description: z.record(z.string(), z.string()).optional(),
  url: z.string().url(),
});

const updateLinkSchema = z.object({
  id: z.number(),
  name: z.record(z.string(), z.string()).optional(),
  description: z.record(z.string(), z.string()).optional().nullable(),
  url: z.string().url().optional(),
});
