import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { removeTokensAndLogout } from "@/lib/auth/sessionUtility";

export const Route = createFileRoute("/logout/")({
  component: RouteComponent,
});

function RouteComponent() {
  useEffect(() => {
    removeTokensAndLogout();
  }, []);
  return <div>Hello "/logout/"!</div>;
}
