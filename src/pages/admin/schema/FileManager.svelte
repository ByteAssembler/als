<script lang="ts">
  import Upload from "@lucide/svelte/icons/upload";
  import FolderPlus from "@lucide/svelte/icons/folder-plus";
  import FileIcon from "@lucide/svelte/icons/file";
  import FolderIcon from "@lucide/svelte/icons/folder";
  import Trash2 from "@lucide/svelte/icons/trash-2";
  import RefreshCw from "@lucide/svelte/icons/refresh-cw";
  import X from "@lucide/svelte/icons/x";
  import HardDriveUpload from "@lucide/svelte/icons/hard-drive-upload";
  import Loader2 from "@lucide/svelte/icons/loader-2";
  import AlertTriangle from "@lucide/svelte/icons/alert-triangle";
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import Home from "@lucide/svelte/icons/home";
  import ArrowLeft from "@lucide/svelte/icons/arrow-left";
  import ExternalLink from "@lucide/svelte/icons/external-link";
  import Pencil from "@lucide/svelte/icons/pencil";
  import Check from "@lucide/svelte/icons/check";

  import type { BucketItem } from "minio";
  import { trpcAuthQuery, trpcQuery } from "@/pages/api/trpc/trpc";
  import { cn } from "@/utils/utils";

  interface DisplayItem {
    name: string;
    displayName: string;
    isDir: boolean;
    size?: number;
    lastModified?: Date;
  }
  interface BreadcrumbPart {
    name: string;
    path: string;
  }

  const CACHE_SIZE = 20;
  let folderCache = $state<Map<string, DisplayItem[]>>(new Map());
  let recentlyVisitedFolders = $state<string[]>([]);

  let items = $state<DisplayItem[]>([]);
  let isLoading = $state(true);
  let isOptimisticLoading = $state(false);
  let error = $state<string | null>(null);
  let newFolderName = $state("");
  let showNewFolderInput = $state(false);
  let isProcessing = $state(false);
  let navigationHistory = $state<string[]>([]);
  let renamingItemName = $state<string | null>(null);
  let newItemName = $state("");

  let showPreviewDialog = $state(false);
  let previewItem = $state<DisplayItem | null>(null);
  let previewUrl = $state<string | null>(null);
  let isPreviewLoading = $state(false);
  let previewError = $state<string | null>(null);
  let dialogElement: HTMLDialogElement | null = $state(null);

  let currentPrefix = $derived.by(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("prefix") ?? "";
    }
    return "";
  });

  let breadcrumbs = $derived.by(() => {
    const parts: BreadcrumbPart[] = [{ name: "Root", path: "" }];
    const pathSegments = currentPrefix.split("/").filter((p) => p !== "");
    let currentPath = "";
    for (const segment of pathSegments) {
      currentPath += segment + "/";
      parts.push({ name: segment, path: currentPath });
    }
    return parts;
  });

  function formatBytes(bytes: number, decimals = 2): string {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }
  function formatDate(date?: Date | string): string {
    if (!date) return "-";
    try {
      const d = date instanceof Date ? date : new Date(date);
      return d.toLocaleString();
    } catch {
      return "-";
    }
  }
  function sortItems(itemsToSort: DisplayItem[]): DisplayItem[] {
    return itemsToSort.sort((a, b) => {
      if (a.isDir && !b.isDir) return -1;
      if (!a.isDir && b.isDir) return 1;
      return a.displayName.localeCompare(b.displayName);
    });
  }
  function processItems(rawItems: BucketItem[], prefix: string): DisplayItem[] {
    const displayItems: DisplayItem[] = [];
    const currentFolderItems = new Set<string>();

    rawItems.forEach((item) => {
      if (item.prefix) {
        const folderPrefix = item.prefix;
        if (folderPrefix.startsWith(prefix) && folderPrefix.length > prefix.length) {
          const relativePath = folderPrefix.substring(prefix.length);
          const parts = relativePath.replace(/\/$/, "").split("/");
          if (parts.length === 1) {
            const displayName = parts[0];
            if (!currentFolderItems.has(folderPrefix)) {
              displayItems.push({
                name: folderPrefix,
                displayName: displayName,
                isDir: true,
                size: 0,
                lastModified: undefined,
              });
              currentFolderItems.add(folderPrefix);
            }
          }
        }
      } else if (item.name) {
        const fileName = item.name;
        if (
          fileName.startsWith(prefix) &&
          fileName.length > prefix.length &&
          !fileName.substring(prefix.length).includes("/")
        ) {
          const displayName = fileName.substring(prefix.length);
          if (fileName !== prefix && displayName && !currentFolderItems.has(fileName)) {
            displayItems.push({
              name: fileName,
              displayName: displayName,
              isDir: false,
              size: item.size,
              lastModified: item.lastModified ? new Date(item.lastModified) : undefined,
            });
            currentFolderItems.add(fileName);
          }
        }
      }
    });

    return sortItems(displayItems);
  }

  function updateCache(prefix: string, data: DisplayItem[]) {
    folderCache.set(prefix, data);
    const filteredList = recentlyVisitedFolders.filter((p) => p !== prefix);
    filteredList.push(prefix);
    recentlyVisitedFolders = filteredList;
    while (recentlyVisitedFolders.length > CACHE_SIZE) {
      const oldestPrefix = recentlyVisitedFolders.shift();
      if (oldestPrefix) {
        folderCache.delete(oldestPrefix);
        console.log(`Cache evicted: ${oldestPrefix || "root"}`);
      }
    }
    folderCache = folderCache;
    recentlyVisitedFolders = recentlyVisitedFolders;
  }

  function invalidateCache(prefix: string) {
    folderCache.delete(prefix);
    recentlyVisitedFolders = recentlyVisitedFolders.filter((p) => p !== prefix);
    folderCache = folderCache;
    recentlyVisitedFolders = recentlyVisitedFolders;
    console.log("Cache invalidated for:", prefix || "root");
  }

  async function loadItemsForPrefix(prefix: string, forceNoCache = false) {
    const loadTargetPrefix = prefix;

    isLoading = true;
    isOptimisticLoading = false;
    if (currentPrefix === loadTargetPrefix) {
      error = null;
    }
    if (showPreviewDialog) closePreview();
    cancelRename();

    if (!forceNoCache && folderCache.has(loadTargetPrefix)) {
      const cachedItems = folderCache.get(loadTargetPrefix)!;
      if (currentPrefix === loadTargetPrefix) {
        items = cachedItems;
        isLoading = false;
        isOptimisticLoading = true;
      }
      console.log(`Cache hit for: ${loadTargetPrefix || "root"}`);
    } else {
      if (currentPrefix === loadTargetPrefix) {
        items = [];
      }
      console.log(`Cache miss or force refresh for: ${loadTargetPrefix || "root"}`);
    }

    try {
      const options = { prefix: loadTargetPrefix, recursive: false };
      const rawItems: BucketItem[] = await trpcQuery("filemanager.bucket.list", options);
      const freshItems = processItems(rawItems, loadTargetPrefix);
      updateCache(loadTargetPrefix, freshItems);
      if (currentPrefix === loadTargetPrefix) {
        items = freshItems;
        error = null;
      }
    } catch (err: any) {
      console.error(`Error loading items for prefix '${loadTargetPrefix}':`, err);
      if (currentPrefix === loadTargetPrefix) {
        error = err.message || `Failed to load items.`;
        if (!folderCache.has(loadTargetPrefix)) {
          items = [];
        }
      }
    } finally {
      if (currentPrefix === loadTargetPrefix) {
        isLoading = false;
        isOptimisticLoading = false;
      }
    }
  }

  $effect(() => {
    if (typeof window !== "undefined") {
      loadItemsForPrefix(currentPrefix);
    }
  });

  function navigateToFolder(prefix: string | null, isForwardNavigation: boolean = true) {
    const targetPrefix = prefix === null ? "" : prefix;
    if (targetPrefix === currentPrefix) return;

    if (isForwardNavigation) {
      navigationHistory.push(currentPrefix);
      navigationHistory = navigationHistory;
    }

    const params = new URLSearchParams(window.location.search);
    if (targetPrefix) {
      params.set("prefix", targetPrefix);
    } else {
      params.delete("prefix");
    }
    window.history.pushState({}, "", window.location.pathname + `?${params.toString()}`);
    currentPrefix = targetPrefix;
    cancelRename();
  }

  function handleBackClick() {
    if (navigationHistory.length > 0) {
      const previousPrefix = navigationHistory.pop();
      navigationHistory = navigationHistory;
      navigateToFolder(previousPrefix ?? "", false);
    } else {
      console.warn("Back clicked, but navigation history is empty.");
    }
  }

  function handleItemClick(item: DisplayItem) {
    if (renamingItemName) return;
    if (item.isDir) {
      navigateToFolder(item.name, true);
    } else {
      openPreview(item);
    }
  }

  async function handleFileUpload(event: Event) {
    const prefixAtActionStart = currentPrefix;
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const filesToUpload = Array.from(input.files);
    input.value = "";

    isProcessing = true;
    let hadActionInFocus = false;
    if (currentPrefix === prefixAtActionStart) {
      isOptimisticLoading = true;
      hadActionInFocus = true;
      error = null;
    }

    const uploadPromises = filesToUpload.map(async (file) => {
      const fullName = prefixAtActionStart + file.name;
      try {
        console.log(`Requesting upload URL for: ${fullName}`);
        const uploadUrl: string = await trpcAuthQuery("filemanager.file.upload-url", fullName);

        if (!uploadUrl) {
          throw new Error(`No upload URL received for ${file.name}`);
        }
        console.log(`Received upload URL for: ${file.name}. Uploading...`);

        const response = await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type || "application/octet-stream",
          },
        });

        if (!response.ok) {
          let errorBody = "Upload failed";
          try {
            const textResponse = await response.text();
            console.error(`Upload failed for ${file.name}. Status: ${response.status}. Response: ${textResponse}`);
            const messageMatch = textResponse.match(/<Message>(.*?)<\/Message>/);
            if (messageMatch && messageMatch[1]) {
              errorBody = messageMatch[1];
            } else {
              errorBody = `Upload failed with status ${response.status}`;
            }
          } catch (parseError) {
            console.error("Could not parse error response body", parseError);
            errorBody = `Upload failed with status ${response.status}`;
          }
          throw new Error(errorBody);
        }

        console.log(`Successfully uploaded: ${fullName}`);
        return { status: "fulfilled", value: fullName };
      } catch (uploadError: any) {
        console.error(`Failed to upload ${file.name}:`, uploadError);
        return {
          status: "rejected",
          reason: `Failed to upload ${file.name}: ${uploadError.message}`,
        };
      }
    });

    const results = await Promise.allSettled(uploadPromises);

    const failedUploads = results.filter((result) => result.status === "rejected") as PromiseRejectedResult[];

    try {
      if (failedUploads.length > 0) {
        const errorMessages = failedUploads.map((f) => f.reason).join("; ");
        throw new Error(`Some uploads failed: ${errorMessages}`);
      }

      console.log("All uploads completed successfully for prefix:", prefixAtActionStart);
      invalidateCache(prefixAtActionStart);
      if (currentPrefix === prefixAtActionStart) {
        await loadItemsForPrefix(prefixAtActionStart, true);
      }
    } catch (err: any) {
      console.error("Upload process finished with errors:", err);
      if (currentPrefix === prefixAtActionStart) {
        error = err.message || "Upload failed.";
        invalidateCache(prefixAtActionStart);
        await loadItemsForPrefix(prefixAtActionStart, true);
      } else {
        console.error(`Upload failed for background folder "${prefixAtActionStart}": ${err.message}`);
        invalidateCache(prefixAtActionStart);
      }
    } finally {
      isProcessing = false;
      if (hadActionInFocus) {
        isOptimisticLoading = false;
      }
    }
  }

  async function handleCreateFolder() {
    const prefixAtActionStart = currentPrefix;
    const trimmedName = newFolderName.trim().replace(/\//g, "");
    if (!trimmedName) {
      if (currentPrefix === prefixAtActionStart) error = "Folder name cannot be empty or just slashes.";
      return;
    }

    const newFolderPath = prefixAtActionStart + trimmedName + "/";
    const optimisticDisplayName = trimmedName;

    isProcessing = true;
    let hadActionInFocus = false;
    if (currentPrefix === prefixAtActionStart) {
      isOptimisticLoading = true;
      hadActionInFocus = true;
      error = null;
    }

    const optimisticNewFolder: DisplayItem = {
      name: newFolderPath,
      displayName: optimisticDisplayName,
      isDir: true,
      size: 0,
      lastModified: new Date(),
    };
    let itemsToUpdate: DisplayItem[] = [];
    if (folderCache.has(prefixAtActionStart)) {
      itemsToUpdate = [...folderCache.get(prefixAtActionStart)!];
    } else if (currentPrefix === prefixAtActionStart) {
      itemsToUpdate = [...items];
    }
    itemsToUpdate.push(optimisticNewFolder);
    const newOptimisticItems = sortItems(itemsToUpdate);
    updateCache(prefixAtActionStart, newOptimisticItems);
    if (currentPrefix === prefixAtActionStart) {
      items = newOptimisticItems;
    }

    const oldFolderName = newFolderName;
    newFolderName = "";
    showNewFolderInput = false;

    try {
      await trpcAuthQuery("filemanager.folder.create", newFolderPath);
      console.log("Folder creation successful:", newFolderPath);
    } catch (err: any) {
      console.error("Create Folder Error:", err);
      invalidateCache(prefixAtActionStart);
      if (currentPrefix === prefixAtActionStart) {
        error = err.message || `Failed to create folder.`;
        await loadItemsForPrefix(prefixAtActionStart, true);
        newFolderName = oldFolderName;
        showNewFolderInput = true;
      } else {
        console.error(`Folder creation failed for background folder "${prefixAtActionStart}": ${err.message}`);
      }
    } finally {
      isProcessing = false;
      if (hadActionInFocus) {
        isOptimisticLoading = false;
      }
    }
  }

  async function handleDeleteItem(item: DisplayItem) {
    const prefixAtActionStart = currentPrefix;
    const itemName = item.name;
    const itemDisplayName = item.displayName;

    const confMsg = item.isDir
      ? `Delete folder "${itemDisplayName}" and all its contents?`
      : `Delete file "${itemDisplayName}"?`;
    if (!confirm(confMsg)) return;

    isProcessing = true;
    let hadActionInFocus = false;
    if (currentPrefix === prefixAtActionStart) {
      isOptimisticLoading = true;
      hadActionInFocus = true;
      error = null;
    }

    let itemsToUpdate: DisplayItem[] = [];
    if (folderCache.has(prefixAtActionStart)) {
      itemsToUpdate = [...folderCache.get(prefixAtActionStart)!];
    } else if (currentPrefix === prefixAtActionStart) {
      itemsToUpdate = [...items];
    }
    const newOptimisticItems = itemsToUpdate.filter((i) => i.name !== itemName);
    updateCache(prefixAtActionStart, newOptimisticItems);
    if (currentPrefix === prefixAtActionStart) {
      items = newOptimisticItems;
    }

    try {
      const query = item.isDir ? "filemanager.folder.delete" : "filemanager.file.delete";
      await trpcAuthQuery(query, itemName);
      console.log("Deletion successful:", itemName);
    } catch (err: any) {
      console.error("Delete Error:", err);
      invalidateCache(prefixAtActionStart);
      if (currentPrefix === prefixAtActionStart) {
        error = err.message || `Failed to delete item.`;
        await loadItemsForPrefix(prefixAtActionStart, true);
      } else {
        console.error(
          `Deletion failed for background item "${itemName}" in folder "${prefixAtActionStart}": ${err.message}`
        );
      }
    } finally {
      isProcessing = false;
      if (hadActionInFocus) {
        isOptimisticLoading = false;
      }
    }
  }

  function startRename(item: DisplayItem) {
    if (item.isDir || isProcessing || isLoading) return;
    renamingItemName = item.name;
    newItemName = item.displayName;
    error = null;
  }

  function cancelRename() {
    renamingItemName = null;
    newItemName = "";
  }

  async function handleRenameItem() {
    if (!renamingItemName) return;

    const prefixAtActionStart = currentPrefix;
    const oldFullName = renamingItemName;
    const originalItem = items.find((i) => i.name === oldFullName);
    const trimmedNewName = newItemName.trim();

    if (!originalItem || originalItem.isDir) {
      error = "Cannot rename this item.";
      cancelRename();
      return;
    }
    if (!trimmedNewName || trimmedNewName.includes("/")) {
      error = "Invalid file name. Cannot be empty or contain slashes.";
      return;
    }
    if (trimmedNewName === originalItem.displayName) {
      cancelRename();
      return;
    }

    const newFullName = prefixAtActionStart + trimmedNewName;

    isProcessing = true;
    let hadActionInFocus = false;
    if (currentPrefix === prefixAtActionStart) {
      isOptimisticLoading = true;
      hadActionInFocus = true;
      error = null;
    }

    let itemsToUpdate: DisplayItem[] = [];
    if (folderCache.has(prefixAtActionStart)) {
      itemsToUpdate = [...folderCache.get(prefixAtActionStart)!];
    } else if (currentPrefix === prefixAtActionStart) {
      itemsToUpdate = [...items];
    }

    const itemIndex = itemsToUpdate.findIndex((i) => i.name === oldFullName);
    let originalOptimisticItem: DisplayItem | null = null;
    if (itemIndex !== -1) {
      originalOptimisticItem = { ...itemsToUpdate[itemIndex] };
      itemsToUpdate[itemIndex] = {
        ...itemsToUpdate[itemIndex],
        name: newFullName,
        displayName: trimmedNewName,
        lastModified: new Date(),
      };
      const newOptimisticItems = sortItems(itemsToUpdate);
      updateCache(prefixAtActionStart, newOptimisticItems);
      if (currentPrefix === prefixAtActionStart) {
        items = newOptimisticItems;
      }
    } else {
      console.warn("Optimistic rename failed: Item not found in list/cache.");
    }

    const oldRenamingItemName = renamingItemName;
    const oldNewItemName = newItemName;
    renamingItemName = null;
    newItemName = "";

    try {
      await trpcAuthQuery("filemanager.file.rename", {
        oldName: oldFullName,
        newName: newFullName,
      });
      console.log(`Rename successful: ${oldFullName} -> ${newFullName}`);
    } catch (err: any) {
      console.error("Rename Error:", err);
      if (originalOptimisticItem && itemIndex !== -1) {
        itemsToUpdate[itemIndex] = originalOptimisticItem;
        const revertedItems = sortItems(itemsToUpdate);
        updateCache(prefixAtActionStart, revertedItems);
        if (currentPrefix === prefixAtActionStart) {
          items = revertedItems;
        }
      } else {
        invalidateCache(prefixAtActionStart);
      }

      if (currentPrefix === prefixAtActionStart) {
        error = err.message || `Failed to rename file.`;
        renamingItemName = oldRenamingItemName;
        newItemName = oldNewItemName;
      } else {
        console.error(
          `Rename failed for background item "${oldFullName}" in folder "${prefixAtActionStart}": ${err.message}`
        );
        invalidateCache(prefixAtActionStart);
      }
    } finally {
      isProcessing = false;
      if (hadActionInFocus) {
        isOptimisticLoading = false;
      }
      if (error && renamingItemName === oldRenamingItemName) {
        // Input was restored due to error, keep it.
      } else {
        renamingItemName = null;
        newItemName = "";
      }
    }
  }

  async function openPreview(itemToPreview: DisplayItem) {
    if (itemToPreview.isDir || isPreviewLoading) return;
    previewItem = itemToPreview;
    previewError = null;
    previewUrl = null;
    isPreviewLoading = true;
    showPreviewDialog = true;
    try {
      const url = await trpcQuery("filemanager.file.download-url", itemToPreview.name);
      if (!url) throw new Error("No preview URL received.");
      previewUrl = url;
    } catch (err: any) {
      console.error("Preview URL Error:", err);
      previewError = err.message || "Could not load preview.";
    } finally {
      isPreviewLoading = false;
    }
  }
  function closePreview() {
    dialogElement?.close();
  }
  $effect(() => {
    if (showPreviewDialog && dialogElement && !dialogElement.open) {
      dialogElement.showModal();
    }
  });
  function handleDialogClose() {
    showPreviewDialog = false;
    previewUrl = null;
    previewItem = null;
    previewError = null;
    isPreviewLoading = false;
  }
</script>

<div class="p-4 md:p-6 space-y-6 bg-white text-gray-900 rounded-lg border border-gray-200">
  <h2 class="text-2xl font-bold">File Manager</h2>

  <nav
    aria-label="Breadcrumb"
    class="flex items-center space-x-1 text-sm text-gray-600 overflow-x-auto whitespace-nowrap py-1"
  >
    {#each breadcrumbs as part, i (part.path)}
      {#if i > 0}<ChevronRight class="h-4 w-4 flex-shrink-0" />{/if}
      {#if i === breadcrumbs.length - 1}
        <span class="font-semibold text-gray-900 truncate" aria-current="page">{part.name}</span>
      {:else}
        <button
          onclick={() => navigateToFolder(part.path, true)}
          class="hover:underline hover:text-gray-900 truncate flex items-center"
          disabled={isLoading || isProcessing || renamingItemName !== null}
        >
          {#if i === 0}<Home class="inline h-4 w-4 mr-1" />{/if}{part.name}
        </button>
      {/if}
    {/each}
  </nav>

  <div class="flex flex-wrap gap-2 items-center border-b border-gray-200 pb-4">
    {#if navigationHistory.length > 0}
      <button
        onclick={handleBackClick}
        class={cn(
          "p-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors",
          (isLoading || isProcessing || renamingItemName !== null) && "opacity-50 cursor-not-allowed"
        )}
        title="Go back to previous folder"
        aria-label="Go back"
        disabled={isLoading || isProcessing || renamingItemName !== null}
      >
        <ArrowLeft class="h-4 w-4" />
      </button>
    {/if}

    <label
      class={cn(
        "flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 cursor-pointer transition-colors",
        (isProcessing || isLoading || renamingItemName !== null) && "opacity-50 cursor-not-allowed"
      )}
      aria-disabled={isProcessing || isLoading || renamingItemName !== null}
    >
      <Upload class="h-4 w-4" /> <span>Upload</span>
      <input
        type="file"
        multiple
        onchange={handleFileUpload}
        class="hidden"
        disabled={isProcessing || isLoading || renamingItemName !== null}
      />
    </label>

    {#if showNewFolderInput}
      <div class="flex items-center gap-2 bg-gray-100 p-1 rounded-md">
        <input
          type="text"
          bind:value={newFolderName}
          placeholder="Folder name"
          class="px-3 py-1.5 bg-white rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-400 text-sm"
          onkeydown={(e) => e.key === "Enter" && !isProcessing && !renamingItemName && handleCreateFolder()}
          disabled={isProcessing || renamingItemName !== null}
        />
        <button
          onclick={handleCreateFolder}
          class="p-2 bg-green-600 hover:bg-green-500 rounded-md disabled:opacity-50 text-white"
          title="Create Folder"
          aria-label="Create Folder"
          disabled={isProcessing || !newFolderName.trim() || isLoading || renamingItemName !== null}
        >
          <FolderPlus class="h-4 w-4" />
        </button>
        <button
          onclick={() => {
            showNewFolderInput = false;
            newFolderName = "";
            error = null;
          }}
          class="p-2 bg-red-600 hover:bg-red-500 rounded-md disabled:opacity-50 text-white"
          title="Cancel"
          aria-label="Cancel creating folder"
          disabled={isProcessing || renamingItemName !== null}
        >
          <X class="h-4 w-4" />
        </button>
      </div>
    {:else}
      <button
        onclick={() => (showNewFolderInput = true)}
        class={cn(
          "flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors",
          (isProcessing || isLoading || renamingItemName !== null) && "opacity-50 cursor-not-allowed"
        )}
        disabled={isProcessing || isLoading || renamingItemName !== null}
      >
        <FolderPlus class="h-4 w-4" /> <span>New Folder</span>
      </button>
    {/if}

    <div class="flex items-center gap-2">
      <button
        onclick={() => loadItemsForPrefix(currentPrefix, true)}
        class={cn(
          "p-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors",
          (isProcessing || (isLoading && !isOptimisticLoading) || renamingItemName !== null) &&
            "opacity-50 cursor-not-allowed"
        )}
        title="Refresh current folder (force)"
        aria-label="Refresh file list"
        disabled={isProcessing || (isLoading && !isOptimisticLoading) || renamingItemName !== null}
      >
        {#if isLoading && !isOptimisticLoading}
          <RefreshCw class="h-4 w-4 animate-spin" />
        {:else}
          <RefreshCw class="h-4 w-4" />
        {/if}
      </button>
      {#if isOptimisticLoading || isProcessing}
        <div title="Syncing changes..." aria-label="Optimistic update indicator">
          <Loader2 class="h-4 w-4 animate-spin text-blue-600" />
        </div>
      {/if}
    </div>
  </div>

  {#if error}
    <div class="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm whitespace-pre-wrap">
      Error: {error}
    </div>
  {/if}
  {#if isProcessing && !isLoading && !isOptimisticLoading}
    <div class="mt-4 flex items-center gap-2 text-sm text-blue-700">
      <HardDriveUpload class="h-4 w-4 animate-pulse" /><span>Processing...</span>
    </div>
  {/if}

  <div class="mt-6">
    {#if isLoading && !isOptimisticLoading}
      <p class="text-gray-600 flex items-center gap-2">
        <RefreshCw class="h-4 w-4 animate-spin" /> Loading...
      </p>
    {:else if items.length === 0 && !error}
      <p class="text-gray-500">Folder is empty.</p>
    {:else if items.length > 0}
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm table-auto border-collapse">
          <thead class="border-b border-gray-300">
            <tr>
              <th class="p-2 w-8"></th> <th class="p-2">Name</th>
              <th class="p-2">Size</th>
              <th class="p-2 w-20 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each items as item (item.name)}
              <tr
                class={cn(
                  "border-b border-gray-200 transition-colors group",
                  renamingItemName !== item.name && "hover:bg-gray-50",
                  renamingItemName === item.name && "bg-gray-100"
                )}
              >
                <td class="p-2 align-middle">
                  {#if item.isDir}
                    <FolderIcon class="h-4 w-4 text-blue-600" />
                  {:else}
                    <FileIcon class="h-4 w-4 text-gray-600" />
                  {/if}
                </td>
                <td
                  class={cn(
                    "p-2 align-middle truncate max-w-xs md:max-w-md lg:max-w-lg",
                    (item.isDir || !item.isDir) && renamingItemName !== item.name && "cursor-pointer hover:underline",
                    (isLoading || isProcessing || renamingItemName !== null) && renamingItemName !== item.name
                      ? "opacity-70 pointer-events-none"
                      : "",
                    renamingItemName === item.name && "py-1"
                  )}
                  title={renamingItemName === item.name
                    ? "Renaming..."
                    : item.isDir
                      ? `Open folder ${item.displayName}`
                      : `Click to preview ${item.displayName}`}
                  onclick={() => !isLoading && !isProcessing && renamingItemName !== item.name && handleItemClick(item)}
                >
                  {#if renamingItemName === item.name}
                    <div class="flex items-center gap-1">
                      <input
                        type="text"
                        bind:value={newItemName}
                        class="px-2 py-1 bg-white rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-400 text-sm w-full"
                        onkeydown={(e) => {
                          if (e.key === "Enter") handleRenameItem();
                          if (e.key === "Escape") cancelRename();
                        }}
                        disabled={isProcessing}
                        autofocus
                      />
                    </div>
                  {:else}
                    {item.displayName}
                  {/if}
                </td>
                <td class="p-2 align-middle">
                  {#if !item.isDir && item.size != null}{formatBytes(item.size)}{:else}-{/if}
                </td>
                <td class="p-2 align-middle text-right">
                  {#if renamingItemName === item.name}
                    <div class="flex justify-end items-center gap-1">
                      <button
                        onclick={handleRenameItem}
                        class="p-1 text-green-600 hover:text-green-700 rounded disabled:opacity-50"
                        title="Save changes"
                        aria-label="Save rename"
                        disabled={isProcessing || !newItemName.trim() || newItemName.trim() === item.displayName}
                      >
                        <Check class="h-4 w-4" />
                      </button>
                      <button
                        onclick={cancelRename}
                        class="p-1 text-red-600 hover:text-red-700 rounded disabled:opacity-50"
                        title="Cancel rename"
                        aria-label="Cancel rename"
                        disabled={isProcessing}
                      >
                        <X class="h-4 w-4" />
                      </button>
                    </div>
                  {:else}
                    <div
                      class="flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity"
                    >
                      {#if !item.isDir}
                        <button
                          onclick={() => startRename(item)}
                          class="p-1 text-gray-600 hover:text-blue-600 rounded disabled:opacity-50"
                          title="Rename File"
                          aria-label="Rename {item.displayName}"
                          disabled={isProcessing || isLoading || renamingItemName !== null}
                        >
                          <Pencil class="h-4 w-4" />
                        </button>
                      {/if}
                      <button
                        onclick={() => handleDeleteItem(item)}
                        class="p-1 text-gray-600 hover:text-red-600 rounded disabled:opacity-50"
                        title="Delete {item.isDir ? 'Folder' : 'File'}"
                        aria-label="Delete {item.displayName}"
                        disabled={isProcessing || isLoading || renamingItemName !== null}
                      >
                        <Trash2 class="h-4 w-4" />
                      </button>
                    </div>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>

{#if showPreviewDialog}
  <dialog
    bind:this={dialogElement}
    onclose={handleDialogClose}
    class="bg-white text-gray-900 rounded-lg shadow-xl p-0 w-full max-w-3xl border border-gray-300 backdrop:bg-black/50 open:animate-fade-in"
  >
    <header class="flex justify-between items-center p-4 border-b border-gray-300">
      <h3 class="font-semibold text-lg truncate pr-4" title={previewItem?.displayName}>
        Preview: {previewItem?.displayName ?? "File"}
      </h3>
      <button onclick={closePreview} class="p-1 rounded-full hover:bg-gray-100" aria-label="Close preview">
        <X class="h-5 w-5" />
      </button>
    </header>
    <div class="p-4 min-h-[60vh] max-h-[75vh] overflow-y-auto flex justify-center items-center">
      {#if isPreviewLoading}
        <div class="flex flex-col items-center gap-2 text-gray-600">
          <Loader2 class="h-8 w-8 animate-spin" />
          <span>Loading preview...</span>
        </div>
      {:else if previewError}
        <div class="flex flex-col items-center gap-2 text-red-600">
          <AlertTriangle class="h-8 w-8" />
          <span>{previewError}</span>
        </div>
      {:else if previewUrl}
        {#key previewUrl}
          <iframe
            src={previewUrl}
            title="File Preview: {previewItem?.displayName}"
            class="w-full h-[70vh] border-0 bg-white"
            allowfullscreen
            onload={() => console.log("Iframe loaded (attempted):", previewUrl)}
            onerror={(e) => {
              if (previewUrl) {
                console.error("Iframe loading error:", e, previewUrl);
                previewError = "Could not display preview in iframe.";
              }
            }}
          ></iframe>
        {/key}
      {:else}
        <div class="flex flex-col items-center gap-2 text-gray-500">
          <AlertTriangle class="h-8 w-8" />
          <span>Preview not available or load failed.</span>
        </div>
      {/if}
    </div>
    <footer class="p-4 border-t border-gray-300 text-right">
      <a
        href={previewUrl ?? "#"}
        download={previewItem?.displayName}
        target="_blank"
        rel="noopener noreferrer"
        class={cn(
          "px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors text-white",
          "ml-auto w-fit",
          "flex items-center justify-center gap-2",
          (!previewUrl || previewError) && "opacity-50 cursor-not-allowed pointer-events-none"
        )}
        aria-disabled={!previewUrl || !!previewError}
      >
        <ExternalLink class="h-4 w-4 inline" />{" "}
        {#if isPreviewLoading}
          Loading...
        {:else if previewError}
          Retry...
        {/if}
      </a>
    </footer>
  </dialog>
{/if}
