<script lang="ts">
	import { resolve } from '$app/paths';
	import ProductCard from '$lib/components/ProductCard.svelte';
	import ClothCanvas from '$lib/components/ClothCanvas.svelte';
	import Rail from '$lib/components/Rail.svelte';
	import { departments, DEPT_WEAVE } from '$lib/catalog';
	import { stock } from '$lib/stock.svelte';
	import { weaveName } from '$lib/weave';

	let { data } = $props();

	const items = $derived(stock.inDept(data.dept.slug));
	const others = $derived(departments.filter((d) => d.slug !== data.dept.slug));
	const elsewhere = $derived(stock.all.filter((p) => p.dept !== data.dept.slug).slice(0, 6));
	const lead = $derived(items[0]);
	// With nothing cut, the header still shows the structure the cloth is known
	// for rather than a dead band of colour.
	const headWeave = $derived(lead?.weave ?? DEPT_WEAVE[data.dept.slug] ?? 'plain');
</script>

<svelte:head>
	<title>{data.dept.name} — PLY</title>
	<meta name="description" content={data.dept.note} />
</svelte:head>

<main id="main">
	<!-- The department opens on its own cloth, alive, at the weight it is cut in. -->
	<section class="head">
		<ClothCanvas
			weave={headWeave}
			threads={104}
			warp="#5c4034"
			weft="#7d5b48"
			drape={0.8}
			label="{weaveName[headWeave]} cloth, moving under the cursor"
		/>
		<div class="over wrap">
			<p class="crumb">
				<a href={resolve('/shop')}>All products</a>
			</p>
			<h1>{data.dept.name}</h1>
			<p class="note">{data.dept.note}</p>
			<p class="meta">
				{#if lead}
					{weaveName[lead.weave]} · {lead.gsm} gsm · {lead.mill}
				{:else}
					{weaveName[headWeave]} · nothing here yet
				{/if}
			</p>
		</div>
	</section>

	<div class="wrap body">
		<p class="count">
			{items.length}
			{items.length === 1 ? 'product' : 'products'} in this fabric
		</p>

		{#if items.length}
			<ul class="grid">
				{#each items as p (p.id)}
					<li><ProductCard product={p} eager /></li>
				{/each}
			</ul>
		{:else}
			<p class="empty">
				Nothing in this fabric right now. Products show up here as soon as you post them.
			</p>
		{/if}

		<nav class="more" aria-label="Other fabrics">
			<p>Other fabrics</p>
			<ul>
				{#each others as d (d.slug)}
					<li><a href={resolve('/shop/[dept]', { dept: d.slug })}>{d.name}</a></li>
				{/each}
			</ul>
		</nav>
	</div>

	{#if elsewhere.length}
		<Rail
			title="More from the shop"
			note="Everything else we make."
			more={{ href: resolve('/shop'), label: 'The whole cut' }}
		>
			{#each elsewhere as p (p.id)}
				<ProductCard product={p} />
			{/each}
		</Rail>
	{/if}
</main>

<style>
	.head {
		position: relative;
		isolation: isolate;
		display: grid;
		align-items: end;
		min-height: 17rem;
		overflow: hidden;
		background: var(--accent);
	}

	.head :global(.cloth-live) {
		position: absolute;
		inset: 0;
		z-index: -1;
	}

	.over {
		padding: 3.5rem 0 1.8rem;
		color: oklch(0.98 0.008 30);
		text-shadow: 0 0.15rem 1.4rem oklch(0.16 0.05 25 / 0.65);
	}

	.crumb {
		margin: 0 0 0.5rem;
		font-size: 0.7rem;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		font-weight: 700;
	}

	.crumb a {
		color: oklch(0.93 0.05 42);
		text-decoration: none;
	}

	h1 {
		margin: 0;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: clamp(2.2rem, 6vw, 3.8rem);
		letter-spacing: -0.03em;
	}

	.note {
		margin: 0.6rem 0 0;
		max-width: 44ch;
		font-size: 1.05rem;
		text-wrap: pretty;
	}

	.meta {
		margin: 0.9rem 0 0;
		font-size: 0.76rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: oklch(1 0 0 / 0.72);
	}

	.body {
		padding: 1.6rem 0 0;
	}

	.count {
		margin: 0 0 1.2rem;
		color: var(--muted);
		font-size: 0.88rem;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 2.4rem var(--grid-gap);
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.empty {
		margin: 2rem 0;
		padding: 1.2rem;
		background: var(--surface);
		border-left: 3px solid var(--primary);
		max-width: var(--measure);
	}

	.more {
		margin-top: 2.6rem;
		padding-top: 1.2rem;
		border-top: 1px solid color-mix(in oklch, var(--ink) 16%, transparent);
	}

	.more p {
		margin: 0 0 0.4rem;
		font-size: 0.7rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--muted);
	}

	.more ul {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem 1.3rem;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.more a {
		display: inline-flex;
		align-items: center;
		min-height: 2.4rem;
		font-weight: 600;
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
