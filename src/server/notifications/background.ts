import "server-only";
import { after } from "next/server";
import { processOperationalNotifications } from "./service";

/** The outbox is already committed. Vercel's request waitUntil keeps this bounded work alive. */
export function scheduleOperationalNotifications(ids: string[]) {
  if (!ids.length) return;
  try {
    after(async () => {
      try {
        await processOperationalNotifications({ ids, limit: 3 });
        // Also give earlier, due retries a chance while the app is receiving traffic.
        await processOperationalNotifications({ limit: 2 });
      } catch { console.error("[notifications] background delivery unavailable"); }
    });
  } catch {
    // Scripts/tests can create genuine events outside Next's request scope. Cron drains the same durable outbox.
  }
}
