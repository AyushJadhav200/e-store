/**
 * The house.
 *
 * Everything user-facing reads the name from here, so renaming the shop is one
 * edit rather than a search across forty files.
 */
export const BRAND = 'VELCELLO';

/** Sits under the wordmark in the header and the footer. */
export const TAGLINE = 'Timeless Style. Defining You.';

/** Used in page titles: "Melton Overcoat — VELCELLO". */
export const title = (page?: string) => (page ? `${page} — ${BRAND}` : `${BRAND} — ${TAGLINE}`);

/** Where the shop answers its post. */
export const EMAIL = 'contact@velcello.com';
