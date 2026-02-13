# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**iyzico-js** — modern TypeScript unofficial client for the iyzico payment API. Zero dependencies — uses only `fetch` and Web Crypto API for cross-runtime compatibility (Node.js 20+, Deno, Bun, Cloudflare Workers).

## Commands

- `pnpm check` — type check (tsc --noEmit + test tsconfig)
- `pnpm lint` — lint with Biome
- `pnpm lint:fix` — auto-fix lint issues
- `pnpm test` — run unit tests (vitest)
- `pnpm test:watch` — run tests in watch mode
- `pnpm test -- tests/unit/cancel.test.ts` — run a single test file
- `pnpm test:integration` — run sandbox integration tests (requires network)
- `pnpm build` — build with tsdown (ESM + .d.ts)

Always run `pnpm check && pnpm lint && pnpm test` before committing.

## Architecture

```
src/
├── types/                        # Merged request + response interfaces (one file per domain)
│   ├── common/                   # Base types, enums, shared sub-objects (Buyer, Address, etc.)
│   ├── payment/, cancel.ts, ...  # Domain-specific request + response types
│   └── index.ts                  # Barrel re-export
├── resources/                    # Nested hierarchy matching iyzico docs
│   ├── payment/                  # PaymentNamespace (Non-3DS, 3DS, Checkout Form, Pay with iyzico)
│   ├── marketplace/              # MarketplaceNamespace (subMerchant, approval)
│   ├── cancel.ts, refund.ts      # Flat resources
│   └── ...
├── core/http.ts                  # Fetch-based HTTP client (auth + request signing)
├── lib/                          # Standalone utilities (exported for advanced usage)
│   ├── auth.ts                   # HMAC-SHA256 authentication (V2 only)
│   └── crypto.ts                 # Web Crypto primitives
├── client.ts                     # Iyzipay orchestrator class
└── index.ts                      # Public API exports
```

### Key Patterns

- **Client instance pattern:** `const iyzipay = new Iyzipay(options); await iyzipay.payment.create(req)`
- **Nested namespaces:** `iyzipay.payment.threeds.initialize(req)`, `iyzipay.marketplace.subMerchant.create(req)`
- **Resource classes** take `HttpClient` in constructor, expose async methods
- **Single auth system:** All endpoints use HMAC-SHA256 (V2 only)
- **Types are interfaces, not classes** — no runtime overhead
- **All crypto uses Web Crypto API** (`crypto.subtle`) — never use Node's `crypto` module
- **API errors are returned, not thrown:** Check `result.status === 'success'` vs `'failure'`

### Request Flow

`Iyzipay` → `PaymentNamespace` (or other resource) → `HttpClient.post()` → generates HMAC-SHA256 auth header via `generateAuthHeader()` → calls `fetch` → returns parsed JSON response.

The `HttpClient` signs every request with `IYZWSv2` authorization. `extractUriPath()` in `core/http.ts` extracts the path for signing — it looks for `/v2` first, then falls back to path after `.com` (mirrors C#'s `FindUriPath()`).

## Code Style

- **Formatter/Linter:** Biome (not ESLint/Prettier)
- **Tabs** for indentation, **120** line width
- **Single quotes**, semicolons only as needed (ASI)
- **ESM only** — all imports use `.js` extension (`import { x } from './foo.js'`)
- `verbatimModuleSyntax` is enabled — use `import type` for type-only imports
- `noNonNullAssertion` is disabled in Biome
- `noConsole` is enforced (except in `examples/`)

## Testing

- **Test runner:** Vitest
- **Test location:** `tests/unit/` (unit) and `tests/integration/` (sandbox)
- **Unit tests mock `fetch`** via the `IyzipayOptions.fetch` option — create a mock client with `createMockClient()` pattern (see any test file)
- **Integration tests** hit the iyzico sandbox using credentials in `tests/helpers.ts`
- Test helpers (`buildPaymentRequest`, `buildBuyer`, etc.) are in `tests/helpers.ts`

## Build Output

- **Bundler:** tsdown (Rolldown-powered)
- **Output:** `dist/index.mjs` (ESM) + `dist/index.d.mts` (declarations)
- **Package validation:** `publint` runs on `prepublishOnly`
- No Node-specific APIs in built output — no `require()`, no `node:crypto`

## Common Pitfalls

- The V2 test vector from Node uses `JSON.stringify("body")` (= `'"body"'`) not raw `"body"` — auth functions take pre-serialized JSON
- Price formatting must preserve at least one decimal (e.g., `"1"` → `"1.0"`, `"1.10"` → `"1.1"`)
