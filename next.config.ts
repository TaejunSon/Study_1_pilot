import type { NextConfig } from "next";

/**
 * Static export for GitHub Pages. There is no server at runtime: every page is pre-rendered HTML and all study
 * state lives in the browser (localStorage), so no API route, database or API key is involved.
 *
 * BASE PATH: a project site is served from https://<user>.github.io/<repo>/, so the app must be built with
 * `NEXT_PUBLIC_BASE_PATH=/<repo>`. The deploy workflow sets it from the repository name automatically; a local
 * `npm run build` leaves it empty, which is what `npm run serve` expects.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,            // /trial/1/ -> /trial/1/index.html, which is what Pages serves for a directory
  images: { unoptimized: true },  // the optimizer is a server feature
  reactStrictMode: true,
};

export default nextConfig;
