import { NextResponse } from "next/server";
import { RequestAuthError, requireAuthenticatedUser } from "@/server/auth/request-auth";
import { submitExamServer } from "@/lib/exam/server-service";
import { RateLimitError, consumeRateLimit, rateLimitErrorResponse } from "@/server/http/rate-limit";
import {
  RequestPayloadError,
  assertOnlyKeys,
  readJsonObject,
  requestPayloadErrorResponse,
} from "@/server/http/request";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_EXAM_BODY_BYTES = 32 * 1_024;

export async function POST(req: Request) {
  try {
    const principal = await requireAuthenticatedUser(req);
    await consumeRateLimit({
      namespace: "exam-submission",
      identifier: principal.uid,
      limit: 6,
      windowMs: 10 * 60 * 1_000,
    });
    const body = await readJsonObject(req, MAX_EXAM_BODY_BYTES);
    assertOnlyKeys(body, ["pillarId", "quizAnswers", "writtenAnswer", "userPhone"]);

    if (
      !Number.isInteger(body.pillarId) ||
      !Array.isArray(body.quizAnswers) ||
      body.quizAnswers.length > 100 ||
      body.quizAnswers.some((answer) => !Number.isInteger(answer)) ||
      typeof body.writtenAnswer !== "string" ||
      (body.userPhone !== undefined && (typeof body.userPhone !== "string" || body.userPhone.length > 40))
    ) {
      throw new RequestPayloadError("INVALID_EXAM_PAYLOAD");
    }

    const result = await submitExamServer({
      userId: principal.uid,
      userEmail: principal.email,
      pillarId: body.pillarId as number,
      quizAnswers: body.quizAnswers as number[],
      writtenAnswer: body.writtenAnswer,
      userPhone: body.userPhone as string | undefined,
      isAdmin: principal.role === "admin",
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof RequestAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof RequestPayloadError) return requestPayloadErrorResponse(error);
    if (error instanceof RateLimitError) return rateLimitErrorResponse(error);

    const message = error instanceof Error ? error.message : "EXAM_SUBMISSION_FAILED";
    const status = message.startsWith("INVALID_")
      ? 400
      : message === "USER_NOT_FOUND"
        ? 404
        : message.startsWith("EXAM_")
          ? 403
          : 500;
    console.error("[api/exams] submission error", error);
    return NextResponse.json({ error: message }, { status });
  }
}
