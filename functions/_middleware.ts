/**
 * Early reject for /api and /v1 without session cookie, Bearer, or Access JWT.
 * /api/login and /api/health stay public.
 */
export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const isApi = url.pathname.startsWith("/api/");
  const isV1 = url.pathname.startsWith("/v1/");
  if (
    (isApi || isV1) &&
    url.pathname !== "/api/health" &&
    url.pathname !== "/api/login" &&
    context.request.method !== "OPTIONS"
  ) {
    const access = context.request.headers.get("Cf-Access-Jwt-Assertion");
    const authorization = context.request.headers.get("Authorization");
    const cookie = context.request.headers.get("Cookie") ?? "";
    const hasBearer =
      authorization !== null && /^Bearer\s+\S+/i.test(authorization);
    const hasSession = /(?:^|;\s*)contentrail_session=/.test(cookie);
    if (
      (access === null || access.trim() === "") &&
      !hasBearer &&
      !hasSession
    ) {
      return new Response(
        JSON.stringify({
          error: {
            code: "MISSING_CREDENTIAL",
            message: "Missing admin session. Sign in at /admin.",
          },
        }),
        { status: 401, headers: { "content-type": "application/json" } },
      );
    }
  }
  return context.next();
};
