<script lang="ts">
	import { resolve } from '$app/paths';
	import ProductCard from '$lib/components/ProductCard.svelte';
	import StockLedger from '$lib/components/StockLedger.svelte';
	import { departments, deptName } from '$lib/catalog';
	import { stock } from '$lib/stock.svelte';

	type Order = 'no' | 'low' | 'high' | 'gsm';

	let order = $state<Order>('no');
	let cloth = $state('all');
	let view = $state<'grid' | 'ledger'>('grid');

	const labels: Record<Order, string> = {
		no: 'Newest first',
		low: 'Price: low to high',
		high: 'Price: high to low',
		gsm: 'Heaviest fabric'
	};

	const shown = $derived(
		(cloth === 'all' ? stock.all : stock.inDept(cloth)).toSorted((a, b) => {
			if (order === 'low') return a.price - b.price;
			if (order === 'high') return b.price - a.price;
			if (order === 'gsm') return b.gsm - a.gsm;
			// Newest first: the highest stock number is the most recently posted.
			return b.no.localeCompare(a.no, undefined, { numeric: true });
		})
	);
</script>

<svelte:head>
	<title>Stock book — PLY</title>
	<meta
		name="description"
		content="Every piece PLY currently cuts: mill, cloth weight, weave and price."
	/>
</svelte:head>

