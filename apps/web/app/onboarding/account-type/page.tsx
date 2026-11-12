import { redirect } from "next/navigation";
import { homePathFor, requireSession } from "@/lib/auth";

/** ON-01 to ON-04 are Milestone 2 screens. Until then a new account goes straight to its workspace (every step is skippable, D-04). */
export default async function OnboardingAccountType() {
  const session = await requireSession("/onboarding/account-type");
  redirect(await homePathFor(session));
}
