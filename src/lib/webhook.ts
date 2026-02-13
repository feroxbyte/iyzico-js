import type { WebhookPayload } from '../types/webhook.js'
import { hmacSha256Hex, timingSafeEqual } from './crypto.js'

/**
 * Build the HMAC message string for a webhook payload.
 * Uses plain concatenation (no separator), which differs from response signatures.
 */
function buildMessage(secretKey: string, payload: WebhookPayload, merchantId?: string): string | null {
	if ('subscriptionReferenceCode' in payload) {
		// Subscription webhooks require merchantId — it is NOT in the payload
		if (!merchantId) return null
		return (
			merchantId +
			secretKey +
			payload.iyziEventType +
			payload.subscriptionReferenceCode +
			payload.orderReferenceCode +
			payload.customerReferenceCode
		)
	}

	if ('token' in payload) {
		// Checkout Form / Pay with iyzico (HPP) webhooks
		return (
			secretKey +
			payload.iyziEventType +
			payload.iyziPaymentId +
			payload.token +
			payload.paymentConversationId +
			payload.status
		)
	}

	// Direct (Non-3DS / 3DS) webhooks
	return secretKey + payload.iyziEventType + payload.paymentId + payload.paymentConversationId + payload.status
}

/**
 * Verify the `X-IYZ-SIGNATURE-V3` header of an incoming iyzico webhook POST.
 *
 * Auto-detects the webhook format (Direct, HPP, or Subscription) based on
 * the payload shape — no manual format selection needed.
 *
 * @param secretKey  - Your iyzico secret key
 * @param payload    - The parsed webhook request body
 * @param signature  - The value of the `X-IYZ-SIGNATURE-V3` header
 * @param merchantId - Required only for subscription webhooks (not included in payload)
 * @returns `true` if the signature is valid
 *
 * @example
 * ```ts
 * import { verifyWebhookSignature } from 'iyzico-js'
 *
 * app.post('/webhook', async (req, res) => {
 *   const signature = req.headers['x-iyz-signature-v3']
 *   const valid = await verifyWebhookSignature(secretKey, req.body, signature)
 *
 *   if (!valid) {
 *     res.status(400).send('Invalid signature')
 *     return
 *   }
 *
 *   // Process the webhook event...
 *   res.status(200).send('OK')
 * })
 * ```
 */
export async function verifyWebhookSignature(
	secretKey: string,
	payload: WebhookPayload,
	signature: string,
	merchantId?: string,
): Promise<boolean> {
	if (!signature) return false

	const message = buildMessage(secretKey, payload, merchantId)
	if (message === null) return false

	const expected = await hmacSha256Hex(secretKey, message)
	return timingSafeEqual(expected, signature)
}

/**
 * Generate a test webhook signature for use in automated tests.
 *
 * Follows the same pattern as Stripe's `generateTestHeaderString` — compute the
 * HMAC that {@link verifyWebhookSignature} expects, so you can simulate webhook
 * delivery in your test suite.
 *
 * @param secretKey  - The secret key to sign with
 * @param payload    - The webhook payload to sign
 * @param merchantId - Required only for subscription webhooks
 * @returns The hex-encoded HMAC signature, or empty string if the payload is invalid
 *
 * @example
 * ```ts
 * import { generateWebhookTestSignature, verifyWebhookSignature } from 'iyzico-js'
 *
 * const payload = { paymentId: '123', paymentConversationId: 'conv1', status: 'SUCCESS', iyziEventType: 'CREDIT_PAYMENT_AUTH', merchantId: 'M1' }
 * const signature = await generateWebhookTestSignature(secretKey, payload)
 * const valid = await verifyWebhookSignature(secretKey, payload, signature)
 * // valid === true
 * ```
 */
export async function generateWebhookTestSignature(
	secretKey: string,
	payload: WebhookPayload,
	merchantId?: string,
): Promise<string> {
	const message = buildMessage(secretKey, payload, merchantId)
	if (message === null) return ''
	return hmacSha256Hex(secretKey, message)
}
