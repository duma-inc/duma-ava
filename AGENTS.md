# AGENTS.md — Instruções para Agentes de IA (duma-ava)

## Contexto do Projeto

O `duma-ava` é o **frontend web do aprendiz** na plataforma DUMA EdTech. É a versão web do `duma-mobile`, compartilhando o mesmo design system e endpoints de API.

## Stack

- **Framework**: Next.js 16 (App Router) com TypeScript
- **Estilização**: Tailwind CSS 4 com tokens personalizados
- **Componentes**: Headless UI + Heroicons (substitutos web do RNEUI/Ionicons do mobile)
- **Calendário**: react-day-picker (equivalente web do react-native-calendars)
- **Gráficos**: Recharts (equivalente web do react-native-chart-kit)
- **Auth**: next-auth v5 com Keycloak provider (confidential)
- **HTTP**: Axios com interceptor de token

## Convenções

### Estrutura de Arquivos
- Páginas ficam em `src/app/(authenticated)/[rota]/page.tsx`
- Componentes reutilizáveis em `src/components/ui/`
- Layout/nav em `src/components/layout/`
- Libs compartilhadas em `src/lib/`
- Tipos em `src/types/`

### Design System
- **NUNCA** usar cores arbitrárias. Usar tokens do Tailwind: `primary`, `primary-dark`, `primary-darker`, `surface`, `background`, `text-primary`, etc.
- Todos os tokens estão definidos em `src/app/globals.css`
- Bordas de cards: `border border-primary-darker`
- Fundo de cards: `bg-surface` (#1C1C1C)
- Border radius padrão: `rounded-xl` (14px)

### Componentes
- Cada componente novo deve ser criado em `src/components/ui/` se reutilizável
- Componentes usam Tailwind classes, **não** inline styles
- Ícones: usar `@heroicons/react/24/outline` ou `24/solid`
- Botões interativos devem ter `cursor-pointer` e transição de hover

### Autenticação
- Rotas protegidas ficam dentro de `src/app/(authenticated)/`
- O `middleware.ts` protege automaticamente todas as rotas exceto `/login` e `/api/auth`
- Para acessar token: client-side via `useSession()`, server-side via `auth()`

### API
- Usar `src/lib/api.ts` para todas as chamadas ao backend
- Sempre injetar token Bearer da sessão
- URL base configurada via `NEXT_PUBLIC_API_URL`

## Referência Mobile

O `duma-mobile` (React Native/Expo) é a referência visual. Ao criar novas telas:
1. Verificar a tela equivalente em `duma-mobile/src/screens/`
2. Replicar cores, espaçamentos e hierarquia visual
3. Adaptar componentes RN (View, Text, etc.) para HTML/Tailwind

## Endpoints do Backend

O backend (`duma-backend`, Spring Boot) expõe endpoints em:
- `/level-tests/active` — Teste de nível ativo
- `/level-tests/:id/sessions` — Criar sessão de teste
- `/level-test-sessions/:id/answers` — Submeter resposta
- Demais endpoints: consultar controllers em `duma-backend/src/main/java/.../domains/`
