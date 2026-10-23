import { NextResponse } from "next/server";

export class RequestPayloadError extends Error {
  status: number;
  code: string;

  constructor(code: string, status = 400) {
    super(code);
    this.name = "RequestPayloadError";
    this.status = status;
    this.code = code;
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function assertOnlyKeys(value: Record<string, unknown>, allowedKeys: readonly string[]) {
  const allowed = new Set(allowedKeys);
  if (Object.keys(value).some((key) => !allowed.has(key))) {
    throw new RequestPayloadError("UNEXPECTED_REQUEST_FIELD");
  }
}

export async function readJsonObject(req: Request, maxBytes: number): Promise<Record<string, unknown>> {
  const contentType = req.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase();
  if (contentType !== "application/json") {
    throw new RequestPayloadError("CONTENT_TYPE_MUST_BE_JSON", 415);
  }

  const contentLength = Number(req.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    throw new RequestPayloadError("REQUEST_BODY_TOO_LARGE", 413);
  }

  if (!req.body) {
    throw new RequestPayloadError("REQUEST_BODY_REQUIRED");
  }

  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > maxBytes) {
      await reader.cancel().catch(() => undefined);
      throw new RequestPayloadError("REQUEST_BODY_TOO_LARGE", 413);
    }
    chunks.push(value);
  }

  if (totalBytes === 0) {
    throw new RequestPayloadError("REQUEST_BODY_REQUIRED");
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  let value: unknown;
  try {
    value = JSON.parse(new TextDecoder().decode(body));
  } catch {
    throw new RequestPayloadError("INVALID_JSON");
  }

  if (!isRecord(value)) {
    throw new RequestPayloadError("JSON_OBJECT_REQUIRED");
  }

  return value;
}

export function requestPayloadErrorResponse(error: RequestPayloadError) {
  return NextResponse.json({ error: error.code }, { status: error.status });
}

export function getRequestIp(req: Request) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  const forwardedIp = forwardedFor?.split(",", 1)[0]?.trim();
  if (forwardedIp) return forwardedIp.slice(0, 128);

  const realIp = req.headers.get("x-real-ip")?.trim();
  return realIp ? realIp.slice(0, 128) : "unknown";
}
