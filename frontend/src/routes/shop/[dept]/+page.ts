import { error } from '@sveltejs/kit';
import { findDepartment } from '$lib/catalog';
import type { PageLoad } from './$types';

/**
 * Departments are fixed, so they can 404 on the server. The pieces inside one
 * are read from the working stock book in the component, because the dashboard
 * can add pieces this load function has never heard of.
 */
export const load: PageLoad = ({ params }) => {
	const dept = findDepartment(params.dept);
	if (!dept) error(404, 'No such cloth');
	return { dept };
};
