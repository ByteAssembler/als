/**
 * Permission system for the application
 *
 * This module provides a comprehensive permission system that manages access control
 * using bitflag-based permissions. Permissions are grouped into categories (Buckets, Files, etc.)
 * and can be combined to create role-based access control.
 */

/**
 * Permission flags matching the backend DbPermissions bitflags
 * Each flag represents a specific permission that can be granted to a user
 */
export enum DB_PERMISSIONS {
  // Bucket permissions
  LIST_BUCKETS = 1 << 0,
  READ_BUCKET = 1 << 1,
  CREATE_BUCKET = 1 << 2,
  DELETE_BUCKET = 1 << 3,

  // File permissions
  LIST_FILES_IN_BUCKET = 1 << 4,
  READ_FILE_IN_BUCKET = 1 << 5,
  DOWNLOAD_FILE_IN_BUCKET = 1 << 6,
  UPLOAD_FILE_IN_BUCKET = 1 << 7,
  DELETE_FILE_IN_BUCKET = 1 << 8,

  // Accessor permissions
  LIST_ACCESSORS = 1 << 9,
  READ_ACCESSOR = 1 << 10,
  CREATE_ACCESSOR = 1 << 11,
  DELETE_ACCESSOR = 1 << 12,

  // Temporary URL permissions
  SIGN_TEMPORARY_URLS = 1 << 13,
  READ_TEMPORARY_URLS = 1 << 14,

  // Other
  MANAGE_PERMISSIONS = 1 << 15,
  CREATE_JWT_TOKENS_FOR_ACCESSOR = 1 << 16,
}

/**
 * Human-readable labels for each permission flag
 */
export const permissionLabels: Record<DB_PERMISSIONS, string> = {
  // Bucket permissions
  [DB_PERMISSIONS.LIST_BUCKETS]: "List Buckets",
  [DB_PERMISSIONS.READ_BUCKET]: "Read Bucket",
  [DB_PERMISSIONS.CREATE_BUCKET]: "Create Bucket",
  [DB_PERMISSIONS.DELETE_BUCKET]: "Delete Bucket",

  // File permissions
  [DB_PERMISSIONS.LIST_FILES_IN_BUCKET]: "List Files",
  [DB_PERMISSIONS.READ_FILE_IN_BUCKET]: "Read File",
  [DB_PERMISSIONS.DOWNLOAD_FILE_IN_BUCKET]: "Download File",
  [DB_PERMISSIONS.UPLOAD_FILE_IN_BUCKET]: "Upload File",
  [DB_PERMISSIONS.DELETE_FILE_IN_BUCKET]: "Delete File",

  // Accessor permissions
  [DB_PERMISSIONS.LIST_ACCESSORS]: "List Accessors",
  [DB_PERMISSIONS.READ_ACCESSOR]: "Read Accessor",
  [DB_PERMISSIONS.CREATE_ACCESSOR]: "Create Accessor",
  [DB_PERMISSIONS.DELETE_ACCESSOR]: "Delete Accessor",

  // Temporary URL permissions
  [DB_PERMISSIONS.SIGN_TEMPORARY_URLS]: "Sign Temporary URLs",
  [DB_PERMISSIONS.READ_TEMPORARY_URLS]: "Read Temporary URLs",

  // Other permissions
  [DB_PERMISSIONS.MANAGE_PERMISSIONS]: "Manage Permissions",
  [DB_PERMISSIONS.CREATE_JWT_TOKENS_FOR_ACCESSOR]:
    "Create JWT Tokens for Accessor",
} as const;

/**
 * Permission sets grouped by category
 */
