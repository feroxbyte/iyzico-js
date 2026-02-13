import type { HttpClient } from '../../core/http.js'
import type { ApiResponse } from '../../types/common/api.js'
import type {
	PayWithIyzicoInitializeRequest,
	PayWithIyzicoInitializeResponse,
	PayWithIyzicoRetrieveRequest,
	PayWithIyzicoRetrieveResponse,
} from '../../types/payment/index.js'

export class PayWithIyzicoResource {
	constructor(private http: HttpClient) {}

	/**
	 * Step 1: Creates a Pay with iyzico session and returns the redirect URL.
	 *
	 * @remarks
	 * The response includes `payWithIyzicoPageUrl` — redirect the customer to this URL
	 * to complete payment on iyzico's hosted page. Also returns a `token` for step 2.
	 *
	 * @example
	 * ```ts
	 * const result = await iyzipay.payment.payWithIyzico.initialize({
	 *   price: '100.0',
	 *   paidPrice: '110.0',
	 *   currency: 'TRY',
	 *   callbackUrl: 'https://mysite.com/payment/pwi-callback',
	 *   buyer: { id: 'BY789', name: 'John', surname: 'Doe', ip: '85.34.78.112', ... },
	 *   basketItems: [{ id: 'BI101', price: '100.0', name: 'Product', category1: 'Electronics', itemType: 'PHYSICAL' }],
	 * })
	 * // Redirect customer to result.payWithIyzicoPageUrl
	 * ```
	 *
	 * @see {@link https://docs.iyzico.com/odeme-metotlari/iyzico-ile-ode/pwi-entegrasyonu/pwi-baslatma | PWI Başlatma}
	 */
	async initialize(request: PayWithIyzicoInitializeRequest): Promise<ApiResponse<PayWithIyzicoInitializeResponse>> {
		return this.http.post('/payment/pay-with-iyzico/initialize', request)
	}

	/**
	 * Step 2: Retrieves the payment result using the token from the callback.
	 *
	 * @remarks
	 * After the customer completes payment on iyzico's page and is redirected to your
	 * `callbackUrl`, pass the received `token` here to get the full payment result.
	 *
	 * @example
	 * ```ts
	 * // In your callback handler:
	 * const result = await iyzipay.payment.payWithIyzico.retrieve({
	 *   token: callbackData.token,
	 * })
	 * ```
	 *
	 * @see {@link https://docs.iyzico.com/odeme-metotlari/iyzico-ile-ode/pwi-entegrasyonu/pwi-sorgulama | PWI Sorgulama}
	 */
	async retrieve(request: PayWithIyzicoRetrieveRequest): Promise<ApiResponse<PayWithIyzicoRetrieveResponse>> {
		return this.http.post('/payment/iyzipos/checkoutform/auth/ecom/detail', request)
	}
}
