import NextAuth from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import type { NextAuthConfig } from "next-auth";
import type { JWT } from "next-auth/jwt";

/**
 * Configuração do NextAuth com Keycloak (Confidential Client).
 *
 * Variáveis de ambiente necessárias:
 *   KEYCLOAK_CLIENT_ID      – Client ID do realm (ex: duma-ava)
 *   KEYCLOAK_CLIENT_SECRET  – Client secret
 *   KEYCLOAK_ISSUER         – URL do issuer (ex: http://localhost:8081/realms/duma)
 *   NEXTAUTH_SECRET         – Secret aleatório para criptografia de sessão
 *   NEXTAUTH_URL            – URL base exata acessada no navegador
 */

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const url = `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.KEYCLOAK_CLIENT_ID!,
        client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken as string,
      }),
    });

    const refreshed = await response.json();

    if (!response.ok) throw refreshed;

    return {
      ...token,
      accessToken: refreshed.access_token,
      accessTokenExpires: Date.now() + refreshed.expires_in * 1000,
      refreshToken: refreshed.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error("[Auth] Token refresh failed:", error);
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

const config: NextAuthConfig = {
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  trustHost: true,
  debug: process.env.NODE_ENV === "development",
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
      issuer: process.env.KEYCLOAK_ISSUER,
      authorization: {
        params: {
          scope: "openid profile email offline_access",
        },
      },
      token: {
        params: {
          client_id: process.env.KEYCLOAK_CLIENT_ID!,
          client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
        },
      },
    }),
  ],

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, account }) {
      // Initial sign-in: persist tokens from Keycloak
      if (account) {
        return {
          ...token,
          accessToken: account.access_token,
          accessTokenExpires: account.expires_at
            ? account.expires_at * 1000
            : Date.now() + 300_000,
          refreshToken: account.refresh_token,
        };
      }

      // Return existing token if not expired
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Token expired – attempt refresh
      return refreshAccessToken(token);
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.error = token.error as string | undefined;
      return session;
    },
  },

  logger: {
    error(error: any) {
      console.error("[Auth] Error:", error);
    },
    warn(code) {
      console.warn("[Auth] Warning:", code);
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
