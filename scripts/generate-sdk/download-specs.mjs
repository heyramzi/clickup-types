// scripts/generate-sdk/download-specs.mjs
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const SPEC_URLS = {
  v2: "https://developer.clickup.com/openapi/clickup-api-v2-reference.json",
  v3: "https://developer.clickup.com/openapi/ClickUp_PUBLIC_API_V3.yaml",
};

const CACHE_DIR = join(import.meta.dirname, "../../.claude/specs");

export async function downloadSpecs() {
  mkdirSync(CACHE_DIR, { recursive: true });

  const [v2Res, v3Res] = await Promise.all([fetch(SPEC_URLS.v2), fetch(SPEC_URLS.v3)]);

  if (!v2Res.ok) throw new Error(`Failed to download v2 spec: ${v2Res.status}`);
  if (!v3Res.ok) throw new Error(`Failed to download v3 spec: ${v3Res.status}`);

  const v2 = await v2Res.json();
  const v3 = await v3Res.json(); // Despite .yaml extension, ClickUp serves JSON

  writeFileSync(join(CACHE_DIR, "openapi-v2.json"), JSON.stringify(v2, null, 2));
  writeFileSync(join(CACHE_DIR, "openapi-v3.json"), JSON.stringify(v3, null, 2));

  console.log(`  Downloaded v2 spec (${Object.keys(v2.paths).length} paths)`);
  console.log(`  Downloaded v3 spec (${Object.keys(v3.paths).length} paths)`);

  return { v2, v3 };
}
