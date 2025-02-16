/* empty css                                          */
import { e as createComponent, f as createAstro, r as renderTemplate, j as renderHead, h as addAttribute } from '../../chunks/astro/server_BpKjF3de.mjs';
import 'kleur/colors';
import 'clsx';
import { readdir, writeFile, unlink } from 'fs/promises';
import { extname } from 'path';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const $$Files = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Files;
  const uploadDir = "./public/uploads";
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".pdf"];
  const files = await readdir(uploadDir);
  if (Astro2.request.method === "POST") {
    const formData2 = await Astro2.request.formData();
    const file = formData2.get("file");
    if (file instanceof File) {
      const ext = extname(file.name).toLowerCase();
      if (!allowedExtensions.includes(ext)) {
        return new Response("Ung\xFCltiger Dateityp!", { status: 400 });
      }
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${file.name}`;
      const filePath = `${uploadDir}/${filename}`;
      await writeFile(filePath, buffer);
      return Astro2.redirect("/admin/files");
    }
  }
  const formData = await Astro2.request.formData();
  if (Astro2.request.method === "POST" && formData.get("data-delete-file") === "true") {
    const filename = formData.get("filename");
    if (filename) {
      try {
        await unlink(`${uploadDir}/${filename}`);
      } catch (error) {
        console.error("Fehler beim L\xF6schen:", error);
      }
    }
    return Astro2.redirect("/admin/files");
  }
  return renderTemplate`---
<head><title>Datei-Manager | Admin</title>${renderHead()}</head> <body class="bg-gray-100"> <section class="mx-auto max-w-4xl py-12"> <h1 class="mb-6 text-3xl font-bold">📂 Datei-Manager</h1> <!-- 📤 Datei-Upload --> <form method="POST" enctype="multipart/form-data" class="mb-6 bg-white p-6 rounded-md shadow-md"> <input type="file" name="file" required class="mb-2 w-full border p-2 rounded-md"> <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded-md">Hochladen</button> </form> <!-- 📁 Hochgeladene Dateien --> <ul class="mt-6 bg-white p-4 rounded-md shadow-md"> ${files.length === 0 ? renderTemplate`<p class="text-gray-500">Keine Dateien hochgeladen.</p>` : files.map((file) => renderTemplate`<li class="flex justify-between items-center p-2 border-b last:border-0"> <a${addAttribute(`/uploads/${file}`, "href")} target="_blank" class="text-blue-600 hover:underline">${file}</a> <!-- ❌ Löschen-Button --> <form method="POST" onsubmit="return confirm('Datei wirklich löschen?');" class="inline-block"> <input type="hidden" name="filename"${addAttribute(file, "value")}> <button type="submit" class="bg-red-600 text-white px-2 py-1 rounded-md" formaction="/admin/files" formmethod="POST" onclick="this.form.setAttribute('data-delete-file', 'true');">
Löschen
</button> </form> </li>`)} </ul> </section> </body>`;
}, "/home/flori/Prg_new/als/src/pages/admin/files.astro", void 0);

const $$file = "/home/flori/Prg_new/als/src/pages/admin/files.astro";
const $$url = "/admin/files";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Files,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
