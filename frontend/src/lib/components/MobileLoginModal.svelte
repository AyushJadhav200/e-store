<script lang="ts">
	import { auth } from '$lib/auth.svelte';
	import { BRAND } from '$lib/brand';

	let mobileInput = $state('');
	let otpInput = $state('');
	let step = $state<'mobile' | 'otp'>('mobile');
	let errorMsg = $state('');
	let loading = $state(false);

	function handleSendOtp(e: SubmitEvent) {
		e.preventDefault();
		const cleanNumber = mobileInput.replace(/\D/g, '');
		if (cleanNumber.length < 10) {
			errorMsg = 'Please enter a valid 10-digit mobile number.';
			return;
		}
		errorMsg = '';
		loading = true;

		setTimeout(() => {
			loading = false;
			step = 'otp';
			// Auto pre-fill demo OTP for instant testing convenience
			otpInput = '1234';
		}, 400);
	}

	function handleVerifyOtp(e: SubmitEvent) {
		e.preventDefault();
		if (otpInput.trim().length < 4) {
			errorMsg = 'Please enter the 4-digit verification code.';
			return;
		}
		errorMsg = '';
		loading = true;

		setTimeout(() => {
			loading = false;
			auth.login(mobileInput.trim());
			// Reset form state
			step = 'mobile';
			mobileInput = '';
			otpInput = '';
		}, 300);
	}

	function close() {
		auth.closeLogin();
		step = 'mobile';
		errorMsg = '';
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') close();
	}
</script>

{#if auth.loginModalOpen}
	<div
		class="modal-backdrop"
		role="presentation"
		onclick={close}
		onkeydown={handleKeydown}
	>
		<div
			class="modal-card"
			role="dialog"
			aria-modal="true"
			aria-labelledby="login-modal-title"
			onclick={(e) => e.stopPropagation()}
		>
			<button class="close-btn" onclick={close} aria-label="Close modal">
				&times;
			</button>

			<div class="header-emblem">
				<img src="/vc-emblem.jpg" alt="{BRAND} Emblem" class="emblem-img" />
				<h2 id="login-modal-title" class="brand-name">{BRAND}</h2>
			</div>

			{#if step === 'mobile'}
				<div class="step-box">
					<h3>Sign in with Mobile</h3>
					<p class="subtext">Enter your mobile number to sign in or complete your order.</p>

					<form onsubmit={handleSendOtp} class="login-form">
						<div class="phone-input-group">
							<span class="country-code">🇮🇳 +91</span>
							<input
								type="tel"
								placeholder="Enter 10-digit mobile number"
								bind:value={mobileInput}
								maxlength="10"
								required
								autocomplete="tel-national"
								class="phone-field"
							/>
						</div>

						{#if errorMsg}
							<p class="error-text" role="alert">{errorMsg}</p>
						{/if}

						<button type="submit" class="submit-btn" disabled={loading}>
							{loading ? 'Sending OTP…' : 'Get Verification Code'}
						</button>
					</form>
				</div>
			{:else}
				<div class="step-box">
					<h3>Verify Mobile Number</h3>
					<p class="subtext">
						We sent a 4-digit code to <strong>+91 {mobileInput}</strong>
					</p>

					<form onsubmit={handleVerifyOtp} class="login-form">
						<div class="otp-group">
							<input
								type="text"
								placeholder="Enter OTP (e.g. 1234)"
								bind:value={otpInput}
								maxlength="6"
								required
								class="otp-field"
							/>
						</div>

						<p class="hint-text">Demo verification code: <strong>1234</strong></p>

						{#if errorMsg}
							<p class="error-text" role="alert">{errorMsg}</p>
						{/if}

						<button type="submit" class="submit-btn" disabled={loading}>
							{loading ? 'Verifying…' : 'Verify & Continue'}
						</button>

						<button type="button" class="change-num-btn" onclick={() => (step = 'mobile')}>
							Change mobile number
						</button>
					</form>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		z-index: 9999;
		background: rgba(0, 0, 0, 0.65);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		animation: fadeIn 0.25s ease;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.modal-card {
		background: #ffffff;
		width: 100%;
		max-width: 420px;
		border-radius: 24px;
		padding: 2.2rem 1.8rem;
		position: relative;
		box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
		border: 1px solid rgba(160, 30, 30, 0.15);
		animation: popUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
	}

	@keyframes popUp {
		from {
			transform: scale(0.92) translateY(10px);
			opacity: 0;
		}
		to {
			transform: scale(1) translateY(0);
			opacity: 1;
		}
	}

	.close-btn {
		position: absolute;
		top: 1rem;
		right: 1.2rem;
		border: 0;
		background: none;
		font-size: 1.8rem;
		color: #777;
		cursor: pointer;
		line-height: 1;
		transition: color 0.2s;
	}

	.close-btn:hover {
		color: #000;
	}

	.header-emblem {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	.emblem-img {
		width: 68px;
		height: 68px;
		border-radius: 16px;
		object-fit: cover;
		margin-bottom: 0.5rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
	}

	.brand-name {
		font-family: 'Cinzel', serif;
		font-size: 1.4rem;
		font-weight: 700;
		letter-spacing: 0.2em;
		color: var(--primary);
		margin: 0;
		text-transform: uppercase;
	}

	.step-box {
		text-align: center;
	}

	.step-box h3 {
		font-family: 'Cinzel', serif;
		font-size: 1.2rem;
		font-weight: 600;
		margin: 0 0 0.4rem;
		color: #111;
	}

	.subtext {
		font-size: 0.85rem;
		color: #666;
		margin: 0 0 1.5rem;
		line-height: 1.4;
	}

	.login-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.phone-input-group {
		display: flex;
		align-items: center;
		border: 1px solid #ccc;
		border-radius: 12px;
		overflow: hidden;
		background: #fafafa;
		transition: border-color 0.2s;
	}

	.phone-input-group:focus-within {
		border-color: #000;
		background: #fff;
	}

	.country-code {
		padding: 0.8rem 0.9rem;
		font-weight: 600;
		font-size: 0.92rem;
		background: #eee;
		border-right: 1px solid #ccc;
		color: #333;
		white-space: nowrap;
	}

	.phone-field {
		flex: 1;
		border: 0;
		padding: 0.8rem 1rem;
		font-size: 1rem;
		font-weight: 600;
		letter-spacing: 0.05em;
		outline: none;
		background: transparent;
	}

	.otp-group {
		display: flex;
		justify-content: center;
	}

	.otp-field {
		width: 100%;
		border: 1px solid #ccc;
		border-radius: 12px;
		padding: 0.8rem 1rem;
		font-size: 1.2rem;
		font-weight: 700;
		letter-spacing: 0.3em;
		text-align: center;
		outline: none;
		background: #fafafa;
	}

	.otp-field:focus {
		border-color: #000;
		background: #fff;
	}

	.hint-text {
		font-size: 0.8rem;
		color: #777;
		margin: 0.2rem 0 0.5rem;
	}

	.error-text {
		font-size: 0.82rem;
		color: #d32f2f;
		margin: 0;
		font-weight: 600;
	}

	.submit-btn {
		min-height: 3.2rem;
		background: #000000;
		color: #ffffff;
		border: 0;
		border-radius: 999px;
		font-size: 0.95rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		cursor: pointer;
		transition: background-color 0.2s;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.submit-btn:hover {
		background: #222222;
	}

	.change-num-btn {
		border: 0;
		background: none;
		font-size: 0.82rem;
		color: #666;
		text-decoration: underline;
		cursor: pointer;
		margin-top: 0.2rem;
	}

	.change-num-btn:hover {
		color: #000;
	}
</style>
