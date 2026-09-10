import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "./constants";

export { SESSION_COOKIE_NAME };

interface DecodedAuthToken {
  sub: string;
  email: string;
  exp: number;
}

/**
 * Decodes (without verifying) the `sub`/`email`/`exp` claims from the JWT so
 * proxy routes can build `/users/:id`-shaped URLs. This is safe because it's
 * only used for routing convenience - bun/api independently verifies the
 * token's signature on every forwarded request and is the real authority;
 * an invalid/expired token simply gets a 401 back from bun/api, same as if
 * we'd decoded nothing at all.
 */
function decodeToken(token: string): DecodedAuthToken | null {
  try {
    const payloadSegment = token.split(".")[1];
    if (!payloadSegment) return null;
    const json = Buffer.from(payloadSegment, "base64url").toString("utf-8");
    return JSON.parse(json) as DecodedAuthToken;
  } catch {
    return null;
  }
}

/** Reads the raw session JWT from the httpOnly cookie, or null if absent. */
export async function getSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE_NAME)?.value ?? null;
}

/** Reads the session token and decodes it, or null if absent/malformed. */
export async function getSession(): Promise<DecodedAuthToken | null> {
  const token = await getSessionToken();
  if (!token) return null;
  return decodeToken(token);
}
