import { p as prisma } from '../../chunks/db_n0nM774F.mjs';
export { renderers } from '../../renderers.mjs';

const GET = async () => {
  try {
    const sites = await prisma.site.findMany();
    return new Response(JSON.stringify(sites), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch sites: " + error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
