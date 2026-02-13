import type { HttpClient } from '../../core/http.js'
import type { ApiResponse } from '../../types/common/api.js'
import type {
	CheckoutFormInitializeRequest,
	CheckoutFormInitializeResponse,
	CheckoutFormPreAuthInitializeRequest,
	CheckoutFormPreAuthInitializeResponse,
	CheckoutFormRetrieveRequest,
	CheckoutFormRetrieveResponse,
} from '../../types/payment/index.js'

export class CheckoutFormResource {
	constructor(private http: HttpClient) {}

	/**
	 * Step 1: Creates a checkout form session and returns the embed script.
	 *
	 * @remarks
	 * The response contains `checkoutFormContent` — a `<script>` tag that renders
	 * iyzico's payment form when injected into your page. Also returns a `token`
	 * that you'll need in step 2 to retrieve the payment result.
	 *
	 * @example
	 * ```ts
	 * const result = await iyzipay.payment.checkoutForm.initialize({
	 *   price: '100.0',
	 *   paidPrice: '110.0',
	 *   currency: 'TRY',
	 *   callbackUrl: 'https://mysite.com/payment/checkout-callback',
	 *   buyer: { id: 'BY789', name: 'John', surname: 'Doe', ... },
	 *   basketItems: [{ id: 'BI101', price: '100.0', name: 'Product', category1: 'Electronics', itemType: 'PHYSICAL' }],
	 * })
	 * // Embed result.checkoutFormContent in your HTML
	 * ```
	 *
	 * @see {@link https://docs.iyzico.com/odeme-metotlari/odeme-formu/cf-entegrasyonu/cf-baslatma | CF Başlatma}
	 */
	async initialize(request: CheckoutFormInitializeRequest): Promise<ApiResponse<CheckoutFormInitializeResponse>> {
		return this.http.post('/payment/iyzipos/checkoutform/initialize/auth/ecom', request)
	}

	/**
	 * Step 1 (pre-auth variant): Creates a checkout form session for pre-authorization.
	 *
	 * @remarks
	 * Same as `initialize()` but reserves funds without capturing. After the customer
	 * completes the form, retrieve the result with `retrieve()`, then capture later
	 * with `iyzipay.payment.createPostAuth()`.
	 *
	 * @see {@link https://docs.iyzico.com/odeme-metotlari/on-provizyon/on-provizyon-entegrasyonu/provizyon-baslatma/iyzico-odeme-formu-checkoutform | Ön Provizyon Başlatma (Checkout Form)}
	 */
	async initializePreAuth(
		request: CheckoutFormPreAuthInitializeRequest,
	): Promise<ApiResponse<CheckoutFormPreAuthInitializeResponse>> {
		return this.http.post('/payment/iyzipos/checkoutform/initialize/preauth/ecom', request)
	}

	/**
	 * Step 2: Retrieves the payment result using the token from the callback.
	 *
	 * @remarks
	 * After the customer completes the checkout form, iyzico redirects to your
	 * `callbackUrl` with a `token` parameter. Pass that token here to get the
	 * full payment result including `paymentId`, `fraudStatus`, and item details.
	 *
	 * @example
	 * ```ts
	 * // In your callback handler:
	 * const result = await iyzipay.payment.checkoutForm.retrieve({
	 *   token: callbackData.token,
	 * })
	 * ```
	 *
	 * @see {@link https://docs.iyzico.com/odeme-metotlari/odeme-formu/cf-entegrasyonu/cf-sorgulama | CF Sorgulama}
	 */
	async retrieve(request: CheckoutFormRetrieveRequest): Promise<ApiResponse<CheckoutFormRetrieveResponse>> {
		return this.http.post('/payment/iyzipos/checkoutform/auth/ecom/detail', request)
	}
}
