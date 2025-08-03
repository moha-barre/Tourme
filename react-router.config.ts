import type { Config } from "@react-router/dev/config";

export default {
  // Config options...
  // Server-side render by default, to enable SPA mode set this to `false`
  ssr: true,
  // Add server entry point for SSR
  serverEntryPoint: "./app/entry.server.tsx",
} satisfies Config;
