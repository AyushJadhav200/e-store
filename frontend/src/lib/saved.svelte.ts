/**
 * Saved pieces.
 *
 * A shortlist held in the browser. No account, nothing sent anywhere — the heart
 * on a card is a note to yourself, not a signal to us.
 */

const KEY = 'ply.saved.v1';

function load(): string[] {
	if (typeof localStorage === 'undefined') return [];
	try {
		const raw = localStorage.getItem(KEY);
		const parsed = raw ? JSON.parse(raw) : [];
		return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : [];
	} catch {
		return [];
	}
}

class Saved {
	ids = $state<string[]>([]);
	ready = $state(false);

	count = $derived(this.ids.length);

	hydrate() {
		if (this.ready) return;
		this.ids = load();
		this.ready = true;
	}

	has(id: string) {
		return this.ids.includes(id);
	}

	toggle(id: string) {
		this.ids = this.has(id) ? this.ids.filter((v) => v !== id) : [...this.ids, id];
		try {
			localStorage.setItem(KEY, JSON.stringify(this.ids));
		} catch {
			// Storage refused. The shortlist still holds for this page view.
		}
	}
}

export const saved = new Saved();
