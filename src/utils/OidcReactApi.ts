
import type { ReactNode, JSX, ComponentType, FC } from "react";
import type { OidcReact } from "oidc-spa/react";
import type { Oidc } from "oidc-spa";
import type { OidcInitializationError } from "oidc-spa";

export type OidcReactApi<
  DecodedIdToken extends Record<string, unknown>,
  AutoLogin extends boolean,
> = {
  OidcProvider: AutoLogin extends true
    ? (props: {
        fallback?: ReactNode;
        ErrorFallback?: (props: {
          initializationError: OidcInitializationError;
        }) => ReactNode;
        children: ReactNode;
      }) => JSX.Element
    : (props: { fallback?: ReactNode; children: ReactNode }) => JSX.Element;
  useOidc: AutoLogin extends true
    ? {
        (params?: {
          assert: "user logged in";
        }): OidcReact.LoggedIn<DecodedIdToken>;
      }
    : {
        (params?: { assert?: undefined }): OidcReact<DecodedIdToken>;
        (params: {
          assert: "user logged in";
        }): OidcReact.LoggedIn<DecodedIdToken>;
        (params: { assert: "user not logged in" }): OidcReact.NotLoggedIn;
      };
  getOidc: () => Promise<
    AutoLogin extends true
      ? Oidc.LoggedIn<DecodedIdToken>
      : Oidc<DecodedIdToken>
  >;
} & (AutoLogin extends true
  ? {}
  : {
      withLoginEnforced: <Props extends Record<string, unknown>>(
        Component: ComponentType<Props>,
        params?: {
          onRedirecting: () => JSX.Element | null;
        }
      ) => FC<Props>;
      enforceLogin: (redirectUrl?: string) => Promise<void | never>;
    });