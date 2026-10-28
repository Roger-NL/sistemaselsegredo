import "server-only";

export type NotificationEnvelope = { from: string; to: string[]; subject: string; text: string };
export class NotificationDeliveryError extends Error {
  constructor(public readonly code: string, public readonly retryable: boolean) { super(code); }
}

export function notificationProviderConfiguration() {
  const key = process.env.RESEND_API_KEY?.trim();
  const from = process.env.NOTIFICATION_FROM_EMAIL?.trim();
  // A plain verified mailbox; the product supplies the display name itself.
  const validSender = from && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(from) && !/[\r\n]/.test(from);
  return { configured: Boolean(key && validSender), senderEmail: validSender ? from : null };
}

/** Keep the envelope stable across retries: Resend keys last 24 hours. */
export async function sendOperationalEmail(envelope: NotificationEnvelope, idempotencyKey: string): Promise<string> {
  if (!notificationProviderConfiguration().configured) throw new NotificationDeliveryError("provider_not_configured", false);
  let response: Response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY!.trim()}`, "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
      body: JSON.stringify(envelope),
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    });
  } catch { throw new NotificationDeliveryError("provider_connection_failed", true); }
  if (!response.ok) {
    // Do not persist or log provider response bodies: they can contain addresses or credentials.
    throw new NotificationDeliveryError(`provider_http_${response.status}`, response.status === 429 || response.status >= 500);
  }
  let data: unknown;
  try { data = await response.json(); } catch { throw new NotificationDeliveryError("provider_response_invalid", true); }
  if (!data || typeof data !== "object" || !("id" in data) || typeof data.id !== "string" || !data.id) throw new NotificationDeliveryError("provider_response_invalid", true);
  return data.id;
}
