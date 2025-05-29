<script lang="ts">
  import type { Snippet } from "svelte";

  interface Language {
    code: string;
    name: string;
  }

  interface Props {
    show: boolean;
    title: string;
    languages: Language[];
    currentLanguage: string;
    onLanguageChange: (langCode: string) => void;
    onClose: () => void;
    onSubmit: (event: SubmitEvent) => void;
    children: Snippet;
    submitText?: string;
    cancelText?: string;
  }

  let {
    show,
    title,
    languages,
    currentLanguage,
    onLanguageChange,
    onClose,
    onSubmit,
    children,
    submitText = "Speichern",
    cancelText = "Abbrechen",
  }: Props = $props();

  // Focus trap functionality
  function trapFocus(node: HTMLElement) {
    const focusableElements = node.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement | undefined;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement | undefined;

    function handleKeydown(e: KeyboardEvent) {
      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    }

    node.addEventListener("keydown", handleKeydown);
    firstElement?.focus();

    return {
      destroy() {
        node.removeEventListener("keydown", handleKeydown);
      },
    };
  }

  function handleModalKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      onClose();
    }
  }
</script>

{#if show}
  <div
    class="fixed inset-0 z-50 overflow-y-auto"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    tabindex="-1"
    onkeydown={handleModalKeydown}
  >
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 transition-opacity bg-black bg-opacity-50" onclick={onClose} aria-hidden="true"></div>

      <div
        class="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-card shadow-xl rounded-lg border bg-white"
        use:trapFocus
      >
        <div class="flex justify-between items-center mb-4">
          <h3 id="modal-title" class="text-lg font-medium">{title}</h3>
          <button
            onclick={onClose}
            class="text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded p-1"
            aria-label="Dialog schließen"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Language Tabs -->
        <div class="mb-6" role="tablist" aria-label="Sprachen für Übersetzungen">
          <div class="border-b border-border">
            <nav class="-mb-px flex space-x-8">
              {#each languages as lang}
                <button
                  type="button"
                  role="tab"
                  onclick={() => onLanguageChange(lang.code)}
                  class="py-2 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded-t {currentLanguage ===
                  lang.code
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}"
                  aria-selected={currentLanguage === lang.code}
                  aria-controls="form-content"
                  aria-label="Sprache {lang.name} auswählen"
                >
                  {lang.name}
                </button>
              {/each}
            </nav>
          </div>
        </div>

        <div id="form-content" role="tabpanel" aria-labelledby="modal-title">
          <form onsubmit={onSubmit} class="space-y-4">
            {@render children()}

            <div class="flex justify-end space-x-2 pt-4" role="group" aria-label="Dialog Aktionen">
              <button
                type="button"
                onclick={onClose}
                class="px-4 py-2 text-sm font-medium border border-input rounded-lg hover:bg-muted focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                {cancelText}
              </button>
              <button
                type="submit"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                {submitText}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
{/if}
