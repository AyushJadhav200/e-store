<script lang="ts">
	import { shrink, dataUrlBytes, readable, isUploaded, ImageError, TARGET_BYTES } from '$lib/image';

	let { value = $bindable('') }: { value: string } = $props();

	let input: HTMLInputElement;
	let dragging = $state(false);
	let busy = $state(false);
	let problem = $state('');
	let note = $state('');
	let urlDraft = $state(isUploaded(value) ? '' : value);

	const uploaded = $derived(isUploaded(value));
	const bytes = $derived(uploaded ? dataUrlBytes(value) : 0);

	async function take(file: File | undefined | null) {
		if (!file) return;
		problem = '';
		note = '';
		busy = true;
		try {
			const shot = await shrink(file);
			value = shot.dataUrl;
			urlDraft = '';
			note =
				`Scaled to ${shot.width}×${shot.height}, ${readable(shot.bytes)}` +
				(shot.from > shot.bytes ? ` — down from ${readable(shot.from)}.` : '.') +
				(shot.bytes > TARGET_BYTES ? ' Still heavy; a smaller original would store better.' : '');
		} catch (err) {
			problem =
				err instanceof ImageError ? err.message : 'That file could not be read as a photograph.';
		} finally {
			busy = false;
		}
	}

	function drop(e: DragEvent) {
		e.preventDefault();
		dragging = false;
		void take(e.dataTransfer?.files?.[0]);
	}

	function useUrl() {
		problem = '';
		note = '';
		const v = urlDraft.trim();
		if (!v) return;
		if (!/^https?:\/\//i.test(v)) {
			problem = 'A linked photograph needs a full https:// address.';
			return;
		}
		value = v;
		note = 'Linked. The shop will load it from that address every time.';
	}

	function clear() {
		value = '';
		urlDraft = '';
		problem = '';
		note = '';
		if (input) input.value = '';
	}
</script>

<div class="photo">
	<span class="label" id="photo-label">Photograph</span>

	<!-- Drop a file, or click through to the picker. The zone is a button so it
	     works from the keyboard as well as the mouse. -->
	<div
		class="zone"
		class:dragging
		class:filled={Boolean(value)}
		ondragover={(e) => {
			e.preventDefault();
			dragging = true;
		}}
		ondragleave={() => (dragging = false)}
		ondrop={drop}
		role="presentation"
	>
		{#if value}
			<img src={value} alt="" />
			<div class="over">
				<button class="btn" type="button" onclick={() => input.click()} disabled={busy}>
					Replace
				</button>
				<button class="btn danger" type="button" onclick={clear} disabled={busy}>Remove</button>
			</div>
			<span class="badge">
				{uploaded ? `Uploaded · ${readable(bytes)}` : 'Linked'}
			</span>
		{:else}
			<button
				class="drop"
				type="button"
				aria-labelledby="photo-label"
				onclick={() => input.click()}
				disabled={busy}
			>
				<svg viewBox="0 0 24 24" aria-hidden="true">
					<rect x="3" y="5" width="18" height="14" rx="2" />
					<circle cx="8.5" cy="10" r="1.6" />
					<path d="m4 17 5-5 4 4 3-2 4 4" />
				</svg>
				<strong>{busy ? 'Scaling…' : 'Drop a photograph, or choose a file'}</strong>
				<small>JPEG, PNG, WebP or AVIF. Scaled to 1100px and stored with the piece.</small>
			</button>
		{/if}

		<input
			bind:this={input}
			type="file"
			accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
			onchange={(e) => take(e.currentTarget.files?.[0])}
			hidden
		/>
	</div>

	{#if problem}
		<p class="msg bad" role="alert">{problem}</p>
	{:else if note}
		<p class="msg ok">{note}</p>
	{/if}

	<div class="or">
		<label class="label" for="photo-url">Or link one</label>
		<div class="row">
			<input
				id="photo-url"
				bind:value={urlDraft}
				placeholder="https://…"
				onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), useUrl())}
			/>
			<button class="btn" type="button" onclick={useUrl} disabled={!urlDraft.trim()}>Use</button>
		</div>
		<span class="hint">
			A linked photograph is not stored, so it costs nothing — but it disappears if that address
			does.
		</span>
	</div>
</div>

<style>
	.photo {
		margin-bottom: 0.9rem;
	}

	.zone {
		position: relative;
		border: 1px dashed var(--line);
		border-radius: 6px;
		background: var(--bg);
		overflow: hidden;
		transition:
			border-color 0.15s,
			background-color 0.15s;
	}

	.zone.dragging {
		border-color: var(--brand);
		background: color-mix(in oklch, var(--brand) 12%, var(--bg));
	}

	.zone.filled {
		border-style: solid;
	}

	.drop {
		display: grid;
		justify-items: center;
		gap: 0.3rem;
		width: 100%;
		padding: 1.6rem 1rem;
		border: 0;
		background: none;
		color: var(--dim);
		font: inherit;
		cursor: pointer;
		text-align: center;
	}

	.drop:hover:not(:disabled) {
		color: var(--ink);
	}

	.drop:disabled {
		cursor: wait;
	}

	.drop svg {
		width: 1.6rem;
		height: 1.6rem;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.4;
		stroke-linejoin: round;
		margin-bottom: 0.2rem;
	}

	.drop strong {
		font-size: 0.86rem;
		font-weight: 600;
	}

	.drop small {
		color: var(--faint);
		font-size: 0.74rem;
		max-width: 34ch;
	}

	.zone img {
		display: block;
		width: 100%;
		max-height: 15rem;
		object-fit: contain;
		background: oklch(0.15 0.008 260);
	}

	.over {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		display: flex;
		gap: 0.35rem;
	}

	.over .btn {
		min-height: 2rem;
		padding: 0 0.6rem;
		font-size: 0.76rem;
		background: color-mix(in oklch, var(--panel) 85%, transparent);
		backdrop-filter: blur(4px);
	}

	.badge {
		position: absolute;
		left: 0.5rem;
		bottom: 0.5rem;
		padding: 0.15rem 0.45rem;
		border-radius: 3px;
		background: color-mix(in oklch, var(--panel) 88%, transparent);
		font-family: var(--mono);
		font-size: 0.66rem;
		color: var(--dim);
	}

	.msg {
		margin: 0.5rem 0 0;
		font-size: 0.76rem;
	}

	.msg.ok {
		color: var(--good);
	}

	.msg.bad {
		color: oklch(0.8 0.14 27);
	}

	.or {
		margin-top: 0.9rem;
	}

	.row {
		display: flex;
		gap: 0.4rem;
	}

	.row input {
		min-width: 0;
	}

	.hint {
		display: block;
		margin-top: 0.35rem;
		color: var(--faint);
		font-size: 0.74rem;
		line-height: 1.45;
	}
</style>
