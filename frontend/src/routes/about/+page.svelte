<script lang="ts">
	import { resolve } from '$app/paths';
	import PageIntro from '$lib/components/PageIntro.svelte';
</script>

<main id="main">
	<PageIntro title="About PLY">
		<p>
			PLY is a clothing workshop in Lower Parel, Mumbai. We buy cloth from named mills in the UK,
			Italy and Japan, cut a short run, and sell it ourselves. The name is how yarn is counted: a
			single strand breaks, two twisted together hold. It is the smallest true thing we could name a
			shop after.
		</p>
		<h2>What we sell</h2>
		<p>
			Coats, knit, trousers, shirts and a heavy tee. A short list, never a catalogue. No sneakers,
			no perfume, no collabs. If it is not on <a href={resolve('/shop')}>the list</a>, we are not
			making it this season.
		</p>
		<h2>How it is made</h2>
		<p>
			Patterns are graded in-house. Sewing is done in Mumbai and Tiruppur, in units we visit. Labels
			carry fibre, origin, and care in English. We do not gender the shop; sizes are measurements.
		</p>
		<h2>Company</h2>
		<p>
			PLY Clothing Pvt. Ltd, Unit 4, Sunmill Compound, Lower Parel, Mumbai 400013. This online shop
			is a working storefront for the brand. Email <a href="mailto:hello@ply.example"
				>hello@ply.example</a
			>.
		</p>
	</PageIntro>
</main>
