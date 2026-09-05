import { env } from '$env/dynamic/public';

const API_URL = env.PUBLIC_API_URL ?? 'http://localhost:8000';

export type Product = {
	id: string;
	name: string;
	description: string;
	price_cents: number;
	image_url: string;
};

export async function getHealth(fetchFn: typeof fetch = fetch) {
	const response = await fetchFn(`${API_URL}/api/health`);

	if (!response.ok) {
		throw new Error('API health check failed');
	}

	return response.json() as Promise<{ status: string; service: string }>;
}

export async function getProducts(fetchFn: typeof fetch = fetch) {
	const response = await fetchFn(`${API_URL}/api/products`);

	if (!response.ok) {
		throw new Error('Failed to load products');
	}

	const data = (await response.json()) as { products: Product[] };
	return data.products;
}
