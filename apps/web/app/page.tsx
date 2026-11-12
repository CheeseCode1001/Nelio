import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

/** M-01 Home is a Milestone 2 screen. Until then the root sends people to sign in or to their workspace. */
export default async function RootPage() {
  redirect((await getSessionUser()) ? "/auth/continue" : "/login");
}
