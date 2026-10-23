import { ROUTES, isSafeInternalCallbackPath } from "@/lib/routes";

type PostAuthMode = "login" | "signup";

type ResolvePostAuthTargetParams = {
    mode: PostAuthMode;
    callbackUrl?: string | null;
    isAdmin?: boolean;
};

export function resolvePostAuthTarget({
    callbackUrl,
}: ResolvePostAuthTargetParams): string {
    if (callbackUrl && isSafeInternalCallbackPath(callbackUrl)) {
        return callbackUrl;
    }

    return ROUTES.home;
}

export function buildAuthEntryHref(basePath: string, callbackUrl?: string | null): string {
    if (!callbackUrl || !isSafeInternalCallbackPath(callbackUrl)) {
        return basePath;
    }

    const params = new URLSearchParams({ callbackUrl });
    return `${basePath}?${params.toString()}`;
}
