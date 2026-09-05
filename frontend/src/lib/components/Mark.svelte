<script lang="ts">
	import { onMount } from 'svelte';
	import { BRAND } from '$lib/brand';

	// SVG ids are document-global, so each mark on a page needs its own.
	let uid = $props.id();

	let {
		size = 96,
		layers = 14,
		depth = 0.05,
		track = true,
		label = `${BRAND} mark`
	}: {
		/** Rendered width/height in px. */
		size?: number;
		/** Extrusion slabs. More = smoother side wall, more nodes. */
		layers?: number;
		/** Slab spacing as a fraction of `size`. */
		depth?: number;
		/** Follow the pointer. When false the tile holds a fixed three-quarter tilt. */
		track?: boolean;
		label?: string;
	} = $props();

	const REST_X = -11;
	const REST_Y = -17;
	const RANGE = 22;

	let host: HTMLElement;
	let rx = $state(REST_X);
	let ry = $state(REST_Y);
	let still = $state(false);

	onMount(() => {
		const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
		const fine = window.matchMedia('(pointer: fine)');
		const apply = () => (still = motion.matches || !fine.matches || !track);
		apply();
		motion.addEventListener('change', apply);
		fine.addEventListener('change', apply);

		let targetX = REST_X;
		let targetY = REST_Y;
		let idleAt = performance.now();
		let frame = 0;

		function onMove(e: PointerEvent) {
			if (still) return;
			const box = host.getBoundingClientRect();
			// Measured over a generous radius so the mark answers the whole viewport,
			// not only a direct hover.
			const reach = Math.max(window.innerWidth, window.innerHeight) * 0.55;
			const dx = (e.clientX - (box.left + box.width / 2)) / reach;
			const dy = (e.clientY - (box.top + box.height / 2)) / reach;
			targetY = REST_Y + Math.max(-1, Math.min(1, dx)) * RANGE;
			targetX = REST_X - Math.max(-1, Math.min(1, dy)) * RANGE;
			idleAt = performance.now();
		}

		function tick(now: number) {
			frame = requestAnimationFrame(tick);
			if (still) return;
			// Left alone, the tile turns as if it were being looked over in the hand.
			if (now - idleAt > 2600) {
				const t = now / 1000;
				targetY = REST_Y + Math.sin(t * 0.4) * 10;
				targetX = REST_X + Math.sin(t * 0.29 + 1.2) * 5;
			}
			rx += (targetX - rx) * 0.07;
			ry += (targetY - ry) * 0.07;
		}

		frame = requestAnimationFrame(tick);
		window.addEventListener('pointermove', onMove, { passive: true });

		return () => {
			cancelAnimationFrame(frame);
			window.removeEventListener('pointermove', onMove);
			motion.removeEventListener('change', apply);
			fine.removeEventListener('change', apply);
		};
	});

	// Light sits top-left, so the sheen slides opposite to the tilt.
	const sheenX = $derived(50 - ry * 0.9);
	const sheenY = $derived(50 + rx * 0.9);
</script>

<div
	class="mark"
	bind:this={host}
	role="img"
	aria-label={label}
	style="--size:{size}px; --gap:{(size * depth).toFixed(2)}px; --rx:{rx.toFixed(
		2
	)}deg; --ry:{ry.toFixed(2)}deg; --sx:{sheenX.toFixed(1)}%; --sy:{sheenY.toFixed(
		1
	)}%; --n:{layers}"
>
	<div class="tile">
		{#each Array.from({ length: layers }, (_, n) => n) as n (n)}
			<span class="slab" style="--i:{n}"></span>
		{/each}

		<span class="face">
			<!--
				Two strands twisting into one ply. They cross twice: the first strand
				passes over at the top crossing and under at the bottom, which is what
				makes it a twist rather than a printed X. The gap around each strand is
				the tile showing through, and it is what carries the over-and-under.
			-->
			<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">
				<defs>
					<clipPath id="lower-{uid}">
						<rect x="0" y="58" width="100" height="30" />
					</clipPath>
				</defs>

				<!-- Second strand, laid down first so the first strand floats over it. -->
				<path class="casing" d="M72 -6 C72 26, 28 26, 28 50 C28 74, 72 74, 72 106" />
				<path class="strand" d="M72 -6 C72 26, 28 26, 28 50 C28 74, 72 74, 72 106" />

				<path class="casing" d="M28 -6 C28 26, 72 26, 72 50 C72 74, 28 74, 28 106" />
				<path class="strand" d="M28 -6 C28 26, 72 26, 72 50 C72 74, 28 74, 28 106" />

				<!-- The lower crossing, where the second strand comes back over. -->
				<g clip-path="url(#lower-{uid})">
					<path class="casing" d="M72 -6 C72 26, 28 26, 28 50 C28 74, 72 74, 72 106" />
					<path class="strand" d="M72 -6 C72 26, 28 26, 28 50 C28 74, 72 74, 72 106" />
				</g>
			</svg>
		</span>
	</div>
</div>

<style>
	.mark {
		width: var(--size);
		height: var(--size);
		perspective: calc(var(--size) * 4.5);
		flex: none;
		/* Decorative depth, never a scroll trap. */
		pointer-events: none;
	}

	.tile {
		position: relative;
		width: 100%;
		height: 100%;
		transform-style: preserve-3d;
		transform: rotateX(var(--rx)) rotateY(var(--ry));
	}

	.slab,
	.face {
		position: absolute;
		inset: 0;
		display: block;
		border-radius: 24%;
	}

	.slab {
		transform: translateZ(calc(var(--i) * var(--gap) * -1));
		/* Each slab behind the face loses light: that gradient is the side wall. */
		background: oklch(
			calc(0.46 - (var(--i) / var(--n)) * 0.2) calc(0.175 - (var(--i) / var(--n)) * 0.05) 27
		);
	}

	.face {
		transform: translateZ(calc(var(--gap) * 0.5));
		overflow: hidden;
		background: radial-gradient(
			circle at var(--sx) var(--sy),
			oklch(0.6 0.185 30) 0%,
			oklch(0.51 0.19 27) 44%,
			oklch(0.44 0.17 26) 82%,
			oklch(0.39 0.15 25) 100%
		);
	}

	.face svg {
		width: 100%;
		height: 100%;
		display: block;
	}

	/* The casing is the tile showing through: it is the gap, not a colour. */
	.casing {
		fill: none;
		stroke: oklch(0.4 0.155 26);
		stroke-width: 30;
		stroke-linecap: round;
	}

	.strand {
		fill: none;
		stroke: oklch(0.975 0.012 40);
		stroke-width: 21;
		stroke-linecap: round;
	}

	@media (prefers-reduced-motion: reduce) {
		.tile {
			transform: rotateX(-11deg) rotateY(-17deg);
		}
	}
</style>
