<script lang="ts">
	import './admin.css';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { stock } from '$lib/stock.svelte';
	import { BRAND } from '$lib/brand';

	let { children } = $props();

	stock.hydrate();

	const here = $derived(page.url.pathname);
	const on = (path: string) => here === path || here.startsWith(path + '/');
</script>

<svelte:head>
	<meta name="robots" content="noindex, nofollow" />
	<meta name="theme-color" content="#22252c" />
</svelte:head>

<div class="admin">
	<header class="top">
		<a class="brand" href={resolve('/admin')}>
			<span class="glyph" aria-hidden="true"></span>
			<span>{BRAND}<em>/admin</em></span>
		</a>

		<nav>
			<a href={resolve('/admin')} aria-current={here === '/admin' ? 'page' : undefined}>Stock</a>
			<a href={resolve('/admin/new')} aria-current={on('/admin/new') ? 'page' : undefined}>
				Post cloth
			</a>
			<a href={resolve('/admin/data')} aria-current={on('/admin/data') ? 'page' : undefined}>
				Data
			</a>
		</nav>

		<div class="right">
			{#if stock.changed}
				<span class="dirty num">{stock.changed} local change{stock.changed === 1 ? '' : 's'}</span>
			{/if}
		</div>
	</header>

	<!-- Said once, at the top: nothing here reaches a server. -->
	<p class="notice">
		Local dashboard. Everything you post is saved in this browser and rendered by the storefront
		immediately — it is not sent anywhere and nobody else can see it.
	</p>

	{@render children()}
</div>

<style>
	.top {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.8rem 1.6rem;
		padding: 0.7rem clamp(1rem, 3vw, 2rem);
		background: var(--panel);
		border-bottom: 1px solid var(--line);
		position: sticky;
		top: 0;
		z-index: 20;
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
		font-weight: 800;
		font-size: 1.05rem;
		letter-spacing: 0.02em;
		text-decoration: none;
	}

	.brand em {
		font-style: normal;
		font-weight: 400;
		color: var(--faint);
	}

	/* The ply twist, flattened to a monochrome tile for a tool bar. */
	.glyph {
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 5px;
		background:
			radial-gradient(circle at 30% 25%, oklch(0.66 0.18 30), oklch(0.45 0.16 26)), var(--brand);
		position: relative;
		overflow: hidden;
	}

	.glyph::before,
	.glyph::after {
		content: '';
		position: absolute;
		inset: -20% 34%;
		border-radius: 999px;
		background: oklch(0.97 0.01 40);
	}

	.glyph::before {
		transform: rotate(24deg);
	}

	.glyph::after {
		transform: rotate(-24deg);
		clip-path: inset(52% 0 0 0);
	}

	nav {
		display: flex;
		gap: 0.25rem;
		margin-right: auto;
	}

	nav a {
		display: inline-flex;
		align-items: center;
		min-height: 2.2rem;
		padding: 0 0.7rem;
		border-radius: 4px;
		color: var(--dim);
		text-decoration: none;
		font-weight: 600;
		font-size: 0.85rem;
	}

	nav a:hover {
		background: var(--raised);
		color: var(--ink);
	}

	nav a[aria-current='page'] {
		background: var(--raised);
		color: var(--ink);
		box-shadow: inset 0 -2px 0 var(--brand);
	}

	.right {
		display: flex;
		align-items: center;
		gap: 0.7rem;
	}

	.dirty {
		font-size: 0.72rem;
		color: var(--warn);
	}

	.notice {
		margin: 0;
		padding: 0.5rem clamp(1rem, 3vw, 2rem);
		background: color-mix(in oklch, var(--brand) 12%, var(--bg));
		border-bottom: 1px solid var(--line);
		color: var(--dim);
		font-size: 0.78rem;
	}
</style>
