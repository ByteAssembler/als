// import { fileManager } from "./file-manager-api";

export const privateHandlers = {
	// "filemanager.file.upload-url": fileManager.getUploadFileUrlForClient,
	// "filemanager.file.rename": fileManager.renameFile,
	// "filemanager.file.delete": fileManager.deleteFile,
	// "filemanager.folder.create": fileManager.createFolder,
	// "filemanager.folder.delete": fileManager.deleteFolder,
	"private.test": () => {
		console.log("Public test handler called");
	}
};
