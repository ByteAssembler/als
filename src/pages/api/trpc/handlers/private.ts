// import { fileManager } from "./file-manager-api";
import { blogHandlers } from "./blog";
import { linkHandlers } from "./link";
import { navbarHandlers } from "./navbar";
import { userHandlers } from "./user";
import { bookHandlers } from "./book";
import { mapPointCategoryHandlers } from "./mapPointCategory";
import { mapPointHandlers } from "./mapPoint";
import { celebrityHandlers } from "./celebrity";
import { fileManager } from "./file-manager-api";

export const privateHandlers = {
	"filemanager.file.upload-url": fileManager.getUploadFileUrlForClient,
	"filemanager.file.rename": fileManager.renameFile,
	"filemanager.file.delete": fileManager.deleteFile,
	"filemanager.file.listAll": fileManager.listAllFiles,

	"filemanager.folder.create": fileManager.createFolder,
	"filemanager.folder.delete": fileManager.deleteFolder,

	// Blog
	"blog.create": blogHandlers.create,
	"blog.read": blogHandlers.read,
	"blog.read_by_language": blogHandlers.read_by_language,
	"blog.read_by_slug_and_language": blogHandlers.read_by_slug_and_language,
	"blog.update": blogHandlers.update,
	"blog.delete": blogHandlers.delete,
	"blog.list": blogHandlers.list,
	"blog.list_by_language": blogHandlers.list_by_language,

	// Link
	"link.findAll": linkHandlers.findAll,
	"link.create": linkHandlers.create,
	"link.read": linkHandlers.read,
	"link.read_by_language": linkHandlers.read_by_language,
	"link.update": linkHandlers.update,
	"link.delete": linkHandlers.delete,
	"link.list": linkHandlers.list,
	"link.list_by_language": linkHandlers.list_by_language,

	// Navbar
	"navbar.create": navbarHandlers.create,
	"navbar.read": navbarHandlers.read,
	"navbar.read_by_language": navbarHandlers.read_by_language,
	"navbar.update": navbarHandlers.update,
	"navbar.delete": navbarHandlers.delete,
	"navbar.list": navbarHandlers.list,
	"navbar.list_by_language": navbarHandlers.list_by_language,

	// User
	"user.create": userHandlers.register,
	"user.read": userHandlers.read,
	"user.update": userHandlers.update,
	"user.delete": userHandlers.delete,
	"user.list": userHandlers.list,

	// Book
	"book.create": bookHandlers.create,
	"book.read": bookHandlers.read,
	"book.read_by_language": bookHandlers.read_by_language,
	"book.update": bookHandlers.update,
	"book.delete": bookHandlers.delete,
	"book.list": bookHandlers.list,
	"book.list_by_language": bookHandlers.list_by_language,

	// MapPointCategory
	"mapPointCategory.create": mapPointCategoryHandlers.create,
	"mapPointCategory.read": mapPointCategoryHandlers.read,
	"mapPointCategory.read_by_language": mapPointCategoryHandlers.read_by_language,
	"mapPointCategory.update": mapPointCategoryHandlers.update,
	"mapPointCategory.delete": mapPointCategoryHandlers.delete,
	"mapPointCategory.list": mapPointCategoryHandlers.list,
	"mapPointCategory.list_by_language": mapPointCategoryHandlers.list_by_language,

	// MapPoint
	"mapPoint.create": mapPointHandlers.create,
	"mapPoint.read": mapPointHandlers.read,
	"mapPoint.read_by_language": mapPointHandlers.read_by_language,
	"mapPoint.update": mapPointHandlers.update,
	"mapPoint.delete": mapPointHandlers.delete,
	"mapPoint.list": mapPointHandlers.list,
	"mapPoint.list_by_language": mapPointHandlers.list_by_language,

	// Celebrity
	"celebrity.create": celebrityHandlers.create,
	"celebrity.read": celebrityHandlers.read,
	"celebrity.read_by_language": celebrityHandlers.read_by_language,
	"celebrity.update": celebrityHandlers.update,
	"celebrity.delete": celebrityHandlers.delete,
	"celebrity.list": celebrityHandlers.list,
	"celebrity.list_by_language": celebrityHandlers.list_by_language,
};
