import { Client, type BucketItem } from 'minio';
import type { Readable } from 'stream';

if (!process.env.FILE_STORAGE_SERVER_ENDPOINT_FULL || !process.env.FILE_STORAGE_SERVER_ENDPOINT || !process.env.FILE_STORAGE_SERVER_BUCKET_NAME || !process.env.FILE_STORAGE_SERVER_ACCESS_KEY || !process.env.FILE_STORAGE_SERVER_SECRET_KEY) {
	console.error('Missing environment variables for FileServer configuration. Please check your .env file.');
	process.exit(1);
}

export const FILE_STORAGE_SERVER_ENDPOINT_FULL = process.env.FILE_STORAGE_SERVER_ENDPOINT_FULL;
export const FILE_STORAGE_SERVER_ENDPOINT = process.env.FILE_STORAGE_SERVER_ENDPOINT;
export const BUCKET_NAME = process.env.FILE_STORAGE_SERVER_BUCKET_NAME;

export const FILE_STORAGE_SERVER_ACCESS_KEY = process.env.FILE_STORAGE_SERVER_ACCESS_KEY;
export const FILE_STORAGE_SERVER_SECRET_KEY = process.env.FILE_STORAGE_SERVER_SECRET_KEY;

const minioClient = new Client({
	endPoint: FILE_STORAGE_SERVER_ENDPOINT,
	accessKey: FILE_STORAGE_SERVER_ACCESS_KEY,
	secretKey: FILE_STORAGE_SERVER_SECRET_KEY,
});

export function getImageUrlForImageKey(imageKey: string | null | undefined): string | null {
	if (!imageKey || imageKey.length === 0) return null;
	return `${FILE_STORAGE_SERVER_ENDPOINT_FULL}${BUCKET_NAME}/${encodeURIComponent(imageKey)}`;
}

async function listEntries(options: { prefix?: string; recursive?: boolean } = {}): Promise<BucketItem[]> {
	return new Promise((resolve, reject) => {
		const items: BucketItem[] = [];
		const stream = minioClient.listObjectsV2(BUCKET_NAME, options.prefix || '', options.recursive || false);

		stream.on('data', (obj: BucketItem) => {
			items.push(obj);
		});
		stream.on('error', (err: Error) => {
			reject(err);
		});
		stream.on('end', () => {
			resolve(items);
		});
	});
}

async function getObjectStream({ name }: { name: string }): Promise<Readable> {
	if (!name) {
		throw new Error('Name is required to get item stream.');
	}
	if (name.endsWith('/')) {
		throw new Error('Cannot get stream for a folder.');
	}

	try {
		const stream = await minioClient.getObject(BUCKET_NAME, name);
		return stream;
	} catch (error: any) {
		if (error.code === 'NoSuchKey') {
			throw new Error(`Item not found: ${name}`);
		}
		throw new Error(`Error getting item stream: ${error.message || error}`);
	}
}

async function statFile({ name }: { name: string }) {
	if (!name) {
		throw new Error('Name is required to get item stats.');
	}
	if (name.endsWith('/')) {
		throw new Error('Name must not end with a slash.');
	}

	try {
		const stat = await minioClient.statObject(BUCKET_NAME, name);
		return stat;
	} catch (error: any) {
		if (error.code === 'NoSuchKey') {
			throw new Error(`Item not found: ${name}`);
		}
		throw new Error(`Error fetching item stats: ${error.message || error}`);
	}
}

async function getUploadFileUrl(fileName: string, expiresIn: number) {
	return await minioClient.presignedUrl('PUT', BUCKET_NAME, fileName, expiresIn);
}

async function getUploadFileUrlForClient(fileName: string) {
	const FIFTEEN_MINUTES = 15 * 60; // 15 minutes
	return getUploadFileUrl(fileName, FIFTEEN_MINUTES);
}

async function uploadFile(file: File) {
	const metaData = {
		'Content-Type': file.type,
	};
	const arrayBuffer = await file.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);
	return await minioClient.putObject(BUCKET_NAME, file.name, buffer, file.size, metaData);
}

async function getDownloadFileUrl(fileName: string, expiresIn: number) {
	return await minioClient.presignedUrl('GET', BUCKET_NAME, fileName, expiresIn);
}

async function getDownloadFileUrlForClient(fileName: string) {
	const FIFTEEN_MINUTES = 45 * 60 * 3; // 45 minutes
	return getDownloadFileUrl(fileName, FIFTEEN_MINUTES);
}

async function renameFile({ oldName, newName }: { oldName: string; newName: string }) {
	if (!oldName || typeof oldName !== 'string' || !newName || typeof newName !== 'string') {
		throw new Error('Invalid input: oldName and newName must be non-empty strings.');
	}
	if (oldName.endsWith('/') || newName.endsWith('/')) {
		throw new Error('Renaming folders is not supported via this function.');
	}

	try {
		const copySource = `${BUCKET_NAME}/${oldName}`;
		await minioClient.copyObject(BUCKET_NAME, newName, copySource);
		await minioClient.removeObject(BUCKET_NAME, oldName);
		return { success: true, oldName, newName };
	} catch (error: any) {
		try {
			await minioClient.statObject(BUCKET_NAME, newName);
			console.warn(`Copy to ${newName} might have succeeded, but removal of ${oldName} failed.`);
		} catch { }
		throw new Error(`Failed to rename file: ${error.message || error}`);
	}
}

async function deleteFile(fileName: string) {
	await minioClient.removeObject(BUCKET_NAME, fileName);
}

async function createFolder(folderName: string) {
	const prefix = folderName.endsWith('/') ? folderName : folderName + '/';
	return await minioClient.putObject(BUCKET_NAME, prefix, Buffer.from(''));
}

async function deleteFolder(folderName: string) {
	return new Promise<void>((resolve, reject) => {
		const prefix = folderName.endsWith('/') ? folderName : folderName + '/';
		const items: BucketItem[] = [];
		const stream = minioClient.listObjectsV2(BUCKET_NAME, prefix, true);
		stream.on('data', (obj: BucketItem) => items.push(obj));
		stream.on('error', reject);
		stream.on('end', async () => {
			try {
				for (const item of items) {
					if (!item.name) continue; // Skip if name is undefined
					await minioClient.removeObject(BUCKET_NAME, item.name);
				}
				resolve();
			} catch (err) {
				reject(err);
			}
		});
	});
}

async function listAllFiles(): Promise<string[]> {
	return new Promise((resolve, reject) => {
		const filePaths: string[] = [];
		const stream = minioClient.listObjectsV2(BUCKET_NAME, '', true);

		stream.on('data', (obj: BucketItem) => {
			if (obj.name && !obj.name.endsWith('/')) {
				filePaths.push(obj.name);
			}
		});
		stream.on('error', (err: Error) => {
			reject(err);
		});
		stream.on('end', () => {
			resolve(filePaths);
		});
	});
}

export const fileManager = {
	listEntries,
	getObjectStream,

	statFile,
	uploadFile,
	getUploadFileUrl,
	getUploadFileUrlForClient,
	getDownloadFileUrl,
	getDownloadFileUrlForClient,
	renameFile,
	deleteFile,
	listAllFiles,

	createFolder,
	deleteFolder,
};
