import { ROUTES, isSafeInternalCallbackPath } from "@/lib/routes";

type PostAuthMode = "login" | "signup";

const ADMIN_EMAILS = ["roger@esacademy.com", "admin@esacademy.com", "raugerac@gmail.com"];

type ResolvePostAuthTargetParams = {
    mode: PostAuthMode;
    callbackUrl?: string | null;
    email?: string | null;
};

export function resolvePostAuthTarget({
    mode,
    callbackUrl,
    email,
}: ResolvePostAuthTargetParams): string {
    if (callbackUrl && isSafeInternalCallbackPath(callbackUrl)) {
        return callbackUrl;
    }

    if (email && ADMIN_EMAILS.includes(email)) {
        return ROUTES.admin.dashboard;
    }

    return mode === "signup" ? ROUTES.app.profile : ROUTES.app.dashboard;
}

export function buildAuthEntryHref(basePath: string, callbackUrl?: string | null): string {
    if (!callbackUrl || !isSafeInternalCallbackPath(callbackUrl)) {
        return basePath;
    }

    const params = new URLSearchParams({ callbackUrl });
    return `${basePath}?${params.toString()}`;
}
