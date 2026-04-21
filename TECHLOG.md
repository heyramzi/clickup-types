# clickup-utils Tech Log

Changelog-style trail of changes, decisions, and discoveries. Most recent first.

---

## 2026-04-21

- Shipped CLI v0.7.0. Dropped `@heyramzi/cli` as a dependency and inlined its 10 scaffold files into `cli/src/scaffold/`. clickup-utils is now self-contained, which matters because this repo is consumed as a submodule across six projects and a `file:../../vibe-kit/CLIs/climaker` link in `package-lock.json` only resolves on the author's machine.
- Fixed `resolveCommand` in the scaffolded router. Previous code was `Math.min(2, tokens.length)`, capping matching at 2-token command names. Every 3-token command (`task field set`, `view create`, `fields list`, `folder create/update/delete`, `list create/update/delete`, `comments list/add/update/delete`, `docs list/pages/get/update/create/scan`, `time …`) was silently unreachable; CLI fell through to the root help with exit 0 while pretending to succeed. New code computes `maxDepth` from `Object.keys(config.commands)` so the router adapts to however many tokens the longest registered command has.
- Kept `scaffold/` as its own directory to make future re-extraction easy if we ever want to ship the CLI scaffold as a real package again.

---

## 2026-04-20 (late evening)

- Shipped CLI v0.6.0 adding `views list`, `view create`, `view delete`. Driver: Seraph Immo portfolio list needed 6 views (Portefeuille actif board, Vue dirigeant table, Pipeline commerce board, Chantiers en cours board, Clôtures à finaliser table, Carte map). Creating these by hand 12 times across future clients would be wasted toil, so the CLI gets them.
- Minimal ergonomic flags for the common case (`--group-by <field>`) plus full JSON passthrough (`--grouping-json`, `--filters-json`, `--sorting-json`, `--columns-json`, `--settings-json`) for the cases where the ClickUp view payload needs surgical control.
- Endpoints wrapped: `POST /list/{id}/view`, `POST /folder/{id}/view`, `POST /space/{id}/view`, `GET /list/{id}/view`, `DELETE /view/{id}`.
- Added `CreateViewData` interface mirroring the v2 createListView schema. `ViewType` reused from existing `types/clickup-view-types.ts`.

---

## 2026-04-20 (evening)

- Shipped CLI v0.5.0 with write commands for workspace structure. Rebased onto origin which had already shipped v0.3.0 (fields render on `task get`) and v0.4.0 (comments update/delete/ids) earlier in the day, so this release bumps straight to v0.5.0.
- Driver: Seraph Immo ClickUp build needed to automate folder, list, custom field value operations via the CLI rather than ad-hoc scripts.
- Added to `cli/src/client.ts`: `createFolder`, `updateFolder`, `deleteFolder`, `createListInSpace`, `createListInFolder`, `updateList`, `deleteList`, `getListCustomFields`, `setTaskCustomFieldValue`, plus a `CreateListData` interface.
- Added to `cli/src/index.ts` commands: `folder create`, `folder update`, `folder delete`, `list create`, `list update`, `list delete`, `fields list`, `task field set`. Destructive commands (folder delete, list delete) prompt for confirmation unless `--yes` is passed.
- Extended `task create` with `--parent` (create as subtask) and `--custom-item` (set custom task type ID). Added `--description-file` so SOP templates can be injected from a file.
- Added `custom_item_id?: number | null` to the `CreateTaskData` type in `types/clickup-task-types.ts`, matching the task response shape and the v2 POST body.
- ClickUp API limitation surfaced: creating custom fields and creating custom task types are not supported by v2 or v3. The CLI helps manage values and populate structure, but fields/types still need to be set up once in the UI. Documented in `cli/README.md`.
- Next step: update submodule pointer in consuming projects (`upsys` first, the driver for this release).

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
