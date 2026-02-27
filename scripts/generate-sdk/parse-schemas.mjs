// scripts/generate-sdk/parse-schemas.mjs
import { join } from "node:path";

/**
 * Resolves a JSON pointer ($ref) within a spec document.
 * Handles both:
 * - V2 internal refs: #/paths/~1v2~1task~1{task_id}/get/responses/200/...
 * - V3 component refs: #/components/schemas/SomeName
 */
function resolveRef(spec, ref) {
	if (typeof ref !== "string" || !ref.startsWith("#/")) return undefined;

	const parts = ref
		.slice(2)
		.split("/")
		.map((p) => p.replace(/~1/g, "/").replace(/~0/g, "~"));

	let current = spec;
	for (const part of parts) {
		if (current === undefined || current === null) return undefined;
		current = current[decodeURIComponent(part)] ?? current[part];
	}
	return current;
}

/**
 * Deep-resolves all $ref within a schema, inlining referenced schemas.
 * Tracks seen refs to avoid infinite recursion.
 * @param {string} parentKey - The key under which this schema appears in its parent object.
 *   Used to detect when a $ref to an array's /items is used as a property value
 *   (not as an array's own items), indicating the spec should have referenced
 *   the full array instead of just its item schema.
 */
function deepResolveRefs(spec, schema, seen = new Set(), parentKey = "") {
	if (schema === null || schema === undefined || typeof schema !== "object") {
		return schema;
	}

	if (schema.$ref) {
		if (seen.has(schema.$ref)) {
			// Circular reference - return a marker
			return { type: "object", description: `[Circular: ${schema.$ref}]` };
		}
		seen.add(schema.$ref);
		const resolved = resolveRef(spec, schema.$ref);
		if (resolved) {
			const resolvedSchema = deepResolveRefs(spec, structuredClone(resolved), seen);

			// Fix broken $refs that point to an array's /items instead of the array itself.
			// Only apply when the $ref is NOT used as the "items" of an array schema
			// (parentKey !== "items"), meaning the spec author intended to reference the
			// full array but accidentally pointed to its item sub-schema.
			if (schema.$ref.endsWith("/items") && parentKey !== "items") {
				const parentRef = schema.$ref.slice(0, schema.$ref.lastIndexOf("/items"));
				const parent = resolveRef(spec, parentRef);
				if (parent && parent.type === "array") {
					return { type: "array", items: resolvedSchema };
				}
			}

			return resolvedSchema;
		}
		return { type: "unknown", description: `[Unresolved: ${schema.$ref}]` };
	}

	const result = Array.isArray(schema) ? [] : {};
	for (const [key, value] of Object.entries(schema)) {
		if (key === "$ref") continue;
		result[key] = deepResolveRefs(spec, value, new Set(seen), key);
	}
	return result;
}

/**
 * Convert tag name to kebab-case file name.
 * "Time Tracking" -> "time-tracking"
 * "Custom Fields" -> "custom-fields"
 */
function toKebabCase(str) {
	return str
		.replace(/[()]/g, "")
		.replace(/\s+/g, "-")
		.replace(/[^a-zA-Z0-9-]/g, "")
		.toLowerCase()
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
}

/**
 * Sanitize operationId to valid identifier.
 * Removes apostrophes, special chars, normalizes whitespace.
 * "GetTask'sTimeinStatus" -> "GetTasksTimeInStatus"
 * "GetBulkTasks'TimeinStatus" -> "GetBulkTasksTimeInStatus"
 */
