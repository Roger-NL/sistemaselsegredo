/** Synchronize the verified server cookie without touching local story or study progress. */
export type SessionIdentity = { getIdToken(forceRefresh?: boolean): Promise<string> };

export function createSessionSynchronizer(request: typeof fetch = fetch) {
  let lastToken: string | null = null;
  const clear = () => request("/api/auth/session", { method: "DELETE", credentials: "include" });

  return async (identity: SessionIdentity | null, forceRefresh = false): Promise<boolean> => {
    try {
      if (!identity) {
        lastToken = null;
        return (await clear()).ok;
      }
      const token = await identity.getIdToken(forceRefresh);
      if (!forceRefresh && token === lastToken) return true;
      const response = await request("/api/auth/session", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
      });
      if (!response.ok) {
        lastToken = null;
        await clear().catch(() => undefined);
        return false;
      }
      lastToken = token;
      return true;
    } catch {
      lastToken = null;
      await clear().catch(() => undefined);
      return false;
    }
  };
}
