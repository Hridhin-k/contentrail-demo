/**
 * ContentRail Pages Functions API. Server-only.
 * Bind secrets in Pages / .dev.vars — never PUBLIC_* or VITE_*.
 */
import {
  createCloudflareAccessAuthenticator,
  createPagesSiteHandler,
  createSiteAuthorizer,
} from "@contentrail/cloudflare";
import {
  createGitHubGitDataClient,
  createGitPublishProvider,
  createPublisher,
} from "@contentrail/publisher";
import { articles } from "../../content/config";

interface Env {
  CONTENTRAIL_ACCESS_TEAM_DOMAIN: string;
  CONTENTRAIL_ACCESS_AUD: string;
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
  const handler = createPagesSiteHandler({
    siteId: env.CONTENTRAIL_SITE_ID,
    authenticator: createCloudflareAccessAuthenticator({
      teamDomain: env.CONTENTRAIL_ACCESS_TEAM_DOMAIN,
      audience: env.CONTENTRAIL_ACCESS_AUD,
    }),
    authorizer: createSiteAuthorizer({
      sites: {
        [env.CONTENTRAIL_SITE_ID]: {
          destinationRef: "git:allowlisted",
          permissions: ["read", "publish", "status", "rollback", "validate"],
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
