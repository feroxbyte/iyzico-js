import { hmacSha256Hex } from './crypto.js'

/**
 * Generates the iyzico V2 Authorization header.
 *
 *   signature  = hex(HMAC-SHA256(secretKey, randomKey + uriPath + body))
 *   base64     = base64("apiKey:{apiKey}&randomKey:{randomKey}&signature:{signature}")
 *   header     = "IYZWSv2 " + base64
 */
export async function generateAuthHeader(
	apiKey: string,
	secretKey: string,
	randomKey: string,
	uriPath: string,
	body: string | undefined,
): Promise<string> {
	const payload = body != null ? uriPath + body : uriPath
	const signatureHex = await hmacSha256Hex(secretKey, randomKey + payload)

	const authString = `apiKey:${apiKey}&randomKey:${randomKey}&signature:${signatureHex}`
	return `IYZWSv2 ${btoa(authString)}`
}
