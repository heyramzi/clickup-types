// scripts/generate-sdk/generate-api-client.mjs
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const OUTPUT_DIR = join(import.meta.dirname, "../../generated/api");

/**
 * Convert operationId to camelCase function name.
 * "GetTasks" -> "getTasks"
 * "CreateTaskAttachment" -> "createTaskAttachment"
 */
function toCamelCase(str) {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

/**
 * Determine the HTTP method for the request helper.
 */
function httpMethod(method) {
  return method.toUpperCase();
}

/**
 * Determine if an endpoint uses multipart/form-data (file uploads).
 */
function isMultipart(endpoint) {
  return endpoint.requestBody?.contentType === "multipart/form-data";
}

/**
 * Build the path expression with template literals for path params.
 * "/v2/task/{task_id}/comment" -> `/task/${taskId}/comment`
 * "/api/v3/workspaces/{workspace_id}/chat" -> `/workspaces/${workspaceId}/chat`
 *
 * Returns { pathExpr, pathPrefix } where pathPrefix is "v2" or "v3"
 */
function buildPathExpr(path) {
  let cleanPath = path;
  let pathPrefix = "v2";

  if (path.startsWith("/api/v3")) {
    cleanPath = path.slice(7); // Remove "/api/v3"
    pathPrefix = "v3";
  } else if (path.startsWith("/v3")) {
    cleanPath = path.slice(3); // Remove "/v3"
    pathPrefix = "v3";
  } else if (path.startsWith("/v2")) {
    cleanPath = path.slice(3); // Remove "/v2"
  }

  // Replace {param_name} with ${paramName}
  const expr = cleanPath.replace(/\{([^}]+)\}/g, (_, param) => {
    const camel = param.replace(/_([a-zA-Z])/g, (__, c) => c.toUpperCase());
    return "${" + camel + "}";
  });

  return { pathExpr: "`" + expr + "`", pathPrefix };
}

/**
 * Convert a path parameter name to camelCase.
 * "task_id" -> "taskId"
 * "team_Id" -> "teamId"
 */
function paramToCamel(name) {
  return name.replace(/_([a-zA-Z])/g, (_, c) => c.toUpperCase());
}

/**
 * Generate a single API function for an endpoint.
 */
function generateFunction(endpoint) {
  const funcName = toCamelCase(endpoint.operationId);
  const baseName = endpoint.operationIdPascal;
  const method = httpMethod(endpoint.method);

  const pathParams = endpoint.parameters.filter((p) => p.in === "path");
  const queryParams = endpoint.parameters.filter((p) => p.in === "query");
  const hasBody = endpoint.requestBody?.schema != null;
  const hasQuery = queryParams.length > 0;
  const multipart = isMultipart(endpoint);

  // Build function parameters
  const params = ["token: string"];
  for (const p of pathParams) {
    params.push(`${paramToCamel(p.name)}: string`);
  }
  if (hasBody) {
    const bodyRequired = endpoint.requestBody.required;
    params.push(`data${bodyRequired ? "" : "?"}: ${baseName}Request`);
  }
  if (hasQuery) {
    params.push(`params?: ${baseName}Params`);
  }

  // Determine return type — always use unified {OperationId}Response
  const hasResponseSchema = Object.entries(endpoint.responses).some(
    ([c, resp]) => Number(c) >= 200 && Number(c) < 300 && resp?.schema,
  );
  const returnType = hasResponseSchema ? `${baseName}Response` : "void";

  // Build path expression
  const { pathExpr, pathPrefix } = buildPathExpr(endpoint.path);
  const baseVar = pathPrefix === "v3" ? "API_V3_BASE" : "API_V2_BASE";

  // Build function body
  const lines = [];

  // JSDoc
  if (endpoint.summary || endpoint.description) {
    lines.push("/**");
    if (endpoint.summary) lines.push(` * ${endpoint.summary}`);
    if (endpoint.description && endpoint.description !== endpoint.summary) {
      if (endpoint.summary) lines.push(" *");
      // Truncate long descriptions
      const desc =
        endpoint.description.length > 200
          ? endpoint.description.slice(0, 200) + "..."
          : endpoint.description;
      lines.push(` * ${desc}`);
    }
    lines.push(` * @api ${endpoint.apiVersion} ${method} ${endpoint.path}`);
    lines.push(" */");
  }

  lines.push(`export async function ${funcName}(${params.join(", ")}): Promise<${returnType}> {`);

  // Build options
  const optParts = [];
  if (method !== "GET") {
    optParts.push(`method: "${method}"`);
  }
  if (hasBody && !multipart) {
    optParts.push("body: data");
  }
  if (hasQuery) {
    optParts.push("params");
  }

  if (multipart) {
    // File upload endpoint
    lines.push(`\treturn requestMultipart<${returnType}>(${baseVar}, ${pathExpr}, token, data);`);
  } else if (optParts.length > 0) {
    lines.push(
      `\treturn request<${returnType}>(${baseVar}, ${pathExpr}, token, { ${optParts.join(", ")} });`,
    );
  } else {
    lines.push(`\treturn request<${returnType}>(${baseVar}, ${pathExpr}, token);`);
  }

  lines.push("}");

  return lines.join("\n");
}

