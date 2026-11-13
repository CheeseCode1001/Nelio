import { z } from "zod";
import { ACCOUNT_TYPES, WORKSPACE_ROLES } from "./roles";

/** Copy matches the AU-01 error board. */
export const emailSchema = z.string().trim().toLowerCase().pipe(z.email("Enter a full email address"));
export const passwordSchema = z.string().min(10, "At least 10 characters").max(128, "At most 128 characters");
export const fullNameSchema = z.string().trim().min(2, "Enter your full name").max(80, "At most 80 characters");

export const signUpSchema = z.object({
  fullName: fullNameSchema,
  email: emailSchema,
  password: passwordSchema,
  acceptTerms: z.literal(true, { error: "Agree to the terms to continue" }),
});
export const logInSchema = z.object({ email: emailSchema, password: z.string().min(1, "Enter your password") });
export const resetRequestSchema = z.object({ email: emailSchema });
export const newPasswordSchema = z
  .object({ password: passwordSchema, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], error: "Passwords don’t match" });
export const mfaCodeSchema = z.object({ code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code") });
export const CONTENT_PLATFORMS = ["youtube", "instagram", "tiktok", "facebook", "other"] as const;
export const contentOwnerJoinSchema = z.object({
  fullName: fullNameSchema,
  email: emailSchema,
  password: passwordSchema,
  platform: z.enum(CONTENT_PLATFORMS),
});
export const acceptInviteSchema = z.object({ fullName: fullNameSchema, password: passwordSchema });
export const createInvitationSchema = z.object({
  email: emailSchema,
  workspaceId: z.uuid(),
  role: z.enum(WORKSPACE_ROLES),
});
export const accountTypeSchema = z.enum(ACCOUNT_TYPES);

export function slugify(name: string): string {
  const s = name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return s || "workspace";
}

/** Only same-site relative paths are accepted as a post-login destination (open-redirect guard). */
export function safeNextPath(next: string | null | undefined, fallback = "/"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\") || next.includes("://")) return fallback;
  return next;
}

// ------------------------------------------------------------------ Agents (APP-05, APP-06)

const int = (min: number, max: number, what: string) =>
  z.coerce.number({ error: `Enter a number for ${what}` }).int(`Use a whole number for ${what}`).min(min, `${what} must be at least ${min}`).max(max, `${what} can be at most ${max}`);

export const agentPolicySchema = z
  .object({
    goal: z.string().trim().min(5, "Describe what the agent should do").max(300, "At most 300 characters"),
    schedule: z.enum(["mwf_1800", "daily_1800", "weekdays_0900", "tue_thu_1200", "manual"]),
    brandRules: z.string().trim().max(600, "At most 600 characters").optional().default(""),
    maxPostsPerDay: int(1, 20, "Max posts per day"),
    maxPostsPerWeek: int(1, 100, "Max posts per week"),
  })
  .refine((v) => v.maxPostsPerWeek >= v.maxPostsPerDay, { path: ["maxPostsPerWeek"], message: "Posts per week can’t be fewer than posts per day" });

export const agentBudgetSchema = z
  .object({
    weeklyBudget: int(10, 100_000, "Weekly limit"),
    perRunLimit: int(1, 100_000, "Per-run limit"),
  })
  .refine((v) => v.perRunLimit <= v.weeklyBudget, { path: ["perRunLimit"], message: "Per-run limit can’t be more than the weekly limit" });

export const agentCreateSchema = z
  .object({
    name: z.string().trim().min(2, "Give your agent a name").max(40, "At most 40 characters"),
    goal: z.string().trim().min(5, "Describe what the agent should do").max(300, "At most 300 characters"),
    color: z.enum(["lime", "blue", "pink", "yellow", "orange", "teal"]),
    shape: z.enum(["circle", "square", "blob", "pill"]),
    schedule: z.enum(["mwf_1800", "daily_1800", "weekdays_0900", "tue_thu_1200", "manual"]),
    weeklyBudget: int(10, 100_000, "Weekly budget"),
    perRunLimit: int(1, 100_000, "Per-run limit"),
    maxPostsPerWeek: int(1, 100, "Max posts per week"),
    mode: z.enum(["manual", "assisted"]),
  })
  .refine((v) => v.perRunLimit <= v.weeklyBudget, { path: ["perRunLimit"], message: "Per-run limit can’t be more than the weekly budget" });
