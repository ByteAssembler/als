<script>
  import LanguageModal from "./LanguageModal.svelte";

  let {
    show,
    title,
    languages,
    currentLanguage,
    onLanguageChange,
    onClose,
    onSubmit,
    submitText,
    formFields = [],
    formData,
  } = $props();

  function renderFormField(field) {
    const fieldId = `${field.id}-${currentLanguage}`;
    const isRequired = field.required && currentLanguage === "de";
    const helpText = field.getHelpText ? field.getHelpText(currentLanguage) : field.helpText;

    if (field.multilingual) {
      if (!formData[field.id]) formData[field.id] = {};

      if (field.type === "textarea") {
        return `
          <div>
            <label for="${fieldId}" class="block text-sm font-medium mb-1">
              ${field.label} (${languages.find((l) => l.code === currentLanguage)?.name})
              ${isRequired ? '<span aria-label="Pflichtfeld">*</span>' : ""}
            </label>
            <textarea
              id="${fieldId}"
              bind:value={formData[field.id][currentLanguage]}
              ${isRequired ? "required" : ""}
              rows="3"
              class="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="${field.placeholder || ""}"
            ></textarea>
            ${helpText ? `<p class="mt-1 text-xs text-muted-foreground">${helpText}</p>` : ""}
          </div>
        `;
      } else {
        return `
          <div>
            <label for="${fieldId}" class="block text-sm font-medium mb-1">
              ${field.label} (${languages.find((l) => l.code === currentLanguage)?.name})
              ${isRequired ? '<span aria-label="Pflichtfeld">*</span>' : ""}
            </label>
            <input
              id="${fieldId}"
              type="${field.type || "text"}"
              bind:value={formData[field.id][currentLanguage]}
              ${isRequired ? "required" : ""}
              class="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="${field.placeholder || ""}"
            />
            ${helpText ? `<p class="mt-1 text-xs text-muted-foreground">${helpText}</p>` : ""}
          </div>
        `;
      }
    } else {
      return `
        <div>
          <label for="${field.id}" class="block text-sm font-medium mb-1">
            ${field.label} ${field.required ? '<span aria-label="Pflichtfeld">*</span>' : ""}
          </label>
          <input
            id="${field.id}"
            type="${field.type || "text"}"
            bind:value={formData[field.id]}
            ${field.required ? "required" : ""}
            class="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="${field.placeholder || ""}"
          />
          ${helpText ? `<p class="mt-1 text-xs text-muted-foreground">${helpText}</p>` : ""}
        </div>
      `;
    }
  }
</script>

<LanguageModal {show} {title} {languages} {currentLanguage} {onLanguageChange} {onClose} {onSubmit} {submitText}>
  {#snippet children()}
    {#each formFields as field}
      <div>
        {#if field.multilingual}
          <label for="{field.id}-{currentLanguage}" class="block text-sm font-medium mb-1">
            {field.label} ({languages.find((l) => l.code === currentLanguage)?.name})
            {#if field.required && currentLanguage === "de"}
              <span aria-label="Pflichtfeld">*</span>
            {/if}
          </label>

          {#if field.type === "textarea"}
            <textarea
              id="{field.id}-{currentLanguage}"
              bind:value={formData[field.id][currentLanguage]}
              required={field.required && currentLanguage === "de"}
              rows="3"
              class="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder={field.placeholder || ""}
            ></textarea>
          {:else}
            <input
              id="{field.id}-{currentLanguage}"
              type={field.type || "text"}
              bind:value={formData[field.id][currentLanguage]}
              required={field.required && currentLanguage === "de"}
              class="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={field.placeholder || ""}
            />
          {/if}

          {#if field.getHelpText}
            {@const helpText = field.getHelpText(currentLanguage)}
            {#if helpText}
              <p class="mt-1 text-xs text-muted-foreground">{helpText}</p>
            {/if}
          {:else if field.helpText}
            <p class="mt-1 text-xs text-muted-foreground">{field.helpText}</p>
          {/if}
        {:else}
          <label for={field.id} class="block text-sm font-medium mb-1">
            {field.label}
            {#if field.required}<span aria-label="Pflichtfeld">*</span>{/if}
          </label>
          <input
            id={field.id}
            type={field.type || "text"}
            bind:value={formData[field.id]}
            required={field.required}
            class="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={field.placeholder || ""}
          />
          {#if field.helpText}
            <p class="mt-1 text-xs text-muted-foreground">{field.helpText}</p>
          {/if}
        {/if}
      </div>
    {/each}
  {/snippet}
</LanguageModal>
