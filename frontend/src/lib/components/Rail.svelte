<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';

	let {
		title,
		note = '',
		more = null,
		children
	}: {
		title: string;
		note?: string;
		/** Optional { href, label } for the heading's trailing link. */
		more?: { href: string; label: string } | null;
		children: Snippet;
	} = $props();

	let track: HTMLDivElement;
	let atStart = $state(true);
	let atEnd = $state(false);

	function edges() {
		if (!track) return;
		atStart = track.scrollLeft < 8;
		atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
	}

	onMount(() => {
		edges();
		const ro = new ResizeObserver(edges);
		ro.observe(track);
		return () => ro.disconnect();
	});

	function nudge(dir: -1 | 1) {
		// Move by whole cards rather than a fixed pixel count.
		const step = track.querySelector<HTMLElement>(':scope > *')?.offsetWidth ?? 260;
		track.scrollBy({ left: dir * (step + 18) * 2, behavior: 'smooth' });
	}
</script>

<section class="rail">
	<header class="wrap head">
		<div>
			<h2>{title}</h2>
			{#if note}<p>{note}</p>{/if}
		</div>

		<div class="controls">
			{#if more}
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- href arrives already resolved by the caller -->
				<a href={more.href}>{more.label}</a>
			{/if}
			<button type="button" onclick={() => nudge(-1)} disabled={atStart} aria-label="Previous">
				<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 4 7 12l8 8" /></svg>
			</button>
			<button type="button" onclick={() => nudge(1)} disabled={atEnd} aria-label="Next">
				<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4l8 8-8 8" /></svg>
			</button>
		</div>
	</header>

	<div class="track" bind:this={track} onscroll={edges}>
		{@render children()}
	</div>
</section>

<style>
	.rail {
		padding: clamp(2.2rem, 5vw, 3.6rem) 0 0;
	}

	.head {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 1rem 2rem;
		margin-bottom: 1.1rem;
	}

	h2 {
		margin: 0;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: clamp(1.5rem, 3.4vw, 2.2rem);
		letter-spacing: -0.015em;
		text-wrap: balance;
	}

	.head p {
		margin: 0.25rem 0 0;
		color: var(--muted);
		font-size: 0.9rem;
	}

	.controls {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex: none;
	}

	.controls a {
		margin-right: 0.4rem;
		font-size: 0.82rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		text-underline-offset: 0.25em;
	}

	button {
		width: 2.6rem;
		height: 2.6rem;
		display: grid;
		place-items: center;
		border: 1px solid color-mix(in oklch, var(--ink) 25%, transparent);
		background: var(--surface);
		color: var(--ink);
		cursor: pointer;
		padding: 0;
	}

	button:hover:not(:disabled) {
		border-color: var(--primary);
		color: var(--primary);
	}

	button:disabled {
		opacity: 0.32;
		cursor: default;
	}

	svg {
		width: 1.1rem;
		height: 1.1rem;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.8;
		stroke-linecap: square;
	}

	/* The track bleeds to the page edge so cards run off the side, but the first
	   card still lines up with the heading above it. */
	.track {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: minmax(11.5rem, 1fr);
		gap: 1.1rem;
		overflow-x: auto;
		scroll-snap-type: x proximity;
		scroll-padding-inline: var(--page-pad);
		padding-inline: max(
			var(--page-pad),
			calc((100% - min(1080px, 100% - 2 * var(--page-pad))) / 2)
		);
		padding-bottom: 0.4rem;
		scrollbar-width: none;
	}

	.track::-webkit-scrollbar {
		display: none;
	}

	.track > :global(*) {
		scroll-snap-align: start;
	}

	@media (min-width: 640px) {
		.track {
			grid-auto-columns: minmax(14rem, 1fr);
		}
	}

	@media (min-width: 1000px) {
		.track {
			grid-auto-columns: minmax(
				0,
				calc((min(1080px, 100vw - 2 * var(--page-pad)) - 3 * 1.1rem) / 4)
			);
		}
	}
</style>
