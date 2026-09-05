import { redirect } from '@sveltejs/kit';

/** PLY sorts by cloth, not by who wears it. Kept so old links do not break. */
export function load() {
	redirect(308, '/shop');
}
