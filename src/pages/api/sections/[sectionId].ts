// src/pages/api/sections/[sectionId].ts
import { PrismaClient } from "@prisma/client";
import type { APIRoute } from "astro";
import type {
  Section,
  SectionContent,
} from "../../../components/SectionEditor"; // Importiere die Typen

const prisma = new PrismaClient();

export const GET: APIRoute = async ({ params }) => {
  const { sectionId } = params;
  if (!sectionId) {
    return new Response(JSON.stringify({ error: "Missing sectionId" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      include: { contents: true },
    });
    return new Response(JSON.stringify(section), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: "Error: " + error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  const { sectionId } = params;
  if (!sectionId) {
    return new Response(JSON.stringify({ error: "Missing sectionId" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  const data = await request.json() as Section; // Typ-Assertion

  try {
    const updatedSection = await prisma.section.update({
      where: { id: sectionId },
      data: {
        html: data.html,
        contents: {
          upsert: data.contents.map((contentData) => ({
            where: {
              sectionId_langCode: { sectionId, langCode: contentData.langCode },
            },
            update: { content: contentData.content },
            create: { ...contentData, sectionId },
          })),
        },
      },
      include: { contents: true },
    });

    return new Response(JSON.stringify(updatedSection), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Failed to update section: " + error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
