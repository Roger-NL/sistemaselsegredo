import { ROUTES, isSafeInternalCallbackPath } from "@/lib/routes";

type PostAuthMode = "login" | "signup";

type ResolvePostAuthTargetParams = {
    mode: PostAuthMode;
    callbackUrl?: string | null;
    isAdmin?: boolean;
};

export function resolvePostAuthTarget({
    callbackUrl,
    isAdmin,
}: ResolvePostAuthTargetParams): string {
    if (callbackUrl && isSafeInternalCallbackPath(callbackUrl)) {
        return callbackUrl;
    }

    if (isAdmin) {
        return ROUTES.admin.dashboard;
    }

    return ROUTES.app.dashboard;
}

export function buildAuthEntryHref(basePath: string, callbackUrl?: string | null): string {
    if (!callbackUrl || !isSafeInternalCallbackPath(callbackUrl)) {
        return basePath;
    }

    const params = new URLSearchParams({ callbackUrl });
    return `${basePath}?${params.toString()}`;
}
