"use client";

import { loginAction } from "./actions";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import Image from "next/image";

const CURRENT_YEAR = 2026;

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  AccessDenied: "O acesso foi negado pelo provedor de autenticacao.",
  CallbackRouteError:
    "O retorno do Keycloak falhou. Verifique o redirect URI e o client secret.",
  Configuration:
    "A configuracao de autenticacao esta inconsistente. Revise NEXTAUTH_URL e KEYCLOAK_ISSUER.",
  OAuthAccountNotLinked: "A conta retornada pelo Keycloak nao pode ser vinculada.",
  OAuthCallbackError:
    "O Keycloak recusou o callback. Revise o redirect URI e o dominio acessado no navegador.",
  OAuthSigninError:
    "Nao foi possivel iniciar o login no Keycloak. Revise issuer, client e host da aplicacao.",
  RefreshAccessTokenError:
    "Sua sessao expirou e nao foi possivel renovar o token. Entre novamente.",
  Verification: "Nao foi possivel validar a autenticacao.",
};

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const authError = searchParams.get("error");
  const authCode = searchParams.get("code");

  const handleLogin = async () => {
    setIsLoading(true);
    await loginAction();
  };

  const errorMessage = authError
    ? AUTH_ERROR_MESSAGES[authError] ??
      "Nao foi possivel concluir o login pelo Keycloak."
    : null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface px-8 pb-6 relative w-full">
      {/* Versão */}
      <p className="absolute top-14 text-xs text-primary-dark tracking-wide">
        Método de Aprendizagem - v1.0
      </p>

      {/* Logo */}
      <Image
        src="/assets/logoDuma.png"
        alt="DUMA Logo"
        width={220}
        height={110}
        priority
        className="mb-1 object-contain"
      />
      <h1 className="text-2xl text-[#EDAA12] font-bold mb-2">
        DUMA
      </h1>
      
      {/* Linha decorativa */}
      <div className="w-12 h-1 bg-primary rounded-full mb-6" />

      {/* Subtítulo */}
      <p className="text-base text-[#EDAA12] text-center leading-6 mb-12 max-w-xs">
        Sua jornada começa aqui.
        <br />
        Faça login para continuar.
      </p>

      {errorMessage ? (
        <div className="mb-6 w-full max-w-sm rounded-xl border border-primary-darker bg-background/40 px-4 py-3 text-sm text-text-primary">
          <p>{errorMessage}</p>
          {authCode ? (
            <p className="mt-2 text-xs text-primary-dark">Codigo: {authCode}</p>
          ) : null}
        </div>
      ) : null}

      {/* Botão de login */}
      <Button
        onClick={handleLogin}
        loading={isLoading}
        size="lg"
        className="w-1/2 py-[18px] text-lg font-extrabold tracking-wide text-[#1C1C1C]"
        style={{
          backgroundColor: "#EDAA12",
          borderColor: "#EDAA12",
          boxShadow: "0 6px 12px rgba(237, 170, 18, 0.35)"
        }}
      >
        Entrar
      </Button>

      {/* Rodapé */}
      <p className="absolute bottom-12 text-xs text-primary-dark">
        © {CURRENT_YEAR} Talanta Tecnologia
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface">
        <span className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-2" />
        <span className="text-xs text-primary-dark font-medium">Carregando...</span>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
