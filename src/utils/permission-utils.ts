/**
 * Utility functions for working with permissions
 *
 * This module provides additional helper functions for working with
 * the permissions system defined in permissions.ts.
 */

import { DB_PERMISSIONS, DbPermissions, Permissions, permissionSets } from "./permission";

/**
 * Checks if a user has full permissions for a specific category
 * @param permissions User's permission bitfield
 * @param categoryName Name of the category to check (e.g., "Bucket", "File")
 * @returns True if user has all permissions in the category
 */
export function hasFullCategoryAccess(permissions: DbPermissions, categoryName: string): boolean {
	const category = permissionSets.find((set) => set.name === categoryName);
	if (!category) return false;

	return Permissions.hasAll(permissions, ...category.permissions);
}

/**
 * Checks what permission categories a user can fully access
 * @param permissions User's permission bitfield
 * @returns Array of category names the user has full access to
 */
export function getFullyAccessibleCategories(permissions: DbPermissions): string[] {
	return permissionSets.filter((set) => Permissions.hasAll(permissions, ...set.permissions)).map((set) => set.name);
}

/**
 * Determines the effective role name based on permissions
 * @param permissions User's permission bitfield
 * @returns String name of the closest matching role
 */
export function determineEffectiveRole(permissions: DbPermissions): string {
	const fullPermissions = Permissions.allFullPermissions();

	if (permissions === fullPermissions) {
		return "Administrator";
	}

	const hasAllBucketAndFilePermissions =
		hasFullCategoryAccess(permissions, "Bucket") && hasFullCategoryAccess(permissions, "File");

	if (hasAllBucketAndFilePermissions) {
		return "Bucket Manager";
	}

	const activePermissions = Permissions.getActive(permissions);
	const canWrite = activePermissions.includes(DB_PERMISSIONS.UPLOAD_FILE_IN_BUCKET);

	if (canWrite) {
		return "Contributor";
	}

	const canRead =
		activePermissions.includes(DB_PERMISSIONS.READ_FILE_IN_BUCKET) ||
		activePermissions.includes(DB_PERMISSIONS.DOWNLOAD_FILE_IN_BUCKET);

	if (canRead) {
		return "Reader";
	}

	return "Custom Role";
}

/**
 * Creates a diff of two permission sets showing what was added and removed
 * @param oldPermissions Original permissions bitfield
 * @param newPermissions New permissions bitfield
 * @returns Object containing added and removed permission flags
 */
export function diffPermissions(
	oldPermissions: DbPermissions,
	newPermissions: DbPermissions
): {
	added: DB_PERMISSIONS[];
	removed: DB_PERMISSIONS[];
} {
	const oldActive = Permissions.getActive(oldPermissions);
	const newActive = Permissions.getActive(newPermissions);

	return {
		added: newActive.filter((flag) => !oldActive.includes(flag)),
		removed: oldActive.filter((flag) => !newActive.includes(flag)),
	};
}
