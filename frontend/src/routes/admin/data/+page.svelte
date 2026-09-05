<script lang="ts">
	import { stock } from '$lib/stock.svelte';
	import { readable } from '$lib/image';

	let incoming = $state('');
	let message = $state<{ kind: 'ok' | 'bad'; text: string } | null>(null);
	let confirmingReset = $state(false);

	const current = $derived(stock.export());

	// Browsers give roughly 5 MB of localStorage. Uploaded photographs are the
	// only thing here big enough to reach it, so the room left is worth stating.
	const BUDGET = 5 * 1024 * 1024;
	const used = $derived(stock.ready ? stock.usage() : 0);
	const pct = $derived(Math.min(100, Math.round((used / BUDGET) * 100)));
	const uploads = $derived(stock.all.filter((p) => p.photo.startsWith('data:')).length);

	async function copy() {
		try {
			await navigator.clipboard.writeText(current);
			message = { kind: 'ok', text: 'Copied to the clipboard.' };
		} catch {
			message = {
				kind: 'bad',
				text: 'The browser refused clipboard access. Select and copy it by hand.'
			};
		}
	}

	function apply() {
		try {
			stock.import(incoming);
			incoming = '';
			message = { kind: 'ok', text: 'Applied. The storefront is showing it now.' };
		} catch {
			message = { kind: 'bad', text: 'That is not valid JSON in the shape this page exports.' };
		}
	}

	function reset() {
		stock.reset();
		confirmingReset = false;
		message = { kind: 'ok', text: 'Local layer cleared. The book is back to what shipped.' };
	}
</script>

<svelte:head><title>Data — PLY admin</title></svelte:head>

<main class="page">
	<header class="head">
		<h1>Data</h1>
		<p>
			The dashboard stores changes as a layer over the shipped stock book: pieces added, fields
			edited, pieces pulled. This is that layer. Copy it to move your work to another browser, or
			hand it to a backend when there is one to hand it to.
		</p>
	</header>

	<section class="panel storage">
		<div class="storage-head">
			<div>
				<span class="label">Storage used</span>
				<strong class="num">{readable(used)}</strong>
				<span class="of num">of about {readable(BUDGET)}</span>
			</div>
			<span class="uploads">
				{uploads} uploaded photograph{uploads === 1 ? '' : 's'}
			</span>
		</div>
		<div class="meter" role="img" aria-label="{pct} per cent of the storage budget used">
			<span style="width:{pct}%" class:tight={pct > 75}></span>
		</div>
		{#if pct > 75}
			<p class="hint warn">
				Getting full. Link photographs instead of uploading them, or export this layer and clear it.
			</p>
		{/if}
	</section>

	{#if message}
		<p class="msg {message.kind}" role="status">{message.text}</p>
	{/if}

	<div class="cols">
		<section class="panel block">
			<h2>Current layer</h2>
			<p class="hint">
				{stock.layer.added.length} posted · {Object.keys(stock.layer.edits).length} edited ·
				{stock.layer.removed.length} pulled
			</p>
			<textarea readonly value={current} rows="16" spellcheck="false"></textarea>
			<div class="actions">
				<button class="btn" type="button" onclick={copy}>Copy</button>
			</div>
		</section>

		<section class="panel block">
			<h2>Apply a layer</h2>
			<p class="hint">
				This replaces the whole local layer. Pieces that shipped with the shop are never lost — they
				are only hidden or diffed.
			</p>
			<textarea
				bind:value={incoming}
				rows="16"
				spellcheck="false"
				placeholder={'{\n  "added": [],\n  "edits": {},\n  "removed": []\n}'}></textarea>
			<div class="actions">
				<button class="btn primary" type="button" onclick={apply} disabled={!incoming.trim()}>
					Apply
				</button>
			</div>
		</section>
	</div>

	<section class="panel danger-zone block">
		<h2>Clear everything</h2>
		<p class="hint">
			Throws away every posted piece, every edit and every pull. The shipped ten come back. This
			cannot be undone.
		</p>
		<div class="actions">
			{#if confirmingReset}
				<span class="ask">Clear {stock.changed} change{stock.changed === 1 ? '' : 's'}?</span>
				<button class="btn danger" type="button" onclick={reset}>Yes, clear it</button>
				<button class="btn" type="button" onclick={() => (confirmingReset = false)}>Keep</button>
			{:else}
				<button
					class="btn danger"
					type="button"
					disabled={!stock.changed}
					onclick={() => (confirmingReset = true)}
				>
					Clear local layer
				</button>
			{/if}
		</div>
	</section>
</main>

<style>
	.page {
		padding: clamp(1rem, 3vw, 2rem);
	}

	h1 {
		font-size: clamp(1.4rem, 3vw, 1.9rem);
	}

	.head p {
		margin: 0.35rem 0 0;
		max-width: 70ch;
		color: var(--faint);
		font-size: 0.84rem;
	}

	.msg {
		margin: 1rem 0 0;
		padding: 0.55rem 0.8rem;
		border-radius: 4px;
		font-size: 0.82rem;
		border: 1px solid var(--line);
	}

	.msg.ok {
		background: color-mix(in oklch, var(--good) 14%, transparent);
		color: var(--good);
	}

	.msg.bad {
		background: color-mix(in oklch, var(--brand) 16%, transparent);
		color: oklch(0.8 0.14 27);
	}

	.storage {
		margin-top: 1.2rem;
		padding: 0.9rem 1.1rem 1rem;
	}

	.storage-head {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.4rem 1rem;
		margin-bottom: 0.6rem;
	}

	.storage strong {
		font-size: 1.15rem;
		font-weight: 600;
		margin-right: 0.35rem;
	}

	.of,
	.uploads {
		color: var(--faint);
		font-size: 0.78rem;
	}

	.meter {
		height: 0.35rem;
		border-radius: 999px;
		background: var(--raised);
		overflow: hidden;
	}

	.meter span {
		display: block;
		height: 100%;
		background: var(--good);
		transition: width 0.3s;
	}

	.meter span.tight {
		background: var(--warn);
	}

	.hint.warn {
		color: var(--warn);
		margin-bottom: 0;
	}

	.cols {
		display: grid;
		gap: 1rem;
		margin-top: 1.2rem;
	}

	.block {
		padding: 1.1rem 1.2rem 1.2rem;
		min-width: 0;
	}

	h2 {
		font-size: 0.72rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--faint);
	}

	.hint {
		margin: 0.5rem 0 0.8rem;
		color: var(--dim);
		font-size: 0.79rem;
	}

	textarea {
		font-family: var(--mono);
		font-size: 0.74rem;
		line-height: 1.5;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		margin-top: 0.8rem;
	}

	.ask {
		font-size: 0.8rem;
		color: var(--warn);
	}

	.danger-zone {
		margin-top: 1rem;
		border-color: var(--brand-dim);
	}

	@media (min-width: 900px) {
		.cols {
			grid-template-columns: 1fr 1fr;
		}
	}
</style>
