import { renderers } from './renderers.mjs';
import { s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_CvSoi7hX.mjs';
import { manifest } from './manifest_BocWKWrD.mjs';
import { createExports } from '@astrojs/netlify/ssr-function.js';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/admin/events.astro.mjs');
const _page2 = () => import('./pages/admin/files.astro.mjs');
const _page3 = () => import('./pages/admin.astro.mjs');
const _page4 = () => import('./pages/api/auth/jwt.astro.mjs');
const _page5 = () => import('./pages/api/auth.astro.mjs');
const _page6 = () => import('./pages/api/sections/_sectionid_.astro.mjs');
const _page7 = () => import('./pages/api/sites/_siteid_/sections.astro.mjs');
const _page8 = () => import('./pages/api/sites/_siteid_.astro.mjs');
const _page9 = () => import('./pages/api/sites.astro.mjs');
const _page10 = () => import('./pages/_lang_/blog/_slug_.astro.mjs');
const _page11 = () => import('./pages/_lang_/donation.astro.mjs');
const _page12 = () => import('./pages/_lang_/events/_slug_ copy_old.astro.mjs');
const _page13 = () => import('./pages/_lang_/events/_slug_.astro.mjs');
const _page14 = () => import('./pages/_lang_/media.astro.mjs');
const _page15 = () => import('./pages/_lang_/privacy.astro.mjs');
const _page16 = () => import('./pages/_lang_.astro.mjs');
const _page17 = () => import('./pages/_lang_/_---site_slug_.astro.mjs');
const _page18 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/admin/events.astro", _page1],
    ["src/pages/admin/files.astro", _page2],
    ["src/pages/admin/index.astro", _page3],
    ["src/pages/api/auth/jwt.ts", _page4],
    ["src/pages/api/auth/index.ts", _page5],
    ["src/pages/api/sections/[sectionId].ts", _page6],
    ["src/pages/api/sites/[siteId]/sections.ts", _page7],
    ["src/pages/api/sites/[siteId]/index.ts", _page8],
    ["src/pages/api/sites.ts", _page9],
    ["src/pages/[lang]/blog/[slug].astro", _page10],
    ["src/pages/[lang]/donation.astro", _page11],
    ["src/pages/[lang]/events/[slug] copy_OLD.astro", _page12],
    ["src/pages/[lang]/events/[slug].astro", _page13],
    ["src/pages/[lang]/media.astro", _page14],
    ["src/pages/[lang]/privacy.astro", _page15],
    ["src/pages/[lang]/index.astro", _page16],
    ["src/pages/[lang]/[...site_slug].astro", _page17],
    ["src/pages/index.astro", _page18]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "f3a6792e-ebc2-433c-8ecc-b045f1e62d85"
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (_start in serverEntrypointModule) {
	serverEntrypointModule[_start](_manifest, _args);
}

export { __astrojsSsrVirtualEntry as default, pageMap };
