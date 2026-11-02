/**
 * Rejects unauthenticated API calls early.
 * Static /admin HTML is NOT covered — configure Cloudflare Access on /admin*.
 */
export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  if (
    url.pathname.startsWith("/api/") &&
    url.pathname !== "/api/health" &&
    context.request.method !== "OPTIONS"
  ) {
    const access = context.request.headers.get("Cf-Access-Jwt-Assertion");
    const authorization = context.request.headers.get("Authorization");
    const hasBearer =
      authorization !== null && /^Bearer\s+\S+/i.test(authorization);
    if ((access === null || access.trim() === "") && !hasBearer) {
      return new Response(
        JSON.stringify({
          error: {
            code: "MISSING_CREDENTIAL",
            message: "Missing Access JWT credential.",
          },
        }),
        { status: 401, headers: { "content-type": "application/json" } },
      );
    }
  }
  return context.next();
};
