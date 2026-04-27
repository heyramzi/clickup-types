import { build } from "esbuild";
import { chmod, rm } from "node:fs/promises";

await rm("dist", { recursive: true, force: true });

await build({
  entryPoints: ["bin/clickup.ts"],
  outfile: "dist/clickup.js",
  bundle: true,
  platform: "node",
  target: "node20",
  format: "cjs",
  banner: { js: "#!/usr/bin/env node" },
  sourcemap: true,
  logLevel: "info",
});

await chmod("dist/clickup.js", 0o755);
