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
