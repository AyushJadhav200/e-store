import type { Product } from './catalog';
import { laddersOnWaist } from './catalog';

/**
 * The fit ladder.
 *
 * A size chart makes the customer do the arithmetic on every product page. This
 * holds one chest and one waist measurement in the browser and answers the only
 * question that matters — which size, on this piece — everywhere the piece
 * appears. Nothing leaves the device.
 */

const KEY = 'ply.fit.v1';

export type Verdict = {
	size: string;
	/** 'in' — inside the cut range. 'between' — on the join between two sizes. */
	confidence: 'in' | 'between';
	/** The other candidate when sizing sits on a join. */
	alternative?: string;
	note: string;
};

type Saved = { chest: number | null; waist: number | null };

function load(): Saved {
	if (typeof localStorage === 'undefined') return { chest: null, waist: null };
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return { chest: null, waist: null };
		const parsed = JSON.parse(raw) as Partial<Saved>;
		return {
			chest: typeof parsed.chest === 'number' ? parsed.chest : null,
			waist: typeof parsed.waist === 'number' ? parsed.waist : null
		};
	} catch {
		return { chest: null, waist: null };
	}
}

class Fit {
	chest = $state<number | null>(null);
	waist = $state<number | null>(null);
	ready = $state(false);

	known = $derived(this.chest !== null || this.waist !== null);

	hydrate() {
		if (this.ready) return;
		const saved = load();
		this.chest = saved.chest;
		this.waist = saved.waist;
		this.ready = true;
	}

	set(part: 'chest' | 'waist', cm: number | null) {
		this[part] = cm;
		this.save();
	}

	clear() {
		this.chest = null;
		this.waist = null;
		this.save();
	}

	private save() {
		if (typeof localStorage === 'undefined') return;
		try {
			localStorage.setItem(KEY, JSON.stringify({ chest: this.chest, waist: this.waist }));
		} catch {
			// Private browsing. The ladder still works for this page view.
		}
	}

	/** Which size of this piece the stored measurement lands on, if any. */
	verdict(product: Product): Verdict | null {
		const onWaist = laddersOnWaist(product);
		const cm = onWaist ? this.waist : this.chest;
		if (cm === null) return null;

		const rungs = product.sizes
			.map((size) => ({ size, range: product.fit[size] }))
			.filter((r): r is { size: string; range: [number, number] } => Boolean(r.range));
		if (!rungs.length) return null;

		const smallest = rungs[0];
		const largest = rungs[rungs.length - 1];
		const part = onWaist ? 'waist' : 'chest';

		if (cm < smallest.range[0]) {
			return {
				size: smallest.size,
				confidence: 'between',
				note: `Below the cut range. ${smallest.size} is the smallest we make this in; it will sit loose on a ${cm} cm ${part}.`
			};
		}
		if (cm > largest.range[1]) {
			return {
				size: largest.size,
				confidence: 'between',
				note: `Above the cut range. ${largest.size} is the largest in this cloth. Write to us before ordering.`
			};
		}

		const hit = rungs.find((r) => cm >= r.range[0] && cm <= r.range[1]);
		if (!hit) {
			// Measurement falls in a gap between two published ranges.
			const below = [...rungs].reverse().find((r) => r.range[1] < cm)!;
			const above = rungs.find((r) => r.range[0] > cm)!;
			const roomy = product.dept === 'coating' || product.dept === 'knit';
			return {
				size: roomy ? above.size : below.size,
				confidence: 'between',
				alternative: roomy ? below.size : above.size,
				note: roomy
					? 'Between sizes. Take the larger in coating and knit — both are cut to layer.'
					: 'Between sizes. Take the closer of the two; this cloth does not give.'
			};
		}

		// Sitting within 1 cm of the top of a range is effectively a join.
		const nearTop = hit.range[1] - cm <= 1;
		const next = rungs[rungs.indexOf(hit) + 1];
		if (nearTop && next) {
			return {
				size: hit.size,
				confidence: 'between',
				alternative: next.size,
				note: `A ${cm} cm ${part} sits at the top of ${hit.size}. Take ${next.size} if you want room over a knit.`
			};
		}

		return {
			size: hit.size,
			confidence: 'in',
			note: `${hit.size} is cut for a ${hit.range[0]}–${hit.range[1]} cm ${part}.`
		};
	}
}

export const fit = new Fit();
