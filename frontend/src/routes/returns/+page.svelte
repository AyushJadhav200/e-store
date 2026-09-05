<script lang="ts">
	import { resolve } from '$app/paths';
	import PageIntro from '$lib/components/PageIntro.svelte';
</script>

<main id="main">
	<PageIntro title="Returns">
		<p>
			You have 30 days from delivery to send a piece back, under the Consumer Contracts Regulations
			and the Consumer Rights Act 2015. It must be unworn, unwashed, with labels on.
		</p>
		<h2>How to return</h2>
		<ol>
			<li>
				Email <a href="mailto:returns@ply.example">returns@ply.example</a> with your order number.
			</li>
			<li>
				We reply with a prepaid return label for any pin code we deliver to, or an address if you
				are outside India (you pay that postage).
			</li>
			<li>Pack the garment in the original wrap if you still have it.</li>
			<li>
				Refunds go to the original payment method within 5 working days of the piece arriving back.
			</li>
		</ol>
		<h2>Exchanges</h2>
		<p>
			We exchange size when the new size is in stock. If it is not, we refund and you order again
			from
			<a href={resolve('/shop')}>the list</a>.
		</p>
		<h2>Faults</h2>
		<p>
			If a seam fails or the cloth is flawed, write with photographs. We repair, replace, or refund.
			Sale of goods law is not limited to 30 days for faults that were there at delivery.
		</p>
		<p>Underwear and pieces marked final sale cannot be returned unless faulty.</p>
	</PageIntro>
</main>
