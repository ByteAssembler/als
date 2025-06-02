<script lang="ts">
  import LanguageSelector from "@/components/ui/LanguageSelector.svelte";
  import DataTable from "@/components/ui/DataTable.svelte";
  import type { Column, DataItem } from "@/components/ui/DataTable.svelte";

  interface Language {
    code: string;
    name: string;
  }

  type OnLanguageChangeCallback = (langCode: string) => void;
  type OnCreateCallback = () => void;
  type OnEditCallback = (item: DataItem) => void;
  type OnDeleteCallback = (id: string | number) => void;

  interface Props {
    title: string;
    languages: Language[];
    currentLanguage: string;
    onLanguageChange: OnLanguageChangeCallback;
    columns: Column[];
    data: DataItem[];
    onCreate?: OnCreateCallback;
    onEdit?: OnEditCallback;
    onDelete?: OnDeleteCallback;
    createButtonText?: string;
    emptyStateTitle?: string;
    emptyStateDescription?: string;
  }

  let {
    title,
    languages,
    currentLanguage,
    onLanguageChange,
    columns,
    data,
    onCreate,
    onEdit,
    onDelete,
    createButtonText,
    emptyStateTitle,
    emptyStateDescription,
  }: Props = $props();
  
  function ReturnToWebsite() {
    
    // Redirect to the main website
    window.location.href = "/";
  }
</script>

<div class="space-y-4">
  <div class="flex justify-between items-center">
    <h1 class="text-2xl font-bold">{title}</h1>
    <div class="flex items-center gap-4">
      <button 
        type="button" 
        onclick={ReturnToWebsite} 
        class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
      >
        <div class="flex items-center gap-2">
          <span>Zurück zur Webseite</span>
        </div>
      </button>
      <LanguageSelector {languages} {currentLanguage} {onLanguageChange} label="Anzeigesprache:" />
    </div>
  </div>

  <DataTable
    {title}
    {columns}
    {data}
    {onCreate}
    {onEdit}
    {onDelete}
    {createButtonText}
    {emptyStateTitle}
    {emptyStateDescription}
  />
</div>
