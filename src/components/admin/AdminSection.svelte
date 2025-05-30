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
</script>

<div class="space-y-4">
  <div class="flex justify-between items-center">
    <h1 class="text-2xl font-bold">{title}</h1>
    <LanguageSelector {languages} {currentLanguage} {onLanguageChange} label="Anzeigesprache:" />
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
