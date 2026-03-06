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
          scope: "openid profile email offline_access",
        },
        cacheLocation: "localstorage",
        useRefreshTokens: true,
        useRefreshTokensFallback: true,
      });

      console.log("Auth0 client configured with:", {
        domain,
        redirectUri: window.location.origin + "/auth/callback",
        cacheLocation: "localstorage",
        useRefreshTokens: true,
      });

      setAuth0(client);

      // Check if we're returning from Auth0 (has code and state params)
      const searchParams = new URLSearchParams(window.location.search);
      const hasAuthParams =
        searchParams.has("code") && searchParams.has("state");

      if (hasAuthParams && window.location.pathname === "/auth/callback") {
        console.log("🔵 CALLBACK DETECTED");
        console.log("Current URL:", window.location.href);
        console.log("Origin:", window.location.origin);
        console.log("Pathname:", window.location.pathname);
        console.log("Search params:", window.location.search);

        try {
          console.log("🔵 Calling handleRedirectCallback...");
          const result = await client.handleRedirectCallback();
          console.log("✅ Callback handled successfully:", result);

          // Check localStorage immediately after callback
          console.log("🔍 Checking localStorage immediately after callback...");
          const auth0KeysAfterCallback = Object.keys(localStorage).filter(
            (key) => key.includes("auth0")
          );
          console.log(
            "Auth0 keys after callback:",
            auth0KeysAfterCallback.length
          );
          auth0KeysAfterCallback.forEach((key) => {
            console.log(
              `  - ${key}: ${localStorage.getItem(key)?.substring(0, 50)}...`
            );
          });

          // Verify authentication
          console.log("🔍 Verifying authentication...");
          const isLoggedIn = await client.isAuthenticated();
          console.log("Is authenticated:", isLoggedIn);

          if (isLoggedIn) {
            const userData = await client.getUser();
            console.log(
              "✅ User authenticated:",
              userData?.email || userData?.name
            );
            console.log("✅ Redirecting to home...");

            // Wait a bit to ensure logs are visible
            setTimeout(() => {
              window.location.replace("/");
            }, 1000);
            return;
          } else {
            console.error("❌ Callback processed but user NOT authenticated");
            console.error(
              "This shouldn't happen - callback succeeded but isAuthenticated is false"
            );

            // Try to get access token directly
            try {
              console.log("🔄 Attempting to get access token...");
              const token = await client.getTokenSilently();
              console.log("Token retrieved:", token ? "yes" : "no");

              const retryAuth = await client.isAuthenticated();
              console.log("Retry authentication check:", retryAuth);

              if (retryAuth) {
                console.log(
                  "✅ Authentication successful after token retrieval"
                );
                setTimeout(() => {
                  window.location.replace("/");
                }, 1000);
                return;
              }
            } catch (tokenError) {
              console.error("❌ Failed to get token:", tokenError);
            }

            setIsLoading(false);
            setIsProcessingCallback(false);
            return;
          }
        } catch (error) {
          console.error("❌ Error handling redirect callback:", error);
          console.error("Error name:", error.name);
          console.error("Error message:", error.message);
          console.error("Error stack:", error.stack);

          // Check if it's a specific Auth0 error
          if (error.error) {
            console.error("Auth0 error code:", error.error);
            console.error("Auth0 error description:", error.error_description);
          }

          setIsLoading(false);
          setIsProcessingCallback(false);
          return;
        }
      }

      // Normal page load - check if user is authenticated
      // Skip this check if we're in the middle of processing a callback
      if (!isProcessingCallback) {
        // Debug: Check localStorage directly
        console.log("Checking localStorage for Auth0 data...");
        const auth0Keys = Object.keys(localStorage).filter((key) =>
          key.includes("auth0")
        );
        console.log("Auth0 localStorage keys:", auth0Keys);
        auth0Keys.forEach((key) => {
          console.log(`${key}:`, localStorage.getItem(key)?.substring(0, 100));
        });

        const isLoggedIn = await client.isAuthenticated();
        console.log("Is logged in on normal page load:", isLoggedIn);

        if (!isLoggedIn) {
          const hasAuth0Data = Object.keys(localStorage).some((key) =>
            key.startsWith("@@auth0spajs@@")
          );

          if (hasAuth0Data) {
            try {
              console.log("Found cached Auth0 data, attempting silent token refresh...");
              await client.getTokenSilently();
              const retryAuth = await client.isAuthenticated();
              setIsAuthenticated(retryAuth);
              if (retryAuth) {
                const userData = await client.getUser();
                setUser(userData);
              }
            } catch (silentError) {
              console.log(
                "Silent auth failed (user may need to login):",
                silentError.message
              );
              setIsAuthenticated(false);
            }
          } else {
            console.log("No existing session found, user needs to log in.");
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(true);
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
