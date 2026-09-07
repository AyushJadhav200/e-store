/**
 * PLY stock book.
 *
 * Yarn is spun in plies — two strands twisted hold where one lets go. The shop
 * sells a short list cut from mill cloth, so the catalogue is organised by cloth
 * — not by who is expected to wear it. Every piece carries its mill, its weight
 * and its weave, because that is the part a customer cannot see in a photograph.
 */

export type Weave = 'plain' | 'twill' | 'herringbone' | 'rib' | 'loopback' | 'moleskin';

/** Which technical flat is drawn for a piece. */
export type FlatKind =
	'coat' | 'jacket' | 'crew' | 'halfzip' | 'shirt' | 'trouser' | 'sweat' | 'tee';

export type Department = {
	slug: string;
	name: string;
	/** One line, shop-sign voice. Shown under the department heading. */
	note: string;
};

export type Product = {
	id: string;
	/** Stock number as it appears on the ticket. Ordering is the ledger order. */
	no: string;
	name: string;
	dept: string;
	cloth: string;
	mill: string;
	/** Cloth weight in grams per square metre. */
	gsm: number;
	weave: Weave;
	/** Price in paise, so no float ever touches a total. */
	price: number;
	flat: FlatKind;
	/** Shop photograph. The flat is the authority on the cut; this is the mood. */
	photo: string;
	alt: string;
	/** What the loupe is showing you. */
	hand: string;
	notes: string[];
	/** Body chest measurement in cm that each size is cut for. */
	fit: Record<string, [number, number]>;
	sizes: string[];
};

export const departments: Department[] = [
	{ slug: 'coating', name: 'Coating', note: 'Heavy milled wool. Cut to layer a knit underneath.' },
	{ slug: 'knit', name: 'Knit', note: 'Lambswool and geelong, knitted to shape, not cut and sewn.' },
	{ slug: 'shirting', name: 'Shirting', note: 'Oxford and poplin. Split yoke, no fused collar.' },
	{ slug: 'trousering', name: 'Trousering', note: 'Moleskin and cavalry twill, hems left unfinished.' },
	{ slug: 'jersey', name: 'Jersey', note: 'Loopback and interlock, dyed after knitting.' },
	{ slug: 'denim', name: 'Denim', note: 'Selvedge, woven on narrow looms and sold raw.' },
	{ slug: 'corduroy', name: 'Corduroy', note: 'Cut pile in wales. It fades where you fold it.' },
	{ slug: 'linen', name: 'Linen', note: 'Spun from flax. It creases, and it is meant to.' },
	{ slug: 'flannel', name: 'Flannel', note: 'Brushed on both faces. Warm without weight.' },
	{ slug: 'tweed', name: 'Tweed', note: 'Woollen spun and flecked in the yarn, not the finish.' },
	{ slug: 'chambray', name: 'Chambray', note: 'One coloured warp, one white weft. Shirt weight.' },
	{ slug: 'cashmere', name: 'Cashmere', note: 'Combed from the undercoat. Light, and it holds heat.' },
	{ slug: 'canvas', name: 'Canvas', note: 'Plain and heavy. Made to be worked in.' },
	{ slug: 'chino', name: 'Chino', note: 'Cotton twill with a soft hand and a hard wear.' },
	{ slug: 'seersucker', name: 'Seersucker', note: 'Puckered in the weave so it lifts off the skin.' },
	{ slug: 'velvet', name: 'Velvet', note: 'Dense short pile. It catches light along the nap.' },
	{ slug: 'waxed', name: 'Waxed cotton', note: 'Paraffin finished. Reproof it once a year.' },
	{ slug: 'fleece', name: 'Fleece', note: 'Knitted then brushed. Nothing is warmer for the weight.' },
	{ slug: 'silk', name: 'Silk', note: 'Reeled from the cocoon. Cold to the hand, then warm.' },
	{ slug: 'ripstop', name: 'Ripstop', note: 'A reinforcing grid woven in. A tear stops at the square.' }
];

