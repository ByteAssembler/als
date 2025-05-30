<script lang="ts">
  import { onMount } from "svelte";
  import {
    getGlobalLanguages,
    setGlobalLanguages,
    addLanguage,
    removeLanguage,
    updateLanguage,
    validateLanguageCode,
    type Language,
  } from "../../../lib/admin/languageConfig.js";

  let languages = $state<Language[]>([]);
  let showAddForm = $state(false);
  let editingLanguage = $state<Language | null>(null);
  let newLanguage = $state<Language>({ code: "", name: "" });
  let error = $state("");
  let success = $state("");

  onMount(() => {
    languages = getGlobalLanguages();
  });

  function showMessage(msg: string, isError = false) {
    if (isError) {
      error = msg;
      success = "";
    } else {
      success = msg;
      error = "";
    }
    setTimeout(() => {
      error = "";
      success = "";
    }, 3000);
  }

  function validateForm(lang: Language): string | null {
    if (!lang.code.trim()) return "Sprachcode ist erforderlich";
    if (!lang.name.trim()) return "Sprachname ist erforderlich";
    if (!validateLanguageCode(lang.code)) return "Sprachcode darf nur Buchstaben und Bindestriche enthalten";
    if (lang.code.length > 5) return "Sprachcode darf maximal 5 Zeichen haben";
    return null;
  }

  function handleAdd() {
    const validationError = validateForm(newLanguage);
    if (validationError) {
      showMessage(validationError, true);
      return;
    }

    try {
      addLanguage(newLanguage);
      languages = getGlobalLanguages();
      newLanguage = { code: "", name: "" };
      showAddForm = false;
      showMessage("Sprache erfolgreich hinzugefügt");
    } catch (err) {
      showMessage(err instanceof Error ? err.message : "Fehler beim Hinzufügen der Sprache", true);
    }
  }

  function handleEdit(lang: Language) {
    editingLanguage = { ...lang };
  }

  function handleUpdate() {
    if (!editingLanguage) return;

    const validationError = validateForm(editingLanguage);
    if (validationError) {
      showMessage(validationError, true);
      return;
    }

    try {
      const originalCode = languages.find((l) => l === editingLanguage)?.code;
      if (originalCode) {
        updateLanguage(originalCode, editingLanguage);
        languages = getGlobalLanguages();
        editingLanguage = null;
        showMessage("Sprache erfolgreich aktualisiert");
      }
    } catch (err) {
      showMessage(err instanceof Error ? err.message : "Fehler beim Aktualisieren der Sprache", true);
    }
  }

  function handleDelete(code: string) {
    if (!confirm("Sind Sie sicher, dass Sie diese Sprache löschen möchten?")) return;

    try {
      removeLanguage(code);
      languages = getGlobalLanguages();
      showMessage("Sprache erfolgreich gelöscht");
    } catch (err) {
      showMessage(err instanceof Error ? err.message : "Fehler beim Löschen der Sprache", true);
    }
  }

  function cancelEdit() {
    editingLanguage = null;
    showAddForm = false;
    newLanguage = { code: "", name: "" };
  }
</script>

<div class="space-y-6">
  <div class="flex justify-between items-center">
    <h1 class="text-2xl font-bold">Sprachen Verwaltung</h1>
    <button
      onclick={() => (showAddForm = true)}
      class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
    >
      <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
      </svg>
      Sprache hinzufügen
    </button>
  </div>

  <!-- Messages -->
  {#if error}
    <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
      {error}
    </div>
  {/if}

  {#if success}
    <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
      {success}
    </div>
  {/if}

  <!-- Add Form -->
  {#if showAddForm}
    <div class="bg-card shadow-sm rounded-lg border p-6">
      <h3 class="text-lg font-medium mb-4">Neue Sprache hinzufügen</h3>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="new-code" class="block text-sm font-medium mb-1">Sprachcode (max. 5 Zeichen)</label>
          <input
            id="new-code"
            type="text"
            bind:value={newLanguage.code}
            maxlength="5"
            placeholder="z.B. de, en, it"
            class="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label for="new-name" class="block text-sm font-medium mb-1">Sprachname</label>
          <input
            id="new-name"
            type="text"
            bind:value={newLanguage.name}
            placeholder="z.B. Deutsch, English, Italiano"
            class="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div class="flex justify-end space-x-2 mt-4">
        <button
          onclick={cancelEdit}
          class="px-4 py-2 text-sm font-medium border border-input rounded-lg hover:bg-muted"
        >
          Abbrechen
        </button>
        <button
          onclick={handleAdd}
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Hinzufügen
        </button>
      </div>
    </div>
  {/if}

  <!-- Languages Table -->
  <div class="bg-card shadow-sm rounded-lg border">
    <div class="px-6 py-4 border-b border-border">
      <h3 class="text-lg font-medium">Verfügbare Sprachen</h3>
    </div>
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-border">
        <thead class="bg-muted/50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Code</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Name</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Aktionen</th>
          </tr>
        </thead>
        <tbody class="bg-card divide-y divide-border">
          {#each languages as lang}
            <tr class="hover:bg-muted/25">
              <td class="px-6 py-4 text-sm font-medium">
                {#if editingLanguage && editingLanguage.code === lang.code}
                  <input
                    type="text"
                    bind:value={editingLanguage.code}
                    maxlength="5"
                    class="w-20 px-2 py-1 border border-input rounded text-sm"
                  />
                {:else}
                  <span class="font-mono bg-muted px-2 py-1 rounded text-xs">{lang.code}</span>
                {/if}
              </td>
              <td class="px-6 py-4 text-sm">
                {#if editingLanguage && editingLanguage.code === lang.code}
                  <input
                    type="text"
                    bind:value={editingLanguage.name}
                    class="w-full px-2 py-1 border border-input rounded text-sm"
                  />
                {:else}
                  {lang.name}
                {/if}
              </td>
              <td class="px-6 py-4 text-right text-sm">
                {#if editingLanguage && editingLanguage.code === lang.code}
                  <div class="flex justify-end space-x-2">
                    <button
                      onclick={handleUpdate}
                      class="text-green-600 hover:text-green-900 p-1"
                      title="Speichern"
                      aria-label="Speichern"
                    >
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </button>
                    <button
                      onclick={cancelEdit}
                      class="text-gray-600 hover:text-gray-900 p-1"
                      title="Abbrechen"
                      aria-label="Abbrechen"
                    >
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"
                        ></path>
                      </svg>
                    </button>
                  </div>
                {:else}
                  <div class="flex justify-end space-x-2">
                    <button
                      onclick={() => handleEdit(lang)}
                      class="text-blue-600 hover:text-blue-900 p-1"
                      title="Bearbeiten"
                      aria-label="Bearbeiten"
                    >
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        ></path>
                      </svg>
                    </button>
                    <button
                      onclick={() => handleDelete(lang.code)}
                      class="text-red-600 hover:text-red-900 p-1"
                      title="Löschen"
                      aria-label="Löschen"
                    >
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        ></path>
                      </svg>
                    </button>
                  </div>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>
