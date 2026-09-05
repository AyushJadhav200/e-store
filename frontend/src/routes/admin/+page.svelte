<script lang="ts">
	import { resolve } from '$app/paths';
	import { stock, deptName } from '$lib/stock.svelte';
	import { inr, departments } from '$lib/catalog';
	import { weaveName } from '$lib/weave';

	let filter = $state('all');
	let confirming = $state<string | null>(null);

	const rows = $derived(filter === 'all' ? stock.all : stock.inDept(filter));

	const value = $derived(stock.all.reduce((n, p) => n + p.price, 0));
	const heaviest = $derived(
		stock.all.reduce((a, b) => (b.gsm > (a?.gsm ?? 0) ? b : a), stock.all[0])
	);

	function status(id: string) {
		if (stock.isLocal(id)) return { cls: 'new', text: 'Posted' } as const;
		if (stock.isEdited(id)) return { cls: 'edited', text: 'Edited' } as const;
		return { cls: 'seed', text: 'Shipped' } as const;
	}

	function drop(id: string) {
		stock.remove(id);
		confirming = null;
	}
</script>

<svelte:head><title>Stock — PLY admin</title></svelte:head>

<main class="page">
	<header class="head">
		<div>
			<h1>Stock book</h1>
			<p>Everything the shop is currently cutting.</p>
		</div>
		<a class="btn primary" href={resolve('/admin/new')}>+ Post cloth</a>
	</header>

	<ul class="stats">
		<li class="panel">
			<span class="label">Pieces</span>
			<strong class="num">{stock.all.length}</strong>
		</li>
		<li class="panel">
			<span class="label">Book value</span>
			<strong class="num">{inr(value)}</strong>
		</li>
		<li class="panel">
			<span class="label">Cloths</span>
			<strong class="num">{departments.filter((d) => stock.inDept(d.slug).length).length}</strong>
		</li>
		<li class="panel">
			<span class="label">Heaviest</span>
			<strong class="num">{heaviest ? `${heaviest.gsm} gsm` : '—'}</strong>
		</li>
	</ul>

	<div class="chips" role="group" aria-label="Filter by cloth">
		<button type="button" class:on={filter === 'all'} onclick={() => (filter = 'all')}>
			All <span class="num">{stock.all.length}</span>
		</button>
		{#each departments as d (d.slug)}
			<button type="button" class:on={filter === d.slug} onclick={() => (filter = d.slug)}>
				{d.name} <span class="num">{stock.inDept(d.slug).length}</span>
			</button>
		{/each}
	</div>

	<div class="panel table-wrap">
		<table>
			<thead>
				<tr>
					<th scope="col">No.</th>
					<th scope="col">Piece</th>
					<th scope="col">Cloth</th>
					<th scope="col" class="right">Weight</th>
					<th scope="col" class="right">Price</th>
					<th scope="col">State</th>
					<th scope="col"><span class="sr">Actions</span></th>
				</tr>
			</thead>
			<tbody>
				{#each rows as p (p.id)}
					{@const s = status(p.id)}
					<tr class:pending={confirming === p.id}>
						<td class="num no">{p.no}</td>
						<th scope="row">
							<a href={resolve('/product/[id]', { id: p.id })} target="_blank" rel="noreferrer">
								{p.name}
							</a>
							<small>{deptName(p.dept)} · {weaveName[p.weave]}</small>
						</th>
						<td>
							{p.cloth}
							<small>{p.mill}</small>
						</td>
						<td class="num right">{p.gsm}</td>
						<td class="num right">{inr(p.price)}</td>
						<td><span class="tag {s.cls}">{s.text}</span></td>
						<td class="acts-cell">
							<div class="acts">
								{#if confirming === p.id}
									<span class="ask">Pull it?</span>
									<button class="btn danger" type="button" onclick={() => drop(p.id)}
										>Yes, pull</button
									>
									<button class="btn" type="button" onclick={() => (confirming = null)}>Keep</button
									>
								{:else}
									<a class="btn" href={resolve('/admin/edit/[id]', { id: p.id })}>Edit</a>
									{#if stock.isEdited(p.id)}
										<button class="btn" type="button" onclick={() => stock.restore(p.id)}>
											Revert
										</button>
									{/if}
									<button class="btn danger" type="button" onclick={() => (confirming = p.id)}>
										Pull
									</button>
								{/if}
							</div>
						</td>
					</tr>
				{:else}
					<tr>
						<td colspan="7" class="empty">
							{filter === 'all' ? 'The book is empty.' : 'Nothing cut in this cloth.'}
							<a href={resolve('/admin/new')}>Post a piece</a>.
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	{#if stock.layer.removed.length}
		<section class="pulled panel">
			<h2>Pulled from the book</h2>
			<p>These shipped with the shop and are currently hidden from the storefront.</p>
			<ul>
				{#each stock.layer.removed as id (id)}
					<li>
						<span class="num">{id}</span>
						<button class="btn" type="button" onclick={() => stock.restore(id)}>Put back</button>
					</li>
				{/each}
			</ul>
		</section>
	{/if}
</main>

<style>
	.page {
		padding: clamp(1rem, 3vw, 2rem);
	}

	.sr {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
	}

	.head {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1.2rem;
	}

	h1 {
		font-size: clamp(1.4rem, 3vw, 1.9rem);
	}

	.head p {
		margin: 0.25rem 0 0;
		color: var(--faint);
		font-size: 0.84rem;
	}

	.stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
		gap: 0.7rem;
		list-style: none;
		margin: 0 0 1.2rem;
		padding: 0;
	}

	.stats li {
		padding: 0.7rem 0.85rem;
	}

	.stats strong {
		font-size: 1.35rem;
		font-weight: 600;
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		margin-bottom: 1rem;
	}

	.chips button {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		min-height: 2.1rem;
		padding: 0 0.65rem;
		border: 1px solid var(--line);
		border-radius: 999px;
		background: transparent;
		color: var(--dim);
		font: inherit;
		font-size: 0.8rem;
		font-weight: 600;
		cursor: pointer;
	}

	.chips button span {
		font-size: 0.7rem;
		color: var(--faint);
	}

	.chips button.on {
		background: var(--raised);
		border-color: var(--faint);
		color: var(--ink);
	}

	.table-wrap {
		overflow-x: auto;
		overflow-y: visible;
	}

	table {
		width: 100%;
		min-width: 54rem;
		border-collapse: collapse;
		font-size: 0.84rem;
	}

	th,
	td {
		padding: 0.7rem 0.8rem;
		text-align: left;
		vertical-align: top;
		border-bottom: 1px solid var(--line);
	}

	thead th {
		position: sticky;
		top: 0;
		background: var(--raised);
		color: var(--faint);
		font-size: 0.68rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		white-space: nowrap;
	}

	tbody tr:last-child th,
	tbody tr:last-child td {
		border-bottom: 0;
	}

	tbody tr:hover td,
	tbody tr:hover th {
		background: color-mix(in oklch, var(--raised) 55%, transparent);
	}

	tr.pending td,
	tr.pending th {
		background: color-mix(in oklch, var(--brand) 14%, transparent);
	}

	.no {
		color: var(--brand);
		font-weight: 600;
	}

	tbody th a {
		font-weight: 700;
		text-decoration: none;
	}

	tbody th a:hover {
		text-decoration: underline;
	}

	small {
		display: block;
		margin-top: 0.15rem;
		color: var(--faint);
		font-size: 0.72rem;
	}

	.right {
		text-align: right;
	}

	.acts-cell {
		width: 1%;
		white-space: nowrap;
	}

	.acts {
		display: flex;
		flex-wrap: nowrap;
		gap: 0.35rem;
		justify-content: flex-end;
	}

	.acts .btn {
		min-height: 2rem;
		padding: 0 0.6rem;
		font-size: 0.76rem;
	}

	.ask {
		align-self: center;
		font-size: 0.76rem;
		color: var(--warn);
	}

	.empty {
		color: var(--faint);
		text-align: center;
		padding: 2rem;
	}

	.pulled {
		margin-top: 1.2rem;
		padding: 1rem 1.2rem 1.2rem;
	}

	.pulled h2 {
		font-size: 0.72rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--faint);
	}

	.pulled p {
		margin: 0.4rem 0 0.8rem;
		color: var(--dim);
		font-size: 0.8rem;
	}

	.pulled ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.pulled li {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.3rem 0.3rem 0.3rem 0.7rem;
		border: 1px solid var(--line);
		border-radius: 999px;
		font-size: 0.78rem;
	}
</style>
