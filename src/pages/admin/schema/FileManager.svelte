<script lang="ts">
  // Icons
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
  import Pencil from "@lucide/svelte/icons/pencil"; // Added
  import Check from "@lucide/svelte/icons/check"; // Added

  import type { BucketItem } from "minio";
  import { trpcAuthQuery } from "@/pages/api/trpc/trpc";

  // --- Type definitions ---
  interface DisplayItem {
    name: string; // full path (prefix + name) (unique)
    displayName: string; // display name (without prefix)
    isDir: boolean;
    size?: number;
    lastModified?: Date;
  }
  interface BreadcrumbPart {
    name: string;
    path: string;
  }

  // --- Cache ---
  const CACHE_SIZE = 20;
  let folderCache = $state<Map<string, DisplayItem[]>>(new Map()); // Key: absolute path (prefix), Value: items
  let recentlyVisitedFolders = $state<string[]>([]); // LRU order of visited folders

  // --- State ---
  let items = $state<DisplayItem[]>([]);
  let isLoading = $state(true); // Main loading state (initial or when no cache)
  let isOptimisticLoading = $state(false); // Indicates cache is shown while background loading or syncing
  let error = $state<string | null>(null);
  let newFolderName = $state("");
  let showNewFolderInput = $state(false);
  let isProcessing = $state(false); // For actions like upload, delete, create, rename
  let navigationHistory = $state<string[]>([]);
  let renamingItemName = $state<string | null>(null); // Added: Track item being renamed
  let newItemName = $state(""); // Added: Input for new name

  // --- Dialog State ---
  let showPreviewDialog = $state(false);
  let previewItem = $state<DisplayItem | null>(null);
  let previewUrl = $state<string | null>(null);
  let isPreviewLoading = $state(false);
  let previewError = $state<string | null>(null);
  let dialogElement: HTMLDialogElement | null = $state(null);

  // --- Reactive current path ---
  let currentPrefix = $derived.by(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("prefix") ?? "";
    }
    return "";
  });

  // --- Reactive breadcrumbs ---
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

  // --- Helpers ---
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

  // --- Cache management ---
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

  // --- Load data ---
  async function loadItemsForPrefix(prefix: string, forceNoCache = false) {
    const loadTargetPrefix = prefix;

    isLoading = true;
    isOptimisticLoading = false;
    // Clear error only if loading for the currently viewed prefix
    if (currentPrefix === loadTargetPrefix) {
      error = null;
    }
    if (showPreviewDialog) closePreview();
    cancelRename(); // Cancel rename if navigating away or refreshing

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
      const rawItems: BucketItem[] = await trpcAuthQuery("filemanager.bucket.list", options);
      const freshItems = processItems(rawItems, loadTargetPrefix);
      updateCache(loadTargetPrefix, freshItems);
      if (currentPrefix === loadTargetPrefix) {
        items = freshItems;
        // Clear error on successful load for current view
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

  // Effect: reload data on path change
  $effect(() => {
    if (typeof window !== "undefined") {
      loadItemsForPrefix(currentPrefix);
    }
  });

  // --- Navigation ---
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
    currentPrefix = targetPrefix; // Trigger $effect
    cancelRename(); // Cancel rename on navigation
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
    if (renamingItemName) return; // Don't navigate/preview if renaming input is active
    if (item.isDir) {
      navigateToFolder(item.name, true);
    } else {
      openPreview(item);
    }
  }

  // --- Actions with optimistic updates ---

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

  // --- Rename functions ---
  function startRename(item: DisplayItem) {
    if (item.isDir || isProcessing || isLoading) return; // Prevent renaming folders for now
    renamingItemName = item.name;
    newItemName = item.displayName;
    error = null; // Clear previous errors
  }

  function cancelRename() {
    renamingItemName = null;
    newItemName = "";
    // Don't clear error here, might be relevant
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
      // Don't cancel, let user correct
      return;
    }
    if (trimmedNewName === originalItem.displayName) {
      cancelRename(); // No change needed
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

    // Optimistic Update
    let itemsToUpdate: DisplayItem[] = [];
    if (folderCache.has(prefixAtActionStart)) {
      itemsToUpdate = [...folderCache.get(prefixAtActionStart)!];
    } else if (currentPrefix === prefixAtActionStart) {
      itemsToUpdate = [...items];
    }

    const itemIndex = itemsToUpdate.findIndex((i) => i.name === oldFullName);
    let originalOptimisticItem: DisplayItem | null = null;
    if (itemIndex !== -1) {
      originalOptimisticItem = { ...itemsToUpdate[itemIndex] }; // Store for potential revert
      itemsToUpdate[itemIndex] = {
        ...itemsToUpdate[itemIndex],
        name: newFullName,
        displayName: trimmedNewName,
        lastModified: new Date(), // Optimistically update modified time
      };
      const newOptimisticItems = sortItems(itemsToUpdate);
      updateCache(prefixAtActionStart, newOptimisticItems);
      if (currentPrefix === prefixAtActionStart) {
        items = newOptimisticItems;
      }
    } else {
      console.warn("Optimistic rename failed: Item not found in list/cache.");
      // Proceed without optimistic update if item wasn't found locally
    }

    const oldRenamingItemName = renamingItemName; // Store for potential revert
    const oldNewItemName = newItemName; // Store for potential revert
    renamingItemName = null; // Exit renaming mode optimistically
    newItemName = "";

    try {
      await trpcAuthQuery("filemanager.file.rename", {
        oldName: oldFullName,
        newName: newFullName,
      });
      console.log(`Rename successful: ${oldFullName} -> ${newFullName}`);
      // Optimistic update already applied, maybe force refresh cache if needed?
      // invalidateCache(prefixAtActionStart); // Optional: force reload from server after success
      // if (currentPrefix === prefixAtActionStart) {
      //     await loadItemsForPrefix(prefixAtActionStart, true);
      // }
    } catch (err: any) {
      console.error("Rename Error:", err);
      // Revert Optimistic Update
      if (originalOptimisticItem && itemIndex !== -1) {
        itemsToUpdate[itemIndex] = originalOptimisticItem;
        const revertedItems = sortItems(itemsToUpdate);
        updateCache(prefixAtActionStart, revertedItems);
        if (currentPrefix === prefixAtActionStart) {
          items = revertedItems;
        }
      } else {
        // If optimistic update didn't happen or failed, invalidate and reload
        invalidateCache(prefixAtActionStart);
      }

      if (currentPrefix === prefixAtActionStart) {
        error = err.message || `Failed to rename file.`;
        // Restore input field for correction
        renamingItemName = oldRenamingItemName;
        newItemName = oldNewItemName;
        // Optionally force reload if revert wasn't clean
        // await loadItemsForPrefix(prefixAtActionStart, true);
      } else {
        console.error(
          `Rename failed for background item "${oldFullName}" in folder "${prefixAtActionStart}": ${err.message}`
        );
        invalidateCache(prefixAtActionStart); // Invalidate cache for background folder
      }
    } finally {
      isProcessing = false;
      if (hadActionInFocus) {
        isOptimisticLoading = false;
      }
      // Ensure renaming state is cleared if rename succeeded or failed without restoring input
      if (error && renamingItemName === oldRenamingItemName) {
        // Input was restored due to error, keep it.
      } else {
        renamingItemName = null;
        newItemName = "";
      }
    }
  }

  // --- Dialog functions ---
  async function openPreview(itemToPreview: DisplayItem) {
    if (itemToPreview.isDir || isPreviewLoading) return;
    previewItem = itemToPreview;
    previewError = null;
    previewUrl = null;
    isPreviewLoading = true;
    showPreviewDialog = true;
    try {
      const url = await trpcAuthQuery("filemanager.file.download-url", itemToPreview.name);
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

<!-- Main container -->
<div class="p-4 md:p-6 space-y-6 bg-neutral-900 text-gray-100 rounded-lg border border-neutral-800">
  <!-- Title -->
  <h2 class="text-2xl font-bold">File Manager</h2>

  <!-- Breadcrumbs -->
  <nav
    aria-label="Breadcrumb"
    class="flex items-center space-x-1 text-sm text-neutral-400 overflow-x-auto whitespace-nowrap py-1"
  >
    {#each breadcrumbs as part, i (part.path)}
      {#if i > 0}<ChevronRight class="h-4 w-4 flex-shrink-0" />{/if}
      {#if i === breadcrumbs.length - 1}
        <span class="font-semibold text-gray-100 truncate" aria-current="page">{part.name}</span>
      {:else}
        <button
          onclick={() => navigateToFolder(part.path, true)}
          class="hover:underline hover:text-gray-100 truncate flex items-center"
          disabled={isLoading || isProcessing || renamingItemName !== null}
        >
          {#if i === 0}<Home class="inline h-4 w-4 mr-1" />{/if}{part.name}
        </button>
      {/if}
    {/each}
  </nav>

  <!-- Controls -->
  <div class="flex flex-wrap gap-2 items-center border-b border-neutral-800 pb-4">
    <!-- Back Button -->
    {#if navigationHistory.length > 0}
      <button
        onclick={handleBackClick}
        class={cn(
          "p-2 bg-neutral-800 rounded-md hover:bg-neutral-700 transition-colors",
          (isLoading || isProcessing || renamingItemName !== null) && "opacity-50 cursor-not-allowed"
        )}
        title="Go back to previous folder"
        aria-label="Go back"
        disabled={isLoading || isProcessing || renamingItemName !== null}
      >
        <ArrowLeft class="h-4 w-4" />
      </button>
    {/if}

    <!-- Upload Button -->
    <label
      class={cn(
        "flex items-center gap-2 px-4 py-2 bg-neutral-800 rounded-md hover:bg-neutral-700 cursor-pointer transition-colors",
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

    <!-- New Folder Input/Button -->
    {#if showNewFolderInput}
      <div class="flex items-center gap-2 bg-neutral-800 p-1 rounded-md">
        <input
          type="text"
          bind:value={newFolderName}
          placeholder="Folder name"
          class="px-3 py-1.5 bg-neutral-700 rounded-md border border-neutral-600 focus:outline-none focus:ring-1 focus:ring-neutral-500 text-sm"
          onkeydown={(e) => e.key === "Enter" && !isProcessing && !renamingItemName && handleCreateFolder()}
          disabled={isProcessing || renamingItemName !== null}
        />
        <button
          onclick={handleCreateFolder}
          class="p-2 bg-green-600 hover:bg-green-500 rounded-md disabled:opacity-50"
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
          class="p-2 bg-red-600 hover:bg-red-500 rounded-md disabled:opacity-50"
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
          "flex items-center gap-2 px-4 py-2 bg-neutral-800 rounded-md hover:bg-neutral-700 transition-colors",
          (isProcessing || isLoading || renamingItemName !== null) && "opacity-50 cursor-not-allowed"
        )}
        disabled={isProcessing || isLoading || renamingItemName !== null}
      >
        <FolderPlus class="h-4 w-4" /> <span>New Folder</span>
      </button>
    {/if}

    <!-- Refresh Button and Optimistic Loading Indicator -->
    <div class="flex items-center gap-2">
      <button
        onclick={() => loadItemsForPrefix(currentPrefix, true)}
        class={cn(
          "p-2 bg-neutral-800 rounded-md hover:bg-neutral-700 transition-colors",
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
      <!-- Show sync indicator when cache is shown OR an action is processing -->
      {#if isOptimisticLoading || isProcessing}
        <div title="Syncing changes..." aria-label="Optimistic update indicator">
          <Loader2 class="h-4 w-4 animate-spin text-blue-400" />
        </div>
      {/if}
    </div>
  </div>

  <!-- Status display -->
  {#if error}
    <div class="mt-4 p-3 bg-red-900 border border-red-700 rounded-md text-red-100 text-sm whitespace-pre-wrap">
      Error: {error}
    </div>
  {/if}
  {#if isProcessing && !isLoading && !isOptimisticLoading}
    <!-- Should not be visible often due to loader above -->
    <div class="mt-4 flex items-center gap-2 text-sm text-blue-300">
      <HardDriveUpload class="h-4 w-4 animate-pulse" /><span>Processing...</span>
    </div>
  {/if}

  <!-- File and folder list -->
  <div class="mt-6">
    {#if isLoading && !isOptimisticLoading}
      <p class="text-neutral-400 flex items-center gap-2">
        <RefreshCw class="h-4 w-4 animate-spin" /> Loading...
      </p>
    {:else if items.length === 0 && !error}
      <p class="text-neutral-500">Folder is empty.</p>
    {:else if items.length > 0}
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm table-auto border-collapse">
          <thead class="border-b border-neutral-700">
            <tr>
              <th class="p-2 w-8"></th> <th class="p-2">Name</th>
              <th class="p-2">Size</th>
              <th class="p-2">Last Modified</th>
              <th class="p-2 w-20 text-right">Actions</th>
              <!-- Adjusted width -->
            </tr>
          </thead>
          <tbody>
            {#each items as item (item.name)}
              <tr
                class={cn(
                  "border-b border-neutral-800 transition-colors group",
                  renamingItemName !== item.name && "hover:bg-neutral-850",
                  renamingItemName === item.name && "bg-neutral-800" // Highlight row being renamed
                )}
              >
                <td class="p-2 align-middle">
                  {#if item.isDir}
                    <FolderIcon class="h-4 w-4 text-blue-400" />
                  {:else}
                    <FileIcon class="h-4 w-4 text-gray-400" />
                  {/if}
                </td>
                <td
                  class={cn(
                    "p-2 align-middle truncate max-w-xs md:max-w-md lg:max-w-lg",
                    // Apply hover styles if it's a directory OR a file (and not currently being renamed)
                    (item.isDir || !item.isDir) && renamingItemName !== item.name && "cursor-pointer hover:underline",
                    (isLoading || isProcessing || renamingItemName !== null) && renamingItemName !== item.name
                      ? "opacity-70 pointer-events-none" // Keep general disabling logic
                      : "",
                    renamingItemName === item.name && "py-1" // Adjust padding for input
                  )}
                  title={renamingItemName === item.name
                    ? "Renaming..."
                    : item.isDir
                      ? `Open folder ${item.displayName}`
                      : `Click to preview ${item.displayName}`}
                  onclick={() =>
                    !isLoading &&
                    !isProcessing &&
                    renamingItemName !== item.name && // Prevent click when renaming this item
                    handleItemClick(item)}
                >
                  {#if renamingItemName === item.name}
                    <div class="flex items-center gap-1">
                      <input
                        type="text"
                        bind:value={newItemName}
                        class="px-2 py-1 bg-neutral-700 rounded border border-neutral-600 focus:outline-none focus:ring-1 focus:ring-neutral-500 text-sm w-full"
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
                <td class="p-2 align-middle text-neutral-400">{formatDate(item.lastModified)}</td>
                <td class="p-2 align-middle text-right">
                  {#if renamingItemName === item.name}
                    <!-- Rename Save/Cancel Buttons -->
                    <div class="flex justify-end items-center gap-1">
                      <button
                        onclick={handleRenameItem}
                        class="p-1 text-green-400 hover:text-green-300 rounded disabled:opacity-50"
                        title="Save changes"
                        aria-label="Save rename"
                        disabled={isProcessing || !newItemName.trim() || newItemName.trim() === item.displayName}
                      >
                        <Check class="h-4 w-4" />
                      </button>
                      <button
                        onclick={cancelRename}
                        class="p-1 text-red-400 hover:text-red-300 rounded disabled:opacity-50"
                        title="Cancel rename"
                        aria-label="Cancel rename"
                        disabled={isProcessing}
                      >
                        <X class="h-4 w-4" />
                      </button>
                    </div>
                  {:else}
                    <!-- Default Action Buttons -->
                    <div
                      class="flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity"
                    >
                      {#if !item.isDir}
                        <button
                          onclick={() => startRename(item)}
                          class="p-1 text-neutral-400 hover:text-blue-400 rounded disabled:opacity-50"
                          title="Rename File"
                          aria-label="Rename {item.displayName}"
                          disabled={isProcessing || isLoading || renamingItemName !== null}
                        >
                          <Pencil class="h-4 w-4" />
                        </button>
                      {/if}
                      <button
                        onclick={() => handleDeleteItem(item)}
                        class="p-1 text-neutral-400 hover:text-red-400 rounded disabled:opacity-50"
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

<!-- Preview dialog (HTML <dialog>) -->
{#if showPreviewDialog}
  <dialog
    bind:this={dialogElement}
    onclose={handleDialogClose}
    class="bg-neutral-800 text-gray-100 rounded-lg shadow-xl p-0 w-full max-w-3xl border border-neutral-700 backdrop:bg-black/50 open:animate-fade-in"
  >
    <header class="flex justify-between items-center p-4 border-b border-neutral-700">
      <h3 class="font-semibold text-lg truncate pr-4" title={previewItem?.displayName}>
        Preview: {previewItem?.displayName ?? "File"}
      </h3>
      <button onclick={closePreview} class="p-1 rounded-full hover:bg-neutral-700" aria-label="Close preview">
        <X class="h-5 w-5" />
      </button>
    </header>
    <div class="p-4 min-h-[60vh] max-h-[75vh] overflow-y-auto flex justify-center items-center">
      {#if isPreviewLoading}
        <div class="flex flex-col items-center gap-2 text-neutral-400">
          <Loader2 class="h-8 w-8 animate-spin" />
          <span>Loading preview...</span>
        </div>
      {:else if previewError}
        <div class="flex flex-col items-center gap-2 text-red-400">
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
        <div class="flex flex-col items-center gap-2 text-neutral-500">
          <AlertTriangle class="h-8 w-8" />
          <span>Preview not available or load failed.</span>
        </div>
      {/if}
    </div>
    <footer class="p-4 border-t border-neutral-700 text-right">
      <a
        href={previewUrl ?? "#"}
        download={previewItem?.displayName}
        target="_blank"
        rel="noopener noreferrer"
        class={cn(
          "px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors",
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
