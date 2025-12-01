import React from "react";
import { useAuth } from "../auth/AuthProvider";

export default function NavbarAuth() {
  const { isLoading, isAuthenticated, user, login, logout } = useAuth();

  if (isLoading) {
    return (
      <div style={{ padding: "0 1rem", fontSize: "0.9rem", color: "#888" }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <button
        className="button button--primary button--sm"
        onClick={login}
        style={{ marginRight: "0.5rem" }}
      >
        Sign In
      </button>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <span style={{ fontSize: "0.9rem" }}>
        {user?.name || user?.email || "User"}
      </span>
      <button
        className="button button--secondary button--sm"
        onClick={logout}
      >
        Sign Out
      </button>
    </div>
  );
}

