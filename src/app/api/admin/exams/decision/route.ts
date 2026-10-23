import { NextResponse } from "next/server";
import { RequestAuthError, requireAuthenticatedUser } from "@/server/auth/request-auth";
import { gradeExamServer } from "@/lib/exam/server-service";
import { RateLimitError, consumeRateLimit, rateLimitErrorResponse } from "@/server/http/rate-limit";
import {
  RequestPayloadError,
  assertOnlyKeys,
  readJsonObject,
  requestPayloadErrorResponse,
} from "@/server/http/request";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const principal = await requireAuthenticatedUser(req);
    if (principal.role !== "admin") {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    await consumeRateLimit({
      namespace: "admin-exam-decision",
      identifier: principal.uid,
      limit: 30,
      windowMs: 10 * 60 * 1_000,
    });

    const body = await readJsonObject(req, 8 * 1_024);
    assertOnlyKeys(body, ["examId", "decision", "feedback"]);

    if (
      typeof body.examId !== "string" ||
      body.examId.length < 1 ||
      body.examId.length > 160 ||
      (body.decision !== "approved" && body.decision !== "rejected") ||
      (body.feedback !== undefined && (typeof body.feedback !== "string" || body.feedback.length > 4_000))
    ) {
      return NextResponse.json({ error: "Invalid exam decision." }, { status: 400 });
    }

    const result = await gradeExamServer(body.examId, body.decision, body.feedback as string | undefined);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof RequestAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof RequestPayloadError) return requestPayloadErrorResponse(error);
    if (error instanceof RateLimitError) return rateLimitErrorResponse(error);

    const message = error instanceof Error ? error.message : "EXAM_DECISION_FAILED";
    const status = message === "EXAM_NOT_FOUND" ? 404 : message === "EXAM_ALREADY_DECIDED" ? 409 : 500;
    console.error("[api/admin/exams/decision] error", error);
    return NextResponse.json({ error: message }, { status });
  }
}
