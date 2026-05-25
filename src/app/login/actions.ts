"use server";

import { signIn } from "@/lib/auth";

export async function loginAction() {
  await signIn("keycloak", { redirectTo: "/dashboard" });
}
