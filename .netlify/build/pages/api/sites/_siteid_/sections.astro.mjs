import { p as prisma } from '../../../../chunks/db_n0nM774F.mjs';
export { renderers } from '../../../../renderers.mjs';

const GET = async ({ params }) => {
  const { siteId } = params;
  console.log("\n\n\n			SITE ID: " + siteId);
  if (!siteId) {
    return new Response(JSON.stringify({ error: "Missing siteId" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const sections = await prisma.section.findMany({
      where: { siteId: Number(siteId) }
    });
    return new Response(JSON.stringify(sections), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Error: " + error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
