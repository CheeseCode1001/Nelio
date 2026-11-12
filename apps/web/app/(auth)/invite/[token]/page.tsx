import { db, findInvitation } from "@nelio/db";
import { ROLE_LABELS } from "@nelio/domain";
import { Banner, Button, ButtonLink, CardTitle, Chip, KeyValues, Small } from "@nelio/ui";
import type { Metadata } from "next";
import { AcceptInviteForm, AcceptInviteSignUpForm } from "@/components/auth/forms";
import { AuthShell, inviteSide } from "@/components/auth/shell";
import { switchAccountAction } from "@/lib/actions/auth";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = { title: "You’re invited", robots: { index: false } };

/** What each role can and can't do, in the words of the AU-06 board and B §6. */
const ROLE_COPY: Record<string, { can: string; cannot: string }> = {
  client_approver: { can: "Review and approve content", cannot: "See billing, other clients or settings" },
  viewer: { can: "View content, activity and analytics", cannot: "Edit, approve or publish" },
  editor: { can: "Create, edit and schedule content", cannot: "Approve, change billing or connect accounts" },
  manager: { can: "Run this workspace: agents, accounts and schedules", cannot: "Change the plan or see other clients" },
  admin: { can: "Manage every workspace, the team and billing", cannot: "Delete the organization or transfer ownership" },
};

/** AU-06 Accept invitation. States: filled, invite expired, already accepted, signed in as someone else. */
export default async function AcceptInvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const inv = await findInvitation(db(), token);
  const user = await getSessionUser();
  const org = inv.orgName ?? "Nelio";
  const place = inv.workspaceName ?? inv.orgName ?? "a workspace";
  const role = inv.workspaceRole ?? inv.orgRole ?? "viewer";
  const copy = ROLE_COPY[role]!;
  const inviter = inv.inviterName?.split(" ")[0] ?? "Your teammate";

  // A link that never existed gets the same answer as an expired one: nothing about the workspace is revealed.
  const known = inv.state !== "not_found";
  const head = (
    <div className="flex flex-wrap items-center gap-3">
      <span aria-hidden="true" className="box-border inline-flex size-[52px] items-center justify-center rounded-2xl border-2 border-outline bg-orange font-display text-[22px] font-extrabold text-outline">
        {known ? org.slice(0, 1).toUpperCase() : "N"}
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <Small>{known ? `${inviter} from ${org} invited you` : "Invitation"}</Small>
        <CardTitle size={20}>{known ? `Join ${place} on Nelio` : "Join a workspace on Nelio"}</CardTitle>
      </div>
    </div>
  );

  let body;
  if (inv.state === "accepted") {
    body = (
      <>
        <Banner tone="ok" title={`You’ve already joined ${place}`} text="Log in to continue." />
        <ButtonLink href="/login" size="lg" full>Log in</ButtonLink>
      </>
    );
  } else if (inv.state !== "valid") {
    body = <Banner tone="warn" title="This invite expired" text={known ? `Invites last 7 days. Ask ${inviter} to send a new one.` : "Invites last 7 days. Ask for a new one."} />;
  } else if (user && user.email.toLowerCase() !== inv.email!.toLowerCase()) {
    body = (
      <>
        <Banner tone="warn" title={`This invite is for ${inv.email}`} text={`You’re signed in as ${user.email}.`} />
        <form action={switchAccountAction}>
          <input type="hidden" name="token" value={token} />
          <Button type="submit" size="lg" full>Switch account</Button>
        </form>
        <ButtonLink href="/auth/continue" variant="ghost" full>Cancel</ButtonLink>
      </>
    );
  } else {
    const details = (
      <KeyValues
        pairs={[
          ["Your role", <Chip key="r" tone={role === "client_approver" ? "warn" : "blue"} icon="check">{ROLE_LABELS[role]}</Chip>],
          ["You can", copy.can],
          ["You can’t", copy.cannot],
        ]}
      />
    );
    body = (
      <>
        {details}
        {user ? <AcceptInviteForm token={token} /> : <AcceptInviteSignUpForm token={token} />}
      </>
    );
  }

  return (
    <AuthShell side={inviteSide(org)}>
      {head}
      {body}
    </AuthShell>
  );
}
