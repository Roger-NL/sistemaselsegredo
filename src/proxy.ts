import { NextResponse, type NextRequest } from "next/server";
import { isRetiredPage } from "@/lib/page-aliases";
import { firstDayPreviewCookie, firstDayPreviewPath, firstDayPrivateHeaders, hasFirstDayPreviewAccess, redeemFirstDayPreview } from "@/lib/first-day-preview";
import { localToolsAllowed } from "@/features/local-testing/environment";

function decodedPath(path: string) {
  try { return decodeURIComponent(path); } catch { return path; }
}

function isFirstDayMedia(path: string) {
  return path === "/first-day" || path.startsWith("/first-day/");
}

function privatePreviewResponse(response: NextResponse) {
  for (const [header, value] of Object.entries(firstDayPrivateHeaders)) response.headers.set(header, value);
  return response;
}

function previewNotFound() {
  return privatePreviewResponse(new NextResponse(null, { status: 404 }));
}

export function proxy(request: NextRequest) {
  const pathname = decodedPath(request.nextUrl.pathname);
  if (pathname === "/_next/image") {
    const source = request.nextUrl.searchParams.get("url");
    const image = source && URL.parse(source, request.url);
    if (image && isFirstDayMedia(decodedPath(image.pathname))) return previewNotFound();
    return NextResponse.next();
  }

  const previewPage = pathname === firstDayPreviewPath || pathname.startsWith(firstDayPreviewPath + "/");
  if (previewPage || isFirstDayMedia(pathname)) {
    if (localToolsAllowed(request.headers.get("host") ?? "")) return NextResponse.next();

    if (pathname === firstDayPreviewPath && request.method === "GET") {
      const key = request.nextUrl.searchParams.get("acesso");
      if (key !== null) {
        const value = redeemFirstDayPreview(key);
        if (!value) return previewNotFound();
        const response = NextResponse.redirect(new URL(firstDayPreviewPath, request.url), 303);
        response.cookies.set(firstDayPreviewCookie, value, {
          path: "/",
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          maxAge: 30 * 24 * 60 * 60,
        });
        return privatePreviewResponse(response);
      }
    }

    return hasFirstDayPreviewAccess(request.cookies.get(firstDayPreviewCookie)?.value)
      ? privatePreviewResponse(NextResponse.next())
      : previewNotFound();
  }

  if (isRetiredPage(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/", request.url), 307);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!api/|_next/).*)", "/_next/image"] };
