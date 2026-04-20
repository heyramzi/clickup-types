# Changelog

## Technical History

- 2026-04-20: feat(cli): `task get --fields` renders custom fields with dropdown option resolution (drop_down, labels, date, users, tasks, JSON fallback). Added to support post-Make-push QC: you need to eyeball a downstream task's custom fields from the terminal before declaring a scenario edit done. v0.3.0 (ramzi).
- 2026-04-13: feat(cli): migrate from commander to @heyramzi/cli SDK, consolidate 15 command files into single createCLI entry (ramzi)
- 2026-04-13: feat(cli): add docs scan command for workspace-wide call page discovery (ramzi)
- 2026-04-13: feat(cli): multi-token auth with priority-ordered fallback (ramzi)
- 2026-04-14: fix(cli): token fallback now triggers on ClickUp 404/ACCESS_999 — ClickUp returns 404 with ECODE ACCESS_999 for permission-denied responses, not 401/403; isAccessError now checks message for this code (ramzi)
- 2026-04-17: fix(cli): point @heyramzi/cli to CLIs/climaker (modules/cli path was broken); use getEnvVarOptional from climaker for CU_API_TOKEN and CU_TEAM_ID env resolution (ramzi)
- 2026-04-17: feat(types): add ClickUpPageAvatar with color/source fields, ClickUpTaskDocRelationship and response type from v3 OpenAPI spec (ramzi)
