import type { CardCreateNewUserRequest, CardStorageCard } from '../src/types/card-storage.js'
import type { IyzilinkCreateRequest } from '../src/types/iyzilink.js'
import type { SubmerchantLimitedCompany, SubmerchantPersonal } from '../src/types/marketplace.js'
import type {
	CheckoutFormInitializeRequest,
	PaymentCreateRequest,
	PayWithIyzicoInitializeRequest,
	ThreeDSInitializeRequest,
} from '../src/types/payment/index.js'

export const SANDBOX_OPTIONS = {
	apiKey: 'sandbox-afXhZPW0MQlE4dCUUlHcEopnMBgXnAZI',
	secretKey: 'sandbox-wbwpzKIiplZxI3hh5ALI4FJyAcZKL6kq',
	baseUrl: 'https://sandbox-api.iyzipay.com',
}

export function randomId(): string {
	return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function buildBuyer() {
	return {
		id: 'BY789',
		name: 'John',
		surname: 'Doe',
		identityNumber: '74300864791',
		email: 'email@email.com',
		gsmNumber: '+905350000000',
		registrationDate: '2013-04-21 15:12:09',
		lastLoginDate: '2015-10-05 12:43:35',
		registrationAddress: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
		city: 'Istanbul',
		country: 'Turkey',
		zipCode: '34732',
		ip: '85.34.78.112',
	}
}

export function buildAddress() {
	return {
		address: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
		zipCode: '34742',
		contactName: 'Jane Doe',
		city: 'Istanbul',
		country: 'Turkey',
	}
}

export function buildPaymentCard() {
	return {
		cardHolderName: 'John Doe',
		cardNumber: '5528790000000008',
		expireYear: '2030',
		expireMonth: '12',
		cvc: '123',
	}
}

export function buildBasketItems() {
	return [
		{ id: 'BI101', name: 'Binocular', category1: 'Collectibles', itemType: 'PHYSICAL' as const, price: '0.3' },
		{ id: 'BI102', name: 'Game code', category1: 'Game', itemType: 'VIRTUAL' as const, price: '0.5' },
		{ id: 'BI103', name: 'Usb', category1: 'Electronics', itemType: 'PHYSICAL' as const, price: '0.2' },
	]
}

export function buildPaymentRequest(overrides?: Partial<PaymentCreateRequest>): PaymentCreateRequest {
	return {
		locale: 'tr',
		conversationId: randomId(),
		price: '1.0',
		paidPrice: '1.1',
		installment: 1,
		paymentChannel: 'WEB',
		paymentGroup: 'LISTING',
		basketId: `B-${randomId()}`,
		currency: 'TRY',
		paymentCard: buildPaymentCard(),
		buyer: buildBuyer(),
		shippingAddress: buildAddress(),
		billingAddress: buildAddress(),
		basketItems: buildBasketItems(),
		...overrides,
	}
}

export function buildThreeDSRequest(overrides?: Partial<ThreeDSInitializeRequest>): ThreeDSInitializeRequest {
	return {
		...buildPaymentRequest(),
		callbackUrl: 'https://merchant.com/callback',
		...overrides,
	}
}

export function buildCheckoutFormRequest(
	overrides?: Partial<CheckoutFormInitializeRequest>,
): CheckoutFormInitializeRequest {
	return {
		locale: 'tr',
		conversationId: randomId(),
		price: '1.0',
		paidPrice: '1.1',
		currency: 'TRY',
		basketId: `B-${randomId()}`,
		callbackUrl: 'https://merchant.com/checkout/callback',
		enabledInstallments: [1, 2, 3, 6, 9],
		buyer: buildBuyer(),
		shippingAddress: buildAddress(),
		billingAddress: buildAddress(),
		basketItems: buildBasketItems(),
		...overrides,
	}
}

export function buildPayWithIyzicoRequest(
	overrides?: Partial<PayWithIyzicoInitializeRequest>,
): PayWithIyzicoInitializeRequest {
	return {
		locale: 'tr',
		conversationId: randomId(),
		price: '1.0',
		paidPrice: '1.1',
		currency: 'TRY',
		basketId: `B-${randomId()}`,
		callbackUrl: 'https://merchant.com/pwi/callback',
		enabledInstallments: [1, 2, 3, 6, 9],
		buyer: { ...buildBuyer(), ip: '85.34.78.112' },
		shippingAddress: buildAddress(),
		billingAddress: buildAddress(),
		basketItems: buildBasketItems(),
		...overrides,
	}
}

// ─── Marketplace helpers ─────────────────────────────────────

export function buildPersonalSubMerchantRequest(overrides?: Partial<SubmerchantPersonal>): SubmerchantPersonal {
	return {
		locale: 'tr',
		conversationId: randomId(),
		subMerchantType: 'PERSONAL',
		name: 'John Store',
		email: 'sub@merchant.com',
		gsmNumber: '+905350000000',
		address: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
		iban: 'TR180006200119000006672315',
		contactName: 'John',
		contactSurname: 'Doe',
		identityNumber: '74300864791',
		subMerchantExternalId: `sub-${randomId()}`,
		currency: 'TRY',
		...overrides,
	}
}

export function buildLimitedCompanySubMerchantRequest(
	overrides?: Partial<SubmerchantLimitedCompany>,
): SubmerchantLimitedCompany {
	return {
		locale: 'tr',
		conversationId: randomId(),
		subMerchantType: 'LIMITED_OR_JOINT_STOCK_COMPANY',
		name: 'Acme Ltd',
		email: 'acme@company.com',
		gsmNumber: '+905350000000',
		address: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
		iban: 'TR180006200119000006672315',
		taxOffice: 'Tax office',
		taxNumber: '1234567890',
		legalCompanyTitle: 'Acme Ltd Sti',
		identityNumber: '74300864791',
		subMerchantExternalId: `sub-${randomId()}`,
		currency: 'TRY',
		...overrides,
	}
}

export function buildMarketplaceBasketItems(subMerchantKey: string) {
	return [
		{
			id: 'BI101',
			name: 'Binocular',
			category1: 'Collectibles',
			itemType: 'PHYSICAL' as const,
			price: '0.3',
			subMerchantKey,
			subMerchantPrice: '0.27',
		},
		{
			id: 'BI102',
			name: 'Game code',
			category1: 'Game',
			itemType: 'VIRTUAL' as const,
			price: '0.5',
			subMerchantKey,
			subMerchantPrice: '0.42',
		},
		{
			id: 'BI103',
			name: 'Usb',
			category1: 'Electronics',
			itemType: 'PHYSICAL' as const,
			price: '0.2',
			subMerchantKey,
			subMerchantPrice: '0.18',
		},
	]
}

export function buildMarketplacePaymentRequest(
	subMerchantKey: string,
	overrides?: Partial<PaymentCreateRequest>,
): PaymentCreateRequest {
	return buildPaymentRequest({
		paymentGroup: 'PRODUCT',
		basketItems: buildMarketplaceBasketItems(subMerchantKey),
		...overrides,
	})
}

// ─── iyzilink helpers ────────────────────────────────────────

// Minimal 1x1 transparent PNG as base64 (used for encodedImageFile in tests)
const TINY_PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

export function buildIyzilinkCreateRequest(overrides?: Partial<IyzilinkCreateRequest>): IyzilinkCreateRequest {
	return {
		locale: 'tr',
		conversationId: randomId(),
		name: `Test Widget ${randomId()}`,
		description: 'Created by integration tests',
		price: '100.0',
		currencyCode: 'TRY',
		encodedImageFile: TINY_PNG,
		addressIgnorable: true,
		...overrides,
	}
}

// ─── Card storage helpers ───────────────────────────────────

export function buildCardStorageCard(overrides?: Partial<CardStorageCard>): CardStorageCard {
	return {
		cardAlias: 'My Test Card',
		cardHolderName: 'John Doe',
		cardNumber: '5528790000000008',
		expireYear: '2030',
		expireMonth: '12',
		...overrides,
	}
}

export function buildCardCreateRequest(overrides?: Partial<CardCreateNewUserRequest>): CardCreateNewUserRequest {
	return {
		locale: 'tr',
		conversationId: randomId(),
		email: 'test@example.com',
		card: buildCardStorageCard(),
		...overrides,
	}
}
