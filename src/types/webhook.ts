// ─── Event types ────────────────────────────────────────────────

/** Known webhook event types for direct and HPP payment webhooks */
export type PaymentWebhookEventType = 'CREDIT_PAYMENT_AUTH' | 'CREDIT_PAYMENT_PENDING' | (string & {})

/** Known webhook event types for subscription webhooks */
export type SubscriptionWebhookEventType =
	| 'subscription.order.success'
	| 'subscription.order.failure'
	| 'subscription.cancel'
	| (string & {})

// ─── Payload types ──────────────────────────────────────────────

/** Webhook payload for Non-3DS and 3DS payment webhooks */
export interface WebhookDirectPayload {
	/** Unique payment ID */
	paymentId: string
	/** Payment conversation ID */
	paymentConversationId: string
	/** Payment status (`SUCCESS`, `FAILURE`, etc.) */
	status: string
	/** Webhook event type */
	iyziEventType: PaymentWebhookEventType
	/** Merchant ID */
	merchantId: string
}

/** Webhook payload for Checkout Form and Pay with iyzico webhooks */
export interface WebhookHppPayload {
	/** Unique payment ID (named `iyziPaymentId` in HPP webhooks) */
	iyziPaymentId: string
	/** Checkout form token */
	token: string
	/** Payment conversation ID */
	paymentConversationId: string
	/** Payment status (`SUCCESS`, `FAILURE`, etc.) */
	status: string
	/** Webhook event type */
	iyziEventType: PaymentWebhookEventType
	/** Merchant ID */
	merchantId: string
}

/** Webhook payload for subscription webhooks */
export interface WebhookSubscriptionPayload {
	/** Subscription reference code */
	subscriptionReferenceCode: string
	/** Order reference code */
	orderReferenceCode: string
	/** Customer reference code */
	customerReferenceCode: string
	/** Webhook event type */
	iyziEventType: SubscriptionWebhookEventType
}

/** Union of all webhook payload types */
export type WebhookPayload = WebhookDirectPayload | WebhookHppPayload | WebhookSubscriptionPayload
