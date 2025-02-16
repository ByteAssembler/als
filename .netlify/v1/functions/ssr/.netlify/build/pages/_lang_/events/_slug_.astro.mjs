/* empty css                                             */
import { e as createComponent, f as createAstro, r as renderTemplate, i as renderComponent, m as maybeRenderHead, h as addAttribute } from '../../../chunks/astro/server_BpKjF3de.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../../../chunks/Layout_lfss1_Pw.mjs';
import { $ as $$Header, a as $$Button } from '../../../chunks/Button_BpOTdgaY.mjs';
import { $ as $$FormattedDate } from '../../../chunks/FormattedDate_DBMTMjbw.mjs';
import { p as prisma } from '../../../chunks/db_n0nM774F.mjs';
export { renderers } from '../../../renderers.mjs';

const $$Astro = createAstro();
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$slug;
  const { slug, lang } = Astro2.params;
  const event = await prisma.event.findUnique({
    where: {
      slug
    },
    include: {
      speakers: true
    }
  });
  if (!event) {
    throw new Error("Event not found");
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": event.title }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Header", $$Header, {})} ${maybeRenderHead()}<a href="#blogs">${renderComponent($$result2, "Button", $$Button, {}, { "default": ($$result3) => renderTemplate`Back to all Blogs` })}</a> <main class="mt-2 min-h-screen bg-gray-50"> <div class="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8"> <article class="overflow-hidden rounded-lg bg-white shadow-lg"> <div class="p-8"> <div class="mb-4 flex items-center text-sm text-gray-500"> <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round"${addAttribute(2, "stroke-width")} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path> </svg> ${renderComponent($$result2, "FormattedDate", $$FormattedDate, { "date": event.createdAt })} ${event.updatedAt && event.createdAt !== event.updatedAt && renderTemplate`<span class="ml-4 flex items-center"> <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round"${addAttribute(2, "stroke-width")} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path> </svg>
Updated on${" "} ${renderComponent($$result2, "FormattedDate", $$FormattedDate, { "date": event.updatedAt })} </span>`} </div> <h1 class="mb-6 text-4xl font-bold text-gray-900"> ${event.title} </h1> ${event.speakers && event.speakers.length > 0 && renderTemplate`<div class="mb-8"> <h2 class="mb-4 text-xl font-semibold text-gray-900">
Speakers
</h2> <div class="flex flex-wrap gap-4"> ${event.speakers.map((speaker) => renderTemplate`<div class="flex items-center space-x-3"> ${speaker.image && renderTemplate`<img${addAttribute(speaker.image, "src")} alt="" class="h-10 w-10 rounded-full">`} <div> <p class="text-sm font-medium text-gray-900"> ${speaker.name} </p> <p class="text-sm text-gray-500"> ${speaker.bio} </p> </div> </div>`)} </div> </div>`} <div class="prose prose-lg max-w-none"> ${event.detailedDescription} </div> </div> </article> </div> </main> ` })}`;
}, "/home/flori/Prg_new/als/src/pages/[lang]/events/[slug].astro", void 0);

const $$file = "/home/flori/Prg_new/als/src/pages/[lang]/events/[slug].astro";
const $$url = "/[lang]/events/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$slug,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
