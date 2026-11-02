import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: path.join(rootDir, "admin"),
  base: "/admin/",
  build: {
    outDir: path.join(rootDir, "public", "admin"),
    emptyOutDir: true,
  },
});
