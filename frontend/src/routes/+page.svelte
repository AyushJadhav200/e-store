<script lang="ts">
	let { data } = $props();

	function formatPrice(cents: number) {
		return new Intl.NumberFormat('en-IN', {
			style: 'currency',
			currency: 'INR'
		}).format(cents / 100);
	}
</script>

<svelte:head>
	<title>E-Store</title>
</svelte:head>

<main class="mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-6 py-12">
	<header class="flex flex-col gap-3">
		<p class="text-sm tracking-wide text-zinc-500 uppercase">Starter catalog</p>
		<h1 class="text-4xl font-semibold tracking-tight">E-Store</h1>
		<p class="max-w-xl text-zinc-600">
			SvelteKit storefront talking to a FastAPI backend. Sample products are served from
			<code class="rounded bg-zinc-100 px-1.5 py-0.5 text-sm">GET /api/products</code>.
		</p>
		<p class="text-sm">
			API:
			{#if data.health}
				<span class="font-medium text-emerald-700">{data.health.status} · {data.health.service}</span>
			{:else}
				<span class="font-medium text-red-700">offline</span>
			{/if}
		</p>
		{#if data.error}
			<p class="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
				{data.error}
			</p>
		{/if}
	</header>

	<section class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
		{#each data.products as product (product.id)}
			<article class="overflow-hidden rounded-xl border border-zinc-200 bg-white">
				<img src={product.image_url} alt={product.name} class="h-48 w-full object-cover" />
				<div class="flex flex-col gap-2 p-4">
					<h2 class="text-lg font-medium">{product.name}</h2>
					<p class="text-sm text-zinc-600">{product.description}</p>
					<p class="text-base font-semibold">{formatPrice(product.price_cents)}</p>
				</div>
			</article>
		{/each}
	</section>
</main>
