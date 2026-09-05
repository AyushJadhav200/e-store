<script lang="ts">
	import { untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import {
		departments,
		TYPE_NAME,
		TOPS,
		TOP_FIT,
		WAISTS,
		WAIST_FIT,
		type FlatKind,
		type Product,
		type Weave
	} from '$lib/catalog';
	import { stock, QuotaError } from '$lib/stock.svelte';
	import { weaveName } from '$lib/weave';
	import ProductCard from '../ProductCard.svelte';
	import Cloth from '../Cloth.svelte';
	import PhotoField from './PhotoField.svelte';

	let { existing = null }: { existing?: Product | null } = $props();

	const WEAVES: Weave[] = ['plain', 'twill', 'herringbone', 'rib', 'loopback', 'moleskin'];
	const FLATS: FlatKind[] = [
		'coat',
		'jacket',
		'crew',
		'halfzip',
		'shirt',
		'trouser',
		'sweat',
		'tee'
	];

	// Newlines mean this cannot live inline in the markup.
	const NOTES_HINT = 'Undyed horn buttons\nHalf-lined in cupro\nTwo-year repair on seams';

	const PLACEHOLDER =
		'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1100&q=80';

	// Next free stock number, two digits, so a new piece lands at the end of the book.
	function nextNo() {
		const highest = stock.all.reduce((n, p) => Math.max(n, Number(p.no) || 0), 0);
		return String(highest + 1).padStart(2, '0');
	}

	// Seeded once, deliberately: the fields must not reset under the writer's
	// hands. The edit page remounts this form with {#key} when the piece changes.
	const seed = untrack(() => existing);

	let no = $state(seed?.no ?? nextNo());
	let name = $state(seed?.name ?? '');
	let dept = $state(seed?.dept ?? departments[0].slug);
	let cloth = $state(seed?.cloth ?? '');
	let mill = $state(seed?.mill ?? '');
	let gsm = $state(seed ? String(seed.gsm) : '');
	let weave = $state<Weave>(seed?.weave ?? 'plain');
	let flat = $state<FlatKind>(seed?.flat ?? 'tee');
	let rupees = $state(seed ? String(Math.round(seed.price / 100)) : '');
	let photo = $state(seed?.photo ?? '');
	let alt = $state(seed?.alt ?? '');
	let hand = $state(seed?.hand ?? '');
	let notes = $state((seed?.notes ?? []).join('\n'));
	let touched = $state(false);
	let saved = $state(false);
	let failure = $state('');

	// The garment decides the ladder, not the fabric — trousers are cut in denim
	// and chino as much as in trousering.
	const onWaist = $derived(flat === 'trouser');

	// The preview is a real ProductCard, so what you see here is what the shop renders.
	const draft = $derived<Product>({
		id: seed?.id ?? `p-${slug(name) || 'untitled'}`,
		no: no.trim() || '00',
		name: name.trim() || 'Untitled piece',
		dept,
		cloth: cloth.trim() || 'Unnamed cloth',
		mill: mill.trim() || 'Mill not stated',
		gsm: Number(gsm) || 0,
		weave,
		flat,
		price: Math.max(0, Math.round(Number(rupees) || 0)) * 100,
		photo: photo.trim() || PLACEHOLDER,
		alt: alt.trim() || `Photograph of the ${name.trim() || 'piece'}`,
		hand: hand.trim(),
		notes: notes
			.split('\n')
			.map((n) => n.trim())
			.filter(Boolean),
		fit: onWaist ? WAIST_FIT : TOP_FIT,
		sizes: onWaist ? WAISTS : TOPS
	});

	function slug(v: string) {
		return v
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '')
			.slice(0, 40);
	}

	type Problem = { text: string; fix?: { href: string; label: string } };

	// A piece posted from here takes its address from its name, so two pieces
	// with the same name would occupy one URL and the second would quietly
	// replace the first. Both clashes below say which piece is in the way.
	const nameClash = $derived(seed ? undefined : stock.all.find((p) => p.id === draft.id));
	const numberClash = $derived(stock.all.find((p) => p.id !== draft.id && p.no === draft.no));

	const problems = $derived<Problem[]>(
		(
			[
				!name.trim() && { text: 'A name.' },
				!no.trim() && { text: 'A stock number.' },
				!cloth.trim() && { text: 'The cloth it is cut from.' },
				!Number(gsm) && { text: 'A cloth weight in gsm.' },
				!Number(rupees) && { text: 'A price in rupees.' },
				!hand.trim() && { text: 'A description — what the cloth is like in the hand.' },
				nameClash && {
					text: `“${nameClash.name}” already sits at /product/${nameClash.id}. Change the name here, or edit that piece instead.`,
					fix: {
						href: resolve('/admin/edit/[id]', { id: nameClash.id }),
						label: `Edit ${nameClash.name}`
					}
				},
				numberClash && {
					text: `Stock number ${draft.no} belongs to ${numberClash.name}.`,
					fix: {
						href: resolve('/admin/edit/[id]', { id: numberClash.id }),
						label: `Edit ${numberClash.name}`
					}
				}
			] as (Problem | false | undefined)[]
		).filter((v): v is Problem => Boolean(v))
	);

	function submit(e: SubmitEvent) {
		e.preventDefault();
		touched = true;
		failure = '';
		if (problems.length) return;
		try {
			stock.save(draft);
		} catch (err) {
			// Almost always the storage quota, and almost always a photograph.
			failure =
				err instanceof QuotaError
					? err.message
					: 'The change could not be stored. Nothing has been lost — try again.';
			return;
		}
		saved = true;
		goto(resolve('/admin'));
	}
