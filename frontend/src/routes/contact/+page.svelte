<script lang="ts">
	import PageIntro from '$lib/components/PageIntro.svelte';

	let name = $state('');
	let email = $state('');
	let order = $state('');
	let message = $state('');
	let sent = $state(false);
	let error = $state('');

	function submit(e: SubmitEvent) {
		e.preventDefault();
		error = '';
		if (!name.trim() || !email.includes('@') || message.trim().length < 10) {
			error = 'Name, a real email, and at least ten characters in the message.';
			return;
		}
		sent = true;
	}
</script>

<main id="main">
	<PageIntro title="Contact">
		<p>
			Unit 4, Sunmill Compound, Lower Parel, Mumbai 400013. Open to visits by appointment,
			Wednesday–Friday 11:00–17:00.
		</p>
		<p>Email <a href="mailto:hello@ply.example">hello@ply.example</a>. Phone +44 20 7946 0148.</p>

		<h2 id="orders">Write to us</h2>
		{#if sent}
			<p role="status">
				Received. We answer within two working days. This demo does not send a real email yet.
			</p>
		{:else}
			<form onsubmit={submit}>
				<label>
					Name
					<input name="name" autocomplete="name" bind:value={name} required />
				</label>
				<label>
					Email
					<input name="email" type="email" autocomplete="email" bind:value={email} required />
				</label>
				<label>
					Order number (optional)
					<input name="order" bind:value={order} />
				</label>
				<label>
					Message
					<textarea name="message" rows="6" bind:value={message} required></textarea>
				</label>
				{#if error}
					<p class="err" role="alert">{error}</p>
				{/if}
				<button type="submit">Send</button>
			</form>
		{/if}
	</PageIntro>
</main>

<style>
	form {
		display: grid;
		gap: 0.9rem;
		max-width: 32rem;
		margin-top: 0.5rem;
	}

	label {
		display: grid;
		gap: 0.3rem;
		font-weight: 600;
		font-size: 0.92rem;
	}

	input,
	textarea {
		font: inherit;
		font-weight: 400;
		padding: 0.55rem 0.65rem;
		border: 1px solid color-mix(in oklch, var(--ink) 22%, transparent);
		background: var(--surface);
		color: var(--ink);
	}

	button {
		justify-self: start;
		min-height: 2.75rem;
		padding: 0.45rem 1.2rem;
		border: 0;
		background: var(--primary);
		color: var(--on-primary);
		font: inherit;
		font-weight: 600;
		cursor: pointer;
	}

	.err {
		color: var(--primary);
		font-weight: 600;
	}
</style>
