import {
  getRequestPrincipal,
  type RequestPrincipal,
  type RequestPrincipalOptions,
} from "@/lib/auth/principal";

export class RequestAuthError extends Error {
  status: number;

  constructor(message: string, status = 401) {
    super(message);
    this.name = "RequestAuthError";
    this.status = status;
  }
}

function getAuthErrorMessage(options: RequestPrincipalOptions) {
  if (options.allowBearer === false && options.allowSessionCookie !== false) {
    return "Valid server session required.";
  }

  return "Authentication required.";
}

export async function requireRequestPrincipal(
  req?: Request,
  options: RequestPrincipalOptions = {}
): Promise<RequestPrincipal> {
  const principal = await getRequestPrincipal(req, options);

  if (!principal) {
    throw new RequestAuthError(getAuthErrorMessage(options));
  }

  return principal;
}

export async function requireAuthenticatedUser(req: Request) {
  const principal = await requireRequestPrincipal(req, {
    allowBearer: true,
    allowSessionCookie: true,
    allowLegacyCookie: false,
  });

  return {
    uid: principal.uid,
    email: principal.email,
    role: principal.role,
    subscriptionStatus: principal.subscriptionStatus,
    source: principal.source,
  };
}

export type { RequestPrincipal, RequestPrincipalOptions } from "@/lib/auth/principal";
