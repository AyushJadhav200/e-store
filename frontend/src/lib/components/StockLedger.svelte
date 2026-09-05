<script lang="ts">
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { inr, laddersOnWaist, type Product } from '$lib/catalog';
	import { fit } from '$lib/fit.svelte';
	import { weaveStyle, weaveName } from '$lib/weave';

	let { items, dense = false }: { items: Product[]; dense?: boolean } = $props();

	let activeId = $state<string | null>(null);

	onMount(() => {
		fit.hydrate();
	});

	const active = $derived(items.find((p) => p.id === activeId) ?? items.at(0));
</script>

<div class="ledger" class:dense>
	<ol
		class="rows"
		onpointerleave={() => (activeId = null)}
		onfocusout={(e) => {
			if (!e.currentTarget.contains(e.relatedTarget as Node)) activeId = null;
		}}
	>
		{#each items as p (p.id)}
			{@const verdict = fit.ready ? fit.verdict(p) : null}
			<li onpointerenter={() => (activeId = p.id)}>
				<a href={resolve('/product/[id]', { id: p.id })} onfocus={() => (activeId = p.id)}>
					<span class="no">{p.no}</span>

					<span class="swatch" style={weaveStyle(p.weave, 4.5)} aria-hidden="true"></span>

					<span class="name">
						{p.name}
						<small>{p.cloth} · {p.gsm} gsm · {p.mill}</small>
					</span>

					{#if verdict}
						<span class="yours" title={verdict.note}>
							your {laddersOnWaist(p) ? 'waist' : 'chest'}: <b>{verdict.size}</b>
						</span>
					{/if}

					<span class="price">{inr(p.price)}</span>
				</a>
			</li>
		{/each}
	</ol>

	<aside class="pin" aria-hidden="true">
		{#if active}
			<div class="card">
				<img src={active.photo} alt="" width="700" height="980" loading="lazy" />
				<div class="cloth" style={weaveStyle(active.weave, 6)}></div>
				<p>
					<strong>{active.name}</strong>
					<span>{weaveName[active.weave]} · {active.gsm} gsm</span>
				</p>
			</div>
		{/if}
	</aside>
</div>

<style>
	.ledger {
		display: grid;
		gap: 2rem;
	}

	.rows {
		list-style: none;
		margin: 0;
		padding: 0;
		border-top: 2px solid var(--primary);
	}

	li {
		border-bottom: 1px solid color-mix(in oklch, var(--ink) 16%, transparent);
	}

	a {
		display: grid;
		grid-template-columns: 2.4rem 0.9rem 1fr auto;
		grid-template-areas:
			'no swatch name price'
			'.  .      yours yours';
		align-items: baseline;
		gap: 0.15rem 0.75rem;
		padding: 0.95rem 0.2rem;
		color: var(--ink);
		text-decoration: none;
		transition: background-color 0.18s var(--ease-out-expo);
	}

	a:hover,
	a:focus-visible {
		background: color-mix(in oklch, var(--primary) 7%, transparent);
		color: var(--ink);
	}

	.no {
		grid-area: no;
		font-family: var(--font-display);
		font-size: 1.15rem;
		color: var(--primary);
		font-variant-numeric: tabular-nums;
	}

	.swatch {
		grid-area: swatch;
		align-self: stretch;
		width: 0.9rem;
		border: 1px solid color-mix(in oklch, var(--ink) 25%, transparent);
		--warp: oklch(0.57 0.028 48);
		--weft: oklch(0.69 0.022 52);
		--gap-thread: oklch(0.45 0.03 45);
	}

	.name {
		grid-area: name;
		display: block;
		font-family: var(--font-display);
		font-size: clamp(1.1rem, 2.6vw, 1.5rem);
		line-height: 1.15;
		text-wrap: balance;
	}

	.name small {
		display: block;
		margin-top: 0.2rem;
		font-family: var(--font-sans);
		font-size: 0.82rem;
		color: var(--muted);
		letter-spacing: 0.01em;
	}

	.yours {
		grid-area: yours;
		justify-self: start;
		margin-top: 0.35rem;
		font-size: 0.78rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--primary);
		border: 1px solid color-mix(in oklch, var(--primary) 45%, transparent);
		padding: 0.1rem 0.4rem;
	}

	.yours b {
		font-weight: 700;
	}

	.price {
		grid-area: price;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}

	.pin {
		display: none;
	}

	@media (min-width: 960px) {
		.ledger {
			grid-template-columns: minmax(0, 1fr) 17rem;
			gap: 3rem;
			align-items: start;
		}

		.dense.ledger {
			grid-template-columns: minmax(0, 1fr) 14rem;
		}

		a {
			grid-template-columns: 3rem 1.1rem 1fr auto auto;
			grid-template-areas: 'no swatch name yours price';
			gap: 0.15rem 1.4rem;
			padding: 1.15rem 0.4rem;
		}

		.yours {
			justify-self: end;
			margin-top: 0;
			align-self: center;
		}

		.pin {
			display: block;
			position: sticky;
			top: 5.5rem;
		}

		/* The sample card is pinned to the ledger the way a swatch is pinned to a
		   sample book — it changes as the eye moves down the list. */
		.card {
			transform: rotate(-0.6deg);
			transition: transform 0.4s var(--ease-out-expo);
			background: var(--surface);
			padding: 0.55rem 0.55rem 0.75rem;
			box-shadow: 0 1rem 2.4rem oklch(0.2 0.04 25 / 0.14);
		}

		.card img {
			display: block;
			width: 100%;
			aspect-ratio: 3 / 4;
			object-fit: cover;
			background: var(--bg);
		}

		.card .cloth {
			height: 2.4rem;
			margin-top: 0.4rem;
			--warp: oklch(0.57 0.028 48);
			--weft: oklch(0.69 0.022 52);
			--gap-thread: oklch(0.45 0.03 45);
		}

		.card p {
			margin: 0.55rem 0 0;
			display: grid;
			gap: 0.1rem;
			font-size: 0.85rem;
			color: var(--muted);
		}

		.card strong {
			font-family: var(--font-display);
			font-weight: 500;
			font-size: 1.05rem;
			color: var(--ink);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.card {
			transition-duration: 0.01ms;
			transform: none;
		}
	}
</style>