</script>

<form onsubmit={submit}>
	<div class="cols">
		<div class="fields">
			<section class="panel block">
				<h2>The piece</h2>

				<div class="row two">
					<p class="field short">
						<label class="label" for="no">Stock no.</label>
						<input id="no" class="num" bind:value={no} placeholder="11" />
					</p>
					<p class="field">
						<label class="label" for="name">Name</label>
						<input id="name" bind:value={name} placeholder="Donegal Overshirt" />
					</p>
				</div>

				<div class="row two">
					<p class="field">
						<label class="label" for="dept">Department</label>
						<select id="dept" bind:value={dept}>
							{#each departments as d (d.slug)}
								<option value={d.slug}>{d.name}</option>
							{/each}
						</select>
					</p>
					<p class="field">
						<label class="label" for="flat">Garment</label>
						<select id="flat" bind:value={flat}>
							{#each FLATS as f (f)}
								<option value={f}>{TYPE_NAME[f]}</option>
							{/each}
						</select>
					</p>
				</div>

				<p class="hint">
					The garment sets which technical flat is drawn for it, and the department sets whether it
					ladders on chest or waist.
				</p>
			</section>

			<section class="panel block">
				<h2>The cloth</h2>

				<div class="row two">
					<p class="field">
						<label class="label" for="cloth">Cloth</label>
						<input id="cloth" bind:value={cloth} placeholder="Donegal tweed" />
					</p>
					<p class="field">
						<label class="label" for="mill">Mill</label>
						<input id="mill" bind:value={mill} placeholder="Molloy &amp; Sons, Donegal" />
					</p>
				</div>

				<div class="row two">
					<p class="field short">
						<label class="label" for="gsm">Weight (gsm)</label>
						<input id="gsm" class="num" inputmode="numeric" bind:value={gsm} placeholder="420" />
					</p>
					<p class="field">
						<label class="label" for="weave">Structure</label>
						<select id="weave" bind:value={weave}>
							{#each WEAVES as w (w)}
								<option value={w}>{weaveName[w]}</option>
							{/each}
						</select>
					</p>
				</div>

				<div class="swatch">
					<Cloth {weave} caption="Drawn live from the structure you pick" />
				</div>
			</section>

			<section class="panel block">
				<h2>Description</h2>

				<p class="field">
					<label class="label" for="hand">In the hand</label>
					<textarea
						id="hand"
						bind:value={hand}
						placeholder="Milled until the twill closes up. Cut edges do not fray; the coat has no facing on the hem."
					></textarea>
					<span class="hint">
						Two sentences on what the cloth is actually like. This is the paragraph under the price,
						and it is the thing a photograph cannot show.
					</span>
				</p>

				<p class="field">
					<label class="label" for="notes">Make notes</label>
					<textarea id="notes" bind:value={notes} placeholder={NOTES_HINT}></textarea>
					<span class="hint">One per line. Rendered as the bulleted list on the product page.</span>
				</p>
			</section>

			<section class="panel block">
				<h2>Price and photograph</h2>

				<p class="field short">
					<label class="label" for="rupees">Price (₹)</label>
					<input
						id="rupees"
						class="num"
						inputmode="numeric"
						bind:value={rupees}
						placeholder="8499"
					/>
				</p>

				<PhotoField bind:value={photo} />
				<p class="hint standalone">
					Leave it empty and a stand-in is used until you have a shot of your own.
				</p>

				<p class="field">
					<label class="label" for="alt">Alt text</label>
					<input
						id="alt"
						bind:value={alt}
						placeholder="A flecked grey overshirt hung open on a rail"
					/>
					<span class="hint">
						Describe the photograph, not the piece. Someone reading with a screen reader gets this
						instead of the image.
					</span>
				</p>
			</section>
		</div>

		<aside class="side">
			<div class="panel sticky block">
				<h2>As the shop will show it</h2>
				<div class="preview">
					<ProductCard product={draft} eager />
				</div>

				<dl class="meta">
					<div>
						<dt>Address</dt>
						<dd class="num">/product/{draft.id}</dd>
					</div>
					<div>
						<dt>Ladders on</dt>
						<dd>{onWaist ? 'Waist' : 'Chest'}</dd>
					</div>
					<div>
						<dt>Sizes</dt>
						<dd>{draft.sizes.join(' · ')}</dd>
					</div>
				</dl>

				{#if failure}
					<div class="problems" role="alert">
						<p>Not stored</p>
						<p class="plain">{failure}</p>
					</div>
				{/if}

				{#if touched && problems.length}
					<div class="problems" role="alert">
						<p>Before this can be posted</p>
						<ul>
							{#each problems as p (p.text)}
								<li>
									{p.text}
									{#if p.fix}
										<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- href is already resolved above -->
										<a href={p.fix.href}>{p.fix.label} →</a>
									{/if}
								</li>
							{/each}
						</ul>
					</div>
				{/if}

				<div class="actions">
					<button class="btn primary" type="submit" disabled={saved}>
						{seed ? 'Save changes' : 'Post to the book'}
					</button>
					<a class="btn" href={resolve('/admin')}>Cancel</a>
				</div>
			</div>
		</aside>
	</div>
</form>

<style>
	form {
		padding: clamp(1rem, 3vw, 2rem);
	}

	.cols {
		display: grid;
		gap: 1.2rem;
		align-items: start;
	}

	.fields {
		display: grid;
		gap: 1.2rem;
		min-width: 0;
	}

	.block {
		padding: 1.1rem 1.2rem 1.3rem;
	}

	h2 {
		font-size: 0.72rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--faint);
		margin-bottom: 1rem;
	}

	.row {
		display: grid;
		gap: 0.9rem;
	}

	.field {
		margin: 0 0 0.9rem;
		min-width: 0;
	}

	.row .field {
		margin-bottom: 0;
	}

	.short {
		max-width: 10rem;
	}

	.hint {
		display: block;
		margin-top: 0.35rem;
		color: var(--faint);
		font-size: 0.76rem;
		line-height: 1.45;
	}

	.swatch {
		margin-top: 1rem;
		max-width: 22rem;
	}

	.sticky {
		position: sticky;
		top: 5rem;
	}

	.preview {
		max-width: 15rem;
		margin-bottom: 1.1rem;
		/* The card is built for shop paper, so it gets shop paper to sit on. */
		background: oklch(0.97 0.012 25);
		--ink: oklch(0.24 0.04 25);
		--muted: oklch(0.42 0.035 25);
		--surface: oklch(0.99 0.006 25);
		--primary: oklch(0.5 0.19 27);
		--on-primary: oklch(0.98 0.01 25);
		padding: 0.6rem;
		border-radius: 4px;
	}

	.meta {
		margin: 0 0 1rem;
		display: grid;
		gap: 0.4rem;
	}

	.meta div {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		padding-bottom: 0.4rem;
		border-bottom: 1px solid var(--line);
		font-size: 0.78rem;
	}

	dt {
		color: var(--faint);
	}

	dd {
		margin: 0;
		text-align: right;
		word-break: break-all;
	}

	.problems {
		margin-bottom: 1rem;
		padding: 0.7rem 0.8rem;
		border-radius: 4px;
		background: color-mix(in oklch, var(--brand) 16%, transparent);
		border: 1px solid var(--brand-dim);
		font-size: 0.8rem;
	}

	.problems p {
		margin: 0 0 0.35rem;
		font-weight: 700;
	}

	.problems ul {
		margin: 0;
		padding-left: 1.1rem;
		color: var(--dim);
	}

	.problems li + li {
		margin-top: 0.4rem;
	}

	.problems a {
		display: inline-block;
		margin-top: 0.2rem;
		color: var(--ink);
		font-weight: 600;
		text-underline-offset: 0.2em;
	}

	.problems .plain {
		margin: 0;
		font-weight: 400;
		color: var(--dim);
	}

	.hint.standalone {
		margin: -0.4rem 0 0.9rem;
	}

	.actions {
		display: flex;
		gap: 0.5rem;
	}

	.actions .btn {
		flex: 1;
	}

	@media (min-width: 640px) {
		.row.two {
			grid-template-columns: auto 1fr;
		}
	}

	@media (min-width: 1040px) {
		.cols {
			grid-template-columns: minmax(0, 1fr) 20rem;
			gap: 1.6rem;
		}
	}
</style>
