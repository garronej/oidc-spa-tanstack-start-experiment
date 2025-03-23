import {
    createOidcBackend as createOidcBackend_nonMemoized,
    type ParamsOfCreateOidcBackend,
    type OidcBackend
} from "oidc-spa/backend";

const prOidcBackedByIssuerUri = new Map<string, Promise<OidcBackend<Record<string, unknown>>>>();

export function createOidcBackend<DecodedAccessToken extends Record<string, unknown>>(
    params: ParamsOfCreateOidcBackend<DecodedAccessToken>
): Promise<OidcBackend<DecodedAccessToken>> {
    const { issuerUri } = params;

    use_cache: {
        const prOidcBacked = prOidcBackedByIssuerUri.get(issuerUri);

        if (prOidcBacked === undefined) {
            break use_cache;
        }

        // @ts-expect-error
        return prOidcBacked;
    }

    const prOidcBacked = createOidcBackend_nonMemoized(params);

    prOidcBackedByIssuerUri.set(issuerUri, prOidcBacked);

    return prOidcBacked;
}
