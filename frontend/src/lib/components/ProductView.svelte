<script lang="ts">
	import { resolve } from '$app/paths';
	import { bag } from '$lib/bag.svelte';
	import { saved } from '$lib/saved.svelte';
	import { inr, deptName, type Product } from '$lib/catalog';
	import { weaveName } from '$lib/weave';
	import Cloth from './Cloth.svelte';
	import Flat from './Flat.svelte';

	let { product }: { product: Product } = $props();

	let view = $state<'photo' | 'flat'>('photo');
	let size = $state<string | null>(null);
	let nudge = $state(false);
	let added = $state(0);
	let readMore = $state(false);

	const isSaved = $derived(saved.has(product.id));

	function toggleSave() {
		saved.toggle(product.id);
	}

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
</script>

<main id="main" class="lv-pdp">
	<!-- Left column: Product Image / View Frame -->
	<div class="left-hero">
		<div class="image-stage">
			{#if view === 'photo'}
				<img src={product.photo} alt={product.alt} class="main-image" />
			{:else}
				<div class="flat-container">
					<Flat
						kind={product.flat}
						weave={product.weave}
						pitch={11}
						label="Technical flat of the {product.name}"
					/>
				</div>
			{/if}
		</div>

		<div class="view-switch">
			<button type="button" class:active={view === 'photo'} onclick={() => (view = 'photo')}>
				Photograph
			</button>
			<button type="button" class:active={view === 'flat'} onclick={() => (view = 'flat')}>
				Technical Cut
			</button>
		</div>
	</div>

	<!-- Right column: Product Info & Actions (LV Style) -->
	<div class="right-details">
		<div class="details-inner">
			<div class="ref-row">
				<span class="ref-code">{product.no}</span>
				<button
					type="button"
					class="wishlist-button"
					onclick={toggleSave}
					aria-label={isSaved ? 'Remove from Wishlist' : 'Add to Wishlist'}
				>
					<svg viewBox="0 0 24 24" class="heart-icon" class:saved={isSaved}>
						<path
							d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
							fill={isSaved ? 'var(--primary)' : 'none'}
							stroke="currentColor"
							stroke-width="1.6"
						/>
					</svg>
				</button>
			</div>

			<h1 class="product-title">{product.name}</h1>

			<div class="price-block">
				<span class="price-val">{inr(product.price)}</span>
				<span class="mrp-note">(M.R.P. incl. of all taxes)</span>
			</div>

			<!-- Size Selection & Size Guide link -->
			<div class="size-section" class:nudge>
				<div class="size-header">
					<span class="size-label">Sizes</span>
					<a href={resolve('/size-guide')} class="size-guide-link">Size guide</a>
				</div>

				<div class="size-options">
					{#each product.sizes as s (s)}
						<button
							type="button"
							class="size-pill"
							class:selected={size === s}
							onclick={() => pick(s)}
						>
							{s}
						</button>
					{/each}
				</div>

				{#if nudge}
					<p class="nudge-warn">Please select a size first.</p>
				{/if}
			</div>

			<!-- Black Pill Main Action Button -->
			<button type="button" class="black-pill-btn" onclick={add}>
				{added > 0 ? 'Added to Bag' : 'Contact Concierge Services'}
			</button>

			{#if added > 0}
				<p class="added-notice">
					Size {size} added to your bag. <a href={resolve('/bag')}>View Bag</a>
				</p>
			{/if}

			<!-- Concierge Support Info -->
			<div class="concierge-box">
				<p>
					Our Digital Concierge is available if you have any questions on this product.
					<a href={resolve('/contact')}>Contact us</a>.
				</p>
			</div>

			<!-- Product Description & Accordion -->
			<div class="description-section">
				<p class="hand-text">{product.hand}</p>

				{#if readMore}
					<div class="extra-details">
						<ul class="notes-list">
							{#each product.notes as note (note)}
								<li>{note}</li>
							{/each}
						</ul>

						<dl class="fabric-specs">
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

						<div class="loupe-wrap">
							<Cloth weave={product.weave} caption="{product.cloth} · {product.gsm} gsm" />
						</div>
					</div>
				{/if}

				<button type="button" class="read-more-btn" onclick={() => (readMore = !readMore)}>
					{readMore ? 'Read Less' : 'Read More'}
				</button>
			</div>
		</div>
	</div>
</main>

<style>
	.lv-pdp {
		display: grid;
		grid-template-columns: 1fr;
		min-height: 80vh;
		background: #fcfcfc;
	}

	@media (min-width: 900px) {
		.lv-pdp {
			grid-template-columns: 1fr 1fr;
		}
	}

	/* Left side */
	.left-hero {
		background: #f6f6f6;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem 1rem;
		position: relative;
	}

	.image-stage {
		width: 100%;
		max-width: 620px;
		aspect-ratio: 4 / 5;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.main-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		background: #efefef;
	}

	.flat-container {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--surface);
	}

	.view-switch {
		display: flex;
		gap: 0.5rem;
		margin-top: 1rem;
	}

	.view-switch button {
		padding: 0.4rem 0.9rem;
		font-size: 0.8rem;
		font-weight: 600;
		border: 1px solid #ddd;
		background: #fff;
		color: #555;
		cursor: pointer;
		border-radius: 999px;
		transition: all 0.2s ease;
	}

	.view-switch button.active {
		border-color: #000;
		background: #000;
		color: #fff;
	}

	/* Right side */
	.right-details {
		padding: clamp(2rem, 5vw, 4rem) clamp(1.5rem, 5vw, 4.5rem);
		display: flex;
		flex-direction: column;
		justify-content: center;
		background: #ffffff;
	}

	.details-inner {
		max-width: 480px;
		width: 100%;
		margin: 0 auto;
	}

	.ref-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 0.8rem;
	}

	.ref-code {
		font-size: 0.8rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: #666;
		font-weight: 600;
	}

	.wishlist-button {
		border: 0;
		background: none;
		cursor: pointer;
		padding: 0.2rem;
		color: #222;
		transition: transform 0.2s ease;
	}

	.wishlist-button:hover {
		transform: scale(1.15);
	}

	.heart-icon {
		width: 1.3rem;
		height: 1.3rem;
	}

	.heart-icon.saved {
		color: var(--primary);
	}

	.product-title {
		font-family: 'Cinzel', serif;
		font-size: clamp(1.6rem, 3vw, 2.2rem);
		font-weight: 500;
		line-height: 1.25;
		letter-spacing: 0.03em;
		color: #111;
		margin: 0 0 1rem;
	}

	.price-block {
		margin-bottom: 2rem;
	}

	.price-val {
		font-size: 1.3rem;
		font-weight: 700;
		color: #111;
	}

	.mrp-note {
		display: block;
		font-size: 0.78rem;
		color: #777;
		margin-top: 0.2rem;
	}

	/* Sizes */
	.size-section {
		margin-bottom: 1.8rem;
	}

	.size-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 0.6rem;
	}

	.size-label {
		font-size: 0.88rem;
		font-weight: 600;
		color: #222;
	}

	.size-guide-link {
		font-size: 0.82rem;
		color: #444;
		text-decoration: underline;
		text-underline-offset: 0.2em;
	}

	.size-options {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.size-pill {
		min-width: 3.2rem;
		height: 2.6rem;
		border: 1px solid #ccc;
		background: #fff;
		color: #222;
		font-weight: 600;
		font-size: 0.88rem;
		cursor: pointer;
		border-radius: 4px;
		transition: all 0.2s ease;
	}

	.size-pill:hover {
		border-color: #000;
	}

	.size-pill.selected {
		border-color: #000;
		background: #000;
		color: #fff;
	}

	.nudge-warn {
		font-size: 0.82rem;
		color: var(--primary);
		margin-top: 0.4rem;
		font-weight: 600;
	}

	/* Black Pill Button */
	.black-pill-btn {
		width: 100%;
		min-height: 3.3rem;
		background: #000000;
		color: #ffffff;
		border: 0;
		border-radius: 999px;
		font-family: var(--font-sans);
		font-size: 0.95rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		cursor: pointer;
		transition: background-color 0.2s, transform 0.15s;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.black-pill-btn:hover {
		background: #222222;
		transform: translateY(-1px);
	}

	.added-notice {
		font-size: 0.85rem;
		color: #444;
		margin-top: 0.6rem;
		text-align: center;
	}

	/* Concierge box */
	.concierge-box {
		margin-top: 2rem;
		padding: 1.2rem 0;
		border-top: 1px solid #eee;
		border-bottom: 1px solid #eee;
		font-size: 0.85rem;
		color: #666;
		line-height: 1.5;
	}

	.concierge-box a {
		color: #111;
		font-weight: 600;
		text-decoration: underline;
	}

	/* Description & accordion */
	.description-section {
		margin-top: 1.5rem;
	}

	.hand-text {
		font-size: 0.92rem;
		color: #444;
		line-height: 1.6;
		margin-bottom: 0.8rem;
	}

	.read-more-btn {
		border: 0;
		background: none;
		color: #111;
		font-weight: 600;
		font-size: 0.85rem;
		text-decoration: underline;
		cursor: pointer;
		padding: 0;
	}

	.extra-details {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px dashed #ddd;
	}

	.notes-list {
		margin: 0 0 1.2rem;
		padding-left: 1.2rem;
		font-size: 0.88rem;
		color: #555;
	}

	.notes-list li {
		margin-bottom: 0.3rem;
	}

	.fabric-specs {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.8rem;
		margin-bottom: 1.2rem;
		font-size: 0.85rem;
	}

	.fabric-specs dt {
		color: #888;
		font-size: 0.72rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	.fabric-specs dd {
		margin: 0;
		font-weight: 600;
		color: #222;
	}

	.loupe-wrap {
		margin-top: 1rem;
	}
</style>
