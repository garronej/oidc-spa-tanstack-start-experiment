import { z } from "zod";
import type { OidcReactApi } from "../utils/OidcReactApi";
import { assert } from "tsafe/assert";
import { createMiddleware } from "@tanstack/react-start";
import { createServerFn } from '@tanstack/react-start'


export const zDecodedIdToken = z.object({
    sub: z.string(),
    name: z.string()
});

export type DecodedIdToken = z.infer<typeof zDecodedIdToken>;

export const ISSUER_URI: string = import.meta.env.VITE_OIDC_ISSUER_URI;

let oidcReactApi: OidcReactApi<DecodedIdToken, false> | undefined = undefined;

export function setOidcReactApi(params: { oidcReactApi: OidcReactApi<DecodedIdToken, false> }) {
    oidcReactApi = params.oidcReactApi;
}

export const useOidc: OidcReactApi<DecodedIdToken, false>["useOidc"] = params => {
    assert(oidcReactApi !== undefined, "useOidc Cannot be called on the server");

    // @ts-expect-error
    return oidcReactApi.useOidc(params);
};

type ClientToServerOidcContext = {
    idToken: string;
    accessToken: string;
};

const zClientToServerOidcContext = z.object({
    idToken: z.string(),
    accessToken: z.string()
});

export const oidcMiddleware = createMiddleware()
    .client(async ({ next }) => {
        let clientToServerOidcContext: ClientToServerOidcContext | undefined | null;

        if (oidcReactApi !== undefined) {
            const oidc = await oidcReactApi.getOidc();

            if (oidc.isUserLoggedIn) {
                const { accessToken, idToken } = await oidc.getTokens_next();

                clientToServerOidcContext = { accessToken, idToken };
            } else {
                clientToServerOidcContext = undefined;
            }
        } else {
            clientToServerOidcContext = null;
        }

        return next({
            sendContext: {
                clientToServerOidcContext
            }
        });
    })
    .server(async ({ next, context }) => {
        const { clientToServerOidcContext } = context;

        z.union([zClientToServerOidcContext, z.undefined(), z.null()]).parse(clientToServerOidcContext);

        type OidcServerContext = {
            decodedIdToken: DecodedIdToken;
            accessToken: string;
        };

        let oidcContext: OidcServerContext | undefined | null;

        if(clientToServerOidcContext === null ){

            oidcContext = null;

        } else if (clientToServerOidcContext === undefined) {
            oidcContext = undefined;
        } else {
            const { decodedIdToken } = await validateIdToken({
                idToken: clientToServerOidcContext.idToken
            });

            console.log("Token is valid!");

            oidcContext = {
                decodedIdToken,
                accessToken: clientToServerOidcContext.accessToken
            };
        }

        const context_next = { oidcContext };

        return next({
            context: context_next
        });
    });

async function validateIdToken(params: { idToken: string }) {
    const { idToken } = params;

    const { createOidcBackend } = await import("../utils/oidc-spa-backend");

    const { verifyAndDecodeAccessToken } = await createOidcBackend({
        issuerUri: ISSUER_URI,
        decodedAccessTokenSchema: zDecodedIdToken
    });

    const { isValid, decodedAccessToken, errorCase, errorMessage } = verifyAndDecodeAccessToken({
        accessToken: idToken
    });

    if (!isValid) {
        throw new Error(`${errorCase}: ${errorMessage}`);
    }

    return {
        decodedIdToken: decodedAccessToken
    };
}

export const getOidcLoader = createServerFn()
    .middleware([oidcMiddleware])
    .handler(async ({ context }) => {
        const { oidcContext } = context;

        return oidcContext;
    });
