<script lang="ts">
	import { resolve } from '$app/paths';
	import HeroCarousel, { type Slide } from '$lib/components/HeroCarousel.svelte';
	import ProductCard from '$lib/components/ProductCard.svelte';
	import ClothCanvas from '$lib/components/ClothCanvas.svelte';
	import { departments } from '$lib/catalog';
	import { stock } from '$lib/stock.svelte';

	const slides: Slide[] = [
		{
			key: 'roll',
			eyebrow: 'Spun, not printed',
			title: 'Two plies hold.',
			tail: 'One lets go.',
			line: 'A short list, cut from named mill cloth and made up here. Weight, weave and mill published for every piece.',
			href: resolve('/shop'),
			cta: 'Shop all products',
			weave: 'twill',
			warp: '#9b3021',
			weft: '#cf4b34',
			spine: 'The roll'
		},
		{
			key: 'coating',
			eyebrow: 'Coating · 740 gsm',
			title: 'Milled until the',
			tail: 'twill closes up.',
			line: 'Heavy milled wool, cut to layer a knit underneath rather than to fill a rail. Weight and mill published against every coat.',
			href: resolve('/shop/[dept]', { dept: 'coating' }),
			cta: 'Shop coating',
			weave: 'herringbone',
			warp: '#7a2a24',
			weft: '#ad4739',
			spine: 'Coating'
		},
		{
			key: 'knit',
			eyebrow: 'Knit · fully fashioned',
			title: 'Knitted to shape,',
			tail: 'not cut from a sheet.',
			line: 'Fully fashioned, knitted to shape instead of cut from a sheet. The rib recovers rather than stretching out at the cuff.',
			href: resolve('/shop/[dept]', { dept: 'knit' }),
			cta: 'Shop knit',
			weave: 'rib',
			warp: '#a04a2e',
			weft: '#cf7551',
			spine: 'Knit'
		},
		{
			key: 'trousering',
			eyebrow: 'Trousering · hems unfinished',
			title: 'Sueded until the',
			tail: 'weave disappears.',
			line: 'Moleskin and cavalry twill, hems sent out unfinished. Cloth that marks where you wear it and then keeps the mark.',
			href: resolve('/shop/[dept]', { dept: 'trousering' }),
			cta: 'Shop trousering',
			weave: 'moleskin',
			warp: '#8f5a2f',
			weft: '#c48c53',
			spine: 'Trousering'
		}
	];

	// Highest stock number is the most recently posted, so the newest piece leads.
	// Highest stock number is the most recently posted, so the newest piece leads.
	const newest = $derived([...stock.all].reverse());

	/** How many the front page shows before sending you to the full list. */
	const SHOWN = 15;

	let tab = $state('new');

	// Only fabrics with something in them get a chip — an empty filter is a dead end.
	const tabs = $derived([
		{ key: 'new', label: 'New', count: stock.all.length },
		...departments
			.map((d) => ({ key: d.slug, label: d.name, count: stock.inDept(d.slug).length }))
			.filter((t) => t.count > 0)
	]);

	const picked = $derived(tab === 'new' ? newest : newest.filter((p) => p.dept === tab));
	const grid = $derived(picked.slice(0, SHOWN));
</script>

<svelte:head>
	<title>PLY — cloth, cut short</title>
	<meta
		name="description"
		content="PLY sells a short list of clothes cut from named mill cloth. Ten pieces, one wardrobe, every weight and weave published."
	/>
</svelte:head>

