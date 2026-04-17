# clickup-utils Tech Log

Changelog-style trail of changes, decisions, and discoveries. Most recent first.

---

## 2026-04-17

- Pulled updated ClickUp v3 OpenAPI spec. Docs/pages surface unchanged (same 5 endpoints since March 19). Found 3 gaps vs hand-written types: avatar object missing `color` and `source` fields; `TaskDocRelationship` type entirely absent; search result vs full-doc response types conflated.
- Added `ClickUpPageAvatar` interface (`color`, `value`, `source`) replacing the inline `{ value: string }` on `ClickUpPage.avatar`.
- Added `ClickUpTaskDocRelationship` and `ClickUpTaskDocRelationshipsResponse`. Relationship type union: `"embed" | "mentionedBy" | "mentioning" | "linked" | "attached"`. Endpoint path not yet in the spec (schema-only, likely unreleased).
- Fixed broken `@heyramzi/cli` symlink in `cli/package.json`. Previous path (`file:../../vibe-kit/modules/cli`) pointed to a directory that does not exist. Correct path is `file:../../vibe-kit/CLIs/climaker`. The symlink in `node_modules` was dead, making imports non-functional.
- Remote had already attempted a fix (commit `e86a62f`) but used wrong name `cli-maker` (hyphen) and wrong depth (`../../../../` from the `cli/` subfolder). Resolved merge conflict keeping the correct path.
- Migrated `config.ts` to use `getEnvVarOptional` from `@heyramzi/cli` (climaker) instead of raw `process.env` reads for `CU_API_TOKEN` and `CU_TEAM_ID`. Consistent with the AXI-style CLI SDK pattern.
- Committed pre-existing `client.ts` fix (`isAccessError`) that was staged but never committed: ClickUp returns 404 with `ECODE ACCESS_999` for permission-denied responses, not 401/403. The fallback now checks both status and message.
- Bumped CLI version to `0.2.0`.
- Updated clickup-utils submodule pointer to `4df0b2d` in all 4 consuming projects: `clickup-to-blog` (staging), `client-glance` (staging), `save-to-clickup` (2.5.0), `upsys` (dev).
- Added `AGENTS.md`, `GEMINI.md`, `TECHLOG.md` to repo root. Converted `CLAUDE.md` to a symlink pointing to `AGENTS.md`. Added `.claude/skills/` tree (21 skill files bridged from vibe-kit).

---

## 2026-04-13 to 2026-04-14

- Built full ClickUp CLI (`cli/`) using the `@heyramzi/cli` AXI-style SDK. Consolidated into a single `createCLI` entry in `cli/src/index.ts`.
- Commands: `init`, `status`, `workspaces`, `spaces`, `folders`, `lists`, `hierarchy`, `tasks`, `task get`, `task create`, `task update`, `members`, `comments list`, `comments add`, `time`, `tags`, `open`, `docs list`, `docs pages`, `docs get`, `docs update`, `docs create`, `docs scan`.
- Multi-token auth with priority-ordered fallback via `requestWithFallback`. Config stored at `~/.config/clickup/config.json`. Supports `CU_API_TOKEN` / `CU_TEAM_ID` env overrides.
- `docs scan`: workspace-wide sweep for call pages (date-suffixed page titles matching `MM/DD/YYYY`). Handles type 3 docs (SyncUp/meeting notes) where the doc itself is the call record. Runs in parallel batches of 5.
- Fixed `isAccessError` to trigger token fallback on ClickUp 404 with `ECODE ACCESS_999`. ClickUp returns 404, not 401/403, for permission-denied doc requests.
- Migrated CLI from `commander` to `@heyramzi/cli` SDK.

---

## 2026-03 to 2026-04-12

- Added OpenAPI SDK generator (`scripts/generate-sdk/`). Pipeline: download v2+v3 specs, parse `$ref`s, emit `generated/types/` and `generated/api/`. Generator handles circular refs, dynamic maps, multipart uploads, and unified response types across status codes. `generated/` is gitignored.
- Refactored token storage: split into `sveltekit/token.service.supabase.ts` and `sveltekit/token.service.convex.ts`. Convex now the default.
- Enhanced v3 Chat and Docs types: reactions, threaded replies, page cover, presentation details, page listing vs full pages distinction.
- Added `ClickUpEditPageRequest` with `content_edit_mode: "replace" | "append" | "prepend"`.
- Added colocated READMEs and JSDoc comments across `core/`, `api/`, `transformers/`, `sveltekit/`.
- Cleaned up `.claude/` context files: `product.md`, `tech.md`, `structure.md`, `tracker.md`, `changelog.md`.

---

## Early history (pre-2026-03)

- Renamed project from `clickup-types` to `clickup-utils`. Added framework-specific integrations under `sveltekit/` and `nextjs/`.
- Introduced layered architecture: types → core (OAuth) → api (fetch) → transformers → framework integrations.
- Added `StoredWorkspace`, `StoredList` and other simplified storage-format types alongside raw API response types.
- Hand-wrote all ClickUp v2 hierarchy types (`ClickUpWorkspace`, `ClickUpSpace`, `ClickUpFolder`, `ClickUpList`, `ClickUpTask`, etc.) from API responses rather than generated sources.
- Added `ClickUpCustomFieldType` enum and typed field variant interfaces.
- Added time tracking types (`TimeEntry`, `CreateTimeEntryParams`).
- Added comment types (`ClickUpTaskComment`, `CreateCommentBody`).
- Added `CLICKUP_PATH` builder for dynamic endpoint construction, replacing the `Endpoint` enum.
- OAuth: `ClickUpOAuthConfig`, `ClickUpTokenResponse`. Removed `clientSecret` from config; added `TokenStorageRequest`/`TokenStorageResponse` interfaces.
- Multiple rounds of type cleanup: removed `.d.ts` in favor of `.ts`, standardized naming with `ClickUp` prefix, removed deprecated stored types, aligned with actual API responses.
