<script lang="ts">
	import { weaveStyle } from '$lib/weave';
	import type { FlatKind, Weave } from '$lib/catalog';

	let {
		kind,
		weave,
		pitch = 9,
		label
	}: { kind: FlatKind; weave: Weave; pitch?: number; label: string } = $props();
</script>

<!--
	A technical flat, not a photograph. Pattern rooms draw garments this way: the
	cut seen square-on, with the seams that matter marked. Laid over the cloth's
	own structure, it shows the piece and the material in one image, and it never
	shows you a model who is not the shape you are.
-->
<div class="flat" style={weaveStyle(weave, pitch)} role="img" aria-label={label}>
	<svg viewBox="0 0 200 280" aria-hidden="true" focusable="false">
		{#if kind === 'coat'}
			<path class="fill" d="M64 44 138 44 152 66 148 264 52 264 48 66Z" />
			<path class="seam" d="M64 44 44 74 36 210 60 216 66 96" />
			<path class="seam" d="M138 44 158 74 166 210 142 216 136 96" />
			<path class="seam" d="M64 44 100 92 136 44" />
			<path class="seam" d="M64 44 78 40 100 92 122 40 138 44" />
			<path class="seam" d="M100 92 100 264" />
			<path class="seam" d="M84 96 84 264" />
			<circle class="dot" cx="92" cy="120" r="3.2" />
			<circle class="dot" cx="92" cy="160" r="3.2" />
			<circle class="dot" cx="92" cy="200" r="3.2" />
			<path class="seam" d="M60 168 84 168M140 168 116 168" />
		{:else if kind === 'jacket'}
			<path class="fill" d="M64 46 136 46 150 68 146 212 54 212 50 68Z" />
			<path class="seam" d="M64 46 44 76 38 178 62 184 66 98" />
			<path class="seam" d="M136 46 156 76 162 178 138 184 134 98" />
			<path class="seam" d="M64 46 80 42 100 84 120 42 136 46" />
			<path class="seam" d="M100 84 100 212" />
			<path class="seam" d="M62 138 88 138 88 162 62 162Z" />
			<path class="seam" d="M138 138 112 138 112 162 138 162Z" />
			<circle class="dot" cx="93" cy="112" r="3" />
			<circle class="dot" cx="93" cy="150" r="3" />
			<circle class="dot" cx="93" cy="188" r="3" />
		{:else if kind === 'crew' || kind === 'sweat' || kind === 'halfzip'}
			<path class="fill" d="M62 50 138 50 148 70 144 216 56 216 52 70Z" />
			<path class="seam" d="M62 50 20 152 46 166 56 100" />
			<path class="seam" d="M138 50 180 152 154 166 144 100" />
			<path class="seam" d="M76 48Q100 74 124 48" />
			<path class="seam" d="M74 42Q100 70 126 42" />
			<path class="rib" d="M56 200 144 200" />
			<path class="rib" d="M44 160 50 148M156 160 150 148" />
			{#if kind === 'halfzip'}
				<path class="seam" d="M92 62 92 122M108 62 108 122M100 122 100 126" />
			{/if}
			{#if kind === 'sweat'}
				<path class="seam" d="M92 66 100 82 108 66" />
			{/if}
		{:else if kind === 'tee'}
			<path class="fill" d="M62 54 138 54 168 82 152 104 144 216 56 216 48 104 32 82Z" />
			<path class="seam" d="M76 52Q100 74 124 52" />
			<path class="seam" d="M74 46Q100 68 126 46" />
			<path class="seam" d="M48 104 62 96M152 104 138 96" />
			<path class="rib" d="M56 206 144 206" />
		{:else if kind === 'shirt'}
			<path class="fill" d="M64 54 136 54 146 74 142 224 58 224 54 74Z" />
			<path class="seam" d="M64 54 24 150 50 168 58 104" />
			<path class="seam" d="M136 54 176 150 150 168 142 104" />
			<path class="seam" d="M78 50 100 76 122 50" />
			<path class="seam" d="M78 50 68 30 100 76 132 30 122 50" />
			<path class="seam" d="M100 76 100 224" />
			<path class="seam" d="M88 80 88 224" />
			<path class="seam" d="M58 88 142 88" />
			<circle class="dot" cx="94" cy="112" r="2.6" />
			<circle class="dot" cx="94" cy="150" r="2.6" />
			<circle class="dot" cx="94" cy="188" r="2.6" />
			<path class="rib" d="M40 156 56 164M160 156 144 164" />
		{:else}
			<path class="fill" d="M56 40 144 40 150 74 128 268 104 268 100 140 96 268 72 268 50 74Z" />
			<path class="seam" d="M52 58 148 58" />
			<path class="seam" d="M100 58 100 140" />
			<path class="seam" d="M92 58 92 96" />
			<path class="seam" d="M60 78Q74 92 78 108M140 78Q126 92 122 108" />
			<circle class="dot" cx="100" cy="50" r="3" />
		{/if}
	</svg>
</div>

<style>
	.flat {
		position: relative;
		aspect-ratio: 4 / 5;
		width: 100%;
		border: 1px solid color-mix(in oklch, var(--ink) 22%, transparent);
		--warp: oklch(0.57 0.028 48);
		--weft: oklch(0.69 0.022 52);
		--gap-thread: oklch(0.45 0.03 45);
	}

	svg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	/* The garment is lifted off the cloth field by a wash of paper, so the cut
	   reads without hiding the weave it is cut from. */
	.fill {
		fill: oklch(0.97 0.012 25 / 0.42);
		stroke: var(--ink);
		stroke-width: 2.2;
		stroke-linejoin: round;
	}

	.seam,
	.rib {
		fill: none;
		stroke: var(--ink);
		stroke-width: 1.5;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.rib {
		stroke-dasharray: 3 3.5;
	}

	.dot {
		fill: var(--bg);
		stroke: var(--ink);
		stroke-width: 1.3;
	}
</style>
