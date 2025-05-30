<script lang="ts">
  export interface Column {
    header: string;
    key: string;
    primary?: boolean;
    render?: (item: DataItem) => string;
    clickable?: boolean;
    onClick?: (item: DataItem) => void;
  }

  export interface DataItem {
    id: string | number;
    [key: string]: any;
  }

  type OnEditCallback = (item: DataItem) => void;
  type OnDeleteCallback = (id: string | number) => void;
  type OnCreateCallback = () => void;

  let {
    title,
    columns,
    data,
    onEdit,
    onDelete,
    onCreate,
    createButtonText = "Neuen Eintrag hinzufügen",
    emptyStateTitle = "Keine Einträge vorhanden",
    emptyStateDescription = "Erstellen Sie Ihren ersten Eintrag, um zu beginnen.",
  }: {
    title: string;
    columns: Column[];
    data: DataItem[];
    onEdit?: OnEditCallback;
    onDelete?: OnDeleteCallback;
    onCreate?: OnCreateCallback;
    createButtonText?: string;
    emptyStateTitle?: string;
    emptyStateDescription?: string;
  } = $props();
</script>

<div class="bg-card shadow-sm rounded-lg border" role="region" aria-labelledby="table-heading">
  <div class="px-6 py-4 border-b border-border">
    <div class="flex justify-between items-center">
      <h3 id="table-heading" class="text-lg font-medium">{title}</h3>
      {#if onCreate}
        <button
          onclick={onCreate}
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          aria-label={createButtonText}
        >
          <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          {createButtonText}
        </button>
      {/if}
    </div>
  </div>

  <div class="overflow-x-auto" role="region" aria-label="Datentabelle">
    <table class="min-w-full divide-y divide-border" aria-label="Übersicht aller Einträge">
      <thead class="bg-muted/50">
        <tr>
          {#each columns as column}
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
            >
              {column.header}
            </th>
          {/each}
          <th
            scope="col"
            class="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider"
          >
            Aktionen
          </th>
        </tr>
      </thead>
      <tbody class="bg-card divide-y divide-border">
        {#each data as item (item.id)}
          <tr class="hover:bg-muted/25 transition-colors">
            {#each columns as column}
              <td class="px-6 py-4 text-sm" class:font-medium={column.primary} role="cell">
                {#if column.render}
                  {#if column.clickable && column.onClick}
                    <button
                      onclick={() => column.onClick?.(item)}
                      class="text-left w-full focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                    >
                      {@html column.render(item)}
                    </button>
                  {:else}
                    {@html column.render(item)}
                  {/if}
                {:else}
                  {item[column.key] || "-"}
                {/if}
              </td>
            {/each}
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" role="cell">
              <div class="flex justify-end space-x-2" role="group" aria-label="Aktionen für Eintrag">
                {#if onEdit}
                  <button
                    onclick={() => onEdit(item)}
                    class="text-blue-600 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded transition-colors p-1"
                    aria-label="Eintrag bearbeiten"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      ></path>
                    </svg>
                  </button>
                {/if}
                {#if onDelete}
                  <button
                    onclick={() => onDelete(item.id)}
                    class="text-red-600 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 rounded transition-colors p-1"
                    aria-label="Eintrag löschen"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      ></path>
                    </svg>
                  </button>
                {/if}
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  {#if data.length === 0}
    <div class="text-center py-12" role="status" aria-live="polite">
      <svg
        class="mx-auto h-12 w-12 text-muted-foreground"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
        ></path>
      </svg>
      <h3 class="mt-4 text-lg font-medium">{emptyStateTitle}</h3>
      <p class="mt-2 text-sm text-muted-foreground">{emptyStateDescription}</p>
    </div>
  {/if}
</div>
