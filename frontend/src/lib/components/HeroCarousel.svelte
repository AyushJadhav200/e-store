<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import ClothCanvas from './ClothCanvas.svelte';
	import Mark from './Mark.svelte';
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
		// Listeners are attached here rather than in the markup: the carousel shell
		// is a region, and pause/steer belong to it without pretending it is a widget.
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
		// One slow turn. Stops the moment anyone is reading or pointing at it.
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

<section class="hero" aria-roledescription="carousel" aria-label="The cloth on the roll">
	<!-- Handlers sit on a plain div: a <section> carries an implicit region role,
	     and pointer/key listeners do not belong on one. -->
	<div class="stage" bind:this={host}>
		<!-- One cloth for the whole carousel: the weave and colour are dyed across
		     when the slide turns, instead of eight WebGL contexts fighting for the GPU. -->
		<ClothCanvas
			weave={active.weave}
			warp={active.warp}
			weft={active.weft}
			threads={82}
			label="A hanging length of cloth, moving under the cursor"
		/>

		<div class="over wrap">
			<div class="seal"><Mark size={92} layers={16} /></div>

			<div class="say" aria-live="polite">
				{#key active.key}
					<p class="eyebrow">{active.eyebrow}</p>
					<h1>
						{active.title}
						<span>{active.tail}</span>
					</h1>
					<p class="lede">{active.line}</p>
					<p class="acts">
						<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- href arrives already resolved by the caller -->
						<a class="cta" href={active.href}>{active.cta}</a>
						<a class="quiet" href={resolve('/about')}>About us</a>
					</p>
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

		<p class="drag">Move your cursor over the fabric</p>
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
		align-items: end;
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
		background: linear-gradient(
			100deg,
			oklch(0.16 0.04 25 / 0.62) 0%,
			oklch(0.16 0.04 25 / 0.34) 46%,
			oklch(0.16 0.04 25 / 0.06) 78%,
			oklch(0.16 0.04 25 / 0) 100%
		);
	}

	.over {
		display: grid;
		justify-items: center;
		text-align: center;
		gap: 1.6rem;
		padding: 0 0 clamp(5rem, 12vw, 8rem);
		color: oklch(0.98 0.008 30);
	}

	.say {
		display: grid;
		justify-items: center;
		text-shadow: 0 0.15rem 1.5rem oklch(0.16 0.05 25 / 0.6);
		animation: rise 0.6s var(--ease-out-expo);
	}

	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(0.9rem);
		}
	}

	.eyebrow {
		margin: 0 0 0.9rem;
		font-size: 0.66rem;
		letter-spacing: 0.28em;
		text-transform: uppercase;
		font-weight: 700;
		color: oklch(0.93 0.05 42);
	}

	h1 {
		margin: 0;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: clamp(2.2rem, 5.2vw, 3.6rem);
		line-height: 1.08;
		letter-spacing: -0.02em;
		text-wrap: balance;
		max-width: 20ch;
	}

	h1 span {
		display: block;
		opacity: 0.78;
	}

	.lede {
		margin: 1rem 0 0;
		max-width: 52ch;
		font-size: 0.95rem;
		text-wrap: pretty;
		opacity: 0.9;
	}

	.acts {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 0.6rem 1.6rem;
		margin: 1.5rem 0 0;
	}

	/* A rule under the words, not a filled block. */
	.cta,
	.quiet {
		display: inline-flex;
		align-items: center;
		min-height: 2.6rem;
		color: oklch(0.98 0.008 30);
		font-size: 0.86rem;
		font-weight: 500;
		letter-spacing: 0.02em;
		text-decoration: underline;
		text-underline-offset: 0.45em;
		text-decoration-thickness: 1px;
	}

	.cta:hover,
	.quiet:hover {
		color: oklch(0.98 0.008 30);
		text-underline-offset: 0.3em;
	}

	.quiet {
		opacity: 0.72;
	}

	.seal {
		display: none;
	}

	/* Vertical index of what is on the roll, set down the right edge. */
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
	}

	.arm:hover {
		background: oklch(0.2 0.05 25 / 0.5);
		border-color: oklch(1 0 0 / 0.75);
	}

	.back {
		left: 0.7rem;
	}

	.arm.on {
		right: 0.7rem;
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

	.drag {
		position: absolute;
		left: 50%;
		bottom: 2.6rem;
		transform: translateX(-50%);
		margin: 0;
		font-size: 0.64rem;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: oklch(1 0 0 / 0.55);
		pointer-events: none;
	}

	@media (min-width: 760px) {
		.arm {
			display: grid;
		}

		.spine {
			display: grid;
		}
	}

	@media (min-width: 960px) {
		.seal {
			display: block;
			margin-bottom: 0.4rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.say {
			animation: none;
		}
	}
</style>
