<script lang="ts">
  import { onMount } from "svelte";
  import { trpcAuthQuery } from "@/pages/api/trpc/trpc";

  interface Props {
    value: string;
    placeholder?: string;
    field: {
      id: string;
      label: string;
      required?: boolean;
    };
  }

  let { value = $bindable(), placeholder = "Datei auswählen...", field }: Props = $props();

  let files = $state<string[]>([]);
  let loading = $state(false);
  let error = $state("");
  let showDropdown = $state(false);
  let filteredFiles = $state<string[]>([]);
  let searchTerm = $state("");

  // Load files from file manager
  async function loadFiles() {
    try {
      loading = true;
      error = "";
      files = await trpcAuthQuery("filemanager.file.listAll");
      filteredFiles = files;
    } catch (err) {
      error = "Fehler beim Laden der Dateien";
      console.error("Error loading files:", err);
    } finally {
      loading = false;
    }
  }

  // Filter files based on search term
  function filterFiles(search: string) {
    if (!search.trim()) {
      filteredFiles = files;
    } else {
      filteredFiles = files.filter((file) => file.toLowerCase().includes(search.toLowerCase()));
    }
  }

  // Handle file selection
  function selectFile(fileName: string) {
    value = fileName;
    showDropdown = false;
    searchTerm = "";
  }

  // Handle input change
  function handleInputChange(event: Event & { currentTarget: HTMLInputElement }) {
    const inputValue = event.currentTarget.value;
    value = inputValue;
    searchTerm = inputValue;
    filterFiles(inputValue);
    showDropdown = inputValue.length > 0 && filteredFiles.length > 0;
  }

  // Handle focus
  function handleFocus() {
    if (files.length === 0) {
      loadFiles();
    } else {
      filterFiles(searchTerm);
      showDropdown = true;
    }
  }

  // Handle blur with delay to allow for clicks
  function handleBlur() {
    setTimeout(() => {
      showDropdown = false;
    }, 200);
  }

  // Handle keyboard navigation
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      showDropdown = false;
    }
  }

  onMount(() => {
    loadFiles();
  });

  // Update filtered files when search term changes
  $effect(() => {
    filterFiles(searchTerm);
  });

  // Get file extension for icon display
  function getFileExtension(fileName: string): string {
    return fileName.split(".").pop()?.toLowerCase() || "";
  }

  // Check if file is an image
  function isImageFile(fileName: string): boolean {
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
    return imageExtensions.includes(getFileExtension(fileName));
  }
</script>

<div class="relative">
  <div class="relative">
    <input
      id={field.id}
      type="text"
      bind:value
      oninput={handleInputChange}
      onfocus={handleFocus}
      onblur={handleBlur}
      onkeydown={handleKeydown}
      required={field.required}
      class="w-full px-3 py-2 pr-10 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      {placeholder}
      autocomplete="off"
    />

    <!-- Loading spinner or dropdown arrow -->
    <div class="absolute inset-y-0 right-0 flex items-center pr-3">
      {#if loading}
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
      {:else}
        <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      {/if}
    </div>
  </div>

  <!-- Dropdown with file list -->
  {#if showDropdown && filteredFiles.length > 0}
    <div
      class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
    >
      {#each filteredFiles as fileName}
        <button
          type="button"
          onclick={() => selectFile(fileName)}
          class="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0 flex items-center space-x-2"
        >
          <!-- File icon -->
          <div class="flex-shrink-0">
            {#if isImageFile(fileName)}
              <svg class="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                ></path>
              </svg>
            {:else}
              <svg class="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
            {/if}
          </div>

          <!-- File name -->
          <span class="flex-1 text-sm truncate">{fileName}</span>

          <!-- File extension badge -->
          <span class="flex-shrink-0 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
            {getFileExtension(fileName)}
          </span>
        </button>
      {/each}
    </div>
  {/if}

  <!-- No files found message -->
  {#if showDropdown && filteredFiles.length === 0 && searchTerm}
    <div class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
      <p class="text-sm text-gray-500 text-center">Keine Dateien gefunden für "{searchTerm}"</p>
    </div>
  {/if}

  <!-- Error message -->
  {#if error}
    <div class="absolute z-50 w-full mt-1 bg-red-50 border border-red-200 rounded-lg shadow-lg p-3">
      <p class="text-sm text-red-600 text-center">{error}</p>
    </div>
  {/if}
</div>
