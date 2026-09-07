<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import ClothCanvas from './ClothCanvas.svelte';
	import { BRAND, TAGLINE } from '$lib/brand';
	import type { Weave } from '$lib/catalog';

	export type Slide = {
		key: string;
		eyebrow: string;
		title: string;
		tail: string;
		line: string;
		href: string;
		cta: string;
		weave: Weave;
		warp: string;
		weft: string;
		/** Short label for the spine down the right edge. */
		spine: string;
	};

	let { slides }: { slides: Slide[] } = $props();

	let i = $state(0);
	let paused = $state(false);
	let host: HTMLElement;

	const active = $derived(slides[i]);

	const go = (n: number) => (i = (n + slides.length) % slides.length);

	onMount(() => {
		const hold = () => (paused = true);
		const release = () => (paused = false);
		function keys(e: KeyboardEvent) {
			if (e.key === 'ArrowRight') go(i + 1);
			if (e.key === 'ArrowLeft') go(i - 1);
		}

		host.addEventListener('pointerenter', hold);
		host.addEventListener('pointerleave', release);
		host.addEventListener('focusin', hold);
		host.addEventListener('focusout', release);
		host.addEventListener('keydown', keys);

		const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
		const timer = motion.matches
			? 0
			: setInterval(() => {
					if (!paused && !document.hidden) go(i + 1);
				}, 7000);

		return () => {
			if (timer) clearInterval(timer);
			host.removeEventListener('pointerenter', hold);
			host.removeEventListener('pointerleave', release);
			host.removeEventListener('focusin', hold);
			host.removeEventListener('focusout', release);
			host.removeEventListener('keydown', keys);
		};
	});
</script>

