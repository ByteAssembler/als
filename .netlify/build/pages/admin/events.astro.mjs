/* empty css                                          */
import { e as createComponent, f as createAstro, r as renderTemplate, i as renderComponent, m as maybeRenderHead, s as spreadAttributes, h as addAttribute } from '../../chunks/astro/server_BpKjF3de.mjs';
import { PrismaClient } from '@prisma/client';
import { $ as $$Layout } from '../../chunks/Layout_lfss1_Pw.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const $$Events = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Events;
  const prisma = new PrismaClient();
  const events = await prisma.event.findMany();
  if (Astro2.request.method === "POST") {
    const formData = await Astro2.request.formData();
    const id = formData.get("id")?.toString();
    const data = {
      title: formData.get("title")?.toString() || "",
      date: new Date(formData.get("date")?.toString() || Date.now()),
      location: formData.get("location")?.toString() || "",
      description: formData.get("description")?.toString() || "",
      image: formData.get("image")?.toString() || "",
      slug: formData.get("slug")?.toString() || ""
    };
    if (id) {
      await prisma.event.update({ where: { id: Number(id) }, data });
    } else {
      await prisma.event.create({ data });
    }
    Astro2.redirect("/admin/events");
  }
  if (Astro2.request.method === "DELETE") {
    const formData = await Astro2.request.formData();
    const id = formData.get("id")?.toString();
    if (id) {
      await prisma.event.delete({ where: { id: Number(id) } });
    }
    Astro2.redirect("/admin/events");
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Admin Panel", "defaultPadding": false }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="mx-auto max-w-4xl py-12"> <h1 class="mb-6 text-3xl font-bold">Event Manager</h1> <!-- Formular für Event hinzufügen / bearbeiten --> <form method="POST" class="mb-6 rounded-md bg-gray-100 p-6"> <input type="hidden" name="id" id="event-id"> <input type="text" name="title" placeholder="Title" required class="mb-2 block w-full border p-2"> <input type="date" name="date" required class="mb-2 block w-full border p-2"> <input type="text" name="location" placeholder="Location" required class="mb-2 block w-full border p-2"> <input type="text" name="description" placeholder="Description" required class="mb-2 block w-full border p-2"> <input type="text" name="image" placeholder="Image URL" class="mb-2 block w-full border p-2"> <input type="text" name="slug" placeholder="Slug" required class="mb-2 block w-full border p-2"> <button type="submit" class="bg-blue-600 px-4 py-2 text-white">Save</button> </form> <!-- Event Liste --> <ul class="mt-6"> ${events.map((event) => renderTemplate`<li class="flex justify-between bg-white p-4 shadow-md"${spreadAttributes({ key: event.id })}> <span> ${event.title} -${" "} ${event.date.toISOString().split("T")[0]} </span> <div> <button class="bg-yellow-500 px-2 py-1"${addAttribute(`document.getElementById('event-id').value = '${event.id}';`, "onclick")}>
Edit
</button> <form method="POST" onsubmit="return confirm('Event wirklich löschen?');" class="inline-block"> <input type="hidden" name="_method" value="DELETE"> <input type="hidden" name="id"${addAttribute(event.id, "value")}> <button type="submit" class="bg-red-600 px-2 py-1">
Delete
</button> </form> </div> </li>`)} </ul> </section> ` })}`;
}, "/home/flori/Prg_new/als/src/pages/admin/events.astro", void 0);

const $$file = "/home/flori/Prg_new/als/src/pages/admin/events.astro";
const $$url = "/admin/events";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Events,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