export const TOPS = ['XS', 'S', 'M', 'L', 'XL'];
export const TOP_FIT: Record<string, [number, number]> = {
	XS: [86, 91],
	S: [91, 96],
	M: [96, 101],
	L: [101, 106],
	XL: [106, 112]
};

/** Trousers ladder on waist, not chest — same shape, different measurement. */
export const WAISTS = ['28', '30', '32', '34', '36'];
export const WAIST_FIT: Record<string, [number, number]> = {
	'28': [71, 75],
	'30': [76, 80],
	'32': [81, 85],
	'34': [86, 90],
	'36': [91, 95]
};

/**
 * The shipped stock book.
 *
 * Empty. Pieces are posted through the dashboard at /admin, and the storefront
 * reads whatever is in the working book — so a shop opens with nothing in it and
 * fills up as cloth is cut, rather than with someone else's sample list.
 */
export const products: Product[] = [
	{
		id: 'vc-101',
		no: '1AKLVW',
		name: 'Jacquard Zippered Turtleneck Cardigan',
		dept: 'knit',
		cloth: 'Highland Jacquard Mohair Blend',
		mill: 'Bower Roebuck, Yorkshire',
		gsm: 580,
		weave: 'rib',
		price: 30000000,
		flat: 'crew',
		photo: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=1000&auto=format&fit=crop',
		alt: 'Jacquard Zippered Turtleneck Cardigan',
		hand: 'Cozy mix of brushed mohair and fluffy cotton chenille depicting a scenic mountain landscape.',
		notes: [
			'Full-zip turtleneck cardigan with custom engraved metal pull',
			'Graphic allover Monogram Highlands jacquard motif',
			'Ribbed collar, cuffs and waistband',
			'Dry clean only'
		],
		fit: TOP_FIT,
		sizes: TOPS
	},
	{
		id: 'vc-102',
		no: '2VL780',
		name: 'Melton Wool Trench Overcoat',
		dept: 'coating',
		cloth: 'Heavy Milled Wool Melton',
		mill: 'Fox Brothers, Somerset',
		gsm: 740,
		weave: 'twill',
		price: 45000000,
		flat: 'coat',
		photo: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1000&auto=format&fit=crop',
		alt: 'Melton Wool Trench Overcoat',
		hand: 'Dense milled wool, wind-resistant and structured to layer a knit underneath.',
		notes: [
			'Double-breasted front with horn buttons',
			'Fully lined in cupro silk',
			'Storm flap and waist tie belt',
			'Made in Italy'
		],
		fit: TOP_FIT,
		sizes: TOPS
	},
	{
		id: 'vc-103',
		no: '3VL450',
		name: 'Sea Island Cotton Poplin Shirt',
		dept: 'shirting',
		cloth: 'Sea Island Cotton Poplin',
		mill: 'Thomas Mason, Bergamo',
		gsm: 140,
		weave: 'plain',
		price: 12000000,
		flat: 'shirt',
		photo: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1000&auto=format&fit=crop',
		alt: 'Sea Island Cotton Poplin Shirt',
		hand: 'Silky smooth hand, woven from extra-long staple West Indian Sea Island cotton.',
		notes: [
			'Split yoke construction',
			'Mother-of-pearl buttons',
			'Curved hem for tucked or untucked wear'
		],
		fit: TOP_FIT,
		sizes: TOPS
	},
	{
		id: 'vc-104',
		no: '4VL890',
		name: 'Tailored Cavalry Twill Trouser',
		dept: 'trousering',
		cloth: 'Heavy Cavalry Twill',
		mill: 'Brisbane Moss, Lancashire',
		gsm: 490,
		weave: 'moleskin',
		price: 18000000,
		flat: 'trouser',
		photo: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1000&auto=format&fit=crop',
		alt: 'Tailored Cavalry Twill Trouser',
		hand: 'Steep diagonal twill with a crisp drape and natural crease retention.',
		notes: [
			'High-rise waist with side adjusters',
			'Unfinished hems for custom tailoring',
			'Button fly closure'
		],
		fit: WAIST_FIT,
		sizes: WAISTS
	},
	{
		id: 'vc-105',
		no: '5VL320',
		name: 'Loopback Organic Sweatshirt',
		dept: 'jersey',
		cloth: 'Heavy Loopback Cotton',
		mill: 'Loopwheeler, Wakayama',
		gsm: 420,
		weave: 'loopback',
		price: 15000000,
		flat: 'sweat',
		photo: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1000&auto=format&fit=crop',
		alt: 'Loopback Organic Sweatshirt',
		hand: 'Knitted on vintage wheel machines for zero tension and enduring softness.',
		notes: [
			'Flatlock stitched seams',
			'Ribbed gusset underarms',
			'Pre-washed to prevent shrinkage'
		],
		fit: TOP_FIT,
		sizes: TOPS
	},
	{
		id: 'vc-106',
		no: '6VL910',
		name: 'Indigo Selvedge Denim Trucker',
		dept: 'denim',
		cloth: '14oz Raw Selvedge Denim',
		mill: 'Kuroki Mill, Okayama',
		gsm: 460,
		weave: 'twill',
		price: 28000000,
		flat: 'jacket',
		photo: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=1000&auto=format&fit=crop',
		alt: 'Indigo Selvedge Denim Trucker',
		hand: 'Stiff raw denim with red selvedge ID line that breaks in over time.',
		notes: [
			'Woven on narrow shuttle looms',
			'Solid brass hardware',
			'Dual chest flap pockets'
		],
		fit: TOP_FIT,
		sizes: TOPS
	}
];

