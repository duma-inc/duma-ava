# 🎓 DUMA AVA — Ambiente Virtual de Aprendizagem

Frontend web do aprendiz no ecossistema DUMA. Interface responsiva que espelha a experiência do aplicativo móvel (`duma-mobile`).

---

## 🛠️ Stack Tecnológica

| Tecnologia | Versão | Finalidade |
|------------|--------|------------|
| **Next.js** | 16 (App Router) | Framework React com SSR/SSG |
| **React** | 19 | Biblioteca de UI |
| **TypeScript** | 5 | Tipagem estática |
| **Tailwind CSS** | 4 | Estilização utilitária |
| **next-auth** | v5 (beta) | Autenticação OAuth2 com Keycloak |
| **Recharts** | 2 | Gráficos SVG (progresso) |
| **react-day-picker** | 9 | Calendário (agenda) |
| **Headless UI** | 2 | Componentes acessíveis sem estilo |
| **Heroicons** | 2 | Ícones SVG |
| **Axios** | 1 | Cliente HTTP para `duma-backend` |

---

## 📂 Estrutura de Pastas

```text
duma-ava/
├── src/
│   ├── app/
│   │   ├── globals.css           # Design system (cores, fontes)
│   │   ├── layout.tsx            # Layout raiz
│   │   ├── page.tsx              # Redirect → /login
│   │   ├── login/page.tsx        # Tela de login
│   │   ├── api/auth/[...nextauth]/route.ts  # NextAuth handler
│   │   └── (authenticated)/
│   │       ├── layout.tsx        # SessionProvider + AppShell
│   │       ├── dashboard/page.tsx
│   │       ├── exercitar/page.tsx
│   │       ├── progresso/page.tsx
│   │       ├── agenda/page.tsx
│   │       ├── conteudo/page.tsx
│   │       └── configuracoes/page.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx       # Sidebar (desktop) + Bottom nav (mobile)
│   │   │   └── AppShell.tsx      # Container principal
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── CardButton.tsx
│   │       ├── BorderedCard.tsx
│   │       ├── ProgressBar.tsx
│   │       ├── Badge.tsx
│   │       ├── ViewToggle.tsx
│   │       ├── MetricBar.tsx
│   │       ├── GradeCard.tsx
│   │       ├── FeedbackCard.tsx
│   │       └── EventCard.tsx
│   ├── lib/
│   │   ├── auth.ts              # NextAuth + Keycloak config
│   │   └── api.ts               # Axios instance
│   ├── types/
│   │   └── next-auth.d.ts       # Type augmentation
│   └── middleware.ts            # Proteção de rotas
├── .env.local                    # Variáveis de ambiente
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

## ⚙️ Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `KEYCLOAK_CLIENT_ID` | Client ID no Keycloak | `duma-ava` |
| `KEYCLOAK_CLIENT_SECRET` | Client secret (confidencial) | `xxxxx` |
| `KEYCLOAK_ISSUER` | URL do issuer do realm | `http://localhost:8081/realms/duma` |
| `NEXTAUTH_SECRET` | Chave aleatória para sessão | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | URL base da aplicação | `http://localhost:3001` |
| `NEXT_PUBLIC_API_URL` | URL do duma-backend | `http://localhost:8080` |

---

## 🚀 Rodando o Projeto

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento (porta 3001 conforme nginx.conf)
npm run dev -- -p 3001

# Build de produção
npm run build && npm start
```

---

## 🎨 Design System

A paleta de cores é idêntica ao `duma-mobile`:

| Token | Cor | Uso |
|-------|-----|-----|
| `primary` | `#FDA91E` | Cor principal, botões, ícones ativos |
| `primary-dark` | `#D88A00` | Subtítulos, textos secundários |
| `primary-darker` | `#7A4A12` | Bordas, elementos inativos |
| `surface` | `#1C1C1C` | Cards, sidebar, menus |
| `background` | `#505050` | Fundo principal |
| `text-primary` | `#F4E3C1` | Texto principal |

---

## 🔐 Autenticação

- **Provedor**: Keycloak (realm `duma`, client `duma-ava`)
- **Tipo**: Confidential (server-side secret)
- **Fluxo**: Authorization Code + PKCE via `next-auth`
- **Token refresh**: Automático (configurado no callback JWT)
- **Middleware**: Todas as rotas protegidas exceto `/login` e `/api/auth`

---

## 📡 Integração com Backend

O `duma-backend` é acessado via Axios (`src/lib/api.ts`). O token Bearer é injetado a partir da sessão `next-auth`.

### Exemplo client-side:
```typescript
import api from "@/lib/api";
import { useSession } from "next-auth/react";

const { data: session } = useSession();
api.defaults.headers.common.Authorization = `Bearer ${session?.accessToken}`;
const response = await api.get("/cursos");
```

### Exemplo server-side:
```typescript
import api from "@/lib/api";
import { auth } from "@/lib/auth";

const session = await auth();
const response = await api.get("/cursos", {
  headers: { Authorization: `Bearer ${session?.accessToken}` },
});
```
