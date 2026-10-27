import "server-only";

/** Temporary visual entry for interface testing. Does not authorize any protected API. */
export function isVisualAccessMode() { return true; }

export const VISUAL_ACCOUNT = { name: "Roger", email: "roger@example.com" };
