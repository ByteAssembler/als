<script>
  import LanguageSelector from "../ui/LanguageSelector.svelte";
  import DataTable from "../ui/DataTable.svelte";

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
  } = $props();
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
