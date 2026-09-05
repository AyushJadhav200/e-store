/**
 * The house.
 *
 * Everything user-facing reads the name from here, so renaming the shop is one
 * edit rather than a search across forty files.
 */
export const BRAND = 'PLY';

/** Sits under the wordmark in the header and the footer. */
export const TAGLINE = 'Cloth, cut short';

/** Used in page titles: "Melton Overcoat — PLY". */
export const title = (page?: string) => (page ? `${page} — ${BRAND}` : BRAND);

/** Where the shop answers its post. */
export const EMAIL = 'hello@ply.example';
