import { trpcQuery, trpcAuthQuery } from '../../pages/api/trpc/trpc';

class TrpcClientService {
	constructor() {
		this.authToken = null;
	}

	setAuthToken(token) {
		this.authToken = token;
	}

	async query(route, ...input) {
		return await trpcQuery(route, ...input);
	}

	async authQuery(route, ...input) {
		if (!this.authToken) {
			throw new Error('No auth token provided');
		}
		return await trpcAuthQuery(route, this.authToken, ...input);
	}

	// Link methods
	async getLinks(language) {
		if (language) {
			return await this.authQuery('link.list_by_language', language);
		}
		return await this.authQuery('link.list');
	}

	async createLink(linkData) {
		return await this.authQuery('link.create', linkData);
	}

	async updateLink(linkData) {
		return await this.authQuery('link.update', linkData);
	}

	async deleteLink(id) {
		return await this.authQuery('link.delete', id);
	}

	// Generic CRUD methods for other entities
	async getEntities(entityType, language) {
		const route = language ? `${entityType}.list_by_language` : `${entityType}.list`;
		return await this.authQuery(route, ...(language ? [language] : []));
	}

	async createEntity(entityType, data) {
		return await this.authQuery(`${entityType}.create`, data);
	}

	async updateEntity(entityType, data) {
		return await this.authQuery(`${entityType}.update`, data);
	}

	async deleteEntity(entityType, id) {
		return await this.authQuery(`${entityType}.delete`, id);
	}
}

export const trpcClient = new TrpcClientService();

// Set auth token from localStorage or session
if (typeof window !== 'undefined') {
	const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
	if (token) {
		trpcClient.setAuthToken(token);
	}
}
