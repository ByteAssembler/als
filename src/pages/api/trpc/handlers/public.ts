// import { fileManager } from "./file-manager-api";

import { fileManager } from "./file-manager-api";

export const publicHandlers = {
	"filemanager.bucket.list": fileManager.listEntries,
	"filemanager.file.download-url": fileManager.getDownloadFileUrlForClient,
	"filemanager.file.stat": fileManager.statFile,
};
