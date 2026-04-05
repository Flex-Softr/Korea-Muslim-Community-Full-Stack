import "server-only";

import { loadServerEnv } from "./load-server-env";

export type { ServerEnv } from "./load-server-env";

/** Parsed server env — do not import from Client Components. */
export const env = loadServerEnv();
