import type {
	AccessorCreateRequest,
	ApiResponse,
	BucketCreateRequest,
	DbAccessor,
	DbBucket,
	DbFile,
	DbTemporaryUrl,
	DbTemporaryUrlAfter,
	Id,
	TemporaryUrlCreateRequest,
} from "./types";
import { DB_PERMISSIONS } from "./permission";

// BlobAPI.ts - Main API class
class BlobAPI {
	private baseUrl: string;
	private token: string | null = null;
	private temporaryUrlToken: string | null = null;

	constructor(baseUrl?: string, token?: string, temporaryUrlToken?: string) {
		this.baseUrl = baseUrl ?? "http://127.0.0.1:3000/api";
		this.baseUrl = this.baseUrl.endsWith("/") ? this.baseUrl.slice(0, -1) : this.baseUrl;
		this.token = token ?? null;
		this.temporaryUrlToken = temporaryUrlToken ?? null;
	}

	// Auth methods
	setToken(token: string): void {
		this.token = token;
	}

	clearToken(): void {
		this.token = null;
	}

	setTemporaryUrlToken(token: string): void {
		this.temporaryUrlToken = token;
	}

	clearTemporaryUrlToken(): void {
		this.temporaryUrlToken = null;
	}

	private getHeaders(): HeadersInit {
		const headers: HeadersInit = {
			"Content-Type": "application/json",
		};

		if (this.token) {
			headers["Authorization"] = `Bearer ${this.token}`;
		}

		if (this.temporaryUrlToken) {
			headers["X-Temporary-Url-Token"] = this.temporaryUrlToken;
		}

		return headers;
	}

	private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
		const url = `${this.baseUrl}${path}`;
		const headers = this.getHeaders();

		const response = await fetch(url, {
			...options,
			headers: {
				...headers,
				...options.headers,
			},
		});

		const data: ApiResponse<T> = await response.json();

		if (!data.success) {
			console.log(response);

			throw new Error(`API Error: ${data.status} - ${data.data ?? "No error details provided"}`);
		}

		return data.data;
	}

	// Buckets API
	async listBuckets(): Promise<DbBucket[]> {
		return this.request<DbBucket[]>("/buckets");
	}

	async createBucket(request: BucketCreateRequest): Promise<DbBucket> {
		return this.request<DbBucket>("/buckets", {
			method: "PUT",
			body: JSON.stringify(request),
		});
	}

	async deleteBucket(bucketId: Id): Promise<void> {
		return this.request<void>(`/buckets/${bucketId}`, {
			method: "DELETE",
		});
	}

	async listFilesInBucket(bucketId: Id): Promise<DbFile[]> {
		return this.request<DbFile[]>(`/buckets/${bucketId}`);
	}

	// Files API
	async getFileInfo(bucketId: Id, fileId: Id): Promise<DbFile> {
		return this.request<DbFile>(`/buckets/${bucketId}/${fileId}`);
	}

	async deleteFile(bucketId: Id, fileId: Id): Promise<void> {
		return this.request<void>(`/buckets/${bucketId}/${fileId}`, {
			method: "DELETE",
		});
	}

	downloadFileUrl(bucketId: Id, fileId: Id): string {
		return `${this.baseUrl}/files/${bucketId}/${fileId}`;
	}

	async downloadFile(bucketId: Id, fileId: Id): Promise<Blob> {
		const url = this.downloadFileUrl(bucketId, fileId);
		const headers: HeadersInit = {};

		if (this.token) {
			headers["Authorization"] = `Bearer ${this.token}`;
		}

		if (this.temporaryUrlToken) {
			headers["X-Temporary-Url-Token"] = this.temporaryUrlToken;
		}

		const response = await fetch(url, { headers });

		if (!response.ok) {
			throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
		}

		return response.blob();
	}

	async listAllFilesDebug(): Promise<DbFile[]> {
		return this.request<DbFile[]>("/debug/files/all");
	}

	// Accessors API
	async listAccessors(): Promise<DbAccessor[]> {
		return this.request<DbAccessor[]>("/accessors");
	}

	async createAccessor(request: AccessorCreateRequest): Promise<{ accessor: DbAccessor; token: string }> {
		return this.request<{ accessor: DbAccessor; token: string }>("/accessors", {
			method: "POST",
			body: JSON.stringify(request),
		});
	}

	async getAccessor(accessorId: Id): Promise<DbAccessor> {
		return this.request<DbAccessor>(`/accessors/${accessorId}`);
	}

	async deleteAccessor(accessorId: Id): Promise<void> {
		return this.request<void>(`/accessors/${accessorId}`, {
			method: "DELETE",
		});
	}

	async signTokenForAccessor(accessorId: Id): Promise<{ accessor: DbAccessor; token: string }> {
		return this.request<{ accessor: DbAccessor; token: string }>(`/accessors/sign-token/${accessorId}`, {
			method: "POST",
		});
	}

	// Temporary URL API
	async listTemporaryUrls(): Promise<DbTemporaryUrl[]> {
		return this.request<DbTemporaryUrl[]>("/temporary_urls");
	}

	async createTemporaryUrl(request: TemporaryUrlCreateRequest): Promise<DbTemporaryUrl> {
		return this.request<DbTemporaryUrl>("/temporary_urls", {
			method: "POST",
			body: JSON.stringify(request),
		});
	}

	async getTemporaryUrl(token: string): Promise<DbTemporaryUrl> {
		return this.request<DbTemporaryUrl>(`/temporary_urls/${token}`);
	}

	// Utility to create a common temporary URL for file download
	async createFileDownloadUrl(
		bucketId: Id,
		fileId: Id,
		expiresInSeconds: number = 3600,
		allowedMimeTypes?: string[]
	): Promise<string> {
		const temporaryUrl = await this.createTemporaryUrl({
			target: { file: { bucket_id: bucketId, file_id: fileId } },
			duration_to_add_expires_seconds: expiresInSeconds,
			permissions: DB_PERMISSIONS.DOWNLOAD_FILE_IN_BUCKET,
			files_allowed_mime_types: allowedMimeTypes,
		});

		return temporaryUrl.token;
	}

	// Utility to create a common temporary URL for bucket upload
	async createBucketUploadUrl(
		bucketId: Id,
		expiresInSeconds: number = 3600,
		allowedExtensions?: string[],
		callbackUrl?: string
	): Promise<string> {
		let afterEvent: DbTemporaryUrlAfter | undefined;

		if (callbackUrl) {
			afterEvent = {
				send_upload_success: {
					url: callbackUrl,
					method: "POST",
				},
			};
		}

		const temporaryUrl = await this.createTemporaryUrl({
			target: { bucket: { bucket_id: bucketId } },
			duration_to_add_expires_seconds: expiresInSeconds,
			permissions: DB_PERMISSIONS.UPLOAD_FILE_IN_BUCKET,
			files_allowed_file_name_extensions: allowedExtensions,
			after_event: afterEvent,
		});

		return temporaryUrl.token;
	}
}

export default BlobAPI;
