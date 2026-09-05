/**
 * Shop photographs, taken in the browser.
 *
 * There is no server to upload to, so a picked file is decoded, scaled down and
 * re-encoded here, then carried with the piece as a data URL. That keeps every
 * consumer — cards, product pages, the parcel — working with a plain `src`, and
 * it means an exported layer carries its own images.
 *
 * The trade is storage: browsers give roughly 5 MB of localStorage, so pictures
 * are scaled hard and the dashboard shows how much room is left.
 */

/** Raster only. An SVG is a document, not a photograph, and we do not host it. */
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];

/** Refuse to even decode something this large; it is a mistake, not a photo. */
const MAX_INPUT = 25 * 1024 * 1024;

/** What one stored photograph should come in under. */
export const TARGET_BYTES = 180 * 1024;

export type Shrunk = {
	dataUrl: string;
	bytes: number;
	width: number;
	height: number;
	/** What the file weighed before it was scaled. */
	from: number;
};

export class ImageError extends Error {}

/** Rough byte length of a data URL's payload. */
export function dataUrlBytes(url: string) {
	const comma = url.indexOf(',');
	if (comma < 0) return 0;
	const body = url.length - comma - 1;
	return Math.round(body * 0.75);
}

export const readable = (bytes: number) =>
	bytes >= 1024 * 1024
		? `${(bytes / 1024 / 1024).toFixed(1)} MB`
		: `${Math.max(1, Math.round(bytes / 1024))} KB`;

/**
 * Decode, scale to fit `max` on the long edge, and re-encode, stepping the
 * quality down until the result fits the target.
 */
export async function shrink(file: File, max = 1100): Promise<Shrunk> {
	if (!ACCEPTED.includes(file.type)) {
		throw new ImageError(
			file.type === 'image/svg+xml'
				? 'SVG is not accepted for a photograph. Use a JPEG, PNG or WebP.'
				: 'That is not an image the shop can use. JPEG, PNG, WebP or AVIF.'
		);
	}
	if (file.size > MAX_INPUT) {
		throw new ImageError(`That file is ${readable(file.size)}. Anything over 25 MB is refused.`);
	}

	let bitmap: ImageBitmap;
	try {
		bitmap = await createImageBitmap(file);
	} catch {
		throw new ImageError('The browser could not read that file. It may be damaged.');
	}

	const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
	const width = Math.max(1, Math.round(bitmap.width * scale));
	const height = Math.max(1, Math.round(bitmap.height * scale));

	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new ImageError('The browser refused a drawing surface.');
	ctx.drawImage(bitmap, 0, 0, width, height);
	bitmap.close?.();

	// WebP where it exists, JPEG everywhere else. Quality steps down until the
	// picture fits, rather than storing something that will blow the quota.
	const encode = (quality: number) => {
		const webp = canvas.toDataURL('image/webp', quality);
		return webp.startsWith('data:image/webp') ? webp : canvas.toDataURL('image/jpeg', quality);
	};

	let dataUrl = encode(0.74);
	for (const quality of [0.62, 0.52, 0.44]) {
		if (dataUrlBytes(dataUrl) <= TARGET_BYTES) break;
		dataUrl = encode(quality);
	}

	return { dataUrl, bytes: dataUrlBytes(dataUrl), width, height, from: file.size };
}

/** Whether a value is a stored picture rather than a link to someone else's. */
export const isUploaded = (src: string) => src.startsWith('data:');
