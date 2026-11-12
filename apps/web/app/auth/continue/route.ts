import { NextResponse, type NextRequest } from "next/server";
import { getSession, getSessionUser, homePathFor } from "@/lib/auth";

/** Sends a signed-in person to the right surface for their roles (operator app, client portal, creator portal). */
export async function GET(request: NextRequest) {
  const to = (path: string) => NextResponse.redirect(new URL(path, request.nextUrl.origin));
  const user = await getSessionUser();
  if (!user) return to("/login");
  if (user.needsMfa) return to("/mfa");
  const session = await getSession();
  if (!session) return to("/login");
  return to(await homePathFor(session));
}
