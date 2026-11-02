import {
  createAdminSiteConfig,
  mountAdmin,
} from "@contentrail/editor";
import { articles } from "../content/config";

const target = document.getElementById("contentrail-admin");
if (target === null) {
  throw new Error("Missing #contentrail-admin");
}

mountAdmin({
  target,
  apiBaseUrl: window.location.origin,
  sites: [
    createAdminSiteConfig({
      siteId: "site",
      label: "Site",
      collections: [{ collection: articles }],
    }),
  ],
});
