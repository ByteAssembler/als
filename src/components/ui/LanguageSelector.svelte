<script lang="ts">
  interface Language {
    code: string;
    name: string;
  }

  interface Props {
    languages: Language[];
    currentLanguage: string;
    onLanguageChange: (langCode: string) => void;
    label?: string;
  }

  let { languages, currentLanguage, onLanguageChange, label = "Sprache:" }: Props = $props();
</script>

<div class="flex items-center space-x-2">
  <label for="language-select" class="text-sm text-muted-foreground">{label}</label>
  <select
    id="language-select"
    value={currentLanguage}
    onchange={(e: Event & { currentTarget: HTMLSelectElement }) => onLanguageChange(e.currentTarget.value)}
    class="text-sm border border-input rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
    aria-label="Sprache für die Anzeige auswählen"
  >
    {#each languages as lang}
      <option value={lang.code}>{lang.name}</option>
    {/each}
  </select>
</div>
