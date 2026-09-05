import {
	products as seed,
	departments,
	deptName,
	laddersOnWaist,
	type Product,
	type Department
} from './catalog';

/**
 * The working stock book.
 *
 * The shop ships with a seed list. Anything the dashboard adds, edits or pulls
 * is layered on top of it and kept in this browser — there is no server behind
 * the admin yet, so a change is real for whoever made it and nobody else.
 *
 * Storefront pages read from here rather than from the seed array, which is what
 * makes a posted piece show up in the shop straight away.
 */

const KEY = 'ply.stock.v1';

type Layer = {
	/** Pieces created in the dashboard. */
	added: Product[];
	/** Field-level changes to seed pieces, by id. */
	edits: Record<string, Partial<Product>>;
	/** Seed pieces pulled from the book. */
	removed: string[];
};

const EMPTY: Layer = { added: [], edits: {}, removed: [] };

function load(): Layer {
	if (typeof localStorage === 'undefined') return { ...EMPTY };
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return { ...EMPTY };
		const parsed = JSON.parse(raw) as Partial<Layer>;
		return {
			added: Array.isArray(parsed.added) ? parsed.added : [],
			edits: parsed.edits && typeof parsed.edits === 'object' ? parsed.edits : {},
			removed: Array.isArray(parsed.removed) ? parsed.removed : []
		};
	} catch {
		return { ...EMPTY };
	}
}

const byNumber = (a: Product, b: Product) => a.no.localeCompare(b.no, undefined, { numeric: true });

class Stock {
	layer = $state<Layer>({ ...EMPTY });
	ready = $state(false);

	/** Seed list with the local layer applied, in stock-number order. */
	all = $derived.by(() => {
		const kept = seed
			.filter((p) => !this.layer.removed.includes(p.id))
			.map((p) => ({ ...p, ...(this.layer.edits[p.id] ?? {}) }));
		return [...kept, ...this.layer.added].sort(byNumber);
	});

	/** Which pieces differ from what the shop shipped with. */
	changed = $derived(
		this.layer.added.length + Object.keys(this.layer.edits).length + this.layer.removed.length
	);

	hydrate() {
		if (this.ready) return;
		this.layer = load();
		this.ready = true;
	}

	find(id: string) {
		return this.all.find((p) => p.id === id);
	}

	inDept(slug: string) {
		return this.all.filter((p) => p.dept === slug);
	}

	/** Whether a piece came from the dashboard rather than the seed list. */
	isLocal(id: string) {
		return this.layer.added.some((p) => p.id === id);
	}

	isEdited(id: string) {
		return id in this.layer.edits;
	}

	search(term: string) {
		const q = term.trim().toLowerCase();
		if (!q) return [];
		return this.all.filter((p) =>
			[p.name, p.cloth, p.mill, deptName(p.dept), p.no, p.hand].join(' ').toLowerCase().includes(q)
		);
	}

	/** Create or replace a piece. Seed pieces are stored as a diff, not a copy. */
	save(piece: Product) {
		const isSeed = seed.some((p) => p.id === piece.id);
		if (isSeed) {
			const base = seed.find((p) => p.id === piece.id)!;
			const diff: Partial<Product> = {};
			for (const k of Object.keys(piece) as (keyof Product)[]) {
				if (JSON.stringify(piece[k]) !== JSON.stringify(base[k])) {
					// @ts-expect-error index write across a union of value types
					diff[k] = piece[k];
				}
			}
			this.layer = {
				...this.layer,
				removed: this.layer.removed.filter((id) => id !== piece.id),
				edits: Object.keys(diff).length
					? { ...this.layer.edits, [piece.id]: diff }
					: omit(this.layer.edits, piece.id)
			};
		} else {
			const others = this.layer.added.filter((p) => p.id !== piece.id);
			this.layer = { ...this.layer, added: [...others, piece] };
		}
		this.persist();
	}

	remove(id: string) {
		if (seed.some((p) => p.id === id)) {
			this.layer = {
				...this.layer,
				removed: [...new Set([...this.layer.removed, id])],
				edits: omit(this.layer.edits, id)
			};
		} else {
			this.layer = { ...this.layer, added: this.layer.added.filter((p) => p.id !== id) };
		}
		this.persist();
	}

	/** Undo a change to one seed piece, putting it back as it shipped. */
	restore(id: string) {
		this.layer = {
			...this.layer,
			edits: omit(this.layer.edits, id),
			removed: this.layer.removed.filter((v) => v !== id)
		};
		this.persist();
	}

	/** Throw the whole local layer away. */
	reset() {
		this.layer = { ...EMPTY };
		this.persist();
	}

	/** The layer as JSON, for handing to a backend when there is one. */
	export() {
		return JSON.stringify(this.layer, null, 2);
	}

	import(json: string) {
		const parsed = JSON.parse(json) as Partial<Layer>;
		this.layer = {
			added: Array.isArray(parsed.added) ? parsed.added : [],
			edits: parsed.edits && typeof parsed.edits === 'object' ? parsed.edits : {},
			removed: Array.isArray(parsed.removed) ? parsed.removed : []
		};
		this.persist();
	}

	/** Bytes the local layer currently occupies, photographs included. */
	usage() {
		try {
			return new Blob([JSON.stringify(this.layer)]).size;
		} catch {
			return JSON.stringify(this.layer).length;
		}
	}

	/**
	 * Writes the layer. Throws when the browser refuses — usually the storage
	 * quota, which uploaded photographs are the only realistic way to reach. The
	 * caller is expected to say so rather than lose the write silently.
	 */
	private persist() {
		if (typeof localStorage === 'undefined') return;
		try {
			localStorage.setItem(KEY, JSON.stringify(this.layer));
		} catch (err) {
			throw new QuotaError(
				'The browser refused to store that — most likely the 5 MB limit, reached by uploaded photographs. Remove a picture, or export the layer and clear it.',
				{ cause: err }
			);
		}
	}
}

function omit<T extends Record<string, unknown>>(obj: T, key: string) {
	const rest = { ...obj };
	delete rest[key];
	return rest as T;
}

export class QuotaError extends Error {}

export const stock = new Stock();
export { departments, deptName, laddersOnWaist, type Product, type Department };
