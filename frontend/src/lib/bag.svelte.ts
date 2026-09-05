/**
 * The parcel.
 *
 * Prices are held in paise throughout — no float ever reaches a total. The whole
 * parcel lives in localStorage; there is no checkout behind this yet.
 */

import { stock } from './stock.svelte';
import type { FlatKind, Weave } from './catalog';

export type Line = {
	id: string;
	no: string;
	name: string;
	cloth: string;
	/** Paise. */
	price: number;
	flat: FlatKind;
	weave: Weave;
	photo: string;
	size: string;
	qty: number;
};

const KEY = 'ply.parcel.v1';

/** Free carriage over this, in paise. Mirrors the shipping page. */
export const FREE_CARRIAGE = 299900;
export const CARRIAGE = 9900;

function load(): Line[] {
	if (typeof localStorage === 'undefined') return [];
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		// A parcel saved by an older build can be missing fields this one renders.
		// The stock number is stable, so refresh each line from the book and drop
		// any piece that has since left it.
		stock.hydrate();
		return (parsed as Partial<Line>[]).flatMap((line) => {
			if (!line.id || !line.size) return [];
			const qty = Math.max(1, Math.min(9, Math.round(Number(line.qty) || 1)));
			const product = stock.find(line.id);
			// A piece still in the book is refreshed from it, so a price or a name
			// changed in the dashboard shows in the parcel too. A piece that has left
			// the book keeps whatever the parcel already recorded.
			if (product) {
				return [
					{
						id: product.id,
						no: product.no,
						name: product.name,
						cloth: product.cloth,
						price: product.price,
						flat: product.flat,
						weave: product.weave,
						photo: product.photo,
						size: line.size,
						qty
					}
				];
			}
			return typeof line.price === 'number' && line.name ? [{ ...(line as Line), qty }] : [];
		});
	} catch {
		return [];
	}
}

function save(items: Line[]) {
	if (typeof localStorage === 'undefined') return;
	try {
		localStorage.setItem(KEY, JSON.stringify(items));
	} catch {
		// Storage refused. The parcel still holds for this page view.
	}
}

const same = (a: Line, id: string, size: string) => a.id === id && a.size === size;

class Bag {
	items = $state<Line[]>([]);
	ready = $state(false);
	/** Bumped on every add, so the seal can stamp itself. */
	stamped = $state(0);

	count = $derived(this.items.reduce((n, line) => n + line.qty, 0));
	goods = $derived(this.items.reduce((n, line) => n + line.price * line.qty, 0));
	carriage = $derived(this.items.length === 0 || this.goods >= FREE_CARRIAGE ? 0 : CARRIAGE);
	total = $derived(this.goods + this.carriage);
	/** Paise still to spend before carriage is free, or 0. */
	toFreeCarriage = $derived(Math.max(0, FREE_CARRIAGE - this.goods));

	hydrate() {
		if (this.ready) return;
		this.items = load();
		this.ready = true;
	}

	add(line: Omit<Line, 'qty'>) {
		const existing = this.items.find((item) => same(item, line.id, line.size));
		this.items = existing
			? this.items.map((item) =>
					same(item, line.id, line.size) ? { ...item, qty: item.qty + 1 } : item
				)
			: [...this.items, { ...line, qty: 1 }];
		this.stamped += 1;
		save(this.items);
	}

	remove(id: string, size: string) {
		this.items = this.items.filter((item) => !same(item, id, size));
		save(this.items);
	}

	setQty(id: string, size: string, qty: number) {
		if (qty < 1) return this.remove(id, size);
		this.items = this.items.map((item) => (same(item, id, size) ? { ...item, qty } : item));
		save(this.items);
	}
}

export const bag = new Bag();
