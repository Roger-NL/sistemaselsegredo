const ONE_DAY_IN_SECONDS = 60 * 60 * 24;

export const AUTH_SESSION_COOKIE_NAME = "es_auth_session";
export const AUTH_SESSION_MAX_AGE_SECONDS = ONE_DAY_IN_SECONDS * 7;

export function getAuthSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: AUTH_SESSION_MAX_AGE_SECONDS,
  };
}

