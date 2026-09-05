<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import ProductCard from '$lib/components/ProductCard.svelte';
	import { stock } from '$lib/stock.svelte';
	import { saved } from '$lib/saved.svelte';

	onMount(() => saved.hydrate());

	const kept = $derived(stock.all.filter((p) => saved.ids.includes(p.id)));
</script>

<svelte:head>
	<title>Saved — PLY</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main id="main" class="wrap">
	<p class="crumb"><a href={resolve('/')}>PLY</a> · Saved</p>
	<h1>Saved</h1>
	<p class="lede">
		Pieces you have set aside. Held in this browser only — nothing is sent to us, and nothing is
		reserved against stock.
	</p>

	{#if !saved.ready}
		<p class="quiet">Loading…</p>
	{:else if kept.length === 0}
		<div class="empty">
			<p>Nothing saved yet.</p>
			<p class="quiet">Tap the heart on any product and it will wait for you here.</p>
			<a class="cta" href={resolve('/shop')}>Shop all products</a>
		</div>
	{:else}
		<p class="count" aria-live="polite">
			{kept.length}
			{kept.length === 1 ? 'product' : 'products'}
		</p>
		<ul class="grid">
			{#each kept as p (p.id)}
				<li><ProductCard product={p} /></li>
			{/each}
		</ul>
	{/if}
</main>

<style>
	main {
		padding: clamp(1.4rem, 3.5vw, 2.4rem) 0 clamp(3rem, 7vw, 5rem);
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
		margin: 0.6rem 0 1.6rem;
		max-width: var(--measure);
		color: var(--muted);
		text-wrap: pretty;
	}

	.count {
		margin: 0 0 1.2rem;
		color: var(--muted);
		font-size: 0.88rem;
	}

	.empty {
		max-width: var(--measure);
	}

	.empty p {
		margin: 0 0 0.5rem;
		font-size: 1.05rem;
	}

	.quiet {
		color: var(--muted);
		font-size: 0.92rem;
	}

	.cta {
		display: inline-flex;
		align-items: center;
		min-height: 3rem;
		margin-top: 1rem;
		padding: 0 1.3rem;
		background: var(--primary);
		color: var(--on-primary);
		text-decoration: none;
		font-weight: 700;
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
