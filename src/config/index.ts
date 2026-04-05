/**
 * Central configuration folder.
 *
 * - Client / shared types: import from here.
 * - Server secrets and full env: `import { env } from "@/config/env"` (never in Client Components).
 * - Public env only: `import { publicEnv } from "@/config/public-env"` or from this file.
 */
export { publicEnv, type PublicEnv } from "./public-env";
export type { ServerEnv } from "./load-server-env";
