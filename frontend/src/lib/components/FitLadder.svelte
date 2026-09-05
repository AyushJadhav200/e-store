<script lang="ts">
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { fit } from '$lib/fit.svelte';
	import { laddersOnWaist, type Product } from '$lib/catalog';

	let { product, onpick }: { product: Product; onpick?: (size: string) => void } = $props();

	let editing = $state(false);
	let draft = $state('');

	const part = $derived(laddersOnWaist(product) ? 'waist' : 'chest');
	const stored = $derived(part === 'waist' ? fit.waist : fit.chest);
	const verdict = $derived(fit.ready ? fit.verdict(product) : null);

	onMount(() => {
		fit.hydrate();
	});

	$effect(() => {
		if (stored !== null) draft = String(stored);
	});

	function commit(e: SubmitEvent) {
		e.preventDefault();
		const cm = Number(draft);
		// Anything outside this is a typo, not a body.
		if (!Number.isFinite(cm) || cm < 50 || cm > 200) return;
		fit.set(part, Math.round(cm));
		editing = false;
	}
</script>

<section class="ladder" aria-label="Fit">
	{#if verdict && !editing}
		<p class="verdict">
			<span class="seal-dot" aria-hidden="true"></span>
			Your {part} is {stored} cm — that is
			<button type="button" class="pick" onclick={() => onpick?.(verdict.size)}>
				size {verdict.size}
			</button>
			{#if verdict.alternative}
				<span class="alt">
					or
					<button type="button" class="pick quiet" onclick={() => onpick?.(verdict.alternative!)}>
						{verdict.alternative}
					</button>
				</span>
			{/if}
		</p>
		<p class="note">{verdict.note}</p>
		<p class="row">
			<button type="button" class="link" onclick={() => (editing = true)}>Change</button>
			<a href={resolve('/size-guide')}>How to measure</a>
		</p>
	{:else}
		<form onsubmit={commit}>
			<label for="fit-{product.id}">
				Your {part}, in centimetres
			</label>
			<p class="note">
				Measured around the fullest part, tape flat, not pulled. Kept on this device only — we never
				see it.
			</p>
			<div class="row">
				<input
					id="fit-{product.id}"
					type="number"
					inputmode="numeric"
					min="50"
					max="200"
					step="1"
					placeholder="98"
					bind:value={draft}
				/>
				<span class="unit">cm</span>
				<button type="submit">Show my size</button>
				{#if stored !== null}
					<button type="button" class="link" onclick={() => (editing = false)}>Cancel</button>
				{/if}
			</div>
			<p class="row">
				<a href={resolve('/size-guide')}>Full size guide</a>
			</p>
		</form>
	{/if}
</section>

<style>
	.ladder {
		margin: 1.5rem 0 0;
		padding: 0.95rem 1.05rem 1.05rem;
		background: var(--surface);
		border-left: 3px solid var(--primary);
	}

	label {
		display: block;
		font-weight: 700;
	}

	.verdict {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.35rem;
		margin: 0;
		font-size: 1.05rem;
	}

	.seal-dot {
		width: 0.6rem;
		height: 0.6rem;
		border-radius: 50%;
		background: var(--primary);
		align-self: center;
		flex: none;
	}

	.pick {
		border: 0;
		background: var(--primary);
		color: var(--on-primary);
		font: inherit;
		font-weight: 700;
		padding: 0.1rem 0.5rem;
		cursor: pointer;
	}

	.pick.quiet {
		background: transparent;
		color: var(--primary);
		border-bottom: 2px solid var(--primary);
		padding-inline: 0.15rem;
	}

	.alt {
		color: var(--muted);
	}

	.note {
		margin: 0.45rem 0 0;
		color: var(--muted);
		font-size: 0.88rem;
		max-width: 46ch;
		text-wrap: pretty;
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem 1rem;
		margin: 0.75rem 0 0;
		font-size: 0.9rem;
	}

	input {
		width: 5.5rem;
		min-height: 2.75rem;
		border: 1px solid color-mix(in oklch, var(--ink) 30%, transparent);
		background: var(--bg);
		color: var(--ink);
		font: inherit;
		padding: 0 0.55rem;
	}

	.unit {
		margin-left: -0.75rem;
		color: var(--muted);
	}

	form button[type='submit'] {
		min-height: 2.75rem;
		border: 0;
		background: var(--ink);
		color: var(--bg);
		font: inherit;
		font-weight: 700;
		padding: 0 0.9rem;
		cursor: pointer;
	}

	.link {
		border: 0;
		background: none;
		padding: 0;
		font: inherit;
		color: var(--primary);
		text-decoration: underline;
		cursor: pointer;
	}
</style>
