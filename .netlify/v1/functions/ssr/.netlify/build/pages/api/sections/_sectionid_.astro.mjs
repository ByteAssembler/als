import { p as prisma } from '../../../chunks/db_n0nM774F.mjs';
export { renderers } from '../../../renderers.mjs';

const GET = async ({ params }) => {
  const sectionId = Number(params.sectionId);
  if (!sectionId) {
    return new Response(JSON.stringify({ error: "Missing sectionId" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      include: { contents: true }
    });
    const sectionContents = await prisma.sectionContent.findMany({
      where: { sectionId }
    });
    if (section) {
      section.contents = sectionContents;
    }
    return new Response(JSON.stringify(section), {
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
const PUT = async ({ params, request }) => {
  const sectionId = Number(params.sectionId);
  console.log("Put" + sectionId);
  if (!sectionId) {
    return new Response(JSON.stringify({ error: "Missing sectionId" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const data = await request.json();
    const updatedSection = await prisma.section.update({
      where: { id: sectionId },
      data: {
        title: data.title,
        html: data.html,
        css: data.css,
        js: data.js,
        contents: {
          upsert: data.contents.map((contentData) => ({
            where: { sectionId, langCode: contentData.langCode },
            // ✅ Korrektur: Direkt als Objekt
            update: { content: contentData.content },
            create: {
              sectionId,
              langCode: contentData.langCode,
              content: contentData.content
            }
          }))
        }
      },
      include: { contents: true }
    });
    return new Response(JSON.stringify(updatedSection), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Failed to update section: " + error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    GET,
    PUT
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
