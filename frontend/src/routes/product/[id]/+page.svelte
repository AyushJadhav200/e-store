<script lang="ts">
	import { resolve } from '$app/paths';
	import ProductView from '$lib/components/ProductView.svelte';
	import ProductCard from '$lib/components/ProductCard.svelte';
	import Rail from '$lib/components/Rail.svelte';
	import { deptName } from '$lib/catalog';
	import { stock } from '$lib/stock.svelte';

	let { data } = $props();

	const product = $derived(stock.find(data.id));

	// Same cloth first, then the rest of the book.
	const nearby = $derived(
		product
			? [...stock.all]
					.filter((p) => p.id !== product.id)
					.sort((a, b) => Number(b.dept === product.dept) - Number(a.dept === product.dept))
					.slice(0, 6)
			: []
	);
</script>

<svelte:head>
	<title>{product ? `${product.name} — PLY` : 'Not in the book — PLY'}</title>
	{#if product}
		<meta
			name="description"
			content="{product.name}. {product.cloth}, {product.gsm} gsm, from {product.mill}. {product.hand}"
		/>
	{/if}
</svelte:head>

{#if product}
	<ProductView {product} />

	{#if nearby.length}
		<Rail
			title="You may also like"
			note="{deptName(product.dept)} first."
			more={{ href: resolve('/shop'), label: 'The whole cut' }}
		>
			{#each nearby as p (p.id)}
				<ProductCard product={p} />
			{/each}
		</Rail>
	{/if}
{:else if stock.ready}
	<main id="main" class="wrap gone">
		<h1>Product not found</h1>
		<p>
			Stock <strong>{data.id}</strong> is not in the cut. It may have been pulled when the roll ran out.
		</p>
		<p><a href={resolve('/shop')}>Shop all products</a></p>
	</main>
{/if}

<style>
	.gone {
		padding: clamp(3rem, 8vw, 6rem) 0;
	}

	.gone h1 {
		margin: 0 0 0.8rem;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: clamp(2rem, 5vw, 3rem);
	}

	.gone p {
		margin: 0 0 0.6rem;
		max-width: var(--measure);
		color: var(--muted);
	}
</style>