function sanitizeOperationId(str) {
	return str
		.replace(/'/g, "") // Remove apostrophes
		.replace(/[^a-zA-Z0-9]/g, " ") // Replace special chars with space
		.replace(/\s+/g, " ") // Normalize spaces
		.trim()
		.split(" ")
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join("");
}

/**
 * Convert operationId to PascalCase.
 * "getTasks" -> "GetTasks"
 * "CreateTaskAttachment" -> "CreateTaskAttachment"
 */
function toPascalCase(str) {
	const sanitized = sanitizeOperationId(str);
	return sanitized.replace(/(^|[_-])(\w)/g, (_, _sep, c) => c.toUpperCase()).replace(/^(\w)/, (c) => c.toUpperCase());
}

/**
 * Extract the base path prefix to determine API version.
 */
function getApiVersion(path) {
	if (path.startsWith("/api/v3") || path.startsWith("/v3")) return "v3";
	return "v2";
}

/**
 * Parse a single OpenAPI operation into our normalized format.
 */
function parseOperation(spec, method, path, op, apiVersion) {
	const rawOperationId = op.operationId || `${method}${path.replace(/[^a-zA-Z0-9]/g, "")}`;
	const operationId = sanitizeOperationId(rawOperationId);

	// Parameters
	const parameters = (op.parameters || []).map((param) => {
		const resolved = param.$ref ? resolveRef(spec, param.$ref) : param;
		return {
			name: resolved.name,
			in: resolved.in,
			required: resolved.required || false,
			description: resolved.description || "",
			schema: resolved.schema
				? deepResolveRefs(spec, structuredClone(resolved.schema))
				: { type: "string" },
		};
	});

	// Request body
	let requestBody = null;
	if (op.requestBody) {
		const contentType = Object.keys(op.requestBody.content || {})[0];
		if (contentType) {
			const bodySchema = op.requestBody.content[contentType].schema;
			requestBody = {
				contentType,
				required: op.requestBody.required || false,
				schema: bodySchema ? deepResolveRefs(spec, structuredClone(bodySchema)) : null,
			};
		}
	}

	// Responses - focus on success responses (2xx)
	const responses = {};
	for (const [code, resp] of Object.entries(op.responses || {})) {
		if (code === "default" || Number(code) >= 400) continue;
		const contentType = Object.keys(resp.content || {})[0];
		if (contentType) {
			const respSchema = resp.content[contentType].schema;
			responses[code] = {
				description: resp.description || "",
				schema: respSchema ? deepResolveRefs(spec, structuredClone(respSchema)) : null,
			};
		} else {
			responses[code] = {
				description: resp.description || "",
				schema: null,
			};
		}
	}

	return {
		operationId,
		operationIdPascal: toPascalCase(operationId),
		method,
		path,
		apiVersion,
		summary: op.summary || "",
		description: op.description || "",
		parameters,
		requestBody,
		responses,
	};
}

/**
 * Map variant/alternate tag names to their canonical form.
 * Prevents tiny groups from being created for tags that are
 * essentially the same domain (e.g. "Chat (Experimental)" → "Chat").
 */
const TAG_ALIASES = {
	"Chat (Experimental)": "Chat",
	Acls: "Privacy and access",
};

/**
 * Normalize a raw tag from the OpenAPI spec to its canonical form.
 */
function normalizeTag(rawTag) {
	return TAG_ALIASES[rawTag] ?? rawTag;
}

/**
 * Parse both v2 and v3 specs into grouped, normalized structure.
 */
export function parseSpecs({ v2, v3 }) {
	const groups = {};

	function addToGroup(tag, endpoint) {
		const fileName = toKebabCase(tag);
		if (!groups[fileName]) {
			groups[fileName] = {
				tag,
				fileName,
				endpoints: [],
			};
		}
		groups[fileName].endpoints.push(endpoint);
	}

	// Parse v2 spec
	for (const [pathKey, pathItem] of Object.entries(v2.paths)) {
		for (const [method, op] of Object.entries(pathItem)) {
			if (method === "parameters" || method === "summary" || method === "description") continue;

			const tag = normalizeTag(op.tags?.[0] || "Other");
			const endpoint = parseOperation(v2, method, pathKey, op, "v2");
			addToGroup(tag, endpoint);
		}
	}

	// Parse v3 spec
	for (const [pathKey, pathItem] of Object.entries(v3.paths)) {
		for (const [method, op] of Object.entries(pathItem)) {
			if (method === "parameters" || method === "summary" || method === "description") continue;

			const tag = normalizeTag(op.tags?.[0] || "Other");
			const endpoint = parseOperation(v3, method, pathKey, op, "v3");
			addToGroup(tag, endpoint);
		}
	}

	// Sort endpoints within each group
	for (const group of Object.values(groups)) {
		group.endpoints.sort((a, b) => a.operationId.localeCompare(b.operationId));
	}

	const tagCount = Object.keys(groups).length;
	const endpointCount = Object.values(groups).reduce((sum, g) => sum + g.endpoints.length, 0);
	console.log(`  Parsed ${endpointCount} endpoints into ${tagCount} groups`);
	for (const [fileName, group] of Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))) {
		const v2Count = group.endpoints.filter((e) => e.apiVersion === "v2").length;
		const v3Count = group.endpoints.filter((e) => e.apiVersion === "v3").length;
		const versions = [v2Count && `v2:${v2Count}`, v3Count && `v3:${v3Count}`].filter(Boolean).join(", ");
		console.log(`    ${fileName} (${group.tag}): ${group.endpoints.length} endpoints [${versions}]`);
	}

	return groups;
}
