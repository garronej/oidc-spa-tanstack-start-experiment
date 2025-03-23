import { createFileRoute } from '@tanstack/react-router'
import { getOidcLoader } from "../oidc";

export const Route = createFileRoute('/protected')({
  loader: async () => {

    // We need this: https://github.com/TanStack/router/discussions/3394#discussioncomment-12595357
    // https://x.com/tannerlinsley/status/1892364303711281262
    // https://github.com/TanStack/router/discussions/3141
    const oidcContext = await getOidcLoader();

    return oidcContext;

  },
  component: Protected,
  ssr: false
})

function Protected() {
  const oidcContext = Route.useLoaderData()

  return oidcContext === undefined ? (
      <h1>User not connected</h1>
  ) : (
      <pre>{JSON.stringify(oidcContext, null, 2)}</pre>
  );
}
