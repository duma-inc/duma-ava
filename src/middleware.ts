export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: [
    /*
     * Protege todas as rotas EXCETO:
     * - /login
     * - /api/auth (rotas do NextAuth)
     * - /_next (assets estáticos)
     * - /favicon.ico
     */
    "/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
