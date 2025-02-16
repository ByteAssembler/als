/* empty css                                             */
import { e as createComponent, f as createAstro, r as renderTemplate, i as renderComponent, m as maybeRenderHead, h as addAttribute } from '../../../chunks/astro/server_BpKjF3de.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../../../chunks/Layout_lfss1_Pw.mjs';
import { $ as $$Header } from '../../../chunks/Button_BpOTdgaY.mjs';
import { $ as $$Footer } from '../../../chunks/Footer_CjTzBoZ1.mjs';
import { $ as $$FormattedDate } from '../../../chunks/FormattedDate_DBMTMjbw.mjs';
import { p as prisma } from '../../../chunks/db_n0nM774F.mjs';
export { renderers } from '../../../renderers.mjs';

const $$Astro = createAstro();
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$slug;
  const { slug, lang } = Astro2.params;
  const post = await prisma.post.findUnique({
    where: { slug },
    include: { author: true }
  });
  if (!post) {
    return Astro2.redirect("/404");
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": post.title }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Header", $$Header, {})} ${maybeRenderHead()}<main class="mx-auto mt-10 max-w-4xl px-6 py-16 pt-10 sm:px-8 lg:px-12"> <article class="prose lg:prose-xl mx-auto"> <div class="mb-12 space-y-6 rounded-xl bg-gray-100 p-8 shadow-lg"> <h1 class="text-5xl font-bold leading-tight text-gray-900"> ${post.title} </h1> <div class="flex items-center space-x-4 text-sm text-gray-600"> <img${addAttribute(post.author.avatar, "src")}${addAttribute(post.author.name, "alt")} class="h-12 w-12 rounded-full shadow-md"> <span class="font-medium">${post.author.name}</span> <span>•</span> ${renderComponent($$result2, "FormattedDate", $$FormattedDate, { "date": post.publishedAt })} ${post.updatedAt && post.publishedAt !== post.updatedAt && renderTemplate`<span class="ml-2 text-gray-500">
(Aktualisiert am${" "} ${renderComponent($$result2, "FormattedDate", $$FormattedDate, { "date": post.updatedAt })})
</span>`} </div> ${post.coverImage && renderTemplate`<img${addAttribute(post.coverImage, "src")}${addAttribute(post.title, "alt")} class="h-80 w-full rounded-lg object-cover shadow-md">`} </div> <div class="prose prose-lg prose-blue max-w-none leading-relaxed"> ${post.content} </div> <div class="mt-12 flex items-center justify-between border-t border-gray-300 pt-6"> <a${addAttribute(`/${lang}/#blogs`, "href")} class="font-medium text-blue-600 hover:text-blue-800">
← Zurück zur Übersicht
</a> </div> </article> </main> ${renderComponent($$result2, "Footer", $$Footer, {})} ` })}`;
}, "/home/flori/Prg_new/als/src/pages/[lang]/blog/[slug].astro", void 0);

const $$file = "/home/flori/Prg_new/als/src/pages/[lang]/blog/[slug].astro";
const $$url = "/[lang]/blog/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$slug,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
