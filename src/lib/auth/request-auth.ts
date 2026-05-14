import { adminAuth } from "@/lib/firebase-admin";

export class RequestAuthError extends Error {
  status: number;

  constructor(message: string, status = 401) {
    super(message);
    this.name = "RequestAuthError";
    this.status = status;
  }
}

function extractBearerToken(req: Request) {
  const authorization = req.headers.get("authorization");
  if (!authorization) {
    return null;
  }

  const [scheme, token] = authorization.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token.trim();
}

export async function requireAuthenticatedUser(req: Request) {
  const token = extractBearerToken(req);

  if (!token) {
    throw new RequestAuthError("Authentication required.");
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return {
      uid: decodedToken.uid,
      email: decodedToken.email || null,
    };
  } catch {
    throw new RequestAuthError("Invalid authentication token.");
  }
}
