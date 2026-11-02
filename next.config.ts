import { withContentrail } from "./contentrail.next.mjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
};

export default withContentrail(nextConfig);
