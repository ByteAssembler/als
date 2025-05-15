/**
 * File Upload API with chunking support
 * Compatible with the Rust server implementation
 */

// Configuration constants
const DEFAULT_CHUNK_SIZE = 18 * 1024 * 1024; // 18MB as defined in server
const DEFAULT_CONCURRENT_UPLOADS = 3;

// Types and interfaces
export interface UploadOptions {
	baseUrl: string;
	token?: string | null;
	temporaryUrlToken?: string | null;

	chunkSize?: number; // in bytes
	concurrentUploads?: number;
	headers?: Record<string, string>;
	onProgress?: (progress: UploadProgress) => void;
}

export interface UploadProgress {
	fileName: string;
	loaded: number; // bytes uploaded
	total: number; // total file size
	percentage: number; // 0-100
}

export interface UploadResult {
	fileName: string;
	fileId: string;
	bucketId: string;
	size: number;
	success: boolean;
}

export class FileUploader {
	// Change private to public to allow modification from outside
	public options: Required<UploadOptions>;

	constructor(options: UploadOptions) {
		this.options = {
			baseUrl: options.baseUrl.endsWith("/") ? options.baseUrl.slice(0, -1) : options.baseUrl,
			token: options.token || null,
			temporaryUrlToken: options.temporaryUrlToken || null,

			chunkSize: options.chunkSize || DEFAULT_CHUNK_SIZE,
			concurrentUploads: options.concurrentUploads || DEFAULT_CONCURRENT_UPLOADS,
			headers: options.headers || {},
			onProgress: options.onProgress || (() => { }),
		};
	}

	/**
	 * Get headers including authentication tokens
	 */
	private getHeaders(): Record<string, string> {
		const headers = { ...this.options.headers };

		if (this.options.token) {
			headers["Authorization"] = `Bearer ${this.options.token}`;
		}

		if (this.options.temporaryUrlToken) {
			headers["X-Temporary-Url-Token"] = this.options.temporaryUrlToken;
		}

		return headers;
	}

	/**
	 * Upload a single file to a bucket
	 */
	async uploadFile(bucketId: string, file: File): Promise<UploadResult> {
		try {
			if (file.size <= this.options.chunkSize) {
				// Small file - no chunking needed
				return await this.uploadSmallFile(bucketId, file);
			} else {
				// Large file - use chunking
				return await this.uploadLargeFile(bucketId, file);
			}
		} catch (error) {
			console.error(`Error uploading file ${file.name}:`, error);
			return {
				fileName: file.name,
				fileId: "",
				bucketId,
				size: file.size,
				success: false,
			};
		}
	}

	/**
	 * Upload multiple files to a bucket
	 */
	async uploadFiles(bucketId: string, files: File[]): Promise<UploadResult[]> {
		const queue = [...files];
		const results: UploadResult[] = [];
		const inProgress: Promise<UploadResult>[] = [];

		// Process files with concurrency limit
		while (queue.length > 0 || inProgress.length > 0) {
			// Fill up to concurrency limit
			while (queue.length > 0 && inProgress.length < this.options.concurrentUploads) {
				const file = queue.shift()!;
				const uploadPromise = this.uploadFile(bucketId, file).then((result) => {
					// Remove this promise from inProgress when done
					const index = inProgress.indexOf(uploadPromise);
					if (index !== -1) inProgress.splice(index, 1);
					return result;
				});

				inProgress.push(uploadPromise);
				results.push(await uploadPromise);
			}

			if (inProgress.length > 0) {
				// Wait for at least one upload to complete
				await Promise.race(inProgress);
			}
		}

		return results;
	}

	/**
	 * Upload a small file (no chunking)
	 */
	private async uploadSmallFile(bucketId: string, file: File): Promise<UploadResult> {
		const url = `${this.options.baseUrl}/files/${bucketId}/${encodeURIComponent(file.name)}?total_chunks=1`;
		const formData = new FormData();
		formData.append("file", file);

		console.log("file upload url", url);

		const response = await fetch(url, {
			method: "PUT",
			headers: this.getHeaders(),
			body: file,
		});

		if (!response.ok) {
			throw new Error(`Upload failed with status: ${response.status}`);
		}

		const result = await response.json();
		return {
			fileName: file.name,
			fileId: result.data,
			bucketId,
			size: file.size,
			success: true,
		};
	}

	/**
	 * Upload a large file using chunking
	 */
	private async uploadLargeFile(bucketId: string, file: File): Promise<UploadResult> {
		const totalChunks = Math.ceil(file.size / this.options.chunkSize);
		let targetId: string | null = null;
		let uploadedBytes = 0;

		// Upload first chunk
		const firstChunkSize = Math.min(this.options.chunkSize, file.size);
		const firstChunk = file.slice(0, firstChunkSize);

		const firstChunkUrl = `${this.options.baseUrl}/files/${bucketId}/${encodeURIComponent(
			file.name
		)}?total_chunks=${totalChunks}`;
		const firstChunkResponse = await fetch(firstChunkUrl, {
			method: "PUT",
			headers: this.getHeaders(),
			body: firstChunk,
		});

		if (!firstChunkResponse.ok) {
			throw new Error(`Failed to upload first chunk: ${firstChunkResponse.status}`);
		}

		const firstChunkResult = await firstChunkResponse.json();
		targetId = firstChunkResult.data;
		uploadedBytes += firstChunkSize;

		this.updateProgress(file.name, uploadedBytes, file.size);

		// Upload remaining chunks
		for (let i = 1; i < totalChunks; i++) {
			const start = i * this.options.chunkSize;
			const end = Math.min(start + this.options.chunkSize, file.size);
			const chunk = file.slice(start, end);

			const chunkUrl = `${this.options.baseUrl}/files/${bucketId}/${encodeURIComponent(
				file.name
			)}?target_id=${targetId}&chunk_index=${i}`;
			const chunkResponse = await fetch(chunkUrl, {
				method: "PUT",
				headers: this.getHeaders(),
				body: chunk,
			});

			if (!chunkResponse.ok) {
				throw new Error(`Failed to upload chunk ${i}: ${chunkResponse.status}`);
			}

			uploadedBytes += end - start;
			this.updateProgress(file.name, uploadedBytes, file.size);
		}

		return {
			fileName: file.name,
			fileId: targetId!,
			bucketId,
			size: file.size,
			success: true,
		};
	}

	/**
	 * Update progress callback
	 */
	private updateProgress(fileName: string, loaded: number, total: number): void {
		const percentage = Math.min(Math.round((loaded / total) * 100), 100);
		this.options.onProgress({
			fileName,
			loaded,
			total,
			percentage,
		});
	}
}

// Example usage:
/**
 * // Create an uploader instance
 * const uploader = new FileUploader({
 *   baseUrl: 'https://api.example.com',
 *   onProgress: (progress) => {
 *     console.log(`${progress.fileName}: ${progress.percentage}%`);
 *   }
 * });
 *
 * // Upload a single file
 * const fileInput = document.getElementById('fileInput') as HTMLInputElement;
 * if (fileInput.files && fileInput.files.length > 0) {
 *   const result = await uploader.uploadFile('my-bucket-id', fileInput.files[0]);
 *   console.log('Upload result:', result);
 * }
 *
 * // Upload multiple files
 * const multipleFilesInput = document.getElementById('multipleFiles') as HTMLInputElement;
 * if (multipleFilesInput.files && multipleFilesInput.files.length > 0) {
 *   const files = Array.from(multipleFilesInput.files);
 *   const results = await uploader.uploadFiles('my-bucket-id', files);
 *   console.log('Upload results:', results);
 * }
 */
