<script lang="ts">
  import { hasTranslation, createTranslationWarning } from "../../lib/utils/translation.js";

  interface Language {
    code: string;
    name: string;
  }

  interface Props {
    translationObj: Record<string, string>;
    currentLanguage: string;
    languages: Language[];
  }

  let { translationObj, currentLanguage, languages }: Props = $props();

  const showWarning =
    translationObj && Object.keys(translationObj).length > 0 && !hasTranslation(translationObj, currentLanguage);
  const warningText = showWarning ? createTranslationWarning(translationObj, currentLanguage, languages) : "";
</script>

{#if showWarning}
  <span class="ml-2 text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded" aria-label={warningText}>
    Übersetzung fehlt
  </span>
{/if}
