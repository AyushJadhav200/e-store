<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { bag } from '$lib/bag.svelte';
	import { fit } from '$lib/fit.svelte';
	import { saved } from '$lib/saved.svelte';
	import { departments } from '$lib/catalog';
	import Mark from './Mark.svelte';

	let q = $state('');
	let open = $state(false);
	let stamping = $state(false);
	let panel: HTMLElement | undefined = $state();

	onMount(() => {
		bag.hydrate();
		fit.hydrate();
		saved.hydrate();
	});

	const here = $derived(page.url.pathname);
	const on = (path: string) => (here === path || here.startsWith(path + '/') ? 'page' : undefined);

	// Every add presses the seal again.
	$effect(() => {
		if (bag.stamped === 0) return;
		stamping = true;
		const t = setTimeout(() => (stamping = false), 620);
		return () => clearTimeout(t);
	});

	// The drawer closes on Escape and on any move to a new page.
	$effect(() => {
		void here;
		open = false;
	});

	$effect(() => {
		if (!open) return;
		const esc = (e: KeyboardEvent) => e.key === 'Escape' && (open = false);
		window.addEventListener('keydown', esc);
		panel?.focus();
		return () => window.removeEventListener('keydown', esc);
	});

	function search(e: SubmitEvent) {
		e.preventDefault();
		const term = q.trim();
		if (!term) return;
		goto(resolve(`/search?q=${encodeURIComponent(term)}`));
		open = false;
	}

	/** How many fabrics get a place on the bar itself. */
	const onBar = 6;

	const shopPages = [
		{ href: '/shop', label: 'All products' },
		{ href: '/saved', label: 'Saved' },
		{ href: '/size-guide', label: 'Size guide' },
		{ href: '/shipping', label: 'Shipping' },
		{ href: '/returns', label: 'Returns' },
		{ href: '/care', label: 'Care' },
		{ href: '/faq', label: 'FAQ' },
		{ href: '/about', label: 'About' },
		{ href: '/contact', label: 'Contact' }
	] as const;
</script>

<!-- The standing promises, stated before anything is sold. -->
<div class="strip">
	<div class="wrap">
		<span>Free delivery over ₹2,999</span>
		<span>30-day returns, we pay postage</span>
		<span>Made in India</span>
	</div>
</div>

