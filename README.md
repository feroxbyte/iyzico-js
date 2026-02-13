# iyzico-js

[![CI](https://github.com/feroxbyte/iyzico-js/actions/workflows/ci.yml/badge.svg)](https://github.com/feroxbyte/iyzico-js/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/feroxbyte/iyzico-js/graph/badge.svg)](https://codecov.io/gh/feroxbyte/iyzico-js)
[![npm version](https://img.shields.io/npm/v/iyzico-js)](https://www.npmjs.com/package/iyzico-js)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

> **Note:** This is an **unofficial**, community-maintained client. It is not affiliated with or endorsed by iyzico. For the official Node.js client, see [iyzipay-node](https://github.com/iyzico/iyzipay-node) (callback-based, CommonJS).

Modern, fully-typed TypeScript client for the [iyzico](https://www.iyzico.com/) payment API.

- **Zero dependencies** &mdash; only `fetch` + Web Crypto API
- **Runs everywhere** &mdash; Node.js, Deno, Bun, Cloudflare Workers, edge runtimes
- **ESM only** &mdash; tree-shakeable, no CommonJS baggage
- **Fully typed** &mdash; complete TypeScript interfaces for every request and response

> **Pre-v1:** The API surface may change before 1.0. TypeScript interfaces were built from iyzico's documentation and sandbox testing — some fields may be missing or mistyped against production responses. Bug reports are welcome.

## Runtime Support

| Runtime               | Minimum Version |
| --------------------- | --------------- |
| Node.js               | 20+             |
| Deno                  | 1.0+            |
| Bun                   | 1.0+            |
| Cloudflare Workers    | Yes             |
| Vercel Edge Functions | Yes             |

Requires native `fetch` and `crypto.subtle` (Web Crypto API).

## Install

```bash
npm install iyzico-js
```

## Quick Start

```typescript
import { Iyzipay } from "iyzico-js";

const iyzipay = new Iyzipay({
	apiKey: "your-api-key",
	secretKey: "your-secret-key",
	baseUrl: "https://sandbox-api.iyzipay.com", // or https://api.iyzipay.com
});

const payment = await iyzipay.payment.create({
	locale: "tr",
	conversationId: "123456",
	price: "1.0",
	paidPrice: "1.1",
	currency: "TRY",
	installment: 1,
	basketId: "B67832",
	paymentCard: {
		cardHolderName: "John Doe",
		cardNumber: "5528790000000008",
		expireMonth: "12",
		expireYear: "2030",
		cvc: "123",
	},
	buyer: {
		id: "BY789",
		name: "John",
		surname: "Doe",
		email: "john@example.com",
		identityNumber: "74300864791",
		registrationAddress: "Nidakule Goztepe, Merdivenkoyu Mah.",
		city: "Istanbul",
		country: "Turkey",
		ip: "85.34.78.112",
	},
	shippingAddress: {
		contactName: "John Doe",
		city: "Istanbul",
		country: "Turkey",
		address: "Nidakule Goztepe, Merdivenkoyu Mah.",
	},
	billingAddress: {
		contactName: "John Doe",
		city: "Istanbul",
		country: "Turkey",
		address: "Nidakule Goztepe, Merdivenkoyu Mah.",
	},
	basketItems: [
		{ id: "BI101", name: "Binocular", category1: "Collectibles", itemType: "PHYSICAL", price: "0.3" },
		{ id: "BI102", name: "Game code", category1: "Game", itemType: "VIRTUAL", price: "0.5" },
		{ id: "BI103", name: "Usb", category1: "Electronics", itemType: "PHYSICAL", price: "0.2" },
	],
});

console.log(payment.status, payment.paymentId);
```

## Configuration

```typescript
const iyzipay = new Iyzipay({
	apiKey: "your-api-key",
	secretKey: "your-secret-key",
	baseUrl: "https://api.iyzipay.com",
	timeout: 30_000, // optional — request timeout in ms (default: 30 000)
	fetch: customFetch, // optional — for testing, polyfills, or Workers
});
```

## Payment Flows

### Non-3DS (Direct)

The simplest flow — card details are sent directly and the payment is processed immediately with no bank verification step.

```typescript
const result = await iyzipay.payment.create(request);
console.log(result.status, result.paymentId);
```

For pre-authorization (reserve funds now, capture later):

```typescript
const preAuth = await iyzipay.payment.createPreAuth(request);
// ... later, after shipping:
const postAuth = await iyzipay.payment.createPostAuth({
	locale: "tr",
	paymentId: preAuth.paymentId,
	ip: "85.34.78.112",
});
```

### 3D Secure (Two-Step)

3D Secure adds bank verification (SMS/OTP). It requires two API calls with a browser redirect in between.

**Step 1 — Initialize:** send the payment details along with a `callbackUrl`. The response contains an HTML snippet that triggers the bank's verification page.

```typescript
const init = await iyzipay.payment.threeds.initialize({
	...paymentRequest,
	callbackUrl: "https://your-site.com/threeds/callback",
});

// Render init.threeDSHtmlContent in the buyer's browser.
// The bank will redirect back to your callbackUrl with the result.
```

**Step 2 — Complete:** after the bank redirects to your callback, extract `paymentId` from the POST body and finalize the payment.

```typescript
// In your callback handler:
const result = await iyzipay.payment.threeds.create({
	locale: "tr",
	conversationId: "123456",
	paymentId: callbackPaymentId, // from the bank callback POST
});

console.log(result.status, result.paymentId);
```

### Checkout Form (Hosted Payment Page)

iyzico hosts the entire payment page — you initialize a session and embed their JavaScript. No card details touch your server.

**Step 1 — Initialize:** get a token and embed the iyzico payment form.

```typescript
const form = await iyzipay.payment.checkoutForm.initialize({
	...paymentRequest,
	callbackUrl: "https://your-site.com/checkout/callback",
	enabledInstallments: [1, 2, 3, 6],
});

// Embed the iyzico JS in your page using form.checkoutFormContent
```

**Step 2 — Retrieve:** after the buyer completes payment, iyzico redirects to your callback. Retrieve the result with the token.

```typescript
const result = await iyzipay.payment.checkoutForm.retrieve({
	locale: "tr",
	token: callbackToken,
});

console.log(result.status, result.paymentId);
```

### Pay with iyzico (Wallet Redirect)

Same two-step pattern as Checkout Form — initialize, then retrieve after redirect. Buyers pay using their iyzico wallet balance.

```typescript
const init = await iyzipay.payment.payWithIyzico.initialize(request);
// Redirect the buyer to the iyzico wallet page using init.payWithIyzicoPageUrl

const result = await iyzipay.payment.payWithIyzico.retrieve({ locale: "tr", token });
```

## Error Handling

### API Errors

API errors are **never thrown** — they are returned in the response object. Check `result.status` to determine success or failure:

```typescript
const result = await iyzipay.payment.create(request);

if (result.status === "success") {
	console.log(result.paymentId);
} else {
	console.log(result.errorCode); // e.g. '10051'
	console.log(result.errorMessage); // e.g. 'Not sufficient funds'
}
```

### Transport Errors

Network-level failures (timeouts, DNS errors, malformed responses) **are** thrown as typed error classes. Wrap calls in try/catch to handle them:

```typescript
import {
	IyzipayTimeoutError,
	IyzipayConnectionError,
	IyzipayParseError,
} from "iyzico-js";

try {
	const result = await iyzipay.payment.create(request);
} catch (error) {
	if (error instanceof IyzipayTimeoutError) {
		// Request exceeded the configured timeout
		console.log(error.timeoutMs, error.path);
	} else if (error instanceof IyzipayConnectionError) {
		// Network failure (DNS, refused connection, etc.)
		console.log(error.path, error.cause);
	} else if (error instanceof IyzipayParseError) {
		// iyzico returned non-JSON (e.g. HTML error page)
		console.log(error.httpStatus, error.rawBody);
	}
}
```

All three extend `IyzipayError`, so you can also catch them with a single `instanceof IyzipayError` check.

## Response Signature Verification

Every iyzico API response that includes a `signature` field can be verified to confirm data integrity. The signature is an HMAC-SHA256 hash of selected response fields, so verifying it proves the response genuinely came from iyzico and was not tampered with.

```typescript
import { verifyPaymentSignature } from "iyzico-js";

const result = await iyzipay.payment.create(request);

if (result.status === "success") {
	const valid = await verifyPaymentSignature(secretKey, result);
	if (!valid) throw new Error("Response signature mismatch");
}
```

Use the matching function for each endpoint:

| Endpoint                          | Verification function            |
| --------------------------------- | -------------------------------- |
| Non-3DS payment / pre-auth        | `verifyPaymentSignature`         |
| 3DS initialize                    | `verifyThreeDSInitSignature`     |
| 3DS auth (complete)               | `verifyThreeDSAuthSignature`     |
| 3DS callback POST body            | `verifyCallbackSignature`        |
| Checkout Form initialize          | `verifyFormInitSignature`        |
| Checkout Form retrieve            | `verifyFormRetrieveSignature`    |
| Refund (V1 and V2)                | `verifyRefundSignature`          |

Price fields with trailing zeros (e.g. `10.50`) are automatically normalized before hashing — no manual formatting needed.

## Webhook Validation

Verify incoming webhook POSTs from iyzico using the `X-IYZ-SIGNATURE-V3` header to ensure they are authentic.

```typescript
import { verifyWebhookSignature } from "iyzico-js";

// Express / Hono / any framework
app.post("/webhook", async (req, res) => {
	const signature = req.headers["x-iyz-signature-v3"];
	const valid = await verifyWebhookSignature(secretKey, req.body, signature);

	if (!valid) {
		res.status(400).send("Invalid signature");
		return;
	}

	// Process the event
	const { iyziEventType } = req.body;
	// ...

	res.status(200).send("OK");
});
```

The function auto-detects the webhook format (Direct, Checkout Form/HPP, or Subscription) from the payload shape. For **subscription webhooks**, pass the `merchantId` as the fourth argument since it is not included in the payload:

```typescript
const valid = await verifyWebhookSignature(secretKey, req.body, signature, merchantId);
```

### Testing webhooks

Use `generateWebhookTestSignature` to simulate webhook delivery in your test suite:

```typescript
import { generateWebhookTestSignature, verifyWebhookSignature } from "iyzico-js";

const payload = {
	paymentId: "123",
	paymentConversationId: "conv1",
	status: "SUCCESS",
	iyziEventType: "CREDIT_PAYMENT_AUTH",
	merchantId: "M1",
};
const signature = await generateWebhookTestSignature(secretKey, payload);
const valid = await verifyWebhookSignature(secretKey, payload, signature);
// valid === true
```

## Marketplace

The iyzico marketplace model lets platforms accept payments on behalf of multiple sellers (sub-merchants). Funds are split per basket item and held in escrow until the platform explicitly approves payout.

**1. Register a sub-merchant:**

```typescript
const subMerchant = await iyzipay.marketplace.subMerchant.create({
	locale: "tr",
	subMerchantExternalId: "S49235",
	subMerchantType: "PERSONAL",
	contactName: "Jane",
	contactSurname: "Doe",
	identityNumber: "31300864726",
	iban: "TR340010009999901234567890",
	address: "Istanbul, Turkey",
	email: "jane@example.com",
	legalCompanyTitle: "Jane Doe",
});
```

**2. Include sub-merchant info in basket items** when creating a payment:

```typescript
basketItems: [
	{
		id: "BI101",
		name: "Product",
		category1: "Clothing",
		itemType: "PHYSICAL",
		price: "30.0",
		subMerchantKey: subMerchant.subMerchantKey,
		subMerchantPrice: "27.0", // amount the sub-merchant receives
	},
];
```

**3. Approve items for payout** after delivery:

```typescript
await iyzipay.marketplace.approval.approve({
	locale: "tr",
	paymentTransactionId: "12345",
});
```

## Subscriptions

The subscription API follows a **Product &rarr; Pricing Plan &rarr; Subscription** hierarchy.

**1. Create a product** (groups related plans):

```typescript
const product = await iyzipay.subscription.product.create({
	locale: "tr",
	name: "Premium Membership",
});
```

**2. Create a pricing plan** under that product:

```typescript
const plan = await iyzipay.subscription.pricingPlan.create(product.data!.referenceCode, {
	locale: "tr",
	name: "Monthly",
	price: "49.90",
	currencyCode: "TRY",
	paymentInterval: "MONTHLY",
	paymentIntervalCount: 1,
});
```

**3. Initialize a subscription** for a customer:

```typescript
// Direct (new customer + card details)
const sub = await iyzipay.subscription.initialize({
	locale: "tr",
	pricingPlanReferenceCode: plan.data!.referenceCode,
	customer: { name: "John", surname: "Doe", email: "john@example.com", /* ... */ },
	paymentCard: { cardHolderName: "John Doe", cardNumber: "5528790000000008", /* ... */ },
});
```

Three initialization flows are available:
- `initialize` — new customer with card details
- `initializeWithCustomer` — existing customer reference code
- `initializeWithCf` — via checkout form (iyzico-hosted page)

Manage the lifecycle with `activate`, `cancel`, `upgrade`, `retryPayment`, and `search`.

## Supported APIs

| Namespace | Method | Description |
| --- | --- | --- |
| `payment` | `create`, `retrieve`, `createPreAuth`, `createPostAuth` | Non-3DS payments |
| `payment.threeds` | `initialize`, `initializePreAuth`, `create`, `createV2` | 3D Secure flow |
| `payment.checkoutForm` | `initialize`, `initializePreAuth`, `retrieve` | Hosted payment page |
| `payment.payWithIyzico` | `initialize`, `retrieve` | iyzico wallet redirect |
| `marketplace.subMerchant` | `create`, `update`, `retrieve`, `updatePayoutItem` | Sub-merchant management |
| `marketplace.approval` | `approve`, `disapprove` | Payout approval |
| `subscription` | `initialize`, `initializeWithCustomer`, `initializeWithCf`, `retrieveCfResult`, `retrieve`, `search`, `activate`, `cancel`, `upgrade`, `retryPayment`, `initializeCardUpdate` | Subscription lifecycle |
| `subscription.product` | `create`, `update`, `retrieve`, `list`, `delete` | Subscription products |
| `subscription.pricingPlan` | `create`, `update`, `retrieve`, `list`, `delete` | Pricing plans |
| `subscription.customer` | `retrieve`, `update`, `list` | Subscriber management |
| `refund` | `create`, `createAmountBased`, `createChargedFromMerchant` | Refunds |
| `cancel` | `create` | Same-day void |
| `bin` | `check` | BIN lookup |
| `installment` | `query` | Installment options |
| `iyzilink` | `create`, `createFastLink`, `list`, `retrieve`, `update`, `updateStatus`, `delete` | Payment links |
| `cardStorage` | `create`, `list`, `delete` | Stored cards |
| `reporting` | `getPaymentDetails`, `getDailyTransactions` | Payment reporting |

All request and response types are exported:

```typescript
import type { CreatePaymentRequest, Payment, Buyer, PaymentCard } from "iyzico-js";
```

## Development

```bash
pnpm install
pnpm test
pnpm build
pnpm check
pnpm lint
```

## Testing

You can run sandbox integration tests with:

```bash
pnpm test:integration
```

### Mock Test Cards

Test cards that simulate a successful payment:

| Card Number      | Bank                  | Card Type            |
| ---------------- | --------------------- | -------------------- |
| 5890040000000016 | Akbank                | Master Card (Debit)  |
| 5526080000000006 | Akbank                | Master Card (Credit) |
| 4766620000000001 | Denizbank             | Visa (Debit)         |
| 4603450000000000 | Denizbank             | Visa (Credit)        |
| 4729150000000005 | Denizbank Bonus       | Visa (Credit)        |
| 4987490000000002 | Finansbank            | Visa (Debit)         |
| 5311570000000005 | Finansbank            | Master Card (Credit) |
| 9792020000000001 | Finansbank            | Troy (Debit)         |
| 9792030000000000 | Finansbank            | Troy (Credit)        |
| 5170410000000004 | Garanti Bankası       | Master Card (Debit)  |
| 5400360000000003 | Garanti Bankası       | Master Card (Credit) |
| 374427000000003  | Garanti Bankası       | American Express     |
| 4475050000000003 | Halkbank              | Visa (Debit)         |
| 5528790000000008 | Halkbank              | Master Card (Credit) |
| 4059030000000009 | HSBC Bank             | Visa (Debit)         |
| 5504720000000003 | HSBC Bank             | Master Card (Credit) |
| 5892830000000000 | Türkiye İş Bankası    | Master Card (Debit)  |
| 4543590000000006 | Türkiye İş Bankası    | Visa (Credit)        |
| 4910050000000006 | Vakıfbank             | Visa (Debit)         |
| 4157920000000002 | Vakıfbank             | Visa (Credit)        |
| 5168880000000002 | Yapı ve Kredi Bankası | Master Card (Debit)  |
| 5451030000000000 | Yapı ve Kredi Bankası | Master Card (Credit) |

Cross-border test cards:

| Card Number      | Country              |
| ---------------- | -------------------- |
| 4054180000000007 | Non-Turkish (Debit)  |
| 5400010000000004 | Non-Turkish (Credit) |

Error simulation cards:

| Card Number      | Description                                          |
| ---------------- | ---------------------------------------------------- |
| 5406670000000009 | Success but cannot be cancelled, refund or post auth |
| 4111111111111129 | Not sufficient funds                                 |
| 4129111111111111 | Do not honour                                        |
| 4128111111111112 | Invalid transaction                                  |
| 4127111111111113 | Lost card                                            |
| 4126111111111114 | Stolen card                                          |
| 4125111111111115 | Expired card                                         |
| 4124111111111116 | Invalid cvc2                                         |
| 4123111111111117 | Not permitted to card holder                         |
| 4122111111111118 | Not permitted to terminal                            |
| 4121111111111119 | Fraud suspect                                        |
| 4120111111111110 | Pickup card                                          |
| 4130111111111118 | General error                                        |
| 4131111111111117 | Success but mdStatus is 0                            |
| 4141111111111115 | Success but mdStatus is 4                            |
| 4151111111111112 | 3D Secure initialize failed                          |

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for setup instructions and guidelines.

## License

MIT
