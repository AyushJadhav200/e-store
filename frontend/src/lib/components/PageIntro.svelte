<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Snippet } from 'svelte';
	import Mark from './Mark.svelte';

	let {
		title,
		standfirst = '',
		children
	}: { title: string; standfirst?: string; children: Snippet } = $props();
</script>

<header class="page-head wrap">
	<Mark size={52} />
	<p class="crumb"><a href={resolve('/')}>PLY</a> · The shop</p>
	<h1>{title}</h1>
	{#if standfirst}<p class="standfirst">{standfirst}</p>{/if}
</header>

<div class="wrap">
	<div class="prose">
		{@render children()}
	</div>
</div>

<style>
	.page-head {
		padding: clamp(1.6rem, 4vw, 2.6rem) 0 1.1rem;
		border-bottom: 2px solid var(--primary);
		margin-bottom: 1.8rem;
	}

	.page-head :global(.mark) {
		margin-bottom: 0.8rem;
	}

	.crumb {
		margin: 0 0 0.4rem;
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
		font-size: clamp(2rem, 5.5vw, 3.2rem);
		font-weight: 400;
		letter-spacing: -0.02em;
		text-wrap: balance;
	}

	.standfirst {
		margin: 0.8rem 0 0;
		max-width: var(--measure);
		font-size: 1.05rem;
		color: var(--muted);
		text-wrap: pretty;
	}
</style>
