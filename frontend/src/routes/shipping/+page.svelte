<script lang="ts">
	import PageIntro from '$lib/components/PageIntro.svelte';
</script>

<main id="main">
	<PageIntro title="Shipping">
		<p>
			Orders leave the Lower Parel studio Monday to Saturday, before 16:00 IST. Anything placed
			after that goes out the next working day.
		</p>

		<h2>India</h2>
		<div class="scroller">
			<table>
				<caption>Carriage is charged once per order, not per piece.</caption>
				<thead>
					<tr>
						<th scope="col">Service</th>
						<th scope="col">Time</th>
						<th scope="col">Cost</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Standard, tracked</td>
						<td>3–6 working days</td>
						<td>₹99, free over ₹2,999</td>
					</tr>
					<tr>
						<td>Express, tracked</td>
						<td>1–3 working days</td>
						<td>₹249</td>
					</tr>
				</tbody>
			</table>
		</div>
		<p>
			Metro pin codes are usually the short end of those ranges. We do not deliver to PO boxes, and
			we do not offer cash on delivery — every order is paid before it is packed.
		</p>

		<h2>Outside India</h2>
		<p>
			Tracked parcel, 7–14 working days, from ₹2,400 depending on weight. Duties and taxes are
			charged on arrival by your customs; we do not collect them at checkout and we cannot estimate
			them for you.
		</p>

		<h2>If it does not arrive</h2>
		<p>
			Lost parcels are claimed with the carrier. Wait 10 working days past the last scan before
			writing, then email us the order number and we will open the claim ourselves. You are not
			asked to chase the carrier.
		</p>

		<h2>What we send</h2>
		<p>
			Paper wrap, seal sticker, care card. No plastic mailers. If you need a gift note, say so in
			the order email.
		</p>
	</PageIntro>
</main>
