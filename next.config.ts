import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@libsql/client"],
  // The Coach page tells students to open 127.0.0.1 for mic access, which is a
  // different hostname than the `localhost` the dev server allows by default.
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
