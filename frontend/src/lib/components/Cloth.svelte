<script lang="ts">
	import { weaveStyle, weaveName } from '$lib/weave';
	import type { Weave } from '$lib/catalog';

	let {
		weave,
		pitch = 7,
		zoom = 5.5,
		caption = ''
	}: { weave: Weave; pitch?: number; zoom?: number; caption?: string } = $props();

	let panel: HTMLElement;
	let x = $state(0);
	let y = $state(0);
	let live = $state(false);
	let held = $state(false);

	const LENS = 148;

	function move(e: PointerEvent) {
		const box = panel.getBoundingClientRect();
		x = e.clientX - box.left;
		y = e.clientY - box.top;
		live = true;
	}

	function leave() {
		live = false;
	}

	// The swatch is drawn, not photographed, so magnifying it means redrawing the
	// structure at a larger thread pitch — no interpolation, no soft pixels.
	const base = $derived(weaveStyle(weave, pitch));
	const magnified = $derived(weaveStyle(weave, pitch * zoom));
	const show = $derived(live || held);
</script>

<figure class="cloth">
	<div
		class="panel"
		bind:this={panel}
		style={base}
		onpointermove={move}
		onpointerleave={leave}
		onpointerdown={() => (held = true)}
		onpointerup={() => (held = false)}
		aria-hidden="true"
	>
		{#if show}
			<span
				class="lens"
				style="{magnified}; width:{LENS}px; height:{LENS}px; left:{x}px; top:{y}px; background-position: {-x *
					(zoom - 1)}px {-y * (zoom - 1)}px"
			></span>
		{/if}
		<span class="hint" class:gone={show}>Hold to zoom in</span>
	</div>
	<figcaption>
		<strong>{weaveName[weave]}</strong>
		{#if caption}<span>{caption}</span>{/if}
	</figcaption>
</figure>

<style>
	.cloth {
		margin: 0;
	}

	.panel {
		position: relative;
		height: clamp(9rem, 26vw, 14rem);
		overflow: hidden;
		cursor: zoom-in;
		touch-action: none;
		border: 1px solid color-mix(in oklch, var(--ink) 22%, transparent);
		--warp: oklch(0.57 0.028 48);
		--weft: oklch(0.69 0.022 52);
		--gap-thread: oklch(0.45 0.03 45);
	}

	.lens {
		position: absolute;
		transform: translate(-50%, -50%);
		border-radius: 50%;
		pointer-events: none;
		box-shadow:
			0 0 0 1px var(--ink),
			0 0 0 5px var(--surface),
			0 0 0 6px color-mix(in oklch, var(--ink) 35%, transparent),
			0 1rem 2rem oklch(0.2 0.04 25 / 0.35);
	}

	.hint {
		position: absolute;
		left: 0.6rem;
		bottom: 0.55rem;
		background: var(--surface);
		color: var(--ink);
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		padding: 0.2rem 0.45rem;
		transition: opacity 0.2s;
	}

	.hint.gone {
		opacity: 0;
	}

	figcaption {
		display: flex;
		flex-wrap: wrap;
		gap: 0.15rem 0.6rem;
		margin-top: 0.5rem;
		font-size: 0.88rem;
		color: var(--muted);
	}

	figcaption strong {
		color: var(--ink);
	}

	@media (hover: none) {
		.hint::after {
			content: ' — or touch';
		}
	}
</style>
