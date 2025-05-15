import { DbPermissions } from "@/lib/permission";

/**
 * Represents a unique identifier in the system
 */
export type Id = string;

/**
 * Represents a date and time in the system
 */
export type DateTime = string; // ISO format string

// File structure
export interface DbFile {
	readonly id: Id;
	name: string;
	extension: string;
	size: number; // u64 -> number in TS
	mime_type: string;
	hash?: string; // Optional in Rust
	metadata: Record<string, any>; // HashMap -> Record
	permissions: Record<Id, DbPermissions>; // Accessor ID -> Permissions
	uploaded_at: DateTime;
}

// Bucket structure
export interface DbBucket {
	readonly id: Id;
	name: string;
	description?: string; // Option<String> -> optional property
	default_permissions: DbPermissions;
	created_at: DateTime;
}

// Accessor structure
export interface DbAccessor {
	readonly id: Id;
	name: string;
	default_permissions: DbPermissions;
	created_at: DateTime;
}

// Temporary URL target enum
export type DbTemporaryUrlTarget =
	| { file: { bucket_id: Id; file_id: Id } }
	| {
		bucket: { bucket_id: Id };
	};

export type DbTemporaryUrlAfter = {
	send_upload_success: {
		url: string;
		method: string;
		body_data?: any;
	};
};

// Temporary URL structure
export interface DbTemporaryUrl {
	readonly id: Id;
	target: DbTemporaryUrlTarget;
	readonly token: string;
	expires_at: DateTime;
	permissions: DbPermissions;
	issued_at: DateTime;
	issued_by: Id;
	files_allowed_mime_types?: string[];
	files_allowed_file_name_extensions?: string[];
	after_event?: DbTemporaryUrlAfter;
}

export interface ApiResponse<T> {
	success: boolean;
	status_code: number;
	status: string;
	type: "success" | "error";
	data: T;
}

// Request types
export interface AccessorCreateRequest {
	name: string;
	default_permissions?: DbPermissions;
}

export interface BucketCreateRequest {
	name: string;
	description?: string;
	default_permissions?: DbPermissions;
}

export interface TemporaryUrlCreateRequest {
	target: DbTemporaryUrlTarget;
	duration_to_add_expires_seconds: number;
	permissions: DbPermissions;
	files_allowed_mime_types?: string[];
	files_allowed_file_name_extensions?: string[];
	after_event?: DbTemporaryUrlAfter;
}

//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////

/**
 * Response when creating an accessor or signing a token
 */
export interface TokenResponse {
	accessor: DbAccessor;
	token: string;
}

/**
 * Request to create a new bucket
 */
export interface BucketCreateRequest {
	name: string;
	description?: string;
	default_permissions?: number;
}

/**
 * Request to create a new accessor
 */
export interface AccessorCreateRequest {
	name: string;
	default_permissions?: number;
}

/**
 * API error response
 */
export interface ApiError {
	error: string;
	status: number;
	message: string;
}

/**
 * Options for API requests
 */
export interface RequestOptions {
	useTemp?: boolean;
	tempUrl?: string;
	headers?: Record<string, string>;
}

/**
 * Options for file upload
 */
export interface UploadOptions extends RequestOptions {
	onProgress?: (progress: number) => void;
	fileName?: string;
	chunkSize?: number;
	contentType?: string;
	metadata?: Record<string, any>;
}

/**
 * Result of a file upload operation
 */
export interface UploadResult {
	success: boolean;
	fileId: Id;
	file?: File;
	error?: string;
}
