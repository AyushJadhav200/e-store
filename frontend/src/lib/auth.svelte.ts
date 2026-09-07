import { BRAND } from './brand';

const KEY = 'velcello.auth.v1';

export type Address = {
	name: string;
	mobile: string;
	pincode: string;
	flat: string;
	area: string;
	city: string;
	state: string;
};

export type Order = {
	id: string;
	date: string;
	items: Array<{
		id: string;
		name: string;
		cloth: string;
		size: string;
		qty: number;
		price: number;
		photo: string;
	}>;
	total: number;
	address: Address;
	status: 'Confirmed' | 'Processing' | 'Delivered';
};

type UserState = {
	isLoggedIn: boolean;
	mobile: string;
	name: string;
	addresses: Address[];
	orders: Order[];
};

const INITIAL_STATE: UserState = {
	isLoggedIn: false,
	mobile: '',
	name: '',
	addresses: [],
	orders: []
};

class Auth {
	state = $state<UserState>({ ...INITIAL_STATE });
	ready = $state(false);
	loginModalOpen = $state(false);
	onLoginSuccess: (() => void) | null = null;

	get isLoggedIn() {
		return this.state.isLoggedIn;
	}

	get mobile() {
		return this.state.mobile;
	}

	get orders() {
		return this.state.orders;
	}

	hydrate() {
		if (this.ready) return;
		if (typeof localStorage !== 'undefined') {
			try {
				const raw = localStorage.getItem(KEY);
				if (raw) {
					const parsed = JSON.parse(raw);
					this.state = {
						isLoggedIn: Boolean(parsed.isLoggedIn),
						mobile: parsed.mobile || '',
						name: parsed.name || '',
						addresses: Array.isArray(parsed.addresses) ? parsed.addresses : [],
						orders: Array.isArray(parsed.orders) ? parsed.orders : []
					};
				}
			} catch {
				this.state = { ...INITIAL_STATE };
			}
		}
		this.ready = true;
	}

	openLogin(onSuccess?: () => void) {
		this.onLoginSuccess = onSuccess || null;
		this.loginModalOpen = true;
	}

	closeLogin() {
		this.loginModalOpen = false;
		this.onLoginSuccess = null;
	}

	login(mobileNumber: string, name: string = 'Valued Customer') {
		const formattedMobile = mobileNumber.startsWith('+91')
			? mobileNumber
			: `+91 ${mobileNumber.trim()}`;
		this.state = {
			...this.state,
			isLoggedIn: true,
			mobile: formattedMobile,
			name: name || 'Valued Customer'
		};
		this.persist();

		if (this.onLoginSuccess) {
			const callback = this.onLoginSuccess;
			this.onLoginSuccess = null;
			this.loginModalOpen = false;
			callback();
		} else {
			this.loginModalOpen = false;
		}
	}

	logout() {
		this.state = { ...INITIAL_STATE };
		this.persist();
	}

	addOrder(order: Order) {
		this.state = {
			...this.state,
			orders: [order, ...this.state.orders]
		};
		this.persist();
	}

	private persist() {
		if (typeof localStorage === 'undefined') return;
		try {
			localStorage.setItem(KEY, JSON.stringify(this.state));
		} catch {
			// Ignore quota error for basic auth state
		}
	}
}

export const auth = new Auth();