<header class="head">
	<div class="bar wrap">
		<button
			class="burger"
			type="button"
			aria-expanded={open}
			aria-controls="contents"
			onclick={() => (open = !open)}
		>
			<span aria-hidden="true"></span>
			<span aria-hidden="true"></span>
			<span aria-hidden="true"></span>
			<em>{open ? 'Close' : 'Menu'}</em>
		</button>

		<nav class="tabs" aria-label="Fabrics">
			{#each departments.slice(0, onBar) as d (d.slug)}
				<a href={resolve('/shop/[dept]', { dept: d.slug })} aria-current={on('/shop/' + d.slug)}>
					{d.name}
				</a>
			{/each}
			{#if departments.length > onBar}
				<button class="more" type="button" onclick={() => (open = true)}>All fabrics</button>
			{/if}
		</nav>

		<a class="brand" href={resolve('/')} class:stamping>
			<Mark size={38} />
			<span class="word">PLY</span>
		</a>

		<div class="right">
			<form class="search" onsubmit={search} role="search">
				<label class="sr" for="q">Search the stock book</label>
				<input id="q" type="search" placeholder="Search products" bind:value={q} />
				<button type="submit" aria-label="Look up">
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<circle cx="11" cy="11" r="6.4" />
						<path d="M16.2 16.2 21 21" />
					</svg>
				</button>
			</form>

			<div class="tools">
				<a class="tool" href={resolve('/size-guide')} aria-label="Size guide">
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<rect x="2.5" y="8" width="19" height="8" />
						<path d="M7 8v3M11 8v4.5M15 8v3M19 8v4.5" />
					</svg>
					{#if fit.known}<i class="dot" aria-hidden="true"></i>{/if}
				</a>

				<a class="tool" href={resolve('/saved')} aria-label="Saved">
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<path
							d="M12 20.2 4.6 13a4.6 4.6 0 0 1 6.5-6.5l.9.9.9-.9A4.6 4.6 0 1 1 19.4 13Z"
							fill={saved.count ? 'currentColor' : 'none'}
						/>
					</svg>
					{#if saved.count}<span class="n small">{saved.count}</span>{/if}
				</a>

				<a class="tool parcel" href={resolve('/bag')} class:stamping aria-label="Your bag">
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<path d="M3.5 7.5 12 3.5l8.5 4v9L12 20.5l-8.5-4z" />
						<path d="M3.5 7.5 12 11.5l8.5-4M12 11.5v9" />
					</svg>
					<span class="n">{bag.ready ? bag.count : 0}</span>
				</a>
			</div>
		</div>
	</div>
</header>

{#if open}
	<div class="scrim" role="presentation" onclick={() => (open = false)}></div>
{/if}

<!-- Contents, set as the front matter of a catalogue rather than a mega-menu. -->
<nav
	id="contents"
	class="drawer"
	class:open
	aria-label="Contents"
	aria-hidden={!open}
	bind:this={panel}
	tabindex="-1"
>
	<p class="lead">Fabrics</p>
	<ul>
		{#each departments as d (d.slug)}
			<li>
				<a href={resolve('/shop/[dept]', { dept: d.slug })} tabindex={open ? 0 : -1}>
					<strong>{d.name}</strong>
					<small>{d.note}</small>
				</a>
			</li>
		{/each}
	</ul>

	<p class="lead">More</p>
	<ul class="plain">
		{#each shopPages as p (p.href)}
			<li>
				<a href={resolve(p.href)} tabindex={open ? 0 : -1} aria-current={on(p.href)}>{p.label}</a>
			</li>
		{/each}
	</ul>
</nav>

<style>
	.sr {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}

	.strip {
		background: var(--accent);
		color: oklch(0.95 0.02 35);
		font-size: 0.72rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	.strip .wrap {
		display: flex;
		justify-content: center;
		gap: 1.4rem;
		padding: 0.45rem 0;
		overflow-x: auto;
		scrollbar-width: none;
		white-space: nowrap;
	}

	.strip .wrap::-webkit-scrollbar {
		display: none;
	}

	.strip span:not(:first-child) {
		display: none;
	}

	.head {
		position: sticky;
		top: 0;
		z-index: var(--z-header);
		background: var(--surface);
		border-bottom: 1px solid color-mix(in oklch, var(--ink) 14%, transparent);
	}

	.bar {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: 0.8rem;
		padding: 0.5rem 0;
	}

	.burger {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		border: 0;
		background: none;
		color: var(--ink);
		font: inherit;
		cursor: pointer;
		padding: 0.4rem 0.1rem;
		min-height: 2.75rem;
	}

	.burger span {
		display: block;
		width: 1.15rem;
		height: 1.5px;
		background: var(--ink);
		margin: 3px 0;
	}

	.burger span:nth-child(2) {
		width: 0.8rem;
	}

	.burger em {
		display: none;
		font-style: normal;
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	.tabs {
		display: none;
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		justify-self: center;
		text-decoration: none;
	}

	.word {
		font-family: var(--font-sans);
		font-weight: 800;
		font-size: 1.35rem;
		letter-spacing: 0.02em;
		line-height: 1;
		color: var(--primary);
		text-transform: uppercase;
	}

	.brand.stamping :global(.puck) {
		animation: press 0.62s var(--ease-out-expo);
	}

	@keyframes press {
		0% {
			transform: rotateX(-13deg) rotateY(-20deg) scale(1);
		}
		28% {
			transform: rotateX(2deg) rotateY(0deg) scale(0.86);
		}
		100% {
			transform: rotateX(-13deg) rotateY(-20deg) scale(1);
		}
	}

	.search {
		display: none;
	}

	.right {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		justify-self: end;
	}

	.tools {
		display: flex;
		align-items: center;
		gap: 0.2rem;
	}

	.tool {
		position: relative;
		display: grid;
		place-items: center;
		width: 2.75rem;
		height: 2.75rem;
		color: var(--ink);
	}

	.tool:hover {
		color: var(--primary);
	}

	.tool svg {
		width: 1.35rem;
		height: 1.35rem;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.5;
		stroke-linejoin: round;
	}

	.n.small {
		background: var(--ink);
	}

	.dot {
		position: absolute;
		top: 0.5rem;
		right: 0.55rem;
		width: 0.42rem;
		height: 0.42rem;
		border-radius: 50%;
		background: var(--primary);
	}

	.n {
		position: absolute;
		top: 0.25rem;
		right: 0.15rem;
		min-width: 1.05rem;
		height: 1.05rem;
		display: grid;
		place-items: center;
		padding: 0 0.2rem;
		background: var(--primary);
		color: var(--on-primary);
		font-size: 0.66rem;
		font-weight: 700;
		border-radius: 999px;
	}

	.parcel.stamping .n {
		animation: flash 0.62s var(--ease-out-expo);
	}

	@keyframes flash {
		0%,
		100% {
			transform: scale(1);
		}
		35% {
			transform: scale(1.4);
		}
	}

	.scrim {
		position: fixed;
		inset: 0;
		z-index: calc(var(--z-header) + 1);
		background: oklch(0.2 0.04 25 / 0.45);
	}

	.drawer {
		position: fixed;
		top: 0;
		left: 0;
		bottom: 0;
		z-index: calc(var(--z-header) + 2);
		width: min(22rem, 86vw);
		padding: 1.4rem 1.3rem 2rem;
		background: var(--bg);
		border-right: 2px solid var(--primary);
		overflow-y: auto;
		transform: translateX(-102%);
		visibility: hidden;
		transition:
			transform 0.4s var(--ease-out-expo),
			visibility 0.4s;
		outline: none;
	}

	.drawer.open {
		transform: none;
		visibility: visible;
	}

	.lead {
		margin: 0.6rem 0 0.5rem;
		font-size: 0.68rem;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--muted);
		font-weight: 700;
	}

	.drawer ul {
		list-style: none;
		margin: 0 0 1.4rem;
		padding: 0;
	}

	.drawer a {
		display: block;
		padding: 0.7rem 0;
		border-top: 1px solid color-mix(in oklch, var(--ink) 12%, transparent);
		color: var(--ink);
		text-decoration: none;
	}

	.drawer a:hover strong,
	.drawer a[aria-current='page'] {
		color: var(--primary);
	}

	.drawer strong {
		display: block;
		font-family: var(--font-display);
		font-weight: 500;
		font-size: 1.15rem;
	}

	.drawer small {
		display: block;
		margin-top: 0.15rem;
		color: var(--muted);
		font-size: 0.82rem;
		text-wrap: pretty;
	}

	.drawer .plain a {
		font-weight: 600;
		font-size: 0.95rem;
		padding: 0.6rem 0;
	}

	@media (min-width: 700px) {
		.strip span:not(:first-child) {
			display: inline;
		}

		.strip .wrap {
			gap: 2.5rem;
		}

		.burger em {
			display: inline;
		}
	}

	@media (min-width: 1000px) {
		.bar {
			grid-template-columns: 1fr auto 1fr;
			padding: 0.6rem 0;
		}

		.burger {
			grid-column: 1;
			grid-row: 1;
			justify-self: start;
		}

		/* The cloths sit on the bar itself, the rest stays in the drawer. */
		.tabs {
			display: flex;
			grid-column: 1;
			grid-row: 1;
			gap: 1.15rem;
			margin-left: 9.5rem;
		}

		.tabs a {
			display: inline-flex;
			align-items: center;
			min-height: 2.75rem;
			color: var(--ink);
			text-decoration: none;
			font-size: 0.86rem;
			font-weight: 700;
			letter-spacing: 0.06em;
			text-transform: uppercase;
			border-bottom: 2px solid transparent;
		}

		.tabs a:hover,
		.tabs .more:hover {
			color: var(--primary);
		}

		.tabs .more {
			display: inline-flex;
			align-items: center;
			min-height: 2.75rem;
			padding: 0;
			border: 0;
			background: none;
			color: var(--muted);
			font: inherit;
			font-size: 0.86rem;
			font-weight: 700;
			letter-spacing: 0.06em;
			text-transform: uppercase;
			cursor: pointer;
		}

		.tabs a[aria-current='page'] {
			color: var(--primary);
			border-bottom-color: var(--primary);
		}

		.search {
			display: grid;
			grid-template-columns: 1fr auto;
			align-items: center;
			width: min(15rem, 100%);
			border: 1px solid color-mix(in oklch, var(--ink) 22%, transparent);
			border-radius: 999px;
			padding-left: 0.9rem;
			background: var(--bg);
		}

		.search:focus-within {
			border-color: var(--primary);
		}

		.search input {
			min-width: 0;
			border: 0;
			background: transparent;
			font: inherit;
			font-size: 0.86rem;
			color: var(--ink);
			padding: 0.55rem 0;
			outline: none;
		}

		.search input::-webkit-search-decoration,
		.search input::-webkit-search-cancel-button {
			-webkit-appearance: none;
		}

		.search button {
			display: grid;
			place-items: center;
			width: 2.5rem;
			height: 2.5rem;
			border: 0;
			background: none;
			color: var(--primary);
			cursor: pointer;
			padding: 0;
		}

		.search svg {
			width: 1.05rem;
			height: 1.05rem;
			fill: none;
			stroke: currentColor;
			stroke-width: 1.8;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.drawer {
			transition: none;
		}

		.brand.stamping :global(.puck),
		.parcel.stamping .n {
			animation: none;
		}
	}
</style>
