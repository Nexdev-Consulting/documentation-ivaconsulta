import React from "react";
import { useAuth } from "../auth/AuthProvider";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated, login } = useAuth();

  if (isLoading)
    return (
      <div style={{ textAlign: "center", marginTop: "4rem" }}>
        <p>Checking access…</p>
      </div>
    );

  if (!isAuthenticated)
    return (
      <div style={{ textAlign: "center", marginTop: "4rem" }}>
        <p>Access restricted to collaborators.</p>
        <button className="button button--primary" onClick={login}>
          Sign in with Auth0
        </button>
      </div>
    );

  return <>{children}</>;
}
