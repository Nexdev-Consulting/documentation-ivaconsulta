import React, { createContext, useContext, useEffect, useState } from "react";
import { Auth0Client } from "@auth0/auth0-spa-js";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { useHistory } from "@docusaurus/router";

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
  const history = useHistory();
  const [auth0, setAuth0] = useState<Auth0Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
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
      });
      setAuth0(client);

      if (window.location.pathname === "/auth/callback") {
        try {
          await client.handleRedirectCallback();
          const isLoggedIn = await client.isAuthenticated();
          setIsAuthenticated(isLoggedIn);
          if (isLoggedIn) setUser(await client.getUser());
          setIsLoading(false);
          // Use Docusaurus router to navigate
          history.push("/");
          return;
        } catch (error) {
          console.error("Error handling redirect callback:", error);
          setIsLoading(false);
          return;
        }
      }

      const isLoggedIn = await client.isAuthenticated();
      setIsAuthenticated(isLoggedIn);
      if (isLoggedIn) setUser(await client.getUser());
      setIsLoading(false);
    })();
  }, [siteConfig.customFields, history]);

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
