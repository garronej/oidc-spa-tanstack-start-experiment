import { createFileRoute } from "@tanstack/react-router";
import { useOidc } from "../oidc";

export const Route = createFileRoute("/")({
  component: Home,
  ssr: false
});

function Home() {
  const { isUserLoggedIn, decodedIdToken, login, logout } = useOidc();
  return (
    <div className="p-2">
      <h3>Welcome {isUserLoggedIn ? decodedIdToken?.name : "Stranger"}</h3>
      {!isUserLoggedIn && <button onClick={() => login()}>Login</button>}
      {isUserLoggedIn && ( <button onClick={() => logout({ redirectTo: "home" })}>Logout</button>)}
    </div>
  );
}