<main id="main">
	<HeroCarousel {slides} />

	{#if stock.all.length}
		<section class="picks wrap">
			<div class="chips" role="group" aria-label="Filter products">
				{#each tabs as t (t.key)}
					<button type="button" class:on={tab === t.key} onclick={() => (tab = t.key)}>
						{t.label}
					</button>
				{/each}
			</div>

			<ul class="grid">
				{#each grid as p, n (p.id)}
					<li><ProductCard product={p} eager={n < 4} /></li>
				{/each}
			</ul>

			{#if picked.length > SHOWN}
				<p class="more">
					<a class="cta dark" href={resolve('/shop')}>
						See all {picked.length} products
					</a>
				</p>
			{/if}
		</section>
	{:else}
		<!-- An open shop with nothing in it says so, rather than showing empty rows. -->
		<section class="waiting wrap">
			<p class="eyebrow dark">Nothing here yet</p>
			<h2>No products yet.</h2>
			<p class="lede">
				We are between cuts. Nothing is in the shop at the moment — new pieces go up here as soon as
				the cloth is made up.
			</p>
			<p class="acts">
				<a class="cta dark" href={resolve('/about')}>About us</a>
				<a class="quiet dark" href={resolve('/contact')}>Ask us what is coming</a>
			</p>
		</section>
	{/if}

	<!-- Departments are cloth. Each tile carries the structure it is named for. -->
	<section class="cloths wrap">
		<header class="head">
			<h2>Shop by fabric</h2>
			<p>Sorted by what it is made of, not who wears it.</p>
		</header>

		<ul>
			{#each departments as d (d.slug)}
				{@const inside = stock.inDept(d.slug)}
				<li>
					<a href={resolve('/shop/[dept]', { dept: d.slug })}>
						<span class="tile">
							{#if inside.at(-1)}
								<img src={inside.at(-1)!.photo} alt="" width="600" height="800" loading="lazy" />
							{:else}
								<span class="none">Empty</span>
							{/if}
						</span>
						<strong>{d.name}</strong>
						<small>{inside.length} {inside.length === 1 ? 'product' : 'products'}</small>
					</a>
				</li>
			{/each}
		</ul>
	</section>

	<!-- A banner in the shape a shop uses for an offer, carrying a promise instead. -->
	<section class="banner">
		<ClothCanvas weave="plain" threads={96} warp="#6b3a2c" weft="#8f5340" drape={0.7} />
		<div class="banner-over wrap">
			<p class="eyebrow">Plainly stated</p>
			<h2>Sizes, delivery, returns and care — always one click away.</h2>
			<p class="acts">
				<a class="cta" href={resolve('/size-guide')}>Size guide</a>
				<a class="cta ghost" href={resolve('/returns')}>Returns</a>
				<a class="cta ghost" href={resolve('/care')}>Care</a>
			</p>
		</div>
	</section>
</main>

<style>
	.picks {
		padding: clamp(3rem, 7vw, 5.5rem) 0 0;
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.5rem;
		margin-bottom: clamp(1.8rem, 3.5vw, 2.6rem);
	}

	.chips button {
		min-height: 2.5rem;
		padding: 0 1rem;
		border: 1px solid color-mix(in oklch, var(--ink) 20%, transparent);
		border-radius: 999px;
		background: var(--bg);
		color: var(--ink);
		font: inherit;
		font-size: 0.88rem;
		font-weight: 600;
		cursor: pointer;
		transition:
			background-color 0.15s,
			border-color 0.15s;
	}

	.chips button:hover {
		border-color: var(--ink);
	}

	.chips button.on {
		background: var(--ink);
		border-color: var(--ink);
		color: var(--bg);
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 2.4rem var(--grid-gap);
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.more {
		margin: clamp(2.4rem, 5vw, 3.5rem) 0 0;
		text-align: center;
	}

	/* LV's outline pill, not a filled block. */
	.more .cta {
		background: transparent;
		border: 1px solid color-mix(in oklch, var(--ink) 45%, transparent);
		border-radius: 999px;
		color: var(--ink);
		padding: 0 2rem;
		min-height: 3rem;
		font-weight: 500;
		letter-spacing: 0.01em;
	}

	.more .cta:hover {
		background: var(--ink);
		border-color: var(--ink);
		color: var(--bg);
	}

	.cloths {
		padding: clamp(3.5rem, 8vw, 6rem) 0 0;
	}

	/* Section headings sit centred over the grid, as they do on LV. */
	.head {
		display: grid;
		justify-items: center;
		text-align: center;
		gap: 0.35rem;
		margin-bottom: clamp(1.8rem, 3.5vw, 2.6rem);
	}

	h2 {
		margin: 0;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: clamp(1.5rem, 3.4vw, 2.2rem);
		letter-spacing: -0.015em;
		text-wrap: balance;
	}

	.head p {
		margin: 0;
		color: var(--muted);
		font-size: 0.9rem;
	}

	/* .wrap centres its own box, so a max-width here would centre the copy
	   instead of leaving it under the heading. The children hold the measure. */
	.waiting {
		padding: clamp(2.6rem, 7vw, 4.5rem) 0 0;
	}

	.waiting h2 {
		max-width: 18ch;
		font-size: clamp(1.9rem, 4.5vw, 3rem);
	}

	.waiting .lede {
		margin: 0.8rem 0 0;
		max-width: 52ch;
		color: var(--muted);
		text-wrap: pretty;
	}

	.eyebrow.dark {
		color: var(--primary);
		text-shadow: none;
	}

	.waiting .acts {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.8rem 1.4rem;
		margin: 1.5rem 0 0;
	}

	.cta.dark {
		background: var(--primary);
		color: var(--on-primary);
	}

	.cta.dark:hover {
		background: var(--accent);
		color: var(--on-primary);
	}

	.quiet.dark {
		color: var(--ink);
		font-weight: 600;
		text-underline-offset: 0.25em;
	}

	.cloths ul {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 2rem var(--grid-gap);
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.cloths a {
		display: grid;
		gap: 0.1rem;
		color: var(--ink);
		text-decoration: none;
		text-align: center;
	}

	.tile {
		display: grid;
		place-items: center;
		aspect-ratio: 4 / 5;
		margin-bottom: 0.7rem;
		overflow: hidden;
		background: var(--surface);
		border: 1px solid color-mix(in oklch, var(--ink) 14%, transparent);
		transition:
			border-color 0.2s,
			transform 0.35s var(--ease-out-expo);
	}

	.tile img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.none {
		font-size: 0.7rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--muted);
	}

	.cloths a:hover .tile {
		border-color: var(--primary);
		transform: translateY(-3px);
	}

	.cloths strong {
		font-family: var(--font-display);
		font-weight: 500;
		font-size: 1.05rem;
	}

	.cloths small {
		color: var(--muted);
		font-size: 0.78rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	/* Full-bleed, edge to edge, the way LV runs an editorial panel. */
	.banner {
		position: relative;
		isolation: isolate;
		margin-top: clamp(3.5rem, 8vw, 6rem);
		min-height: clamp(20rem, 46vw, 34rem);
		display: grid;
		align-items: center;
		overflow: hidden;
		background: var(--accent);
	}

	.banner :global(.cloth-live) {
		position: absolute;
		inset: 0;
		z-index: -1;
	}

	.banner-over {
		padding: 3rem 0;
		text-align: center;
		justify-items: center;
		display: grid;
		color: oklch(0.98 0.008 30);
		text-shadow: 0 0.15rem 1.4rem oklch(0.16 0.05 25 / 0.6);
	}

	.eyebrow {
		margin: 0 0 0.6rem;
		font-size: 0.7rem;
		letter-spacing: 0.24em;
		text-transform: uppercase;
		font-weight: 700;
		color: oklch(0.93 0.05 42);
	}

	.banner-over h2 {
		max-width: 24ch;
		font-size: clamp(1.5rem, 3.6vw, 2.4rem);
	}

	.banner-over .acts {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.6rem;
		margin: 1.6rem 0 0;
	}

	.cta {
		display: inline-flex;
		align-items: center;
		min-height: 2.9rem;
		padding: 0 1.1rem;
		background: oklch(0.98 0.008 30);
		color: oklch(0.31 0.13 27);
		text-decoration: none;
		font-weight: 700;
		font-size: 0.92rem;
		text-shadow: none;
	}

	.cta.ghost {
		background: transparent;
		color: oklch(0.98 0.008 30);
		border: 1px solid oklch(1 0 0 / 0.5);
	}

	.cta.ghost:hover {
		border-color: oklch(0.98 0.008 30);
		background: oklch(1 0 0 / 0.1);
	}

	@media (min-width: 700px) {
		.grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}

		.cloths ul {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
	}

	@media (min-width: 1000px) {
		.grid {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}

		.cloths ul {
			grid-template-columns: repeat(5, minmax(0, 1fr));
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.cloths a:hover .tile {
			transform: none;
		}
	}
</style>
