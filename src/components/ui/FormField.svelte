<script lang="ts">
  interface Language {
    code: string;
    name: string;
  }

  interface Props {
    id: string;
    label: string;
    type?: "text" | "textarea" | "checkbox";
    value?: string | boolean;
    onValueChange?: (newValue: string | boolean) => void;
    required?: boolean;
    placeholder?: string;
    rows?: number;
    currentLanguage: string;
    languages: Language[];
    helpText?: string;
    ariaLabel?: string;
  }

  let {
    id,
    label,
    type = "text",
    value = "",
    onValueChange,
    required = false,
    placeholder = "",
    rows = 3,
    currentLanguage,
    languages,
    helpText = "",
    ariaLabel = "",
  }: Props = $props();

  const languageName = languages.find((l) => l.code === currentLanguage)?.name;
  const isRequired = required && currentLanguage === "de";
  const fieldId = `${id}-${currentLanguage}`;
  const helpId = helpText ? `${fieldId}-help` : undefined;

  function handleInput(event: Event & { currentTarget: HTMLInputElement | HTMLTextAreaElement }) {
    if (onValueChange) {
      onValueChange(event.currentTarget.value);
    }
  }
</script>

<div>
  <label for={fieldId} class="block text-sm font-medium mb-1">
    {label} ({languageName})
    {#if isRequired}
      <span aria-label="Pflichtfeld">*</span>
    {/if}
  </label>

  {#if type === "textarea"}
    <textarea
      id={fieldId}
      value={value as string}
      oninput={handleInput}
      {rows}
      required={isRequired}
      class="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
      {placeholder}
      aria-label={ariaLabel || `${label} in ${languageName}`}
      aria-describedby={helpId}
    ></textarea>
  {:else if type === "checkbox"}
    <input
      id={fieldId}
      type="checkbox"
      checked={value as boolean}
      onchange={(e: Event & { currentTarget: HTMLInputElement }) =>
        onValueChange && onValueChange(e.currentTarget.checked)}
      class="rounded border-input focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label={ariaLabel || `${label} in ${languageName}`}
      aria-describedby={helpId}
    />
  {:else}
    <input
      id={fieldId}
      {type}
      value={value as string}
      oninput={handleInput}
      required={isRequired}
      class="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      {placeholder}
      aria-label={ariaLabel || `${label} in ${languageName}`}
      aria-describedby={helpId}
    />
  {/if}

  {#if helpText}
    <p id={helpId} class="mt-1 text-xs text-muted-foreground">{helpText}</p>
  {/if}
</div>
