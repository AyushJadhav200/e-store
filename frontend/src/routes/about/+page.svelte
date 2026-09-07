<script lang="ts">
	import { resolve } from '$app/paths';
	import PageIntro from '$lib/components/PageIntro.svelte';
	import { BRAND, TAGLINE, EMAIL } from '$lib/brand';
</script>

<svelte:head>
	<title>About {BRAND} — {TAGLINE}</title>
</svelte:head>

<main id="main">
	<PageIntro title="About {BRAND}">
		<p>
			{BRAND} is a luxury clothing design house. We curate timeless styles and premium craftsmanship,
			embodying "{TAGLINE}".
		</p>
		<h2>What we sell</h2>
		<p>
			Coats, knits, trousers, shirts and elevated basics. A refined collection crafted for durability and timeless elegance.
			Explore <a href={resolve('/shop')}>our full collection</a>.
		</p>
		<h2>How it is made</h2>
		<p>
			Patterns are meticulously engineered in-house with sustainable practices and top-tier textile mills.
			Every garment carries full origin and care transparency.
		</p>
		<h2>Company</h2>
		<p>
			{BRAND} Fashion Pvt. Ltd. Email <a href="mailto:{EMAIL}">{EMAIL}</a>.
		</p>
	</PageIntro>
</main>
