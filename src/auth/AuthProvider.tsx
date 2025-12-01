import React, { createContext, useContext, useEffect, useState } from "react";
import { Auth0Client } from "@auth0/auth0-spa-js";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";

type AuthContextValue = {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: Record<string, unknown> | null;
  login: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { siteConfig } = useDocusaurusContext();
  const [auth0, setAuth0] = useState<Auth0Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [isProcessingCallback, setIsProcessingCallback] = useState(false);

  useEffect(() => {
    // Only run in browser
    if (!ExecutionEnvironment.canUseDOM) {
      return;
    }

    // Check if we're on the callback page first
    const searchParams = new URLSearchParams(window.location.search);
    const hasAuthParams = searchParams.has("code") && searchParams.has("state");
    const isCallbackPage = window.location.pathname === "/auth/callback";

    if (hasAuthParams && isCallbackPage) {
      setIsProcessingCallback(true);
    }

    (async () => {
      const domain = siteConfig.customFields?.AUTH0_DOMAIN as string;
      const clientId = siteConfig.customFields?.AUTH0_CLIENT_ID as string;

      console.log("Auth0 customFields:", {
        domain: domain || "missing",
        clientId: clientId ? "***" + clientId.slice(-4) : "missing",
        allCustomFields: siteConfig.customFields,
      });

      if (!domain || !clientId) {
        console.error("Auth0 credentials not found in customFields", {
          domain,
          clientId,
        });
        setIsLoading(false);
        return;
      }

      const client = new Auth0Client({
        domain,
        clientId,
        authorizationParams: {
          redirect_uri: window.location.origin + "/auth/callback",
        },
        cacheLocation: "localstorage", // Ensure tokens persist across page reloads
        useRefreshTokens: true, // Enable refresh tokens for better session management
      });
      setAuth0(client);

      // Check if we're returning from Auth0 (has code and state params)
      const searchParams = new URLSearchParams(window.location.search);
      const hasAuthParams =
        searchParams.has("code") && searchParams.has("state");

      if (hasAuthParams && window.location.pathname === "/auth/callback") {
        console.log("Processing callback at:", window.location.href);
        try {
          console.log("Calling handleRedirectCallback...");
          const result = await client.handleRedirectCallback();
          console.log("Callback handled successfully:", result);

          // Redirect immediately - tokens are now stored in localStorage
          console.log("Redirecting to home...");
          window.location.replace("/");
          // Keep loading state true during redirect to prevent UI flicker
          return;
        } catch (error) {
          console.error("Error handling redirect callback:", error);
          console.error("Error details:", {
            message: error.message,
            stack: error.stack,
            name: error.name,
          });
          setIsLoading(false);
          setIsProcessingCallback(false);
          return;
        }
      }

      // Normal page load - check if user is authenticated
      // Skip this check if we're in the middle of processing a callback
      if (!isProcessingCallback) {
        const isLoggedIn = await client.isAuthenticated();
        console.log("Is logged in on normal page load:", isLoggedIn);
        setIsAuthenticated(isLoggedIn);
        if (isLoggedIn) {
          const userData = await client.getUser();
          console.log("User data:", userData);
          setUser(userData);
        }
        setIsLoading(false);
      }
    })();
  }, [siteConfig.customFields]);

  const login = async () => auth0?.loginWithRedirect();
  const logout = () =>
    auth0?.logout({ logoutParams: { returnTo: window.location.origin } });

  return (
    <AuthContext.Provider
      value={{ isLoading, isAuthenticated, user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
