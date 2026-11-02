/**
 * ContentRail Pages Functions handler (shared by /api and /v1). Server-only.
 * Default auth: username/password. Cloudflare Access is optional.
 */
import {
  createCloudflareAccessAuthenticator,
  createPagesSiteHandler,
  createPasswordAuthenticator,
  createSiteAuthorizer,
} from "@contentrail/cloudflare";
import {
  createGitHubGitDataClient,
  createGitPublishProvider,
  createPublisher,
} from "@contentrail/publisher";
import { articles } from "../content/config";

interface Env {
  CONTENTRAIL_ADMIN_USERNAME?: string;
  CONTENTRAIL_ADMIN_PASSWORD?: string;
  CONTENTRAIL_SESSION_SECRET?: string;
  CONTENTRAIL_ACCESS_TEAM_DOMAIN?: string;
  CONTENTRAIL_ACCESS_AUD?: string;
  CONTENTRAIL_SITE_ID: string;
  CONTENTRAIL_GIT_OWNER: string;
  CONTENTRAIL_GIT_REPO: string;
  CONTENTRAIL_GIT_BRANCH: string;
  CONTENTRAIL_CONTENT_ROOT: string;
  CONTENTRAIL_ADMIN_ORIGIN: string;
  CONTENTRAIL_GITHUB_TOKEN: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const env = context.env;
  const passwordReady =
    Boolean(env.CONTENTRAIL_ADMIN_USERNAME?.trim()) &&
    Boolean(env.CONTENTRAIL_ADMIN_PASSWORD) &&
    Boolean(env.CONTENTRAIL_SESSION_SECRET?.trim());
  const accessReady =
    Boolean(env.CONTENTRAIL_ACCESS_TEAM_DOMAIN?.trim()) &&
    Boolean(env.CONTENTRAIL_ACCESS_AUD?.trim());
  const passwordAuth = passwordReady
    ? {
        username: env.CONTENTRAIL_ADMIN_USERNAME!.trim(),
        password: env.CONTENTRAIL_ADMIN_PASSWORD!,
        sessionSecret: env.CONTENTRAIL_SESSION_SECRET!.trim(),
      }
    : undefined;
  const authenticator = passwordReady
    ? createPasswordAuthenticator(passwordAuth!)
    : accessReady
      ? createCloudflareAccessAuthenticator({
          teamDomain: env.CONTENTRAIL_ACCESS_TEAM_DOMAIN!,
          audience: env.CONTENTRAIL_ACCESS_AUD!,
        })
      : {
          async authenticate() {
            return {
              ok: false as const,
              status: 401 as const,
              code: "KEY_UNAVAILABLE" as const,
              message:
                "Configure CONTENTRAIL_ADMIN_USERNAME/PASSWORD/SESSION_SECRET or Cloudflare Access.",
            };
          },
        };

  const allowedSubjects = passwordReady
    ? [`password:${env.CONTENTRAIL_ADMIN_USERNAME!.trim()}`]
    : undefined;

  const handler = createPagesSiteHandler({
    siteId: env.CONTENTRAIL_SITE_ID,
    authenticator,
    ...(passwordAuth !== undefined ? { passwordAuth } : {}),
    authorizer: createSiteAuthorizer({
      sites: {
        [env.CONTENTRAIL_SITE_ID]: {
          destinationRef: "git:allowlisted",
          permissions: ["read", "publish", "status", "rollback", "validate"],
          ...(allowedSubjects !== undefined ? { allowedSubjects } : {}),
        },
      },
    }),
    collections: { articles },
    corsAllowedOrigins: [env.CONTENTRAIL_ADMIN_ORIGIN],
    getPublisher: () =>
      createPublisher({
        provider: createGitPublishProvider({
          branch: env.CONTENTRAIL_GIT_BRANCH,
          contentRoot: env.CONTENTRAIL_CONTENT_ROOT,
          hasCredential: Boolean(env.CONTENTRAIL_GITHUB_TOKEN),
          client: createGitHubGitDataClient({
            token: env.CONTENTRAIL_GITHUB_TOKEN,
            owner: env.CONTENTRAIL_GIT_OWNER,
            repo: env.CONTENTRAIL_GIT_REPO,
            allowedPathPrefix: env.CONTENTRAIL_CONTENT_ROOT,
          }),
        }),
      }),
  });
  return handler(context.request);
};