/**
 * Collect all type names that need importing for a group.
 */
function collectImports(group) {
  const imports = new Set();

  for (const endpoint of group.endpoints) {
    const baseName = endpoint.operationIdPascal;
    const queryParams = endpoint.parameters.filter((p) => p.in === "query");
    const hasBody = endpoint.requestBody?.schema != null;

    if (queryParams.length > 0) imports.add(`${baseName}Params`);
    if (hasBody) imports.add(`${baseName}Request`);

    // Add unified Response type if any success code has a schema
    const hasResponseSchema = Object.entries(endpoint.responses).some(
      ([c, resp]) => Number(c) >= 200 && Number(c) < 300 && resp?.schema,
    );
    if (hasResponseSchema) {
      imports.add(`${baseName}Response`);
    }
  }

  return [...imports].sort();
}

/**
 * Generate the shared _request.ts helper file.
 */
function generateRequestHelper() {
  const lines = [];

  lines.push("// Auto-generated by ClickUp SDK Generator");
  lines.push("// Shared request helpers");
  lines.push("// Do not edit manually\n");

  // request() helper — with Fix #6 (Content-Type only when body) and Fix #2 (array params)
  lines.push(`export async function request<T>(`);
  lines.push(`\tbaseUrl: string,`);
  lines.push(`\tendpoint: string,`);
  lines.push(`\ttoken: string,`);
  lines.push(`\toptions?: { method?: string; body?: unknown; params?: Record<string, unknown> },`);
  lines.push(`): Promise<T> {`);
  lines.push(`\tconst url = new URL(\`\${baseUrl}\${endpoint}\`);`);
  lines.push(`\tif (options?.params) {`);
  lines.push(`\t\tfor (const [key, value] of Object.entries(options.params)) {`);
  lines.push(`\t\t\tif (value === undefined) continue;`);
  lines.push(`\t\t\tif (Array.isArray(value)) {`);
  lines.push(`\t\t\t\tfor (const item of value) {`);
  lines.push(`\t\t\t\t\turl.searchParams.append(key, String(item));`);
  lines.push(`\t\t\t\t}`);
  lines.push(`\t\t\t} else {`);
  lines.push(`\t\t\t\turl.searchParams.set(key, String(value));`);
  lines.push(`\t\t\t}`);
  lines.push(`\t\t}`);
  lines.push(`\t}`);
  lines.push(`\tconst headers: Record<string, string> = {`);
  lines.push(`\t\tAuthorization: token.startsWith("Bearer ") ? token : \`Bearer \${token}\`,`);
  lines.push(`\t};`);
  lines.push(`\tif (options?.body) {`);
  lines.push(`\t\theaders["Content-Type"] = "application/json";`);
  lines.push(`\t}`);
  lines.push(`\tconst response = await fetch(url.toString(), {`);
  lines.push(`\t\tmethod: options?.method ?? "GET",`);
  lines.push(`\t\theaders,`);
  lines.push(`\t\t...(options?.body ? { body: JSON.stringify(options.body) } : {}),`);
  lines.push(`\t});`);
  lines.push(`\tif (!response.ok) {`);
  lines.push(`\t\tconst errorText = await response.text();`);
  lines.push(`\t\tthrow new Error(\`ClickUp API error (\${response.status}): \${errorText}\`);`);
  lines.push(`\t}`);
  lines.push(`\treturn response.json();`);
  lines.push(`}\n`);

  // requestMultipart() helper
  lines.push(`export async function requestMultipart<T>(`);
  lines.push(`\tbaseUrl: string,`);
  lines.push(`\tendpoint: string,`);
  lines.push(`\ttoken: string,`);
  lines.push(`\tdata?: Record<string, unknown>,`);
  lines.push(`): Promise<T> {`);
  lines.push(`\tconst url = new URL(\`\${baseUrl}\${endpoint}\`);`);
  lines.push(`\tconst formData = new FormData();`);
  lines.push(`\tif (data) {`);
  lines.push(`\t\tfor (const [key, value] of Object.entries(data)) {`);
  lines.push(`\t\t\tif (value instanceof Blob) {`);
  lines.push(`\t\t\t\tformData.append(key, value);`);
  lines.push(`\t\t\t} else if (value !== undefined) {`);
  lines.push(`\t\t\t\tformData.append(key, String(value));`);
  lines.push(`\t\t\t}`);
  lines.push(`\t\t}`);
  lines.push(`\t}`);
  lines.push(`\tconst response = await fetch(url.toString(), {`);
  lines.push(`\t\tmethod: "POST",`);
  lines.push(`\t\theaders: {`);
  lines.push(`\t\t\tAuthorization: token.startsWith("Bearer ") ? token : \`Bearer \${token}\`,`);
  lines.push(`\t\t},`);
  lines.push(`\t\tbody: formData,`);
  lines.push(`\t});`);
  lines.push(`\tif (!response.ok) {`);
  lines.push(`\t\tconst errorText = await response.text();`);
  lines.push(`\t\tthrow new Error(\`ClickUp API error (\${response.status}): \${errorText}\`);`);
  lines.push(`\t}`);
  lines.push(`\treturn response.json();`);
  lines.push(`}`);

  return lines.join("\n");
}

