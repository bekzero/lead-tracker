import { z } from "zod";

export const endpointRanges = ["1–50", "51–250", "251–1,000", "1,001–5,000", "5,000+"] as const;
export const interestChoices = [
  "Passwordless authentication",
  "KZero Vault",
  "MSP partnership",
  "Demo",
  "Other"
] as const;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => value || undefined);

export const leadSchema = z.object({
  idempotencyKey: z.string().uuid(),
  fullName: z.string().trim().min(2, "Enter your full name.").max(120),
  company: z.string().trim().min(2, "Enter your company.").max(160),
  workEmail: z.string().trim().email("Enter a valid work email.").max(254),
  jobTitle: optionalText(120),
  phone: optionalText(40),
  endpointRange: z.enum(endpointRanges).optional().or(z.literal("")).transform((value) => value || undefined),
  currentPasswordManager: optionalText(120),
  currentIdentityProvider: optionalText(120),
  interests: z.array(z.enum(interestChoices)).max(interestChoices.length).default([]),
  demoRequested: z.boolean().default(false)
});

export const teamUpdateSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("contacted"), contacted: z.boolean() }),
  z.object({ action: z.literal("notes"), notes: z.string().trim().max(2000) })
]);
