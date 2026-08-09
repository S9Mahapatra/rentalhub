/**
 * Where a user lands after signing in or registering.
 *
 * Rentals are the point of the app, so the default destination is checkout —
 * not the home page. A `callbackUrl` still wins when one is present (that is
 * the "log in to rent this item" path sending you back where you started),
 * but only if it is a same-origin path: a raw query param is attacker-supplied,
 * and `router.push('https://evil.example')` would happily leave the site.
 */
export const POST_AUTH_DESTINATION = '/checkout';

export function sanitizeCallbackUrl(callbackUrl: string | null | undefined) {
  if (!callbackUrl) return POST_AUTH_DESTINATION;

  // Must be a site-relative path. Reject absolute URLs ("https://…"),
  // protocol-relative ones ("//evil.example") and backslash variants that
  // some browsers normalise into a host.
  if (!callbackUrl.startsWith('/')) return POST_AUTH_DESTINATION;
  if (callbackUrl.startsWith('//') || callbackUrl.startsWith('/\\')) return POST_AUTH_DESTINATION;

  // Never bounce back into the auth pages — that is the redirect loop.
  if (callbackUrl.startsWith('/auth/')) return POST_AUTH_DESTINATION;

  return callbackUrl;
}
