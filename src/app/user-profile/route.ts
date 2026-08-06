import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/*
 * Esta rota mora FORA de /api de proposito. No nginx de producao, `location /api/` aponta para o
 * duma-backend (removendo o prefixo), entao um handler em /api/profile nunca chega ao Next.js --
 * a requisicao vira GET /profile no Spring e volta 404. A unica excecao aberta la e /api/auth/,
 * para o next-auth. Qualquer route handler proprio da AVA precisa ficar sob `location /`.
 */
export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const fallbackProfile = {
    firstName: session.user?.name?.split(" ")[0] ?? "",
    lastName: session.user?.name?.split(" ").slice(1).join(" ") ?? "",
    email: session.user?.email ?? "",
  };

  if (!session.accessToken) {
    return NextResponse.json(fallbackProfile);
  }

  const userInfoUrl = `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/userinfo`;

  try {
    const res = await fetch(userInfoUrl, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      return NextResponse.json(fallbackProfile);
    }

    const data = (await res.json()) as {
      given_name?: string;
      family_name?: string;
      name?: string;
      email?: string;
    };

    return NextResponse.json({
      firstName: data.given_name ?? fallbackProfile.firstName,
      lastName:
        data.family_name ??
        (data.name ? data.name.split(" ").slice(1).join(" ") : fallbackProfile.lastName),
      email: data.email ?? fallbackProfile.email,
    });
  } catch {
    return NextResponse.json(fallbackProfile);
  }
}

/*
 * Não há POST aqui de propósito. A escrita usava a Account REST API do Keycloak
 * (`${KEYCLOAK_ISSUER}/account`), que exige um token com audience `account` e a role de client
 * `account:manage-account` — o realm da Duma não entrega nenhum dos dois, então a chamada sempre
 * devolvia 401. Além disso, a Account API não sincroniza a tabela `users` do Postgres.
 * O caminho correto, quando a edição voltar, é um `PUT /users/me` no duma-backend usando o bean
 * Keycloak admin que já existe em `config/KeycloakConfig.java`.
 */
