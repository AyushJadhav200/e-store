<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import { onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { stock } from '$lib/stock.svelte';
	import { BRAND, TAGLINE, title } from '$lib/brand';

	// The working stock book is read by every storefront page, so it is opened once here.
	stock.hydrate();

	let { children } = $props();

	// The dashboard brings its own shell. The root layout always applies in
	// SvelteKit, so the shop chrome is skipped here rather than escaped.
	const isAdmin = $derived(page.url.pathname.startsWith('/admin'));

	// Cross-fade between pages where the browser supports it, so moving through
	// the stock book feels like turning pages rather than reloading a catalogue.
	onNavigate((navigation) => {
		if (!document.startViewTransition) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<svelte:head>
	<title>{BRAND} — {TAGLINE}</title>
	<meta
		name="description"
		content="{BRAND} — Timeless Style. Defining You. Discover our luxury collection."
	/>
	<link rel="icon" href="/velcello-logo.jpg" />
	<meta name="theme-color" content="#f7efec" />
</svelte:head>

{#if isAdmin}
	{@render children()}
{:else}
	<a class="skip-link" href="#main">Skip to content</a>
	<SiteHeader />
	{@render children()}
	<SiteFooter />
{/if}
