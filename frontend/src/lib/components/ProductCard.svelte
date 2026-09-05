<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { inr, deptName, laddersOnWaist, TYPE_NAME, FIT_NOTE, type Product } from '$lib/catalog';
	import { fit } from '$lib/fit.svelte';
	import { saved } from '$lib/saved.svelte';
	import Flat from './Flat.svelte';

	let { product, eager = false }: { product: Product; eager?: boolean } = $props();

	onMount(() => saved.hydrate());

	const verdict = $derived(fit.ready ? fit.verdict(product) : null);
	const on = $derived(saved.ready && saved.has(product.id));
</script>

<article class="card">
	<div class="shot">
		<a class="hit" href={resolve('/product/[id]', { id: product.id })} aria-label={product.name}>
			<img
				src={product.photo}
				alt={product.alt}
				width="900"
				height="1200"
				loading={eager ? 'eager' : 'lazy'}
			/>
			<!-- Hover turns the photograph over to the cut, the way you would turn a
			     garment on the rail to look at the make. -->
			<span class="turn" aria-hidden="true">
				<Flat kind={product.flat} weave={product.weave} pitch={8} label="" />
			</span>
		</a>

		<p class="fit">{FIT_NOTE[product.flat]}</p>

		<button
			class="save"
			type="button"
			aria-pressed={on}
			aria-label={on ? `Remove ${product.name} from saved` : `Save ${product.name}`}
			onclick={() => saved.toggle(product.id)}
		>
			<svg viewBox="0 0 24 24" aria-hidden="true">
				<path
					d="M12 20.2 4.6 13a4.6 4.6 0 0 1 6.5-6.5l.9.9.9-.9A4.6 4.6 0 1 1 19.4 13Z"
					fill={on ? 'currentColor' : 'none'}
				/>
			</svg>
		</button>

		<p class="cloth-chip">
			<span>{product.gsm} gsm</span>
			<span>{product.cloth}</span>
		</p>

		{#if verdict}
			<p class="yours">Your {laddersOnWaist(product) ? 'waist' : 'chest'}: {verdict.size}</p>
		{/if}
	</div>

	<a class="say" href={resolve('/product/[id]', { id: product.id })}>
		<h3>{deptName(product.dept)}: {product.name}</h3>
		<p class="type">{TYPE_NAME[product.flat]}</p>
		<p class="price">{inr(product.price)}</p>
	</a>
</article>

<style>
	.card {
		min-width: 0;
	}

	.shot {
		position: relative;
		aspect-ratio: 4 / 5;
		overflow: hidden;
		background: var(--surface);
	}

	.hit {
		position: absolute;
		inset: 0;
		display: block;
	}

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		transition: transform 0.7s var(--ease-out-expo);
	}

	.turn {
		position: absolute;
		inset: 0;
		opacity: 0;
		transition: opacity 0.32s var(--ease-out-expo);
	}

	.hit:hover .turn,
	.hit:focus-visible .turn {
		opacity: 1;
	}

	.hit:hover img {
		transform: scale(1.03);
	}

	/* How it is cut, set straight onto the shot with no chip behind it. */
	.fit {
		position: absolute;
		top: 0.6rem;
		left: 0.7rem;
		margin: 0;
		max-width: 5.5rem;
		font-size: 0.62rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		line-height: 1.25;
		text-transform: uppercase;
		color: oklch(0.99 0 0);
		text-shadow: 0 1px 6px oklch(0.2 0.03 25 / 0.7);
		pointer-events: none;
	}

	.save {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		width: 2rem;
		height: 2rem;
		display: grid;
		place-items: center;
		border: 0;
		border-radius: 50%;
		background: oklch(1 0 0 / 0.72);
		color: var(--primary);
		cursor: pointer;
		padding: 0;
		backdrop-filter: blur(4px);
		transition: background-color 0.2s;
	}

	.save:hover {
		background: oklch(1 0 0 / 0.95);
	}

	.save svg {
		width: 1.05rem;
		height: 1.05rem;
		stroke: currentColor;
		stroke-width: 1.7;
		stroke-linejoin: round;
	}

	/* The cloth, on the dark ticket a mill would staple to the end of a roll. */
	.cloth-chip {
		position: absolute;
		left: 0;
		bottom: 0.7rem;
		margin: 0;
		display: grid;
		padding: 0.28rem 0.55rem;
		background: oklch(0.22 0.02 40 / 0.92);
		color: oklch(0.98 0 0);
		font-size: 0.6rem;
		font-weight: 700;
		letter-spacing: 0.11em;
		line-height: 1.3;
		text-transform: uppercase;
		pointer-events: none;
	}

	.yours {
		position: absolute;
		right: 0;
		bottom: 0.7rem;
		margin: 0;
		padding: 0.28rem 0.55rem;
		background: var(--primary);
		color: var(--on-primary);
		font-size: 0.6rem;
		font-weight: 700;
		letter-spacing: 0.09em;
		text-transform: uppercase;
		pointer-events: none;
	}

	.say {
		display: block;
		padding-top: 0.6rem;
		border-top: 1px solid color-mix(in oklch, var(--ink) 18%, transparent);
		color: var(--ink);
		text-decoration: none;
	}

	/* Two lines are reserved for the name and one for the type, so prices sit on
	   a common baseline across a row however long the names run. */
	h3 {
		margin: 0;
		font-family: var(--font-sans);
		font-weight: 700;
		font-size: 0.9rem;
		line-height: 1.3;
		min-height: 2.6em;
	}

	.say:hover h3 {
		color: var(--primary);
	}

	.type {
		margin: 0.15rem 0 0;
		color: var(--muted);
		font-size: 0.85rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.price {
		margin: 0.5rem 0 0;
		font-weight: 700;
		font-size: 0.95rem;
		font-variant-numeric: tabular-nums;
	}

	@media (prefers-reduced-motion: reduce) {
		.hit:hover img {
			transform: none;
		}
	}
</style>
