import type { HttpClient } from '../../core/http.js'
import type { ApiResponse } from '../../types/common/api.js'
import type {
	ThreeDSAuthRequest,
	ThreeDSAuthResponse,
	ThreeDSAuthV2Request,
	ThreeDSAuthV2Response,
	ThreeDSInitializeRequest,
	ThreeDSInitializeResponse,
	ThreeDSPreAuthInitializeRequest,
	ThreeDSPreAuthInitializeResponse,
} from '../../types/payment/index.js'

export class ThreeDSResource {
	constructor(private http: HttpClient) {}

	/**
	 * Step 1: Initializes a 3D Secure payment and returns HTML to render.
	 *
	 * @remarks
	 * The response includes `threeDSHtmlContent` — a base64-encoded HTML page that
	 * auto-redirects the cardholder to their bank's 3DS verification page. Decode and
	 * inject it into your page (e.g., via `innerHTML` or an iframe).
	 *
	 * @example
	 * ```ts
	 * const result = await iyzipay.payment.threeds.initialize({
	 *   price: '100.0',
	 *   paidPrice: '110.0',
	 *   currency: 'TRY',
	 *   installment: 1,
	 *   callbackUrl: 'https://mysite.com/payment/3ds-callback',
	 *   paymentCard: { cardHolderName: 'John Doe', cardNumber: '5528790000000008', ... },
	 *   buyer: { id: 'BY789', name: 'John', surname: 'Doe', ... },
	 *   basketItems: [{ id: 'BI101', price: '100.0', name: 'Product', category1: 'Electronics', itemType: 'PHYSICAL' }],
	 * })
	 * const html = atob(result.threeDSHtmlContent) // decode and render in browser
	 * ```
	 *
	 * @see {@link https://docs.iyzico.com/odeme-metotlari/api/3ds/3ds-entegrasyonu/3ds-baslatma | 3DS Başlatma}
	 */
	async initialize(request: ThreeDSInitializeRequest): Promise<ApiResponse<ThreeDSInitializeResponse>> {
		return this.http.post('/payment/3dsecure/initialize', request)
	}

	/**
	 * Step 1 (pre-auth variant): Initializes a 3D Secure pre-authorization.
	 *
	 * @remarks
	 * Same as `initialize()` but reserves funds without capturing. After the cardholder
	 * completes 3DS verification, finalize with `create()` / `createV2()`, then capture
	 * later with `iyzipay.payment.createPostAuth()`.
	 *
	 * @see {@link https://docs.iyzico.com/odeme-metotlari/on-provizyon/on-provizyon-entegrasyonu/provizyon-baslatma/non3d | Ön Provizyon Başlatma (3DS)}
	 */
	async initializePreAuth(
		request: ThreeDSPreAuthInitializeRequest,
	): Promise<ApiResponse<ThreeDSPreAuthInitializeResponse>> {
		return this.http.post('/payment/3dsecure/initialize/preauth', request)
	}

	/**
	 * Step 2: Completes a 3D Secure payment after the callback (V1).
	 *
	 * @remarks
	 * Call this from your `callbackUrl` handler after verifying that `mdStatus` indicates
	 * successful verification. Pass the `paymentId` received in the callback POST data.
	 *
	 * @example
	 * ```ts
	 * // In your callback handler:
	 * const result = await iyzipay.payment.threeds.create({
	 *   paymentId: callbackData.paymentId,
	 *   conversationData: callbackData.conversationData,
	 * })
	 * ```
	 *
	 * @see {@link https://docs.iyzico.com/odeme-metotlari/api/3ds/3ds-entegrasyonu/3ds-tamamlama | 3DS Tamamlama}
	 */
	async create(request: ThreeDSAuthRequest): Promise<ApiResponse<ThreeDSAuthResponse>> {
		return this.http.post('/payment/3dsecure/auth', request)
	}

	/**
	 * Step 2: Completes a 3D Secure payment after the callback (V2).
	 *
	 * @remarks
	 * The V2 endpoint is the newer completion API. Unlike V1, it requires additional
	 * fields from the original request: `paidPrice`, `basketId`, and `currency`.
	 * Prefer V2 for new integrations.
	 *
	 * @example
	 * ```ts
	 * const result = await iyzipay.payment.threeds.createV2({
	 *   paymentId: callbackData.paymentId,
	 *   conversationData: callbackData.conversationData,
	 *   paidPrice: '110.0',
	 *   basketId: 'B67832',
	 *   currency: 'TRY',
	 * })
	 * ```
	 *
	 * @see {@link https://docs.iyzico.com/odeme-metotlari/api/3ds/3ds-entegrasyonu/3ds-tamamlama | 3DS Tamamlama}
	 */
	async createV2(request: ThreeDSAuthV2Request): Promise<ApiResponse<ThreeDSAuthV2Response>> {
		return this.http.post('/payment/v2/3dsecure/auth', request)
	}
}
