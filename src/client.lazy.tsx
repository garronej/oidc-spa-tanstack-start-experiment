/// <reference types="vinxi/types/client" />
import { hydrateRoot } from "react-dom/client";
import { StartClient } from "@tanstack/react-start";
import { createRouter } from "./router";
import { OidcProvider } from "./oidc/client";

const router = createRouter();

hydrateRoot(
  document,
  <OidcProvider>
    <StartClient router={router} />
  </OidcProvider>
);