export const permissionSets = [
  {
    name: "Bucket",
    permissions: [
      DB_PERMISSIONS.LIST_BUCKETS,
      DB_PERMISSIONS.READ_BUCKET,
      DB_PERMISSIONS.CREATE_BUCKET,
      DB_PERMISSIONS.DELETE_BUCKET,
    ],
  },
  {
    name: "File",
    permissions: [
      DB_PERMISSIONS.LIST_FILES_IN_BUCKET,
      DB_PERMISSIONS.READ_FILE_IN_BUCKET,
      DB_PERMISSIONS.DOWNLOAD_FILE_IN_BUCKET,
      DB_PERMISSIONS.UPLOAD_FILE_IN_BUCKET,
      DB_PERMISSIONS.DELETE_FILE_IN_BUCKET,
    ],
  },
  {
    name: "Accessor",
    permissions: [
      DB_PERMISSIONS.LIST_ACCESSORS,
      DB_PERMISSIONS.READ_ACCESSOR,
      DB_PERMISSIONS.CREATE_ACCESSOR,
      DB_PERMISSIONS.DELETE_ACCESSOR,
    ],
  },
  {
    name: "Temporary URLs",
    permissions: [
      DB_PERMISSIONS.SIGN_TEMPORARY_URLS,
      DB_PERMISSIONS.READ_TEMPORARY_URLS,
    ],
  },
  {
    name: "Other",
    permissions: [
      DB_PERMISSIONS.MANAGE_PERMISSIONS,
      DB_PERMISSIONS.CREATE_JWT_TOKENS_FOR_ACCESSOR,
    ],
  },
] as const;

/**
 * Predefined permission combinations for common roles
 */
export const predefinedRoles = {
  /**
   * Full administrator with all permissions
   */
  ADMIN: (): DbPermissions => Permissions.allFullPermissions(),

  /**
   * Read-only access to buckets and files
   */
  READER: (): DbPermissions =>
    Permissions.combine(
      DB_PERMISSIONS.LIST_BUCKETS,
      DB_PERMISSIONS.READ_BUCKET,
      DB_PERMISSIONS.LIST_FILES_IN_BUCKET,
      DB_PERMISSIONS.READ_FILE_IN_BUCKET,
      DB_PERMISSIONS.DOWNLOAD_FILE_IN_BUCKET,
    ),

  /**
   * Can read and write files, but not manage buckets or accessors
   */
  CONTRIBUTOR: (): DbPermissions =>
    Permissions.combine(
      DB_PERMISSIONS.LIST_BUCKETS,
      DB_PERMISSIONS.READ_BUCKET,
      DB_PERMISSIONS.LIST_FILES_IN_BUCKET,
      DB_PERMISSIONS.READ_FILE_IN_BUCKET,
      DB_PERMISSIONS.DOWNLOAD_FILE_IN_BUCKET,
      DB_PERMISSIONS.UPLOAD_FILE_IN_BUCKET,
    ),

  /**
   * Full bucket and file management, but no accessor management
   */
  BUCKET_MANAGER: (): DbPermissions => {
    const bucketPerms =
      permissionSets.find((set) => set.name === "Bucket")?.permissions || [];
    const filePerms =
      permissionSets.find((set) => set.name === "File")?.permissions || [];
    return Permissions.combine(...bucketPerms, ...filePerms);
  },

  /**
   * Can manage accessors and sign temporary URLs
   */
  ACCESSOR_MANAGER: (): DbPermissions => {
    const accessorPerms =
      permissionSets.find((set) => set.name === "Accessor")?.permissions || [];
    const tempUrlPerms =
      permissionSets.find((set) => set.name === "Temporary URLs")
        ?.permissions ||
      [];
    return Permissions.combine(...accessorPerms, ...tempUrlPerms);
  },
};

// Type representing a permissions bitfield
export type DbPermissions = number;

/**
 * Helper functions to work with permissions bitfields
 */
