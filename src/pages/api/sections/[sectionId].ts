// src/pages/api/sections/[sectionId].ts
import { type Section } from "@prisma/client";


import type { APIRoute } from "astro";
import db from "../../../utils/db";

export const GET: APIRoute = async ({ params }) => {
    const sectionId = Number(params.sectionId);

    if (!sectionId) {
        return new Response(JSON.stringify({ error: "Missing sectionId" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        const section = await db.section.findUnique({
            where: { id: sectionId },
            include: { contents: true },
        });
        const sectionContents = await db.sectionContent.findMany({
            where: { sectionId },
        });
        if (section) {
            section.contents = sectionContents;
        }
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
    const sectionId = Number(params.sectionId);
    if (!sectionId) {
        return new Response(JSON.stringify({ error: "Missing sectionId" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        const data = await request.json();

        const updatedSection = await db.section.update({
            where: { id: sectionId },
            data: {
                html: data.html,
                contents: {
                    upsert: data.contents.map((contentData: { langCode: string; content: any }) => ({
                        where: {
                            sectionId_langCode: { sectionId, langCode: contentData.langCode },
                        },
                        update: { content: contentData.content },
                        create: { langCode: contentData.langCode, content: contentData.content, sectionId },
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
