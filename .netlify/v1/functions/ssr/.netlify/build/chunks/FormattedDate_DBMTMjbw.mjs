import { e as createComponent, f as createAstro, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from './astro/server_BpKjF3de.mjs';
import 'kleur/colors';
import 'clsx';

const $$Astro = createAstro();
const $$FormattedDate = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$FormattedDate;
  const { date } = Astro2.props;
  const lang = Astro2.url.pathname.split("/")[1] || "en";
  return renderTemplate`${maybeRenderHead()}<time${addAttribute(date.toISOString(), "datetime")}> ${date.toLocaleDateString(lang, {
    year: "numeric",
    month: "short",
    day: "numeric"
  })} </time>`;
}, "/home/flori/Prg_new/als/src/components/FormattedDate.astro", void 0);

export { $$FormattedDate as $ };
