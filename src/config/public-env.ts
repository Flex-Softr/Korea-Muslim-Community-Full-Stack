import { z } from "zod";

const emptyToUndef = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

/**
 * Safe to import from Client Components. Only `NEXT_PUBLIC_*` variables.
 */
const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.preprocess(
    emptyToUndef,
    z
      .string()
      .url("NEXT_PUBLIC_APP_URL must be a valid URL when set")
      .optional(),
  ),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

export const publicEnv = publicEnvSchema.parse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});
