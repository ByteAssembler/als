import type { APIRoute } from "astro";
import db from "../../../../utils/db";

export const GET: APIRoute = async ({ params }) => {
    const { slug } = params;
    if (!slug) {
        return new Response(JSON.stringify({ error: "Missing siteId" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        const site = await db.site.findMany({
            where: { slug: slug },
        });
        return new Response(JSON.stringify(site), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: "Error: " + error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}