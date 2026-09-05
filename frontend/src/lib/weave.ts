import type { Weave } from './catalog';

/**
 * Cloth swatches drawn in CSS rather than photographed.
 *
 * A photograph of a weave at 40x is a photograph of one loom's dust. Drawing the
 * structure means the loupe on a product page shows the actual over-and-under of
 * that cloth, at any magnification, with nothing to download.
 *
 * `t` is the thread pitch in px. Everything else scales off it.
 */
export type Swatch = { image: string; size: string; position?: string };

const warp = 'var(--warp, oklch(0.42 0.035 40))';
const weft = 'var(--weft, oklch(0.55 0.03 45))';
const gap = 'var(--gap-thread, oklch(0.30 0.03 40))';

export function weaveSwatch(kind: Weave, t: number): Swatch {
	switch (kind) {
		case 'twill':
			// A 2/1 twill: the float steps one end sideways each pick, so the line runs 45°.
			return {
				image: `repeating-linear-gradient(
					45deg,
					${warp} 0 ${t * 0.9}px,
					${gap} ${t * 0.9}px ${t * 1.15}px,
					${weft} ${t * 1.15}px ${t * 2}px,
					${gap} ${t * 2}px ${t * 2.25}px
				), repeating-linear-gradient(
					90deg,
					oklch(0 0 0 / 0.11) 0 ${t * 0.5}px,
					oklch(0 0 0 / 0) ${t * 0.5}px ${t}px
				)`,
				size: 'auto, auto'
			};

		case 'herringbone':
			// Cavalry twill reverses direction every few ends: two mirrored twills, tiled.
			return {
				image: `repeating-linear-gradient(
					45deg,
					${warp} 0 ${t * 0.85}px,
					${gap} ${t * 0.85}px ${t * 1.7}px
				), repeating-linear-gradient(
					-45deg,
					${weft} 0 ${t * 0.85}px,
					${gap} ${t * 0.85}px ${t * 1.7}px
				)`,
				size: `${t * 8}px ${t * 8}px, ${t * 8}px ${t * 8}px`,
				position: `0 0, ${t * 4}px 0`
			};

		case 'rib':
			// Knitted rib: columns of wale with a rounded face and a shadowed valley.
			return {
				image: `repeating-linear-gradient(
					90deg,
					${gap} 0 ${t * 0.28}px,
					${warp} ${t * 0.28}px ${t * 0.9}px,
					${weft} ${t * 0.9}px ${t * 1.5}px,
					${gap} ${t * 1.5}px ${t * 1.8}px
				), repeating-linear-gradient(
					0deg,
					oklch(0 0 0 / 0.07) 0 ${t * 0.18}px,
					oklch(0 0 0 / 0) ${t * 0.18}px ${t * 2.4}px
				)`,
				size: 'auto, auto'
			};

		case 'loopback':
			// The unbrushed back of a sweat: rows of pulled loops, offset every other row.
			return {
				image: `radial-gradient(circle at 50% 40%, ${weft} 0 ${t * 0.36}px, ${gap} ${t * 0.42}px ${t * 0.5}px, transparent ${t * 0.52}px),
					radial-gradient(circle at 50% 40%, ${weft} 0 ${t * 0.36}px, ${gap} ${t * 0.42}px ${t * 0.5}px, transparent ${t * 0.52}px),
					linear-gradient(${warp}, ${warp})`,
				size: `${t * 1.4}px ${t * 1.4}px, ${t * 1.4}px ${t * 1.4}px, auto`,
				position: `0 0, ${t * 0.7}px ${t * 0.7}px, 0 0`
			};

		case 'moleskin':
			// Sueded until the weave is gone. What is left is nap direction and a faint grain.
			return {
				image: `repeating-linear-gradient(
					100deg,
					${warp} 0 ${t * 0.22}px,
					${weft} ${t * 0.22}px ${t * 0.44}px
				), linear-gradient(160deg, oklch(1 0 0 / 0.1), oklch(0 0 0 / 0.14))`,
				size: 'auto, auto'
			};

		case 'plain':
		default:
			// One over, one under. The checker layer is what makes it read as woven
			// rather than as a grid of lines.
			return {
				image: `repeating-conic-gradient(
					from 0deg at 50% 50%,
					oklch(0 0 0 / 0.16) 0deg 90deg,
					oklch(1 0 0 / 0.1) 90deg 180deg,
					oklch(0 0 0 / 0.16) 180deg 270deg,
					oklch(1 0 0 / 0.1) 270deg 360deg
				), repeating-linear-gradient(
					90deg,
					${warp} 0 ${t * 0.78}px,
					${gap} ${t * 0.78}px ${t}px
				), repeating-linear-gradient(
					0deg,
					${weft} 0 ${t * 0.78}px,
					${gap} ${t * 0.78}px ${t}px
				)`,
				size: `${t * 2}px ${t * 2}px, auto, auto`
			};
	}
}

/** Inline style string for an element that should be filled with the cloth. */
export function weaveStyle(kind: Weave, t: number) {
	const s = weaveSwatch(kind, t);
	return [
		`background-image:${s.image}`,
		`background-size:${s.size}`,
		s.position ? `background-position:${s.position}` : '',
		'background-blend-mode:multiply, normal, normal'
	]
		.filter(Boolean)
		.join(';');
}

/** Plain-English name for the structure, for captions and alt text. */
export const weaveName: Record<Weave, string> = {
	plain: 'Plain weave',
	twill: 'Twill',
	herringbone: 'Herringbone twill',
	rib: 'Knitted rib',
	loopback: 'Loopback knit',
	moleskin: 'Sueded moleskin'
};