/**
 * Generate an API client file for a group.
 */
function generateGroupClient(group) {
  const lines = [];
  const imports = collectImports(group);
  const needsV2 = group.endpoints.some((e) => e.apiVersion === "v2");
  const needsV3 = group.endpoints.some((e) => e.apiVersion === "v3");
  const hasMultipart = group.endpoints.some(isMultipart);

  lines.push("// Auto-generated by ClickUp SDK Generator");
  lines.push(`// Group: ${group.tag}`);
  lines.push("// Do not edit manually\n");

  // Import shared request helpers
  const requestImports = ["request"];
  if (hasMultipart) requestImports.push("requestMultipart");
  lines.push(`import { ${requestImports.join(", ")} } from "./_request";\n`);

  // Type imports
  if (imports.length > 0) {
    lines.push(`import type {`);
    for (const imp of imports) {
      lines.push(`\t${imp},`);
    }
    lines.push(`} from "../types/${group.fileName}";\n`);
  }

  // Base URLs
  if (needsV2) lines.push(`const API_V2_BASE = "https://api.clickup.com/api/v2";`);
  if (needsV3) lines.push(`const API_V3_BASE = "https://api.clickup.com/api/v3";`);
  lines.push("");

  // Generate functions
  for (const endpoint of group.endpoints) {
    lines.push(generateFunction(endpoint));
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Generate API client files for all groups.
 */
export function generateApiClient(groups) {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  // Generate shared request helper
  const requestContent = generateRequestHelper();
  writeFileSync(join(OUTPUT_DIR, "_request.ts"), requestContent);

  let totalFunctions = 0;
  for (const [fileName, group] of Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))) {
    const content = generateGroupClient(group);
    const filePath = join(OUTPUT_DIR, `${fileName}.api.ts`);
    writeFileSync(filePath, content);

    totalFunctions += group.endpoints.length;
  }

  console.log(
    `  Generated ${totalFunctions} API functions across ${Object.keys(groups).length} files + _request.ts`,
  );
}
