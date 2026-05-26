import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

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

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const accountUrl = `${process.env.KEYCLOAK_ISSUER}/account`;
    const res = await fetch(accountUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: `Keycloak error: ${res.status} - ${text}` }, { status: res.status });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
