import { e as createComponent, r as renderTemplate, m as maybeRenderHead, i as renderComponent } from './astro/server_BpKjF3de.mjs';
import 'kleur/colors';
import { a as $$Button } from './Button_BpOTdgaY.mjs';
import { FaFacebook, FaInstagram, FaYoutube, FaLinkedin, FaTwitter } from 'react-icons/fa';

const $$Footer = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<footer class="relative bottom-0 bg-gray-900 px-6 py-12 text-white"> <div class="mx-auto max-w-6xl"> <div class="mb-12 grid gap-12 md:grid-cols-2"> <div> <h3 class="mb-4 text-2xl font-bold">Join the Fight</h3> <p class="mb-6 text-gray-100">
Support ALS research by donating, volunteering, or attending
					our events.
</p> ${renderComponent($$result, "Button", $$Button, { "variant": "secondary" }, { "default": ($$result2) => renderTemplate`
Find About Join The Fight For Tomorrow
` })} </div> <div> <h4 class="mb-4 text-xl">Subscribe to our newsletter</h4> <div class="flex flex-col gap-4 sm:flex-row"> <input type="email" placeholder="Enter your email" class="flex-1 rounded-md border-2 border-gray-700 p-3 text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500"> ${renderComponent($$result, "Button", $$Button, {}, { "default": ($$result2) => renderTemplate`Subscribe` })} </div> </div> </div> <div class="flex flex-col items-center justify-between gap-4 border-t border-gray-800 pt-8 md:flex-row"> <div class="text-sm text-gray-400">
© 2025 CV ALS. All rights reserved.
</div> <div class="flex gap-4"> <a href="facebook.com" class="text-gray-400 hover:text-white"> ${renderComponent($$result, "FaFacebook", FaFacebook, { "size": 20 })} </a> <a href="instagram.com" class="text-gray-400 hover:text-white"> ${renderComponent($$result, "FaInstagram", FaInstagram, { "size": 20 })} </a> <a href="youtube.com" class="text-gray-400 hover:text-white"> ${renderComponent($$result, "FaYoutube", FaYoutube, { "size": 20 })} </a> <a href="www.linkedin.com" class="text-gray-400 hover:text-white"> ${renderComponent($$result, "FaLinkedin", FaLinkedin, { "size": 20 })} </a> <a href="x.com" class="text-gray-400 hover:text-white"> ${renderComponent($$result, "FaTwitter", FaTwitter, { "size": 20 })} </a> </div> <div class="flex gap-4"> <a href="/impressum" class="text-gray-400 hover:text-white">Impressum</a> <a href="/privacy" class="text-gray-400 hover:text-white">Datenschutzerklärung</a> </div> </div> </div> </footer>`;
}, "/home/flori/Prg_new/als/src/components/Footer.astro", void 0);

export { $$Footer as $ };
