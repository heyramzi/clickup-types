# Changelog: $ARGUMENTS

Read and follow the changelog management skill at `.claude/skills/changelog-management.md`.

## Version Target
$ARGUMENTS

## Usage

```
/changelog 1.2.0              # Bump to specific version
/changelog patch              # Auto-bump patch (0.0.X)
/changelog minor              # Auto-bump minor (0.X.0)
/changelog major              # Auto-bump major (X.0.0)
```

## Instructions

1. **Read current state**:
   - Get current version from `package.json`
   - Get last git tag (if any)
   - Review commits since last release

2. **Determine new version**:
   - If argument is `patch`/`minor`/`major`: auto-calculate from current
   - If argument is a version (e.g., `1.2.0`): use that exact version
   - Validate version follows semver format

3. **Gather changes**:
   - Review git log since last tag
   - Categorize changes: Added, Changed, Fixed, Removed, Security
   - Focus on user-facing changes only

4. **Update CHANGELOG.md**:
   - Create file if it doesn't exist (use template from skill)
   - Add new version section at top
   - Include today's date in ISO format
   - List categorized changes with clear descriptions

5. **Update package.json**:
   - Set `"version"` field to new version
   - Ensure JSON remains valid

6. **Verify**:
   - Confirm version matches in both files
   - Run `pnpm exec tsc --noEmit` to ensure no type errors
   - Summarize what was documented

## Example Output

After running `/changelog 1.2.0`:

```
Updated CHANGELOG.md and package.json to version 1.2.0

Changes documented:
- Added: 3 new features
- Fixed: 2 bug fixes
- Changed: 1 improvement

Next steps:
1. Review the changelog entries
2. Commit: git add . && git commit -m "chore: release v1.2.0"
3. Tag: git tag v1.2.0
4. Push: git push && git push --tags
```

## Notes

- If no git tags exist, document all changes as "Initial release"
- Breaking changes should prompt a MAJOR version bump (ask if unsure)
- Keep descriptions concise but specific
- Don't include internal refactoring unless it affects users
