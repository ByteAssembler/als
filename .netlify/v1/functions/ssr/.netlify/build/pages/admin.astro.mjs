/* empty css                                       */
import { e as createComponent, r as renderTemplate, i as renderComponent } from '../chunks/astro/server_BpKjF3de.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_lfss1_Pw.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Admin Panel", "defaultPadding": false }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "AdminComponent", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "/home/flori/Prg_new/als/src/components/Admin.tsx", "client:component-export": "default" })} ` })}`;
}, "/home/flori/Prg_new/als/src/pages/admin/index.astro", void 0);

const $$file = "/home/flori/Prg_new/als/src/pages/admin/index.astro";
const $$url = "/admin";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