<section class="hero" aria-roledescription="carousel" aria-label="VELCELLO Hero Collection">
	<div class="stage" bind:this={host}>
		<ClothCanvas
			weave={active.weave}
			warp={active.warp}
			weft={active.weft}
			threads={82}
			label="VELCELLO interactive fabric backdrop"
		/>

		<div class="over wrap">
			<div class="hero-center" aria-live="polite">
				{#key active.key}
					<!-- Brand name BEFORE the logo, in Cinzel luxury serif style -->
					<h1 class="brand-title">{BRAND}</h1>

					<!-- 2nd Image Emblem in the middle of hero section -->
					<div class="emblem-card">
						<img src="/vc-emblem.jpg" alt="{BRAND} Emblem" class="emblem-img" />
					</div>

					<!-- Tagline under emblem -->
					<p class="tagline">{TAGLINE}</p>

					<!-- Category/Fabric Chip -->
					<div class="fabric-chip">{active.eyebrow}</div>

					<!-- Clean CTAs -->
					<div class="acts">
						<a class="cta-button" href={active.href}>{active.cta}</a>
						<a class="quiet-button" href={resolve('/about')}>About Us</a>
					</div>
				{/key}
			</div>
		</div>

		<ul class="spine" aria-hidden="true">
			{#each slides as s, n (s.key)}
				<li class:on={n === i}>{s.spine}</li>
			{/each}
		</ul>

		<button class="arm back" type="button" onclick={() => go(i - 1)} aria-label="Previous">
			<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 4 7 12l8 8" /></svg>
		</button>
		<button class="arm on" type="button" onclick={() => go(i + 1)} aria-label="Next">
			<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4l8 8-8 8" /></svg>
		</button>

		<div class="dots" role="tablist" aria-label="Slides">
			{#each slides as s, n (s.key)}
				<button
					type="button"
					role="tab"
					aria-selected={n === i}
					aria-label={s.spine}
					class:on={n === i}
					onclick={() => go(n)}
				></button>
			{/each}
		</div>
	</div>
</section>

<style>
	.hero {
		background: var(--accent);
	}

	.stage {
		position: relative;
		isolation: isolate;
		min-height: min(52rem, calc(100svh - 5.5rem));
		display: grid;
		align-items: center;
		overflow: hidden;
		outline: none;
	}

	.stage :global(.cloth-live) {
		position: absolute;
		inset: 0;
		z-index: -2;
	}

	.stage::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -1;
		pointer-events: none;
		background: radial-gradient(
			circle at center,
			oklch(0.14 0.04 25 / 0.5) 0%,
			oklch(0.12 0.04 25 / 0.75) 100%
		);
	}

	.over {
		display: grid;
		justify-items: center;
		text-align: center;
		padding: 2.5rem 0 clamp(3rem, 8vw, 5rem);
	}

	.hero-center {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		animation: rise 0.6s var(--ease-out-expo);
	}

	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(0.9rem);
		}
	}

	.brand-title {
		font-family: 'Cinzel', serif;
		font-weight: 700;
		font-size: clamp(2.4rem, 6.5vw, 4.4rem);
		letter-spacing: 0.28em;
		text-transform: uppercase;
		color: #ffffff;
		margin: 0 0 1.2rem;
		line-height: 1.1;
		text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
	}

	.emblem-card {
		width: clamp(120px, 18vw, 170px);
		height: clamp(120px, 18vw, 170px);
		border-radius: 28px;
		overflow: hidden;
		box-shadow: 0 10px 32px rgba(0, 0, 0, 0.45);
		border: 2px solid rgba(255, 255, 255, 0.25);
		background: #fdfaf7;
		margin-bottom: 1.2rem;
		transition: transform 0.3s ease;
	}

	.emblem-card:hover {
		transform: scale(1.05);
	}

	.emblem-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.tagline {
		font-family: 'Cinzel', serif;
		font-size: clamp(0.75rem, 1.8vw, 1.05rem);
		font-weight: 600;
		letter-spacing: 0.32em;
		text-transform: uppercase;
		color: oklch(0.95 0.03 40);
		margin: 0 0 0.8rem;
		text-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
	}

	.fabric-chip {
		font-size: 0.68rem;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: oklch(0.92 0.02 30);
		background: rgba(0, 0, 0, 0.3);
		padding: 0.35rem 1rem;
		border-radius: 999px;
		border: 1px solid rgba(255, 255, 255, 0.2);
		backdrop-filter: blur(4px);
		margin-bottom: 1.6rem;
	}

	.acts {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 1rem;
	}

	.cta-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 2.8rem;
		padding: 0 1.8rem;
		background: oklch(0.98 0.008 30);
		color: oklch(0.3 0.12 25);
		font-family: 'Cinzel', serif;
		font-size: 0.85rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		text-decoration: none;
		border-radius: 999px;
		box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
		transition: background-color 0.2s, transform 0.2s;
	}

	.cta-button:hover {
		background: #ffffff;
		transform: translateY(-2px);
	}

	.quiet-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 2.8rem;
		padding: 0 1.8rem;
		background: rgba(255, 255, 255, 0.12);
		color: #ffffff;
		font-family: 'Cinzel', serif;
		font-size: 0.85rem;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		text-decoration: none;
		border-radius: 999px;
		border: 1px solid rgba(255, 255, 255, 0.35);
		backdrop-filter: blur(4px);
		transition: background-color 0.2s, transform 0.2s;
	}

	.quiet-button:hover {
		background: rgba(255, 255, 255, 0.22);
		transform: translateY(-2px);
	}

	.spine {
		display: none;
		position: absolute;
		right: 0.9rem;
		top: 50%;
		transform: translateY(-50%);
		list-style: none;
		margin: 0;
		padding: 0;
		gap: 1.6rem;
		color: oklch(1 0 0 / 0.5);
		font-size: 0.66rem;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		font-weight: 700;
	}

	.spine li {
		writing-mode: vertical-rl;
		transition: color 0.3s;
	}

	.spine li.on {
		color: oklch(0.98 0.008 30);
	}

	.arm {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		width: 2.9rem;
		height: 2.9rem;
		display: none;
		place-items: center;
		border: 1px solid oklch(1 0 0 / 0.4);
		background: oklch(0.2 0.05 25 / 0.28);
		color: oklch(0.99 0 0);
		cursor: pointer;
		padding: 0;
		backdrop-filter: blur(3px);
		border-radius: 50%;
	}

	.arm:hover {
		background: oklch(0.2 0.05 25 / 0.5);
		border-color: oklch(1 0 0 / 0.75);
	}

	.back {
		left: 1rem;
	}

	.arm.on {
		right: 1rem;
	}

	svg {
		width: 1.1rem;
		height: 1.1rem;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.8;
		stroke-linecap: square;
	}

	.dots {
		position: absolute;
		left: 50%;
		bottom: 1.5rem;
		transform: translateX(-50%);
		display: flex;
		gap: 0.5rem;
	}

	.dots button {
		width: 2.2rem;
		height: 0.2rem;
		border: 0;
		padding: 0;
		background: oklch(1 0 0 / 0.38);
		cursor: pointer;
		transition: background-color 0.25s;
	}

	.dots button.on {
		background: oklch(0.98 0.008 30);
	}

	.dots button::after {
		content: '';
		position: absolute;
		inset: -0.7rem 0;
	}

	@media (min-width: 760px) {
		.arm {
			display: grid;
		}

		.spine {
			display: grid;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.hero-center {
			animation: none;
		}
	}
</style>
