/* empty css                                       */
import { e as createComponent, r as renderTemplate, m as maybeRenderHead, f as createAstro, h as addAttribute, i as renderComponent } from '../chunks/astro/server_BpKjF3de.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_lfss1_Pw.mjs';
import { a as $$Button, $ as $$Header } from '../chunks/Button_BpOTdgaY.mjs';
import 'clsx';
import { p as prisma } from '../chunks/db_n0nM774F.mjs';
import { PrismaClient } from '@prisma/client';
import { $ as $$Footer } from '../chunks/Footer_CjTzBoZ1.mjs';
export { renderers } from '../renderers.mjs';

const $$Hero = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<section id="hero"> <div class="relative flex h-screen w-full items-center justify-center bg-cover bg-center px-6 text-center" style="background-image: url('/home_image.jpg');"> <!-- Overlay --> <div class="absolute inset-0 bg-black/50"></div> <!-- Inhalt --> <div class="relative z-10 max-w-5xl text-white"> <h1 class="text-5xl font-extrabold leading-tight sm:text-6xl md:text-7xl lg:text-8xl">
Fighting Together Against ALS
</h1> <p class="mt-4 text-lg font-light sm:text-xl md:text-2xl lg:text-4xl">
Join us in this strong battle
</p> <!-- Button --> <a href="#about" class="mt-6 inline-block rounded-full bg-gradient-to-r from-blue-500 to-blue-700 px-6 py-3 text-lg font-bold shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-blue-500/50 sm:px-10 sm:py-4 sm:text-xl md:px-12 md:py-5 md:text-2xl">
Learn More
</a> </div> </div> </section>`;
}, "/home/flori/Prg_new/als/src/components/Hero.astro", void 0);

const $$Astro$3 = createAstro();
const $$BlogSection = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$BlogSection;
  const { lang } = Astro2.params;
  const blogs = await prisma.post.findMany({
    where: { language: lang },
    select: {
      title: true,
      slug: true,
      coverImage: true,
      content: true,
      language: true
    }
  });
  return renderTemplate`${maybeRenderHead()}<section id="blogs" class="mt-20 px-6 py-16 pt-20"> <div class="mx-auto max-w-6xl"> <h2 class="mb-12 text-center text-4xl font-bold text-gray-900">
Blogs and Research
</h2> <div class="grid gap-8 md:grid-cols-3"> ${blogs.map((blog) => renderTemplate`<a${addAttribute(`/${lang}/blog/${blog.slug}`, "href")} class="block h-full"> <div class="flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg transition-transform hover:scale-105"> <img${addAttribute(blog.coverImage || "/placeholder.webp", "src")} alt="" class="h-48 w-full object-cover"> <div class="flex flex-1 flex-col p-6"> <h3 class="mb-2 text-xl font-semibold text-gray-900"> ${blog.title} </h3> <p class="line-clamp-2 flex-1 text-gray-700"> ${blog.content.slice(0, 100)}...
</p> </div> </div> </a>`)} </div> </div> </section>`;
}, "/home/flori/Prg_new/als/src/components/BlogSection.astro", void 0);

const $$Astro$2 = createAstro();
const $$EventsSection = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$EventsSection;
  const prisma = new PrismaClient();
  const events = await prisma.event.findMany();
  const currentLang = Astro2.url.pathname.split("/")[1];
  const langPrefix = ["de", "en", "it"].includes(currentLang) ? currentLang : "en";
  return renderTemplate`${maybeRenderHead()}<section id="events" class="mt-20 px-6 py-16 pt-20"> <div class="mx-auto max-w-6xl"> <h2 class="mb-12 text-center text-4xl font-bold text-gray-900">
