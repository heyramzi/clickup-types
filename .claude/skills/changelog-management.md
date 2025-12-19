---
name: changelog-management
description: Use when releasing new versions to update CHANGELOG.md and bump package.json version. Follows semantic versioning and Keep a Changelog format.
---

# Changelog Management

**Philosophy**: 記録 (Kiroku) - Documentation as memory. Every change tells a story.

A well-maintained changelog helps users understand what changed and why, enabling informed upgrade decisions.

---

## When to Use

**Trigger conditions:**
- Releasing a new version (major, minor, or patch)
- After completing a significant feature or fix
- Before creating a git tag or GitHub release
- User invokes `/changelog` command

**Not for:**
- Work-in-progress changes
- Internal refactoring without user impact
- Documentation-only updates (unless significant)

---

## Core Pattern

### Semantic Versioning

```
MAJOR.MINOR.PATCH

MAJOR: Breaking changes (incompatible API changes)
MINOR: New features (backward compatible)
PATCH: Bug fixes (backward compatible)
```

### Changelog Format (Keep a Changelog + Emojis)

```markdown
## [X.Y.Z] - YYYY-MM-DD

### ✨ Added
- New features

### 🔄 Changed
- Changes to existing functionality

### ⚠️ Deprecated
- Features to be removed in future

### 🗑️ Removed
- Features removed in this version

### 🐛 Fixed
- Bug fixes

### 🔒 Security
- Vulnerability fixes
```

**Section Emojis:**
| Section | Emoji | Meaning |
|---------|-------|---------|
| Added | ✨ | Sparkles - new shiny features |
| Changed | 🔄 | Arrows - things that evolved |
| Deprecated | ⚠️ | Warning - heads up, going away |
| Removed | 🗑️ | Trash - gone for good |
| Fixed | 🐛 | Bug - squashed! |
| Security | 🔒 | Lock - keeping you safe |

---

## Quick Reference

| Change Type | Version Bump | Section |
|-------------|--------------|---------|
| Breaking API change | MAJOR | 🔄 Changed / 🗑️ Removed |
| New feature | MINOR | ✨ Added |
| Bug fix | PATCH | 🐛 Fixed |
| Security patch | PATCH | 🔒 Security |
| Deprecation notice | MINOR | ⚠️ Deprecated |
| Performance improvement | PATCH | 🔄 Changed |

---

## Implementation

### Phase 1: Gather Changes

```markdown
1. Get current version from package.json
2. Review git log since last tag/release
3. Categorize changes by type (Added, Changed, Fixed, etc.)
4. Identify if any changes are breaking (MAJOR bump needed)
```

**Git commands to help:**
```bash
# Find last tag
git describe --tags --abbrev=0

# View commits since last tag
git log $(git describe --tags --abbrev=0)..HEAD --oneline

# View commits with full messages
git log $(git describe --tags --abbrev=0)..HEAD --pretty=format:"- %s"
```

### Phase 2: Determine Version

```markdown
1. If breaking changes → bump MAJOR (reset MINOR.PATCH to 0)
2. If new features → bump MINOR (reset PATCH to 0)
3. If only fixes → bump PATCH
4. User can override with explicit version
```

### Phase 3: Update Files

```markdown
1. Update CHANGELOG.md:
   - Add new version section at top (below header)
   - Include date in ISO format (YYYY-MM-DD)
   - List changes by category
   - Keep unreleased section if applicable

2. Update package.json:
   - Set "version" field to new version
   - Verify JSON is valid
```

### Phase 4: Verify

```markdown
1. Changelog follows Keep a Changelog format
2. Version in package.json matches changelog
3. All significant changes are documented
4. Date is correct
5. Links are valid (if using comparison links)
```

---

## Project-Specific Considerations

### Monorepo Structure

For vibe-starter and similar projects with variants:

```
project/
├── package.json          # Root version (update this)
├── CHANGELOG.md          # Root changelog
├── nextjs/package.json   # Variant (may have own version)
└── sveltekit/package.json
```

**Rule**: Root package.json is the source of truth for project version.

### Version Sync

If variants need to sync versions:
```bash
# Update all package.json files
# Root version should match variant versions for consistency
```

---

## Changelog Entry Examples

### Good Entries

```markdown
### ✨ Added
- User authentication with Supabase magic links
- Dark mode toggle in settings page
- Export to CSV functionality for reports

### 🔄 Changed
- Improved form validation error messages
- Updated to Svelte 5 runes syntax throughout

### 🐛 Fixed
- Navigation menu not closing on mobile after selection
- Date picker incorrectly handling timezone offsets

### 🔒 Security
- Updated dependencies to patch CVE-2024-XXXXX
```

### Poor Entries (Avoid)

```markdown
### 🔄 Changed
- Updated stuff
- Fixed bug
- Various improvements
- Refactored code
```

---

## CHANGELOG.md Template

For new projects without a changelog:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - YYYY-MM-DD

### ✨ Added
- Initial release
- Core functionality
```

---

## Common Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|----------------|------------------|
| Vague descriptions | Users can't understand impact | Be specific about what changed |
| Missing breaking changes | Users get surprised by failures | Always highlight breaking changes |
| Wrong version bump | Confuses semantic versioning | Follow semver strictly |
| Forgetting package.json | Version mismatch | Always update both files |
| Past tense inconsistency | Hard to read | Use past tense consistently ("Added" not "Add") |
| Including internal changes | Noise for users | Only document user-facing changes |

---

## Verification Checklist

After updating changelog:

- [ ] Version in CHANGELOG.md matches package.json
- [ ] Date is correct (today's date for new releases)
- [ ] All user-facing changes since last release are documented
- [ ] Breaking changes are clearly marked
- [ ] Entries are categorized correctly
- [ ] Descriptions are clear and specific
- [ ] package.json is valid JSON

---

**Remember**: A changelog is for humans, not machines.
変更の物語を伝える - "Tell the story of change"
