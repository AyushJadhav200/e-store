<script lang="ts">
	import { resolve } from '$app/paths';
	import PieceForm from '$lib/components/admin/PieceForm.svelte';
	import { stock } from '$lib/stock.svelte';

	let { data } = $props();

	const piece = $derived(stock.find(data.id));
</script>

<svelte:head>
	<title>{piece ? `Edit ${piece.name}` : 'Not found'} — PLY admin</title>
</svelte:head>

{#if piece}
	<header class="head">
		<h1>Edit {piece.name}</h1>
		<p>
			Stock {piece.no}.
			{#if stock.isLocal(piece.id)}
				Posted from this dashboard.
			{:else if stock.isEdited(piece.id)}
				Shipped with the shop, changed locally — you can revert it from the stock list.
			{:else}
				Shipped with the shop. Changes are stored as a diff, so nothing is lost.
			{/if}
		</p>
	</header>

	{#key piece.id}
		<PieceForm existing={piece} />
	{/key}
{:else if stock.ready}
	<div class="gone">
		<h1>No such piece</h1>
		<p><a href={resolve('/admin')}>Back to the stock book</a></p>
	</div>
{/if}

<style>
	.head {
		padding: clamp(1rem, 3vw, 2rem) clamp(1rem, 3vw, 2rem) 0;
	}

	h1 {
		font-size: clamp(1.4rem, 3vw, 1.9rem);
	}

	p {
		margin: 0.35rem 0 0;
		max-width: 62ch;
		color: var(--faint);
		font-size: 0.84rem;
	}

	.gone {
		padding: clamp(2rem, 6vw, 4rem);
	}
</style>
