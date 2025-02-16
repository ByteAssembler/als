/* empty css                                          */
import { e as createComponent, f as createAstro, r as renderTemplate, i as renderComponent, m as maybeRenderHead, k as Fragment, u as unescapeHTML } from '../../chunks/astro/server_BpKjF3de.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../../chunks/Layout_lfss1_Pw.mjs';
import { $ as $$Footer } from '../../chunks/Footer_CjTzBoZ1.mjs';
import { p as prisma } from '../../chunks/db_n0nM774F.mjs';
import { $ as $$Header } from '../../chunks/Button_BpOTdgaY.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const $$ = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$;
  const { lang, site_slug } = Astro2.params;
  const site = await prisma.site.findUnique({
    where: {
      slug: site_slug
    },
    include: {
      sections: {
        include: {
          contents: {
            where: {
              langCode: lang
            }
          }
        }
      }
    }
  });
  if (!site) {
    return new Response(`Site ${site_slug} Not Found`, { status: 404 });
  }
  function prepareHtml(html, content) {
    for (const key in content) {
      html = html.replaceAll(`{{${key}}}`, content[key]);
    }
    return html;
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "", "defaultPadding": false }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Header", $$Header, {})} ${maybeRenderHead()}<main> <h1>${site.title}</h1> ${site.sections.map((section) => {
    const sectionContent = section.contents.find(
      (content) => content.langCode === lang
    );
    if (!sectionContent) {
      return renderTemplate`<section class="w-full bg-red-400 p-9"> <h2 class="text-center">
Content not found for lang: ${lang} </h2> </section>`;
    }
    const htmlEverythingSet = prepareHtml(
      section.html,
      sectionContent?.content || {}
    );
    return renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": ($$result3) => renderTemplate` <style>${unescapeHTML(section.css)}</style> <section>${unescapeHTML(htmlEverythingSet)}</section> ` })}`;
  })} </main> ${renderComponent($$result2, "Footer", $$Footer, {})} ` })}`;
}, "/home/flori/Prg_new/als/src/pages/[lang]/[...site_slug].astro", void 0);

const $$file = "/home/flori/Prg_new/als/src/pages/[lang]/[...site_slug].astro";
const $$url = "/[lang]/[...site_slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