Upcoming Events
</h2> <div class="grid gap-8 md:grid-cols-3"> ${events.map((event) => renderTemplate`<a${addAttribute(`/${langPrefix}/events/${event.slug}`, "href")} class="block"> <div class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg transition-transform hover:scale-105"> <img${addAttribute(event.image, "src")}${addAttribute(event.title, "alt")} class="h-48 w-full object-cover"> <div class="p-6"> <h3 class="mb-2 text-xl font-semibold text-gray-900"> ${event.title} </h3> <p class="line-clamp-3 text-gray-700"> ${event.description} </p> <p class="mt-2 text-sm text-gray-500">
📅${" "} ${new Date(event.date).toLocaleDateString()}${" "}
- 📍 ${event.location} </p> </div> </div> </a>`)} </div> </div> </section>`;
}, "/home/flori/Prg_new/als/src/components/EventsSection.astro", void 0);

const $$CommentsSection = createComponent(($$result, $$props, $$slots) => {
  const comments = [
    {
      author: "Max Mastermann",
      role: "ALS Researcher & Scientist",
      comment: "ALS has challenged us in ways I never thought possible, but the support from this community has been our strength.",
      avatar: "/placeholder.webp"
    },
    {
      author: "Sarah Johnson",
      role: "Community Member",
      comment: "The resources and support provided here have made a significant difference in our journey.",
      avatar: "/placeholder.webp"
    }
  ];
  return renderTemplate`${maybeRenderHead()}<section id="comments" class="mt-20 bg-white px-6 py-16 pt-20"> <div class="mx-auto max-w-4xl"> <h2 class="mb-12 text-center text-3xl font-bold">Comments</h2> <div class="space-y-8"> ${comments.map((comment) => renderTemplate`<div class="rounded-lg bg-gray-50 p-6"> <div class="flex items-start gap-4"> <img${addAttribute(comment.avatar, "src")} alt="" class="h-12 w-12 rounded-full"> <div> <h3 class="font-semibold">${comment.author}</h3> <p class="mb-2 text-sm text-gray-500"> ${comment.role} </p> <p class="text-gray-600">${comment.comment}</p> </div> </div> </div>`)} </div> </div> </section>`;
}, "/home/flori/Prg_new/als/src/components/CommentsSection.astro", void 0);

const $$MapSection = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<section id="map" class="mt-20 bg-gray-50 px-6 py-16 pt-20"> <div class="mx-auto max-w-6xl"> <h2 class="mb-4 text-center text-3xl font-bold">Where to Find Us</h2> ${renderComponent($$result, "MapComponent", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "/home/flori/Prg_new/als/src/components/Map.tsx", "client:component-export": "default" })} </div> </section>`;
}, "/home/flori/Prg_new/als/src/components/MapSection.astro", void 0);

const $$AboutSection = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<section id="about" class="mt-20 bg-white px-6 py-16 pt-20"> <div class="mx-auto max-w-6xl"> <h2 class="mb-12 text-3xl font-bold">About us</h2> <div class="grid gap-12 md:grid-cols-2"> <div> <p class="mb-6 text-gray-600">
“Collegium vincere ALS eo” is an association dedicated to
					the fight against amyotrophic lateral sclerosis (ALS), a
					chronic degenerative disease of the motor nervous system. We
					see ALS as a “disease of a thousand farewells” and would
					like to stand by those affected and their relatives during
					this difficult time. Our goals include comprehensive support
					for those affected, intensive public relations work to raise
					awareness of ALS, networking relevant stakeholders and
					promoting ALS research. With campaigns such as theme tables
					and our mobile ALS suitcase, we want to provide information
					and collect donations to initiate research projects and thus
					improve the quality of life of those affected. If you have
					any questions, are looking for help or would like to support
					our work - get in touch with us, because your quality of
					life is important to us!
</p> <h3 class="mb-3 text-xl font-semibold">Innovation</h3> <p class="mb-6 text-gray-600">
We invest in innovative research efforts using
					state-of-the-art technology to advance our mission to find a
					cure.
</p> <h3 class="mb-3 text-xl font-semibold">Customer Centric</h3> <p class="mb-6 text-gray-600">
Our commitment to patient care means we're always here to
					support you through every step of your journey.
</p> </div> <div class="rounded-lg bg-gray-100"> <img src="/placeholder.webp" alt="" class="h-full w-full rounded-lg object-cover"> </div> </div> </div> </section>`;
}, "/home/flori/Prg_new/als/src/components/AboutSection.astro", void 0);

const $$Astro$1 = createAstro();
const $$Input = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Input;
  const { type = "text", id, label, placeholder, rows = 4, name } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<div> <label${addAttribute(id, "for")} class="mb-2 block text-gray-700">${label}</label> ${type === "textarea" ? renderTemplate`<textarea${addAttribute(id, "id")}${addAttribute(name, "name")}${addAttribute(rows, "rows")}${addAttribute(placeholder, "placeholder")} class="w-full rounded-md border p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"></textarea>` : renderTemplate`<input${addAttribute(type, "type")}${addAttribute(id, "id")}${addAttribute(name, "name")}${addAttribute(placeholder, "placeholder")} class="w-full rounded-md border p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500">`} </div>`;
}, "/home/flori/Prg_new/als/src/components/ui/Input.astro", void 0);

