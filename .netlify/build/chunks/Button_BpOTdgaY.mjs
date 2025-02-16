import { e as createComponent, f as createAstro, r as renderTemplate, m as maybeRenderHead, h as addAttribute, i as renderComponent, s as spreadAttributes, l as renderSlot } from './astro/server_BpKjF3de.mjs';
import 'kleur/colors';
import 'clsx';

const $$Astro$3 = createAstro();
const $$MenuItem = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$MenuItem;
  const { href, text, className = "" } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<a${addAttribute(href, "href")}${addAttribute(`text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200 ${className}`, "class")}> ${text} </a>`;
}, "/home/flori/Prg_new/als/src/components/navigation/MenuItem.astro", void 0);

const languages = [
  {
    code: "en",
    label: "English",
    flag: "🇬🇧"
  },
  {
    code: "de",
    label: "Deutsch",
    flag: "🇩🇪"
  },
  {
    code: "it",
    label: "Italiano",
    flag: "🇮🇹"
  }
];

const $$Astro$2 = createAstro();
const $$LanguageSelector = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$LanguageSelector;
  const { lang } = Astro2.params;
  const currentUrl = Astro2.url.pathname;
  const getUpdatedUrl = (newLang) => {
    if (!lang) return `/${newLang}${currentUrl}`;
    return currentUrl.replace(`/${lang}`, `/${newLang}`);
  };
  return renderTemplate`${maybeRenderHead()}<div class="group relative"> <button class="flex items-center gap-2 font-medium text-gray-700 hover:text-primary-600">
🌍 Sprache wählen
<svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"> <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path> </svg> </button> <div class="absolute z-50 mt-2 w-48 rounded-md bg-white py-2 opacity-0 shadow-lg transition-opacity group-hover:opacity-100"> ${languages.map((langOption) => renderTemplate`<a${addAttribute(getUpdatedUrl(langOption.code), "href")} class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"> ${langOption.flag} ${langOption.label} </a>`)} </div> </div>`;
}, "/home/flori/Prg_new/als/src/components/navigation/LanguageSelector.astro", void 0);

const menuItems = [
  { text: "Home", href: "#hero" },
  { text: "Blogs", href: "#blogs" },
  { text: "Events", href: "#events" },
  { text: "Comments", href: "#comments" },
  { text: "Map", href: "#map" },
  { text: "About us", href: "#about" },
  { text: "Contact", href: "#contact" },
  { text: "Donation", href: "donation" }
];

const $$Astro$1 = createAstro();
const $$DesktopMenu = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$DesktopMenu;
  const { lang } = Astro2.params;
  return renderTemplate`${maybeRenderHead()}<nav class="hidden items-center gap-6 lg:flex"> ${menuItems.map((item) => renderTemplate`${renderComponent($$result, "MenuItem", $$MenuItem, { "href": Astro2.url.origin + "/" + lang + "/" + item.href, "text": item.text })}`)} ${renderComponent($$result, "LanguageSelector", $$LanguageSelector, {})} </nav>`;
}, "/home/flori/Prg_new/als/src/components/navigation/DesktopMenu.astro", void 0);

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$MobileMenu = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate(_a || (_a = __template(["", '<div id="mobile-menu" class="z-9999 fixed inset-0 translate-x-full transform bg-white transition-transform duration-300 ease-in-out lg:hidden"> <div class="p-6"> <div class="flex justify-end"> <button id="close-menu" class="text-gray-600 hover:text-gray-900" aria-label="Close menu"> <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path> </svg> </button> </div> <nav class="mt-8"> <ul class="space-y-4"> ', ' <li class="border-t pt-4"> ', ' </li> </ul> </nav> </div> </div> <script defer>\n	const mobileMenu = document.getElementById("mobile-menu");\n	const openButton = document.getElementById("open-menu");\n	const closeButton = document.getElementById("close-menu");\n\n	function toggleMenu(show) {\n		if (mobileMenu) {\n			mobileMenu.style.transform = show\n				? "translateX(0)"\n				: "translateX(100%)";\n		}\n	}\n\n	openButton?.addEventListener("click", () => toggleMenu(true));\n	closeButton?.addEventListener("click", () => toggleMenu(false));\n\n	mobileMenu?.addEventListener("click", (event) => {\n		if (event.target.tagName === "A" || event.target.tagName === "BUTTON") {\n			toggleMenu(false);\n		}\n	});\n<\/script>'])), maybeRenderHead(), menuItems.map((item) => renderTemplate`<li> ${renderComponent($$result, "MenuItem", $$MenuItem, { "href": item.href, "text": item.text, "className": "text-xl block py-2" })} </li>`), renderComponent($$result, "LanguageSelector", $$LanguageSelector, {}));
}, "/home/flori/Prg_new/als/src/components/navigation/MobileMenu.astro", void 0);

const $$Header = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<header class="fixed left-0 right-0 top-0 z-50 border-b border-gray-200 bg-white px-6 py-4 shadow-sm"> <div class="mx-auto flex max-w-6xl items-center justify-between"> <a href="/" class="text-2xl font-bold text-gray-900"> <!-- CV ALS --> <img src="/logo.png" alt="CV ALS" class="h-8"> </a> ${renderComponent($$result, "DesktopMenu", $$DesktopMenu, {})} <button id="open-menu" class="text-gray-700 hover:text-primary-600 lg:hidden" aria-label="Open menu"> <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path> </svg> </button> </div> ${renderComponent($$result, "MobileMenu", $$MobileMenu, {})} </header>`;
}, "/home/flori/Prg_new/als/src/components/Header.astro", void 0);

const $$Astro = createAstro();
const $$Button = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Button;
  const {
    variant = "primary",
    fullWidth = false,
    type = "button",
    className = "",
    formAction
  } = Astro2.props;
  const baseStyles = "px-8 py-3 rounded-md transition-colors duration-200 font-semibold";
  const variantStyles = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
    secondary: "bg-white text-gray-900 hover:bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
  };
  const widthStyles = fullWidth ? "w-full" : "";
  return renderTemplate`${maybeRenderHead()}<button${addAttribute(type, "type")}${addAttribute([baseStyles, variantStyles[variant], widthStyles, className], "class:list")}${spreadAttributes(formAction ? { formAction } : {})}> ${renderSlot($$result, $$slots["default"])} </button>`;
}, "/home/flori/Prg_new/als/src/components/ui/Button.astro", void 0);

export { $$Header as $, $$Button as a };
