import { db } from "@nelio/db";
import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { COOKIE, appOrigin, authUrl, newAttempt, youtubeConfigured } from "@/lib/youtube-verify";



/** LI-06 "Verify with YouTube": starts Google sign-in for the signed-in creator. `?claim=` names a pasted channel to check. */
export async function GET(req: NextRequest) {
  const origin = appOrigin(req.nextUrl.origin);
  const back = (result: string) => NextResponse.redirect(`${origin}/creator/verify?result=${result}`);
  const session = await getSession();
  if (!session || session.user.needsMfa) return NextResponse.redirect(`${origin}/login?next=%2Fcreator%2Fverify`);
  const creator = await db().creatorProfile.findUnique({ where: { userId: session.user.id }, select: { id: true } });
  if (!creator) return NextResponse.redirect(`${origin}/denied`);
  if (!youtubeConfigured()) return back("unavailable");
  const claim = req.nextUrl.searchParams.get("claim");
  if (claim && !(await db().creatorChannel.findFirst({ where: { id: claim, creatorId: creator.id, platform: "youtube" }, select: { id: true } }))) return back("error");
  const a = newAttempt();
  const res = NextResponse.redirect(authUrl(origin, a));
  res.cookies.set(COOKIE, JSON.stringify({ s: a.state, v: a.verifier, c: claim, p: creator.id }), { httpOnly: true, secure: origin.startsWith("https://"), sameSite: "lax", maxAge: 600, path: "/api/creator/verify/youtube" });
  return res;
}
