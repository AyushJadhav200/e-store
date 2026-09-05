import { getHealth, getProducts } from '$lib/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	try {
		const [health, products] = await Promise.all([getHealth(fetch), getProducts(fetch)]);
		return { health, products, error: null as string | null };
	} catch {
		return {
			health: null,
			products: [],
			error: 'Could not reach the API. Start the FastAPI server on port 8000.'
		};
	}
};
