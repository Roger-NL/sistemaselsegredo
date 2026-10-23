import { NextResponse, type NextRequest } from "next/server";
import { isRetiredPage } from "@/lib/page-aliases";

/** Navigation compatibility only; authorization belongs to each preserved API. */
export function proxy(request: NextRequest) {
  if (isRetiredPage(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/", request.url), 307);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!api/|_next/).*)"] };