<main id="main">
	<div class="wrap top">
		<p class="crumb"><a href={resolve('/')}>PLY</a> · All products</p>
		<h1>All products</h1>
		<p class="lede">
			{stock.all.length}
			{stock.all.length === 1 ? 'product' : 'products'} across {departments.length} fabrics. Nothing here
			is seasonal — a piece leaves when the fabric runs out.
		</p>
	</div>

	<!-- Filter bar: chips for cloth, a select for order, and the view switch that
	     swaps the retail grid for the shop's own ledger. -->
	<div class="bar">
		<div class="wrap inner">
			<div class="chips" role="group" aria-label="Fabric">
				<button type="button" class:on={cloth === 'all'} onclick={() => (cloth = 'all')}>
					All <span>{stock.all.length}</span>
				</button>
				{#each departments as d (d.slug)}
					<button type="button" class:on={cloth === d.slug} onclick={() => (cloth = d.slug)}>
						{d.name} <span>{stock.inDept(d.slug).length}</span>
					</button>
				{/each}
			</div>

			<div class="right">
				<label class="sort">
					<span>Order</span>
					<select bind:value={order}>
						{#each Object.keys(labels) as key (key)}
							<option value={key}>{labels[key as Order]}</option>
						{/each}
					</select>
				</label>

				<div class="views" role="group" aria-label="View">
					<button type="button" class:on={view === 'grid'} onclick={() => (view = 'grid')}>
						Grid
					</button>
					<button type="button" class:on={view === 'ledger'} onclick={() => (view = 'ledger')}>
						Ledger
					</button>
				</div>
			</div>
		</div>
	</div>

	<div class="wrap body">
		<p class="count" aria-live="polite">
			{shown.length}
			{shown.length === 1 ? 'product' : 'products'}{cloth === 'all' ? '' : ` in ${deptName(cloth)}`}
		</p>

		{#if !shown.length}
			<div class="empty">
				<h2>{stock.all.length ? 'Nothing in this fabric' : 'No products yet'}</h2>
				<p>
					{stock.all.length
						? 'Nothing in this fabric right now. Try another, or see everything.'
						: 'We are between cuts. New pieces go up here as soon as the cloth is made up.'}
				</p>
				<p class="acts">
					{#if stock.all.length}
						<button class="cta" type="button" onclick={() => (cloth = 'all')}>See everything</button
						>
					{:else}
						<a class="cta" href={resolve('/contact')}>Ask us what is coming</a>
					{/if}
				</p>
			</div>
		{:else if view === 'grid'}
			<ul class="grid">
				{#each shown as p (p.id)}
					<li><ProductCard product={p} /></li>
				{/each}
			</ul>
		{:else}
			<StockLedger items={shown} />
		{/if}
	</div>
</main>

<style>
	.top {
		padding: clamp(1.4rem, 3.5vw, 2.4rem) 0 1.2rem;
	}

	.crumb {
		margin: 0 0 0.5rem;
		font-size: 0.72rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--muted);
		font-weight: 700;
	}

	.crumb a {
		text-decoration: none;
	}

	h1 {
		margin: 0;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: clamp(2rem, 5.5vw, 3.4rem);
		letter-spacing: -0.025em;
	}

	.lede {
		margin: 0.6rem 0 0;
		max-width: var(--measure);
		color: var(--muted);
		text-wrap: pretty;
	}

	.bar {
		position: sticky;
		top: 3.6rem;
		z-index: 10;
		background: var(--surface);
		border-block: 1px solid color-mix(in oklch, var(--ink) 14%, transparent);
	}

	.inner {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.6rem 1.2rem;
		padding: 0.6rem 0;
	}

	.chips {
		display: flex;
		gap: 0.4rem;
		overflow-x: auto;
		scrollbar-width: none;
		margin-inline: calc(var(--page-pad) * -1);
		padding-inline: var(--page-pad);
	}

	.chips::-webkit-scrollbar {
		display: none;
	}

	.chips button {
		flex: none;
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		min-height: 2.4rem;
		padding: 0 0.75rem;
		border: 1px solid color-mix(in oklch, var(--ink) 20%, transparent);
		border-radius: 999px;
		background: var(--bg);
		color: var(--ink);
		font: inherit;
		font-size: 0.85rem;
		font-weight: 600;
		cursor: pointer;
		white-space: nowrap;
	}

	.chips button span {
		color: var(--muted);
		font-size: 0.72rem;
		font-variant-numeric: tabular-nums;
	}

	.chips button.on {
		background: var(--primary);
		border-color: var(--primary);
		color: var(--on-primary);
	}

	.chips button.on span {
		color: color-mix(in oklch, var(--on-primary) 75%, transparent);
	}

	.right {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-left: auto;
	}

	.sort {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.8rem;
	}

	.sort span {
		color: var(--muted);
		letter-spacing: 0.1em;
		text-transform: uppercase;
		font-weight: 700;
		font-size: 0.68rem;
	}

	select {
		min-height: 2.4rem;
		border: 1px solid color-mix(in oklch, var(--ink) 20%, transparent);
		background: var(--bg);
		color: var(--ink);
		font: inherit;
		font-size: 0.85rem;
		font-weight: 600;
		padding: 0 0.5rem;
	}

	.views {
		display: flex;
	}

	.views button {
		min-height: 2.4rem;
		padding: 0 0.7rem;
		border: 1px solid color-mix(in oklch, var(--ink) 20%, transparent);
		background: var(--bg);
		color: var(--muted);
		font: inherit;
		font-size: 0.8rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		cursor: pointer;
	}

	.views button + button {
		border-left: 0;
	}

	.views button.on {
		background: var(--ink);
		border-color: var(--ink);
		color: var(--bg);
	}

	.body {
		padding: 1rem 0 clamp(3rem, 7vw, 5rem);
	}

	.count {
		margin: 0 0 1.2rem;
		color: var(--muted);
		font-size: 0.88rem;
	}

	.empty {
		max-width: var(--measure);
		padding: 2rem 0 3rem;
	}

	.empty h2 {
		margin: 0 0 0.6rem;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: clamp(1.5rem, 3.5vw, 2.1rem);
	}

	.empty p {
		margin: 0;
		color: var(--muted);
		text-wrap: pretty;
	}

	.empty .acts {
		margin-top: 1.2rem;
	}

	.cta {
		display: inline-flex;
		align-items: center;
		min-height: 3rem;
		padding: 0 1.3rem;
		border: 0;
		background: var(--primary);
		color: var(--on-primary);
		text-decoration: none;
		font: inherit;
		font-weight: 700;
		cursor: pointer;
	}

	.cta:hover {
		background: var(--accent);
		color: var(--on-primary);
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 2.4rem var(--grid-gap);
		list-style: none;
		margin: 0;
		padding: 0;
	}

	@media (min-width: 700px) {
		.grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}

	@media (min-width: 1000px) {
		.grid {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
	}
</style>
