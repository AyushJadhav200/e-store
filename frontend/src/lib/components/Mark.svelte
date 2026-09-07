<script lang="ts">
	import { BRAND } from '$lib/brand';

	let {
		size = 96,
		layers,
		depth,
		track,
		label = `${BRAND} mark`
	}: {
		/** Rendered width/height in px. */
		size?: number;
		layers?: number;
		depth?: number;
		track?: boolean;
		label?: string;
	} = $props();
</script>

<div class="mark" style="--size:{size}px;" role="img" aria-label={label}>
	<img src="/velcello-logo.jpg" alt={label} class="logo-img" />
</div>

<style>
	.mark {
		width: var(--size);
		height: var(--size);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex: none;
		overflow: hidden;
		border-radius: 20%;
		box-shadow: 0 2px 8px rgba(120, 20, 20, 0.12);
		background: #fdfaf7;
		border: 1px solid rgba(160, 40, 30, 0.2);
		transition: transform 0.25s ease, box-shadow 0.25s ease;
	}

	.mark:hover {
		transform: scale(1.04);
		box-shadow: 0 4px 14px rgba(160, 40, 30, 0.22);
	}

	.logo-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
</style>
