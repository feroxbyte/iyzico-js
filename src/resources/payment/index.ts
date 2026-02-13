import type { HttpClient } from '../../core/http.js'
import type { ApiResponse } from '../../types/common/api.js'
import type {
	PaymentCreateRequest,
	PaymentCreateResponse,
	PaymentPostAuthCreateRequest,
	PaymentPostAuthCreateResponse,
	PaymentPreAuthCreateRequest,
	PaymentPreAuthCreateResponse,
	PaymentRetrieveRequest,
	PaymentRetrieveResponse,
} from '../../types/payment/index.js'
import { CheckoutFormResource } from './checkout.js'
import { PayWithIyzicoResource } from './pay-with-iyzico.js'
import { ThreeDSResource } from './threeds.js'

/**
 * Payment operations — Non-3DS, 3D Secure, Checkout Form, and Pay with iyzico.
 *
 * @remarks
 * iyzico supports four payment flows depending on your integration needs:
 *
 * - **Non-3DS** — direct card payment without bank verification (`create`, `retrieve`)
 * - **3D Secure** — card payment with SMS/OTP verification (`threeds.initialize` → `threeds.create`)
 * - **Checkout Form** — iyzico-hosted payment page (`checkoutForm.initialize` → `checkoutForm.retrieve`)
 * - **Pay with iyzico** — redirect to iyzico wallet (`payWithIyzico.initialize` → `payWithIyzico.retrieve`)
 *
 * Non-3DS and 3DS also support **pre-authorization**: reserve funds first with `createPreAuth()`
 * (or `threeds.initializePreAuth()`), then capture later with `createPostAuth()`.
 *
 * All flows that accept `paymentCard` also support **stored card payments** — after
 * registering a card via `cardStorage.create()`, pass `{ cardUserKey, cardToken }` as
 * the `paymentCard` field instead of raw card details.
 *
 * @see {@link https://docs.iyzico.com/on-hazirliklar/api-reference-beta/odeme-metotlari | Ödeme Metotları}
 */
export class PaymentNamespace {
	/**
	 * 3D Secure payment flow — card payment with SMS/OTP bank verification.
	 *
	 * @remarks
	 * A two-step flow: `initialize` returns an HTML snippet containing the bank's
	 * 3DS verification form. After the customer completes verification, the bank
	 * posts the result to your `callbackUrl`. Then call `create` with the returned
	 * `paymentId` to finalize the charge.
	 *
	 * Also supports pre-authorization via `initializePreAuth` → callback → `createPreAuth`.
	 *
	 * @see {@link https://docs.iyzico.com/odeme-metotlari/api/3ds/3ds-entegrasyonu | 3DS Entegrasyonu}
	 */
	readonly threeds: ThreeDSResource
	/**
	 * Checkout Form — iyzico-hosted payment page.
	 *
	 * @remarks
	 * Offloads card input and 3D Secure handling to iyzico's hosted page.
	 * `initialize` returns a form token and embeddable JS snippet. After the
	 * customer completes payment, call `retrieve` with the token to get the result.
	 *
	 * This is the simplest PCI-compliant integration — card data never touches your server.
	 *
	 * @see {@link https://docs.iyzico.com/odeme-metotlari/odeme-formu/odeme-formu-entegrasyonu | Ödeme Formu Entegrasyonu}
	 */
	readonly checkoutForm: CheckoutFormResource
	/**
	 * Pay with iyzico — wallet-based redirect flow.
	 *
	 * @remarks
	 * Redirects the customer to the iyzico wallet where they can pay with a
	 * stored card or register a new one. `initialize` returns a redirect URL
	 * and token. After the customer completes payment, call `retrieve` with
	 * the token to get the result.
	 *
	 * @see {@link https://docs.iyzico.com/odeme-metotlari/iyzico-ile-ode/iyzico-ile-ode-entegrasyonu | iyzico ile Öde Entegrasyonu}
	 */
	readonly payWithIyzico: PayWithIyzicoResource

	constructor(private http: HttpClient) {
		this.threeds = new ThreeDSResource(http)
		this.checkoutForm = new CheckoutFormResource(http)
		this.payWithIyzico = new PayWithIyzicoResource(http)
	}

