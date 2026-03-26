// scripts/generate-sdk/index.mjs
import { downloadSpecs } from "./download-specs.mjs";
import { parseSpecs } from "./parse-schemas.mjs";
import { generateTypes } from "./generate-types.mjs";
import { generateApiClient } from "./generate-api-client.mjs";
import { generateBarrelExports } from "./generate-barrel.mjs";

async function main() {
  console.log("=== ClickUp SDK Generator ===\n");

  // Step 1: Download specs
  console.log("1. Downloading OpenAPI specs...");
  const specs = await downloadSpecs();

  // Step 2: Parse & group
  console.log("\n2. Parsing schemas...");
  const groups = parseSpecs(specs);

  // Step 3: Generate types
  console.log("\n3. Generating types...");
  generateTypes(groups);

  // Step 4: Generate API client
  console.log("\n4. Generating API client...");
  generateApiClient(groups);

  // Step 5: Generate barrel exports
  console.log("\n5. Generating barrel exports...");
  generateBarrelExports(groups);

  console.log("\n=== Done! Output in generated/ ===");
}

main().catch((err) => {
  console.error("Generator failed:", err);
  process.exit(1);
});
