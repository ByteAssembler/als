import { PrismaClient } from "@prisma/client";
import type { APIRoute } from "astro";
import db from "../../../../utils/db";

export const GET: APIRoute = async ({ params }) => {
    const { siteId } = params;
    if (!siteId) {
        return new Response(JSON.stringify({ error: "Missing siteId" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        const sections = await db.section.findMany({
            where: { siteId: Number(siteId) },
        });
        return new Response(JSON.stringify(sections), {
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
