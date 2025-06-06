<script lang="ts">
  import LanguageModal from "./LanguageModal.svelte";
  import FileManagerSelect from "./FileManagerSelect.svelte";

  interface Language {
    code: string;
    name: string;
  }

  export interface FormField {
    id: string;
    label: string;
    type?: "text" | "textarea" | "checkbox" | "select";
    required?: boolean;
    multilingual?: boolean;
    placeholder?: string;
    helpText?: string;
    getHelpText?: (currentLanguage: string) => string;
    useFileManager?: boolean;
    options?: Array<{ value: string; label: string }>; // New for select fields
  }

  interface Props {
    show: boolean;
    title: string;
    languages: Language[];
    currentLanguage: string;
    onLanguageChange: (langCode: string) => void;
    onClose: () => void;
    onSubmit: (event: SubmitEvent) => void;
    submitText?: string;
    formFields?: FormField[];
    formData: Record<string, any>;
  }

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
  }: Props = $props();
</script>

<LanguageModal {show} {title} {languages} {currentLanguage} {onLanguageChange} {onClose} {onSubmit} {submitText}>
  {#snippet children()}
    {#each formFields as field}
      <div class="mb-4">
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
              rows="6"
              class="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical min-h-[120px]"
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

          {#if field.type === "checkbox"}
            <input
              id={field.id}
              type="checkbox"
              bind:checked={formData[field.id]}
              class="rounded border-input focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          {:else if field.type === "select"}
            <!-- Select dropdown -->
            <select
              id={field.id}
              bind:value={formData[field.id]}
              required={field.required}
              class="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">{field.placeholder || "Bitte auswählen..."}</option>
              {#each field.options || [] as option}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
          {:else if field.useFileManager}
            <!-- File Manager Selection -->
            <FileManagerSelect
              bind:value={formData[field.id]}
              placeholder={field.placeholder || "Auswählen..."}
              {field}
            />
          {:else if field.id === "authors"}
            <!-- Special handling for authors array field -->
            <input
              id={field.id}
              type="text"
              bind:value={formData[field.id]}
              required={field.required}
              class="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={field.placeholder || ""}
            />
          {:else}
            <input
              id={field.id}
              type={field.type || "text"}
              bind:value={formData[field.id]}
              required={field.required}
              class="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={field.placeholder || ""}
            />
          {/if}

          {#if field.helpText}
            <p class="mt-1 text-xs text-muted-foreground">{field.helpText}</p>
          {/if}
        {/if}
      </div>
    {/each}
  {/snippet}
</LanguageModal>
