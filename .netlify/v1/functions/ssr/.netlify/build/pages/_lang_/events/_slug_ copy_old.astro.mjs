/* empty css                                             */
import { e as createComponent, f as createAstro, r as renderTemplate, i as renderComponent, m as maybeRenderHead, h as addAttribute } from '../../../chunks/astro/server_BpKjF3de.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../../../chunks/Layout_lfss1_Pw.mjs';
import { p as prisma } from '../../../chunks/db_n0nM774F.mjs';
export { renderers } from '../../../renderers.mjs';

const $$Astro = createAstro();
const $$slugCopyOLD = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$slugCopyOLD;
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
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": event.title }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="m2 mx-auto px-6 py-12"> <h1 class="mb-4 text-3xl font-bold">${event.title}</h1> <img${addAttribute(event.image, "src")}${addAttribute(event.title, "alt")} class="mb-4 h-64 w-full rounded-lg object-cover"> <p class="text-gray-600"> ${event.location} | ${new Date(event.date).toLocaleDateString(lang)} </p> <h2 class="mt-6 text-xl font-semibold">Details</h2> <p class="text-gray-700">${event.detailedDescription}</p> ${event.schedule && renderTemplate`<div> <h2 class="mt-6 text-xl font-semibold">Schedule</h2> <pre class="rounded-md bg-gray-100 p-4">

						${typeof event.schedule === "string" ? JSON.parse(event.schedule) : event.schedule}
					</pre> </div>`} ${event.speakers.length > 0 && renderTemplate`<div> <h2 class="mt-6 text-xl font-semibold">Speakers</h2> <ul> ${event.speakers.map((speaker) => renderTemplate`<li class="mt-4"> <img${addAttribute(speaker.image, "src")}${addAttribute(speaker.name, "alt")} class="h-16 w-16 rounded-full"> <p class="text-lg font-bold">${speaker.name}</p> <p class="text-gray-600">${speaker.bio}</p> </li>`)} </ul> </div>`} ${event.ticketsUrl && renderTemplate`<a${addAttribute(event.ticketsUrl, "href")} class="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 text-white">
Get Tickets
</a>`} </section> ` })}`;
}, "/home/flori/Prg_new/als/src/pages/[lang]/events/[slug] copy_OLD.astro", void 0);

const $$file = "/home/flori/Prg_new/als/src/pages/[lang]/events/[slug] copy_OLD.astro";
const $$url = "/[lang]/events/[slug] copy_OLD";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$slugCopyOLD,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
