<script lang="ts">
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import PageIntro from '$lib/components/PageIntro.svelte';
	import { fit } from '$lib/fit.svelte';
	import { deptName, TOPS, TOP_FIT, WAISTS, WAIST_FIT } from '$lib/catalog';
	import { stock } from '$lib/stock.svelte';

	onMount(() => fit.hydrate());

	let chest = $state('');
	let waist = $state('');

	$effect(() => {
		if (fit.chest !== null) chest = String(fit.chest);
		if (fit.waist !== null) waist = String(fit.waist);
	});

	const ok = (v: string) => {
		const n = Number(v);
		return Number.isFinite(n) && n >= 50 && n <= 200 ? Math.round(n) : null;
	};

	function apply(e: SubmitEvent) {
		e.preventDefault();
		fit.set('chest', ok(chest));
		fit.set('waist', ok(waist));
	}

	function forget() {
		fit.clear();
		chest = '';
		waist = '';
	}

	// The ladder is the house's, so both tables stand whether or not anything is
	// currently cut in that cloth.

	const hit = (range: [number, number], cm: number | null) =>
		cm !== null && cm >= range[0] && cm <= range[1];
</script>

<svelte:head>
	<title>Size guide — PLY</title>
</svelte:head>

<main id="main">
	<PageIntro
		title="Size guide"
		standfirst="Give us two numbers once and every table on this page — and every product page — marks your row. The numbers never leave your browser."
	>
		<form class="tool" onsubmit={apply}>
			<div class="fields">
				<p class="field">
					<label for="chest">Chest</label>
					<input
						id="chest"
						type="number"
						inputmode="numeric"
						min="50"
						max="200"
						placeholder="98"
						bind:value={chest}
					/>
					<span>cm</span>
				</p>
				<p class="field">
					<label for="waist">Waist</label>
					<input
						id="waist"
						type="number"
						inputmode="numeric"
						min="50"
						max="200"
						placeholder="84"
						bind:value={waist}
					/>
					<span>cm</span>
				</p>
				<button type="submit">Mark my rows</button>
				{#if fit.known}
					<button type="button" class="forget" onclick={forget}>Forget them</button>
				{/if}
			</div>
			<p class="how">
				Chest: around the fullest part, under the arms, tape flat and level. Waist: where you
				actually wear trousers, not where a belt sits after lunch. Measure over a shirt, not a coat.
			</p>
		</form>

		{#if fit.known}
			<p class="marked" aria-live="polite">
				Marked with <span class="chip">your row</span> below and on every piece in
				<a href={resolve('/shop')}>the stock book</a>.
			</p>
		{/if}

		<h2>Tops — by chest</h2>
		<p>Coating, knit, shirting and jersey all ladder on chest. Cut is regular, not oversized.</p>
		<div class="scroller">
			<table>
				<caption>Body chest each size is cut for, in centimetres.</caption>
				<thead>
					<tr>
						<th scope="col">Size</th>
						<th scope="col">Chest</th>
						<th scope="col">Reads as</th>
					</tr>
				</thead>
				<tbody>
					{#each TOPS as s (s)}
						{@const range = TOP_FIT[s]}
						<tr class:you={hit(range, fit.chest)}>
							<th scope="row">{s}</th>
							<td>{range[0]}–{range[1]} cm</td>
							<td>{hit(range, fit.chest) ? 'Your size' : `Size ${s}`}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<h2>Trousers — by waist</h2>
		<p>
			Hems are sent unfinished. Give a tailor your inside leg, or write it on the order and we will
			do it.
		</p>
		<div class="scroller">
			<table>
				<caption>Body waist each size is cut for, in centimetres.</caption>
				<thead>
					<tr>
						<th scope="col">Size</th>
						<th scope="col">Waist</th>
						<th scope="col">Reads as</th>
					</tr>
				</thead>
				<tbody>
					{#each WAISTS as s (s)}
						{@const range = WAIST_FIT[s]}
						<tr class:you={hit(range, fit.waist)}>
							<th scope="row">{s}</th>
							<td>{range[0]}–{range[1]} cm</td>
							<td>{hit(range, fit.waist) ? 'Your size' : `Size ${s}`}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<h2>Your size, product by product</h2>
		{#if stock.all.length}
			<p>The ladder applied to the whole book, so you do not have to hold it in your head.</p>
			<div class="scroller">
				<table>
					<thead>
						<tr>
							<th scope="col">No.</th>
							<th scope="col">Piece</th>
							<th scope="col">Cloth</th>
							<th scope="col">Your size</th>
						</tr>
					</thead>
					<tbody>
						{#each stock.all as p (p.id)}
							{@const v = fit.ready ? fit.verdict(p) : null}
							<tr>
								<td>{p.no}</td>
								<th scope="row"><a href={resolve('/product/[id]', { id: p.id })}>{p.name}</a></th>
								<td>{deptName(p.dept)}</td>
								<td>
									{#if v}
										<strong>{v.size}</strong>{#if v.alternative}<span class="or">
												or {v.alternative}</span
											>{/if}
									{:else}
										<span class="or">enter a measurement</span>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<p>
				Nothing is cut at the moment, so there is nothing to apply the ladder to. The two tables
				above are the ladder every piece is graded from.
			</p>
		{/if}

		<h2>Between sizes</h2>
		<p>
			Take the larger in coating and knit — both are cut to layer over a shirt. Take the closer
			waist in trousering; moleskin and cavalry twill do not give. If you are unsure, write to
			<a href="mailto:hello@ply.example">hello@ply.example</a> with the garment you already own and its
			flat measurements, and we will tell you which of ours matches.
		</p>
	</PageIntro>
</main>

<style>
	.tool {
		margin: 0 0 1.6rem;
		padding: 1rem 1.1rem 1.1rem;
		background: var(--surface);
		border-left: 3px solid var(--primary);
	}

	.fields {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		gap: 0.7rem 1rem;
	}

	.field {
		display: grid;
		grid-template-columns: auto auto;
		gap: 0.15rem 0.4rem;
		margin: 0;
	}

	label {
		grid-column: 1 / -1;
		font-size: 0.72rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--muted);
		font-weight: 700;
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

	.field span {
		align-self: center;
		color: var(--muted);
		font-size: 0.9rem;
	}

	button {
		min-height: 2.75rem;
		border: 0;
		background: var(--primary);
		color: var(--on-primary);
		font: inherit;
		font-weight: 700;
		padding: 0 1rem;
		cursor: pointer;
	}

	.forget {
		background: none;
		color: var(--muted);
		text-decoration: underline;
		padding: 0;
		font-weight: 400;
	}

	.how {
		margin: 0.9rem 0 0;
		color: var(--muted);
		font-size: 0.88rem;
		max-width: 58ch;
		text-wrap: pretty;
	}

	.marked {
		font-size: 0.92rem;
	}

	.chip,
	tr.you th,
	tr.you td {
		background: color-mix(in oklch, var(--primary) 12%, transparent);
	}

	.chip {
		padding: 0.1rem 0.4rem;
		font-weight: 700;
		color: var(--accent);
	}

	tr.you th[scope='row'] {
		box-shadow: inset 3px 0 0 var(--primary);
	}

	.or {
		color: var(--muted);
	}
</style>
