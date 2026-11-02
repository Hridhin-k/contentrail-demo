/** Merge ContentRail static /admin into a Next.js config. */
export function withContentrail(nextConfig = {}) {
  const images =
    nextConfig.images !== null &&
    typeof nextConfig.images === "object" &&
    !Array.isArray(nextConfig.images)
      ? nextConfig.images
      : {};
  return {
    ...nextConfig,
    output: "export",
    trailingSlash: true,
    images: { ...images, unoptimized: true },
    async rewrites() {
      const admin = [
        { source: "/admin", destination: "/admin/index.html" },
        { source: "/admin/", destination: "/admin/index.html" },
      ];
      const existing = nextConfig.rewrites;
      if (existing === undefined) {
        return admin;
      }
      const extra =
        typeof existing === "function" ? await existing() : existing;
      if (Array.isArray(extra)) {
        return [...admin, ...extra];
      }
      if (extra !== null && typeof extra === "object") {
        return {
          ...extra,
          beforeFiles: [...admin, ...(extra.beforeFiles ?? [])],
        };
      }
      return admin;
    },
  };
}
