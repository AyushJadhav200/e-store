<script lang="ts">
	import { resolve } from '$app/paths';
	import { bag } from '$lib/bag.svelte';
	import { inr, deptName, laddersOnWaist, type Product } from '$lib/catalog';
	import { weaveName } from '$lib/weave';
	import Cloth from './Cloth.svelte';
	import Flat from './Flat.svelte';
	import FitLadder from './FitLadder.svelte';

	let { product }: { product: Product } = $props();

	// The photograph sells it; the flat is what you check the cut against.
	let view = $state<'photo' | 'flat'>('photo');
	let size = $state<string | null>(null);
	let nudge = $state(false);
	let added = $state(0);

	// Sizing is a decision, not a default — an unpicked size is the honest state.
	function add() {
		if (!size) {
			nudge = true;
			return;
		}
		bag.add({
			id: product.id,
			no: product.no,
			name: product.name,
			cloth: product.cloth,
			price: product.price,
			flat: product.flat,
			weave: product.weave,
			photo: product.photo,
			size
		});
		added += 1;
	}

	function pick(s: string) {
		size = s;
		nudge = false;
	}

	const ladderPart = $derived(laddersOnWaist(product) ? 'Waist' : 'Chest');
</script>

<main id="main" class="pdp wrap">
	<div class="plate">
		<div class="frame">
			{#if view === 'photo'}
				<img src={product.photo} alt={product.alt} width="1100" height="1467" />
			{:else}
				<Flat
					kind={product.flat}
					weave={product.weave}
					pitch={11}
					label="Technical flat of the {product.name}, drawn over its {product.cloth}"
				/>
			{/if}
			<p class="stock" aria-hidden="true">PLY / {product.no}</p>
		</div>

		<div class="views" role="group" aria-label="Views of this piece">
			<button type="button" class:on={view === 'photo'} onclick={() => (view = 'photo')}>
				Photo
			</button>
			<button type="button" class:on={view === 'flat'} onclick={() => (view = 'flat')}>
				Shape
			</button>
		</div>
	</div>

	<div class="info">
		<p class="crumb">
			<a href={resolve('/shop/[dept]', { dept: product.dept })}>{deptName(product.dept)}</a>
			<span>·</span>
			<span>No. {product.no}</span>
		</p>

		<h1>{product.name}</h1>
		<p class="price">{inr(product.price)}</p>

		<p class="hand">{product.hand}</p>

		<!-- The ticket carries what a photograph cannot: mill, weight, structure. -->
		<dl class="ticket">
			<div>
				<dt>Fabric</dt>
				<dd>{product.cloth}</dd>
			</div>
			<div>
				<dt>Mill</dt>
				<dd>{product.mill}</dd>
			</div>
			<div>
				<dt>Weight</dt>
				<dd>{product.gsm} gsm</dd>
			</div>
			<div>
				<dt>Weave</dt>
				<dd>{weaveName[product.weave]}</dd>
			</div>
		</dl>

		<FitLadder {product} onpick={pick} />

		<fieldset class:nudge>
			<legend>Size <span>(by {ladderPart.toLowerCase()})</span></legend>
			<div class="sizes">
				{#each product.sizes as s (s)}
					<label class:on={size === s}>
						<input
							type="radio"
							name="size"
							value={s}
							checked={size === s}
							onchange={() => pick(s)}
						/>
						{s}
					</label>
				{/each}
			</div>
			{#if nudge}
				<p class="warn" role="alert">Pick a size first.</p>
			{/if}
		</fieldset>

		<button type="button" class="add" onclick={add}>
			{added > 0 ? 'Added to bag' : 'Add to bag'}
		</button>

		{#if added > 0}
			<p class="after" aria-live="polite">
				{size} added. <a href={resolve('/bag')}>View bag</a>
			</p>
		{/if}

		<ul class="notes">
			{#each product.notes as note (note)}
				<li>{note}</li>
			{/each}
		</ul>

		<Cloth weave={product.weave} caption="{product.cloth} · {product.gsm} gsm · hold to zoom in" />

		<p class="tiny">
			<a href={resolve('/shipping')}>Delivery</a> ·
			<a href={resolve('/returns')}>Returns</a> ·
			<a href={resolve('/care')}>Care</a>
		</p>
	</div>
</main>

<style>
	.pdp {
		display: grid;
		gap: 1.6rem;
		padding: 1.4rem 0 4rem;
		align-items: start;
	}

	.frame {
		position: relative;
		background: var(--surface);
	}

	.frame img {
		display: block;
		width: 100%;
		aspect-ratio: 4 / 5;
		object-fit: cover;
	}

	.views {
		display: flex;
		gap: 0.4rem;
		margin-top: 0.5rem;
	}

	.views button {
		min-height: 2.5rem;
		padding: 0 0.8rem;
		border: 1px solid color-mix(in oklch, var(--ink) 22%, transparent);
		background: none;
		color: var(--muted);
		font: inherit;
		font-size: 0.85rem;
		font-weight: 600;
		cursor: pointer;
	}

	.views button.on {
		border-color: var(--primary);
		color: var(--primary);
	}

	.stock {
		position: absolute;
		left: 0;
		bottom: 0;
		margin: 0;
		background: var(--primary);
		color: var(--on-primary);
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.18em;
		padding: 0.3rem 0.7rem;
	}

	.crumb {
		display: flex;
		gap: 0.4rem;
		margin: 0;
		font-size: 0.85rem;
		color: var(--muted);
		letter-spacing: 0.04em;
	}

	h1 {
		margin: 0.3rem 0 0;
		font-family: var(--font-display);
		font-size: clamp(2rem, 5.5vw, 3.2rem);
		font-weight: 400;
		letter-spacing: -0.02em;
		line-height: 1.05;
		text-wrap: balance;
	}

	.price {
		margin: 0.5rem 0 0;
		font-size: 1.3rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}

	.hand {
		margin: 1rem 0 0;
		max-width: 52ch;
		text-wrap: pretty;
	}

	.ticket {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.7rem 1.2rem;
		margin: 1.3rem 0 0;
		padding: 0.9rem 0;
		border-top: 1px solid color-mix(in oklch, var(--ink) 20%, transparent);
		border-bottom: 1px solid color-mix(in oklch, var(--ink) 20%, transparent);
	}

	dt {
		font-size: 0.7rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--muted);
	}

	dd {
		margin: 0.15rem 0 0;
		font-weight: 600;
	}

	fieldset {
		border: 0;
		padding: 1.3rem 0 0;
		margin: 0;
	}

	legend {
		font-weight: 700;
		padding: 0;
	}

	legend span {
		font-weight: 400;
		color: var(--muted);
		font-size: 0.85rem;
	}

	.sizes {
		display: flex;
		flex-wrap: wrap;
		gap: 0.45rem;
		margin-top: 0.55rem;
	}

	label {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 3rem;
		min-height: 2.75rem;
		border: 1px solid color-mix(in oklch, var(--ink) 25%, transparent);
		padding: 0 0.6rem;
		cursor: pointer;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}

	label.on {
		border-color: var(--primary);
		background: var(--primary);
		color: var(--on-primary);
	}

	label:has(:focus-visible) {
		outline: 2px solid var(--primary);
		outline-offset: 3px;
	}

	fieldset.nudge label {
		border-color: var(--primary);
	}

	input {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}

	.warn {
		margin: 0.55rem 0 0;
		color: var(--primary);
		font-weight: 600;
		font-size: 0.9rem;
	}

	.add {
		margin-top: 1.2rem;
		min-height: 3.1rem;
		width: 100%;
		max-width: 24rem;
		border: 0;
		background: var(--primary);
		color: var(--on-primary);
		font: inherit;
		font-weight: 700;
		letter-spacing: 0.04em;
		cursor: pointer;
		transition: background-color 0.18s;
	}

	.add:hover {
		background: var(--accent);
	}

	.after,
	.tiny {
		margin: 0.7rem 0 0;
		font-size: 0.9rem;
		color: var(--muted);
	}

	.notes {
		margin: 1.4rem 0 1.6rem;
		padding: 0;
		list-style: none;
		display: grid;
		gap: 0.35rem;
		font-size: 0.92rem;
	}

	.notes li {
		padding-left: 1.1rem;
		position: relative;
		color: var(--muted);
	}

	.notes li::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0.55em;
		width: 0.45rem;
		height: 0.45rem;
		background: var(--primary);
	}

	.tiny {
		margin-top: 1.4rem;
	}

	@media (min-width: 880px) {
		.pdp {
			grid-template-columns: minmax(0, 0.95fr) minmax(0, 1fr);
			gap: 3rem;
			padding-top: 2rem;
		}

		.plate {
			position: sticky;
			top: 8.5rem;
		}

		/* Five tracks, with the mill given two: a mill name is a place, and it
		   should not break across four lines to keep a grid tidy. */
		.ticket {
			grid-template-columns: repeat(5, minmax(0, 1fr));
		}

		.ticket div:nth-child(2) {
			grid-column: span 2;
		}
	}
</style>
