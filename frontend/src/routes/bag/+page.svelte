<script lang="ts">
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import Mark from '$lib/components/Mark.svelte';
	import { bag, CARRIAGE, FREE_CARRIAGE } from '$lib/bag.svelte';
	import { inr } from '$lib/catalog';

	onMount(() => bag.hydrate());

	const progress = $derived(Math.min(1, bag.goods / FREE_CARRIAGE));
</script>

<svelte:head>
	<title>Bag — PLY</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main id="main" class="wrap">
	<header class="top">
		<div>
			<p class="eyebrow">Ready to order</p>
			<h1>Your bag</h1>
		</div>
		<Mark size={72} />
	</header>

	{#if !bag.ready}
		<p class="quiet">Loading…</p>
	{:else if bag.items.length === 0}
		<div class="empty">
			<p>Your bag is empty.</p>
			<p class="quiet">
				The book runs to ten pieces. Start at the heaviest cloth and work down, or read
				<a href={resolve('/about')}>why the list is short</a>.
			</p>
			<a class="cta" href={resolve('/shop')}>Shop all products</a>
		</div>
	{:else}
		<ul class="lines">
			{#each bag.items as line (line.id + line.size)}
				<li>
					<img class="thumb" src={line.photo} alt="" width="200" height="280" loading="lazy" />
					<div class="what">
						<a href={resolve('/product/[id]', { id: line.id })}>{line.no} · {line.name}</a>
						<p>{line.cloth} · size {line.size}</p>
					</div>

					<div class="qty">
						<label class="sr" for="q-{line.id}-{line.size}">Quantity of {line.name}</label>
						<button
							type="button"
							onclick={() => bag.setQty(line.id, line.size, line.qty - 1)}
							aria-label="One fewer {line.name}"
						>
							−
						</button>
						<input
							id="q-{line.id}-{line.size}"
							type="number"
							min="0"
							max="9"
							value={line.qty}
							onchange={(e) => bag.setQty(line.id, line.size, Number(e.currentTarget.value))}
						/>
						<button
							type="button"
							onclick={() => bag.setQty(line.id, line.size, line.qty + 1)}
							aria-label="One more {line.name}"
						>
							+
						</button>
					</div>

					<p class="sum">{inr(line.price * line.qty)}</p>

					<button class="drop" type="button" onclick={() => bag.remove(line.id, line.size)}>
						Remove
					</button>
				</li>
			{/each}
		</ul>

		<!-- Carriage stated before checkout, not after. -->
		<section class="totals" aria-label="Total">
			<dl>
				<div>
					<dt>Goods</dt>
					<dd>{inr(bag.goods)}</dd>
				</div>
				<div>
					<dt>Delivery</dt>
					<dd>{bag.carriage === 0 ? 'Free' : inr(bag.carriage)}</dd>
				</div>
				<div class="grand">
					<dt>Total</dt>
					<dd>{inr(bag.total)}</dd>
				</div>
			</dl>

			{#if bag.toFreeCarriage > 0}
				<p class="carriage">
					{inr(bag.toFreeCarriage)} more and carriage is free. Below that it is {inr(CARRIAGE)},
					tracked, two working days.
				</p>
				<div
					class="meter"
					role="img"
					aria-label="{Math.round(progress * 100)} per cent of the way to free carriage"
				>
					<span style="width:{progress * 100}%"></span>
				</div>
			{:else}
				<p class="carriage">Carriage is on us. Tracked, two working days.</p>
			{/if}

			<button class="cta" type="button" disabled>Checkout — coming soon</button>
			<p class="quiet">
				This storefront is the shop's front of house; payment is not wired up. Everything here is
				held in your own browser and nothing has been sent anywhere.
			</p>
		</section>
	{/if}
</main>

<style>
	main {
		padding: clamp(1.6rem, 4vw, 2.8rem) 0 clamp(3rem, 7vw, 5rem);
	}

	.sr {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
	}

	.top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		border-bottom: 2px solid var(--primary);
		padding-bottom: 1rem;
	}

	.eyebrow {
		margin: 0 0 0.3rem;
		font-size: 0.72rem;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--primary);
		font-weight: 700;
	}

	h1 {
		margin: 0;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: clamp(2rem, 5.5vw, 3.2rem);
		letter-spacing: -0.02em;
	}

	.empty {
		margin: 2.4rem 0;
		max-width: var(--measure);
	}

	.empty p {
		margin: 0 0 0.6rem;
		font-size: 1.1rem;
	}

	.quiet {
		color: var(--muted);
		font-size: 0.92rem;
		max-width: 52ch;
		text-wrap: pretty;
	}

	.cta {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 3rem;
		margin-top: 1rem;
		padding: 0 1.3rem;
		border: 0;
		background: var(--primary);
		color: var(--on-primary);
		font: inherit;
		font-weight: 700;
		text-decoration: none;
		cursor: pointer;
	}

	.cta:disabled {
		background: color-mix(in oklch, var(--ink) 22%, var(--surface));
		color: var(--muted);
		cursor: not-allowed;
	}

	.lines {
		list-style: none;
		margin: 1.6rem 0 0;
		padding: 0;
	}

	.lines li {
		display: grid;
		grid-template-columns: 4.5rem 1fr auto;
		grid-template-areas:
			'img what sum'
			'img qty  drop';
		gap: 0.5rem 1rem;
		align-items: center;
		padding: 1rem 0;
		border-bottom: 1px solid color-mix(in oklch, var(--ink) 14%, transparent);
	}

	.thumb {
		grid-area: img;
		width: 4.5rem;
		aspect-ratio: 3 / 4;
		object-fit: cover;
		background: var(--surface);
	}

	.what {
		grid-area: what;
		align-self: end;
	}

	.what a {
		font-family: var(--font-display);
		font-size: 1.15rem;
		color: var(--ink);
		text-decoration: none;
	}

	.what a:hover {
		color: var(--primary);
	}

	.what p {
		margin: 0.2rem 0 0;
		color: var(--muted);
		font-size: 0.85rem;
	}

	.qty {
		grid-area: qty;
		display: flex;
		align-items: center;
		gap: 0.25rem;
		align-self: start;
	}

	.qty button {
		width: 2.5rem;
		height: 2.5rem;
		border: 1px solid color-mix(in oklch, var(--ink) 25%, transparent);
		background: none;
		color: var(--ink);
		font: inherit;
		font-size: 1.1rem;
		cursor: pointer;
	}

	.qty input {
		width: 3rem;
		height: 2.5rem;
		text-align: center;
		border: 1px solid color-mix(in oklch, var(--ink) 25%, transparent);
		background: var(--surface);
		color: var(--ink);
		font: inherit;
		font-variant-numeric: tabular-nums;
	}

	.sum {
		grid-area: sum;
		margin: 0;
		align-self: end;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}

	.drop {
		grid-area: drop;
		justify-self: end;
		align-self: start;
		min-height: 2.5rem;
		border: 0;
		background: none;
		color: var(--muted);
		font: inherit;
		font-size: 0.85rem;
		text-decoration: underline;
		cursor: pointer;
		padding: 0;
	}

	.drop:hover {
		color: var(--primary);
	}

	.totals {
		margin: 2rem 0 0;
		max-width: 26rem;
		margin-left: auto;
	}

	dl {
		margin: 0;
	}

	dl div {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.4rem 0;
	}

	dt {
		color: var(--muted);
	}

	dd {
		margin: 0;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}

	.grand {
		border-top: 2px solid var(--primary);
		margin-top: 0.4rem;
		padding-top: 0.7rem;
	}

	.grand dt {
		color: var(--ink);
		font-weight: 700;
	}

	.grand dd {
		font-size: 1.25rem;
		font-weight: 700;
	}

	.carriage {
		margin: 0.9rem 0 0.5rem;
		font-size: 0.88rem;
		color: var(--muted);
		text-wrap: pretty;
	}

	.meter {
		height: 0.35rem;
		background: color-mix(in oklch, var(--ink) 14%, transparent);
	}

	.meter span {
		display: block;
		height: 100%;
		background: var(--primary);
		transition: width 0.4s var(--ease-out-expo);
	}

	.totals .cta {
		width: 100%;
	}
</style>
