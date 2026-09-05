<script lang="ts">
	import PieceForm from '$lib/components/admin/PieceForm.svelte';
</script>

<svelte:head><title>Post cloth — PLY admin</title></svelte:head>

<header class="head">
	<h1>Post cloth</h1>
	<p>
		A piece needs a cloth, a weight and a description before it can go in the book. The card on the
		right is the real storefront card, drawn from what you type.
	</p>
</header>

<PieceForm />

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
</style>