export const Permissions = {
  /**
   * Creates a permissions bitfield with all possible permissions
   * @returns A bitfield with all permission flags set
   */
  allFullPermissions(): number {
    return Object.values(DB_PERMISSIONS)
      .filter((v) => typeof v === "number")
      .reduce((acc, val) => acc | (val as number), 0);
  },

  /**
   * Checks if a permissions bitfield has a specific permission flag
   * @param permissions The permissions bitfield to check
   * @param flag The permission flag to look for
   * @returns True if the permissions include the specified flag
   */
  has: (permissions: DbPermissions, flag: DB_PERMISSIONS): boolean => {
    return (permissions & flag) === flag;
  },

  /**
   * Adds a permission flag to a permissions bitfield
   * @param permissions The original permissions bitfield
   * @param flag The permission flag to add
   * @returns A new permissions bitfield with the flag added
   */
  add: (permissions: DbPermissions, flag: DB_PERMISSIONS): DbPermissions => {
    return permissions | flag;
  },

  /**
   * Removes a permission flag from a permissions bitfield
   * @param permissions The original permissions bitfield
   * @param flag The permission flag to remove
   * @returns A new permissions bitfield with the flag removed
   */
  remove: (
    permissions: DbPermissions,
    flag: DB_PERMISSIONS,
  ): DbPermissions => {
    return permissions & ~flag;
  },

  /**
   * Combines multiple permission flags into a single bitfield
   * @param flags Permission flags to combine
   * @returns A permissions bitfield with all specified flags
   */
  combine: (...flags: DB_PERMISSIONS[]): DbPermissions => {
    return flags.reduce((acc, flag) => acc | flag, 0 as DbPermissions);
  },

  /**
   * Gets all active permission flags from a permissions bitfield
   * @param permissions The permissions bitfield to analyze
   * @returns Array of active permission flags
   */
  getActive: (permissions: DbPermissions): DB_PERMISSIONS[] => {
    return getAllDbPermissionFlags().filter((flag) =>
      Permissions.has(permissions, flag)
    );
  },

  /**
   * Checks if a permissions bitfield has all of the specified flags
   * @param permissions The permissions bitfield to check
   * @param flags The permission flags to look for
   * @returns True if the permissions include all specified flags
   */
  hasAll: (
    permissions: DbPermissions,
    ...flags: DB_PERMISSIONS[]
  ): boolean => {
    return flags.every((flag) => Permissions.has(permissions, flag));
  },

  /**
   * Checks if a permissions bitfield has any of the specified flags
   * @param permissions The permissions bitfield to check
   * @param flags The permission flags to look for
   * @returns True if the permissions include at least one of the specified flags
   */
  hasAny: (
    permissions: DbPermissions,
    ...flags: DB_PERMISSIONS[]
  ): boolean => {
    return flags.some((flag) => Permissions.has(permissions, flag));
  },

  /**
   * Gets a human-readable description of all permissions in a bitfield
   * @param permissions The permissions bitfield to describe
   * @returns Array of human-readable permission descriptions
   */
  describePermissions: (permissions: DbPermissions): string[] => {
    return Permissions.getActive(permissions).map((flag) =>
      permissionLabels[flag]
    );
  },

  /**
   * Gets permissions grouped by their categories
   * @param permissions The permissions bitfield to categorize
   * @returns Object with permissions organized by category
   */
  categorize: (
    permissions: DbPermissions,
  ): Record<string, DB_PERMISSIONS[]> => {
    const result: Record<string, DB_PERMISSIONS[]> = {};

    permissionSets.forEach((set) => {
      const activeInSet = set.permissions.filter((flag) =>
        Permissions.has(permissions, flag)
      );
      if (activeInSet.length > 0) {
        result[set.name] = activeInSet;
      }
    });

    return result;
  },
};

/**
 * Returns all permission flags defined in the DbPermissionFlag enum
 * @returns Array of all available permission flags
 */
export function getAllDbPermissionFlags(): DB_PERMISSIONS[] {
  return Object.values(DB_PERMISSIONS)
    .filter((value) => typeof value === "number") as DB_PERMISSIONS[];
}
