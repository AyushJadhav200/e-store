<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import { onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { stock } from '$lib/stock.svelte';

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
	<title>PLY</title>
	<meta
		name="description"
		content="PLY sells a short list of clothes cut from named mill cloth. Weight, weave and mill published for every piece."
	/>
	<link rel="icon" href={favicon} />
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
