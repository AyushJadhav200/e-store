<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import StockLedger from '$lib/components/StockLedger.svelte';
	import { departments } from '$lib/catalog';
	import { stock } from '$lib/stock.svelte';

	const q = $derived(page.url.searchParams.get('q') ?? '');
	const hits = $derived(stock.search(q));

	// Writable derived: the field follows the URL, and typing overrides it.
	let term = $derived(q);

	function submit(e: SubmitEvent) {
		e.preventDefault();
		goto(resolve(`/search?q=${encodeURIComponent(term.trim())}`), { keepFocus: true });
	}
</script>

<svelte:head>
	<title>{q ? `“${q}” — PLY` : 'Search — PLY'}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main id="main" class="wrap">
	<h1>Search the stock book</h1>

	<form onsubmit={submit} role="search">
		<label for="s">Cloth, mill, piece or stock number</label>
		<div class="row">
			<input id="s" type="search" bind:value={term} placeholder="moleskin, Kinross, 07" />
			<button type="submit">Look up</button>
		</div>
	</form>

	{#if q}
		<p class="count" aria-live="polite">
			{hits.length}
			{hits.length === 1 ? 'piece' : 'pieces'} for “{q}”
		</p>

		{#if hits.length}
			<StockLedger items={hits} dense />
		{:else}
			<div class="none">
				<p>Nothing in the book matches that. The list is short — ten pieces — so try a cloth:</p>
				<ul>
					{#each departments as d (d.slug)}
						<li><a href={resolve('/shop/[dept]', { dept: d.slug })}>{d.name}</a></li>
					{/each}
				</ul>
			</div>
		{/if}
	{:else}
		<p class="count">Searches run over piece names, cloths, mills and stock numbers.</p>
	{/if}
</main>

<style>
	main {
		padding: clamp(1.6rem, 4vw, 2.8rem) 0 clamp(3rem, 7vw, 5rem);
	}

	h1 {
		margin: 0 0 1.2rem;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: clamp(1.9rem, 5vw, 3rem);
		letter-spacing: -0.02em;
	}

	label {
		display: block;
		font-size: 0.72rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--muted);
		margin-bottom: 0.45rem;
	}

	.row {
		display: flex;
		gap: 0.5rem;
		max-width: 34rem;
	}

	input {
		flex: 1;
		min-width: 0;
		min-height: 2.9rem;
		border: 1px solid color-mix(in oklch, var(--ink) 30%, transparent);
		background: var(--surface);
		color: var(--ink);
		font: inherit;
		padding: 0 0.7rem;
	}

	button {
		min-height: 2.9rem;
		border: 0;
		background: var(--primary);
		color: var(--on-primary);
		font: inherit;
		font-weight: 700;
		padding: 0 1.1rem;
		cursor: pointer;
	}

	.count {
		margin: 1.4rem 0;
		color: var(--muted);
		font-size: 0.92rem;
	}

	.none {
		padding: 1.2rem;
		background: var(--surface);
		border-left: 3px solid var(--primary);
		max-width: var(--measure);
	}

	.none p {
		margin: 0;
	}

	.none ul {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem 1.2rem;
		list-style: none;
		margin: 0.7rem 0 0;
		padding: 0;
	}

	.none a {
		font-weight: 600;
	}
</style>