	/**
	 * Creates a Non-3DS payment (direct card charge).
	 *
	 * @remarks
	 * Charges the card immediately without 3D Secure verification.
	 * Always check `fraudStatus` in the response before shipping goods —
	 * only fulfill orders when `fraudStatus === 1` (approved).
	 *
	 * **Stored card** — After registering a card via `cardStorage.create()`, you can
	 * pass `{ cardUserKey, cardToken }` as `paymentCard` instead of raw card details.
	 *
	 * @example
	 * ```ts
	 * // With raw card details
	 * const result = await iyzipay.payment.create({
	 *   price: '100.0',
	 *   paidPrice: '110.0',
	 *   currency: 'TRY',
	 *   installment: 1,
	 *   paymentCard: { cardHolderName: 'John Doe', cardNumber: '5528790000000008', ... },
	 *   buyer: { id: 'BY789', name: 'John', surname: 'Doe', ... },
	 *   billingAddress: { address: 'Nidakule Göztepe', city: 'Istanbul', country: 'Turkey', contactName: 'John Doe' },
	 *   basketItems: [{ id: 'BI101', price: '100.0', name: 'Product', category1: 'Electronics', itemType: 'PHYSICAL' }],
	 * })
	 * ```
	 *
	 * @example
	 * ```ts
	 * // With a stored card (after cardStorage.create())
	 * const result = await iyzipay.payment.create({
	 *   ...paymentRequest,
	 *   paymentCard: { cardUserKey: 'stored-key', cardToken: 'stored-token' },
	 * })
	 * ```
	 *
	 * @see {@link https://docs.iyzico.com/odeme-metotlari/api/non-3ds/non-3ds-entegrasyonu/odeme-olusturma | Non-3DS Ödeme Oluşturma}
	 * @see {@link https://docs.iyzico.com/ek-servisler/kart-saklama | Kart Saklama}
	 */
	async create(request: PaymentCreateRequest): Promise<ApiResponse<PaymentCreateResponse>> {
		return this.http.post('/payment/auth', request)
	}

	/**
	 * Retrieves the details of an existing payment by `paymentId` or `paymentConversationId`.
	 *
	 * @example
	 * ```ts
	 * const result = await iyzipay.payment.retrieve({
	 *   paymentId: '12345678',
	 * })
	 * ```
	 *
	 * @see {@link https://docs.iyzico.com/odeme-metotlari/api/non-3ds/non-3ds-entegrasyonu/odeme-sorgulama | Non-3DS Ödeme Sorgulama}
	 */
	async retrieve(request: PaymentRetrieveRequest): Promise<ApiResponse<PaymentRetrieveResponse>> {
		return this.http.post('/payment/detail', request)
	}

	/**
	 * Creates a Non-3DS pre-authorization (reserves funds without capturing).
	 *
	 * @remarks
	 * The card is authorized for the given amount but **not charged** until you
	 * explicitly call `createPostAuth()`. Useful for scenarios like hotel bookings
	 * or rentals where the final amount may differ.
	 *
	 * @example
	 * ```ts
	 * const result = await iyzipay.payment.createPreAuth({
	 *   price: '100.0',
	 *   paidPrice: '110.0',
	 *   currency: 'TRY',
	 *   installment: 1,
	 *   paymentCard: { cardHolderName: 'John Doe', cardNumber: '5528790000000008', ... },
	 *   buyer: { id: 'BY789', name: 'John', surname: 'Doe', ... },
	 *   basketItems: [{ id: 'BI101', price: '100.0', name: 'Product', category1: 'Electronics', itemType: 'PHYSICAL' }],
	 * })
	 * ```
	 *
	 * @see {@link https://docs.iyzico.com/odeme-metotlari/on-provizyon/on-provizyon-entegrasyonu/provizyon-baslatma/non3d | Ön Provizyon Başlatma (Non-3DS)}
	 */
	async createPreAuth(request: PaymentPreAuthCreateRequest): Promise<ApiResponse<PaymentPreAuthCreateResponse>> {
		return this.http.post('/payment/preauth', request)
	}

	/**
	 * Captures a previously pre-authorized payment.
	 *
	 * @remarks
	 * Finalizes a pre-authorization created by `createPreAuth()` or through the
	 * 3DS/Checkout Form pre-auth flows. The `paymentId` comes from the original
	 * pre-auth response.
	 *
	 * @example
	 * ```ts
	 * const result = await iyzipay.payment.createPostAuth({
	 *   paymentId: '12345678',
	 *   ip: '85.34.78.112',
	 *   paidPrice: '110.0',
	 *   currency: 'TRY',
	 * })
	 * ```
	 *
	 * @see {@link https://docs.iyzico.com/odeme-metotlari/on-provizyon/on-provizyon-entegrasyonu/provizyon-kapama | Provizyon Kapama}
	 */
	async createPostAuth(request: PaymentPostAuthCreateRequest): Promise<ApiResponse<PaymentPostAuthCreateResponse>> {
		return this.http.post('/payment/postauth', request)
	}
}
