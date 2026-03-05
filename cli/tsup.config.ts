import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["bin/clickup.ts"],
	format: ["cjs"],
	target: "node20",
	outDir: "dist/bin",
	clean: true,
	splitting: false,
	sourcemap: true,
	banner: {
		js: "#!/usr/bin/env node",
	},
	// Bundle everything including parent repo modules
	noExternal: [/.*/],
});
