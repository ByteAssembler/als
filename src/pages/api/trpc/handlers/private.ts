// import { fileManager } from "./file-manager-api";
import { blogHandlers } from "./blog";
import { linkHandlers } from "./link";
import { navbarHandlers } from "./navbar";
import { userHandlers } from "./user";
import { bookHandlers } from "./book";
import { mapPointCategoryHandlers } from "./mapPointCategory";
import { mapPointHandlers } from "./mapPoint";
import { celebrityHandlers } from "./celebrity";

export const privateHandlers = {
	// "filemanager.file.upload-url": fileManager.getUploadFileUrlForClient,
	// "filemanager.file.rename": fileManager.renameFile,
	// "filemanager.file.delete": fileManager.deleteFile,
	// "filemanager.folder.create": fileManager.createFolder,
	// "filemanager.folder.delete": fileManager.deleteFolder,
	"private.test": () => {
		console.log("Public test handler called");
	},
	// Blog
	"blog.create": blogHandlers.create,
	"blog.read": blogHandlers.read,
	"blog.update": blogHandlers.update,
	"blog.delete": blogHandlers.delete,
	"blog.list": blogHandlers.list,

	// Link
	"link.create": linkHandlers.create,
	"link.read": linkHandlers.read,
	"link.update": linkHandlers.update,
	"link.delete": linkHandlers.delete,
	"link.list": linkHandlers.list,

	// Navbar
	"navbar.create": navbarHandlers.create,
	"navbar.read": navbarHandlers.read,
	"navbar.update": navbarHandlers.update,
	"navbar.delete": navbarHandlers.delete,
	"navbar.list": navbarHandlers.list,

	// User
	"user.create": userHandlers.create,
	"user.read": userHandlers.read,
	"user.update": userHandlers.update,
	"user.delete": userHandlers.delete,
	"user.list": userHandlers.list,

	// Book
	"book.create": bookHandlers.create,
	"book.read": bookHandlers.read,
	"book.update": bookHandlers.update,
	"book.delete": bookHandlers.delete,
	"book.list": bookHandlers.list,

	// MapPointCategory
	"mapPointCategory.create": mapPointCategoryHandlers.create,
	"mapPointCategory.read": mapPointCategoryHandlers.read,
	"mapPointCategory.update": mapPointCategoryHandlers.update,
	"mapPointCategory.delete": mapPointCategoryHandlers.delete,
	"mapPointCategory.list": mapPointCategoryHandlers.list,

	// MapPoint
	"mapPoint.create": mapPointHandlers.create,
	"mapPoint.read": mapPointHandlers.read,
	"mapPoint.update": mapPointHandlers.update,
	"mapPoint.delete": mapPointHandlers.delete,
	"mapPoint.list": mapPointHandlers.list,

	// Celebrity
	"celebrity.create": celebrityHandlers.create,
	"celebrity.read": celebrityHandlers.read,
	"celebrity.update": celebrityHandlers.update,
	"celebrity.delete": celebrityHandlers.delete,
	"celebrity.list": celebrityHandlers.list,
};