/**
 * The structure a cloth is characteristically woven or knitted in. Used to draw
 * a department's header when nothing is currently cut in it.
 */
export const DEPT_WEAVE: Record<string, Weave> = {
	coating: 'twill',
	knit: 'rib',
	shirting: 'plain',
	trousering: 'moleskin',
	jersey: 'loopback',
	denim: 'twill',
	corduroy: 'rib',
	linen: 'plain',
	flannel: 'twill',
	tweed: 'herringbone',
	chambray: 'plain',
	cashmere: 'rib',
	canvas: 'plain',
	chino: 'twill',
	seersucker: 'plain',
	velvet: 'moleskin',
	waxed: 'twill',
	fleece: 'loopback',
	silk: 'plain',
	ripstop: 'plain'
};

/** What the piece is, for the line under its name on a card. */
export const TYPE_NAME: Record<FlatKind, string> = {
	coat: 'Overcoats',
	jacket: 'Jackets',
	crew: 'Crew Knits',
	halfzip: 'Half-Zips',
	shirt: 'Shirts',
	trouser: 'Trousers',
	sweat: 'Sweatshirts',
	tee: 'T-Shirts'
};

/** How it is cut, called out on the shot itself. */
export const FIT_NOTE: Record<FlatKind, string> = {
	coat: 'Cut to layer',
	jacket: 'Regular fit',
	crew: 'Regular fit',
	halfzip: 'Regular fit',
	shirt: 'Regular fit',
	trouser: 'Straight leg',
	sweat: 'Regular fit',
	tee: 'Regular fit'
};

/** Rupees, grouped the Indian way (₹1,89,999) and never showing paise. */
export const inr = (paise: number) =>
	new Intl.NumberFormat('en-IN', {
		style: 'currency',
		currency: 'INR',
		maximumFractionDigits: 0
	}).format(Math.round(paise / 100));

export const findProduct = (id: string) => products.find((p) => p.id === id);

export const findDepartment = (slug: string) => departments.find((d) => d.slug === slug);

export const inDept = (slug: string) => products.filter((p) => p.dept === slug);

export const deptName = (slug: string) => findDepartment(slug)?.name ?? slug;

/** Whether a piece ladders on waist rather than chest. Changes the fit prompt. */
export const laddersOnWaist = (p: Product) => p.flat === 'trouser';

export function search(term: string) {
	const q = term.trim().toLowerCase();
	if (!q) return [];
	return products.filter((p) =>
		[p.name, p.cloth, p.mill, deptName(p.dept), p.no, p.hand].join(' ').toLowerCase().includes(q)
	);
}
