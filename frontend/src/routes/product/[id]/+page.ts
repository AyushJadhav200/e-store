import type { PageLoad } from './$types';

/**
 * The id is passed straight through. Lookup happens in the component against the
 * working stock book, so a piece posted in the dashboard resolves like any other.
 */
export const load: PageLoad = ({ params }) => ({ id: params.id });