const $$ContactForm = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<section id="contact" class="mt-20 bg-gray-100 px-6 py-16 pt-20"> <div class="mx-auto max-w-3xl"> <h2 class="mb-12 text-center text-3xl font-bold">Contact Us</h2> <form class="space-y-6" action="mailto:cv-als@pec.it" method="post" enctype="text/plain"> ${renderComponent($$result, "Input", $$Input, { "id": "name", "label": "Name", "type": "text", "name": "name" })} ${renderComponent($$result, "Input", $$Input, { "id": "email", "label": "Email", "type": "email", "name": "email" })} ${renderComponent($$result, "Input", $$Input, { "id": "message", "label": "Why are you contacting us?", "type": "textarea", "name": "message" })} ${renderComponent($$result, "Button", $$Button, { "type": "submit", "fullWidth": true }, { "default": ($$result2) => renderTemplate`Submit` })} </form> <div class="mt-12 rounded-lg bg-white p-6 shadow-md"> <h3 class="text-center text-2xl font-semibold">
Additional Contact Information
</h3> <p class="mt-4 text-center text-gray-700">
For more details or direct assistance, please reach out to us:
</p> <ul class="mt-4 space-y-2 text-center"> <li> <strong>Address:</strong> Rienzstr.21, 39030 Olang, South Tyrol
					- ITALY
</li> <li> <strong>Email:</strong> <a href="mailto:cv-als@pec.it" class="text-blue-600 hover:underline">cv-als@pec.it</a> </li> <li> <strong>Alternate Email:</strong> <a href="mailto:gerdsteger@hotmail.com" class="text-blue-600 hover:underline">gerdsteger@hotmail.com</a> </li> <li><strong>Phone:</strong> +39 328 45 345 83</li> <li> <strong>IBAN:</strong> IT 59 Z060 4559 0400 0000 5001 502
</li> <li><strong>Tax Number:</strong> 92073470210</li> </ul> </div> </div> </section>`;
}, "/home/flori/Prg_new/als/src/components/ContactForm.astro", void 0);

const $$Astro = createAstro();
const $$Donation = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Donation;
  const currentPath = Astro2.url.pathname;
  const donationPath = currentPath.endsWith("/") ? `${currentPath}donation` : `${currentPath}/donation`;
  return renderTemplate`${maybeRenderHead()}<section id="donation" class="mt-20 bg-gray-100 pt-20"> <div class="flex justify-center bg-gray-50 px-8 py-20 sm:px-16 lg:px-24 xl:px-32"> <div class="max-w-2xl text-center"> <h2 class="mb-4 text-4xl font-bold text-gray-900 sm:text-5xl">
Join the Fight
</h2> <p class="mb-8 text-gray-700">
Support ALS research by donating, volunteering, or attending our
				events.
<br>
Your involvement makes a difference. Donate now!
</p> <a${addAttribute(donationPath, "href")} class="inline-block"> <button class="rounded-md bg-gray-700 px-6 py-3 font-medium text-white hover:bg-gray-800">
Take Action
</button> </a> </div> </div> </section>`;
}, "/home/flori/Prg_new/als/src/components/Donation.astro", void 0);

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "CV ALS - Fighting Together Against ALS" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Header", $$Header, {})} ${maybeRenderHead()}<main> ${renderComponent($$result2, "Hero", $$Hero, {})} ${renderComponent($$result2, "BlogSection", $$BlogSection, {})} ${renderComponent($$result2, "EventsSection", $$EventsSection, {})} ${renderComponent($$result2, "CommentsSection", $$CommentsSection, {})} ${renderComponent($$result2, "MapSection", $$MapSection, {})} ${renderComponent($$result2, "AboutSection", $$AboutSection, {})} ${renderComponent($$result2, "ContactForm", $$ContactForm, {})} ${renderComponent($$result2, "Donation", $$Donation, {})} </main> ${renderComponent($$result2, "Footer", $$Footer, {})} ` })}`;
}, "/home/flori/Prg_new/als/src/pages/[lang]/index.astro", void 0);

const $$file = "/home/flori/Prg_new/als/src/pages/[lang]/index.astro";
const $$url = "/[lang]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
