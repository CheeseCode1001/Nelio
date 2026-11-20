"use server";

import { db, findWorkspaceFor, type WorkspaceSummary } from "@nelio/db";
import { CAPTION_LANGUAGES, CAPTION_STYLES, can, type Capability } from "@nelio/domain";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession, type Session } from "../auth";

type Fail = { ok: false; error: string };

/**
 * Brand kits shape content, so they follow "edit content". AI & processing defaults change what processing
 * costs, so they follow "set budget". The IA matrix has no separate row for workspace settings.
 */
async function authorize(slug: string, permission: Capability): Promise<{ session: Session; ws: WorkspaceSummary } | Fail> {
  const session = await getSession();
  if (!session || session.user.needsMfa) return { ok: false, error: "Please sign in again." };
  const ws = await findWorkspaceFor(db(), session.actor, slug);
  if (!ws) return { ok: false, error: "You don’t have permission to do that here." };
  const d = can(session.actor, permission, ws);
  if (!d.allowed || d.access === "R" || d.access === "V") return { ok: false, error: "You don’t have permission to change these settings." };
  return { session, ws };
}

const HEX = /^#[0-9a-f]{6}$/i;
const kitSchema = z.object({
  name: z.string().trim().min(1, "Give the kit a name.").max(60),
  colours: z.array(z.string().regex(HEX)).min(1, "Add at least one colour.").max(6),
  captionStyle: z.enum(Object.keys(CAPTION_STYLES) as [keyof typeof CAPTION_STYLES]),
  voice: z.string().trim().max(600),
});
export type KitInput = z.input<typeof kitSchema>;

export async function saveBrandKitAction(slug: string, kitId: string, input: KitInput): Promise<{ ok: true } | (Fail & { field?: string })> {
  const a = await authorize(slug, "content.edit");
  if ("ok" in a) return a;
  const parsed = kitSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: issue?.message ?? "Check the kit and try again.", field: String(issue?.path[0] ?? "") };
  }
  const v = parsed.data;
  const client = db();
  const kit = await client.brandKit.findFirst({ where: { id: kitId, workspaceId: a.ws.workspaceId }, select: { id: true } });
  if (!kit) return { ok: false, error: "This kit was deleted." };
  await client.$transaction([
    client.brandKit.update({ where: { id: kit.id }, data: { name: v.name, colours: v.colours.map((c) => c.toUpperCase()), primary: v.colours[0]!.toUpperCase(), accent: (v.colours[1] ?? v.colours[0]!).toUpperCase(), captionStyle: v.captionStyle, voice: v.voice } }),
    client.auditEvent.create({ data: { orgId: a.ws.orgId, workspaceId: a.ws.workspaceId, actorUserId: a.session.user.id, action: "brand_kit.update", targetType: "brand_kit", targetId: kit.id } }),
  ]);
  revalidatePath(`/w/${slug}/settings/brand-kits`);
  return { ok: true };
}

/** New kit: starts from the Nelio palette; the first kit in a workspace becomes its default. */
export async function createBrandKitAction(slug: string): Promise<{ ok: true; kitId: string } | Fail> {
  const a = await authorize(slug, "content.edit");
  if ("ok" in a) return a;
  const client = db();
  const count = await client.brandKit.count({ where: { workspaceId: a.ws.workspaceId } });
  if (count >= 10) return { ok: false, error: "A workspace can have up to 10 brand kits." };
  const kit = await client.brandKit.create({
    data: {
      orgId: a.ws.orgId, workspaceId: a.ws.workspaceId, name: count ? `${a.ws.name} kit ${count + 1}` : `${a.ws.name} kit`,
      colours: ["#FFD43B", "#0B0B14", "#FF4FB8", "#FFFFFF"], primary: "#FFD43B", accent: "#0B0B14", captionStyle: "bold_pop", voice: "", isDefault: count === 0,
    },
    select: { id: true },
  });
  await client.auditEvent.create({ data: { orgId: a.ws.orgId, workspaceId: a.ws.workspaceId, actorUserId: a.session.user.id, action: "brand_kit.create", targetType: "brand_kit", targetId: kit.id } });
  revalidatePath(`/w/${slug}/settings/brand-kits`);
  return { ok: true, kitId: kit.id };
}

export async function makeDefaultKitAction(slug: string, kitId: string): Promise<{ ok: true } | Fail> {
  const a = await authorize(slug, "content.edit");
  if ("ok" in a) return a;
  const client = db();
  const kit = await client.brandKit.findFirst({ where: { id: kitId, workspaceId: a.ws.workspaceId }, select: { id: true } });
  if (!kit) return { ok: false, error: "This kit was deleted." };
  await client.$transaction([
    client.brandKit.updateMany({ where: { workspaceId: a.ws.workspaceId, isDefault: true }, data: { isDefault: false } }),
    client.brandKit.update({ where: { id: kit.id }, data: { isDefault: true } }),
  ]);
  revalidatePath(`/w/${slug}/settings/brand-kits`);
  return { ok: true };
}

const aiSchema = z.object({
  quality: z.enum(["fast", "balanced", "high"]),
  language: z.enum(CAPTION_LANGUAGES.map((l) => l.value) as [string, ...string[]]),
  suggestPostTimes: z.boolean(),
});
export type AiSettingsInput = z.input<typeof aiSchema>;

/** ST-07 defaults: new uploads start from these; each upload can still choose its own. */
export async function saveAiSettingsAction(slug: string, input: AiSettingsInput): Promise<{ ok: true } | Fail> {
  const a = await authorize(slug, "agent.set_budget");
  if ("ok" in a) return a;
  const parsed = aiSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Check the settings and try again." };
  const v = parsed.data;
  const client = db();
  await client.$transaction([
    client.workspace.update({ where: { id: a.ws.workspaceId }, data: { processingQuality: v.quality, captionLanguage: v.language, suggestPostTimes: v.suggestPostTimes } }),
    client.auditEvent.create({ data: { orgId: a.ws.orgId, workspaceId: a.ws.workspaceId, actorUserId: a.session.user.id, action: "workspace.ai_settings", targetType: "workspace", targetId: a.ws.workspaceId, metadata: v } }),
  ]);
  revalidatePath(`/w/${slug}/settings/ai`);
  return { ok: true };
}
