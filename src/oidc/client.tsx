

import { createReactOidc } from "oidc-spa/react";
import { zDecodedIdToken } from "./isomorph";
import { ISSUER_URI, setOidcReactApi } from "./isomorph";

const oidcReactApi = createReactOidc({
  issuerUri: ISSUER_URI,
  clientId: import.meta.env.VITE_OIDC_CLIENT_ID,
  homeUrl: "/",
  decodedIdTokenSchema: zDecodedIdToken,
  debugLogs: false,
});

setOidcReactApi({ oidcReactApi });

export const { OidcProvider } = oidcReactApi;

