<script lang="ts">
	import './layout.css';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import MobileLoginModal from '$lib/components/MobileLoginModal.svelte';
	import { onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { stock } from '$lib/stock.svelte';
	import { auth } from '$lib/auth.svelte';
	import { BRAND, TAGLINE } from '$lib/brand';

	stock.hydrate();
	auth.hydrate();

	let { children } = $props();

	const isAdmin = $derived(page.url.pathname.startsWith('/admin'));

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
	<MobileLoginModal />
{/if}
