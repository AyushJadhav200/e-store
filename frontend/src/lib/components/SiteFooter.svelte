<script lang="ts">
	import { resolve } from '$app/paths';
	import Mark from './Mark.svelte';
	import { departments } from '$lib/catalog';

	const year = new Date().getFullYear();

	/** The footer names a few fabrics and sends the rest to the shop. */
	const shown = departments.slice(0, 8);
</script>

<footer>
	<div class="wrap grid">
		<div class="sign">
			<Mark size={64} />
			<p class="word">PLY</p>
			<p class="line">Good fabric, made up in India. A short list, not a catalogue.</p>
		</div>

		<nav aria-label="Cloths">
			<h2>Fabrics</h2>
			<ul>
				{#each shown as d (d.slug)}
					<li><a href={resolve('/shop/[dept]', { dept: d.slug })}>{d.name}</a></li>
				{/each}
				{#if departments.length > shown.length}
					<li><a href={resolve('/shop')}>All {departments.length} fabrics</a></li>
				{/if}
			</ul>
		</nav>

		<nav aria-label="Buying">
			<h2>Help</h2>
			<ul>
				<li><a href={resolve('/shop')}>All products</a></li>
				<li><a href={resolve('/saved')}>Saved</a></li>
				<li><a href={resolve('/size-guide')}>Size guide</a></li>
				<li><a href={resolve('/shipping')}>Shipping</a></li>
				<li><a href={resolve('/returns')}>Returns</a></li>
				<li><a href={resolve('/care')}>Care</a></li>
				<li><a href={resolve('/faq')}>FAQ</a></li>
			</ul>
		</nav>

		<nav aria-label="The shop">
			<h2>Company</h2>
			<ul>
				<li><a href={resolve('/about')}>About</a></li>
				<li><a href={resolve('/contact')}>Contact</a></li>
				<li><a href={resolve('/terms')}>Terms</a></li>
				<li><a href={resolve('/privacy')}>Privacy</a></li>
			</ul>
		</nav>
	</div>

	<p class="foot wrap">
		© {year} PLY. Prices include GST. Measurements you enter stay on your own device.
	</p>
</footer>

<style>
	footer {
		border-top: 2px solid var(--primary);
		margin-top: clamp(2rem, 6vw, 4rem);
		padding: clamp(1.8rem, 4vw, 2.8rem) 0 max(1.6rem, env(safe-area-inset-bottom));
		background: var(--surface);
	}

	.grid {
		display: grid;
		gap: 1.8rem 2rem;
	}

	.sign :global(.mark) {
		margin-bottom: 0.6rem;
	}

	.word {
		margin: 0;
		font-family: var(--font-sans);
		font-weight: 800;
		font-size: 1.6rem;
		letter-spacing: 0.02em;
		text-transform: uppercase;
		color: var(--primary);
		line-height: 1;
	}

	.line {
		margin: 0.4rem 0 0;
		color: var(--muted);
		font-size: 0.88rem;
		max-width: 26ch;
		text-wrap: pretty;
	}

	h2 {
		margin: 0 0 0.4rem;
		font-family: var(--font-sans);
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--muted);
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	a {
		display: inline-flex;
		align-items: center;
		min-height: 2.2rem;
		color: var(--ink);
		text-decoration: none;
		font-weight: 600;
		font-size: 0.92rem;
	}

	a:hover {
		color: var(--primary);
		text-decoration: underline;
		text-underline-offset: 0.2em;
	}

	.foot {
		margin: 2rem auto 0;
		padding-top: 1rem;
		border-top: 1px solid color-mix(in oklch, var(--ink) 12%, transparent);
		color: var(--muted);
		font-size: 0.82rem;
	}

	@media (min-width: 720px) {
		.grid {
			grid-template-columns: 1.4fr repeat(3, 1fr);
		}
	}
</style>
