# Changelog

## [3.0.0](https://github.com/heyramzi/clickup-utils/compare/clickup-utils-v2.1.1...clickup-utils-v3.0.0) (2026-04-30)


### ⚠ BREAKING CHANGES

* **cli:** package renamed from @clickup-utils/cli to @heyramzi/clickup-cli. Reinstall via:   pnpm i -g @heyramzi/clickup-cli
* Reorganized package structure

### Features

* add ClickUp CLI for terminal and AI agent usage ([8804d9b](https://github.com/heyramzi/clickup-utils/commit/8804d9b8111b4b1fe2ec128a80d17ba1f559a331))
* add ClickUp Docs API create and search params types ([d218d7f](https://github.com/heyramzi/clickup-utils/commit/d218d7fe7534b50ec2242452e185b408d2e97312))
* add ClickUp prefix to all type names for clarity ([2a62bd8](https://github.com/heyramzi/clickup-utils/commit/2a62bd87e9c13edb6b37d31187c956cfa9699aad))
* add ClickUpEditPageRequest type for page updates ([37d388b](https://github.com/heyramzi/clickup-utils/commit/37d388bda0da51d81ace9b94eb5ec0d68a942921))
* add initial documentation files for changelog, product overview, code structure, tech stack, and project tracker ([2ffbed2](https://github.com/heyramzi/clickup-utils/commit/2ffbed2e39834595985d43d4bbeef6a9291a0267))
* Add members to ClickUpWorkspace and standardize type naming ([a412dc5](https://github.com/heyramzi/clickup-utils/commit/a412dc5012bdb3a2a5e9da553f2db10de2e7fa8f))
* add normalizeTaskDescription for clean markdown across task shapes ([2f5ed0c](https://github.com/heyramzi/clickup-utils/commit/2f5ed0c96a7dc3ed046dd46c1dd1d62e58570653))
* add notification and hooks for Claude Code in settings.json ([6e4822c](https://github.com/heyramzi/clickup-utils/commit/6e4822cc272a588d317adc87b8873dc5ae136969))
* add OpenAPI SDK generator for ClickUp v2+v3 APIs ([a37b301](https://github.com/heyramzi/clickup-utils/commit/a37b301b248d22a0c631bab6bc18356d6d791236))
* add transformers and API fetch functions to index.ts ([f821191](https://github.com/heyramzi/clickup-utils/commit/f82119102baf58d434fd6f4c8b27ef9b67ff92d8))
* **cli:** comments update + delete + IDs in list (v0.4.0) ([9d64089](https://github.com/heyramzi/clickup-utils/commit/9d64089bb274eb27f57d4e95e240f0ed6d35a2fe))
* **cli:** migrate to @heyramzi/cli SDK, add README and CHANGELOG ([a071e02](https://github.com/heyramzi/clickup-utils/commit/a071e02ece6e12666b3f11891a899122d97460b1))
* **cli:** rename to @heyramzi/clickup-cli ([eaa6eef](https://github.com/heyramzi/clickup-utils/commit/eaa6eeff92bf2cf64aa8e859513bbda580e60d6d))
* **cli:** render custom fields on `task get --fields` (v0.3.0) ([8cd0d2b](https://github.com/heyramzi/clickup-utils/commit/8cd0d2b82e50900821c4bdf9467062891eb400b4))
* **cli:** support richer custom field creation ([05be036](https://github.com/heyramzi/clickup-utils/commit/05be03680276a54767138949b25eac97358cabf6))
* **cli:** v0.5.0, folder/list write commands and custom field value setters ([4da77f8](https://github.com/heyramzi/clickup-utils/commit/4da77f82f664bcdc2b109c99a7165a3e8178db53))
* **cli:** v0.6.0, view management commands ([bdde3ae](https://github.com/heyramzi/clickup-utils/commit/bdde3ae1a74af87cb7f4b7b2bc95dc40ff6bc597))
* **cli:** v0.7.0, inline scaffold and fix deep-command router ([a9b0199](https://github.com/heyramzi/clickup-utils/commit/a9b0199fbc709344f8c99f4febb43fc02c3cca7e))
* **cli:** workspace-wide call page discovery with type 3 doc support ([e689638](https://github.com/heyramzi/clickup-utils/commit/e6896382e4826681e6b4dfbb5e5e2df1253048f5))
* **constants:** add WEBHOOK endpoint to ClickUp API constants ([aef480a](https://github.com/heyramzi/clickup-utils/commit/aef480a8809841f9b17e1c92e2d1917494dc9136))
* enhance ClickUp task creation types with markdown description, parent, and flexible assignees, and remove a Claude notification hook. ([d565922](https://github.com/heyramzi/clickup-utils/commit/d5659224ef16a9227eabf179990a73b05c4bccb3))
* Improve SDK type generation by unifying response types, detecting dynamic maps, fixing array item `$ref`s, normalizing API tags, and generating an internal request helper. ([686e54b](https://github.com/heyramzi/clickup-utils/commit/686e54bf49281917f4b5799ed15642b3877c89a9))
* **pkg:** publish @heyramzi/clickup-utils to GitHub Packages ([920a3a2](https://github.com/heyramzi/clickup-utils/commit/920a3a2ece1d9c8422affc37e9c9a2ace611cb9e))
* type all task webhook payloads ([44663f5](https://github.com/heyramzi/clickup-utils/commit/44663f5123c91af0394277c62d13a8dc6fbe7505))
* type space feature payloads and add getSpace ([7a30268](https://github.com/heyramzi/clickup-utils/commit/7a30268cb74a894289cc26e87033c6aa273a5503))
* **types:** add Chat API endpoints and authentication error codes ([835c50f](https://github.com/heyramzi/clickup-utils/commit/835c50f77f1befedafeadf2a74d908355a887a89))
* **types:** add chat message creation and reaction types ([f559314](https://github.com/heyramzi/clickup-utils/commit/f559314eef0628069e8b5a297d06bafc690705d7))
* **types:** add comment types to ClickUp API type definitions ([ab16deb](https://github.com/heyramzi/clickup-utils/commit/ab16debdc273df2303693621ecc3260cf37311de))
* **types:** add status.id field and make orderindex required ([59d4e9d](https://github.com/heyramzi/clickup-utils/commit/59d4e9d03ccaa543f7182d2b24f69c39db565356))
* **types:** enhance ClickUp OAuth and task types ([f78151e](https://github.com/heyramzi/clickup-utils/commit/f78151e7ba92a2295fdec583e1f2e0676ceef609))
* **types:** enhance ClickUpApiError with additional metadata fields ([a51fc77](https://github.com/heyramzi/clickup-utils/commit/a51fc779ffe60e74289eb8ac34deb06528cce954))
* **types:** extend authorization_failures in ClickUpApiError for detailed error context ([653b8a7](https://github.com/heyramzi/clickup-utils/commit/653b8a79258dcb79d42fbbf351a6081628408b2b))
* v0.2.0 — fix @heyramzi/cli path, smarter env tokens, updated doc types ([4df0b2d](https://github.com/heyramzi/clickup-utils/commit/4df0b2daa7d79c79a36bfdb121abfb9e411881cc))


### Bug Fixes

* add text_content description fallback ([e9f5cec](https://github.com/heyramzi/clickup-utils/commit/e9f5cec4c08f7b8b83908058cd70c03fb3c4e23a))
* **ci:** trigger publish on release published, not tag push ([3cf1a16](https://github.com/heyramzi/clickup-utils/commit/3cf1a16edec60411b538c988dab93e63a42e93f8))
* **cli:** consume @heyramzi/cli from GitHub Packages registry ([9a78224](https://github.com/heyramzi/clickup-utils/commit/9a78224fa8a6f4c7d002ee1838f66ad54d2a7cea))
* **cli:** correct @heyramzi/cli file path after vibe-kit rename ([e86a62f](https://github.com/heyramzi/clickup-utils/commit/e86a62fda0920d2ea99549f54c0caa982877626b))
* **cli:** restore cli/package.json accidentally deleted in f8f68d5 ([32aaaac](https://github.com/heyramzi/clickup-utils/commit/32aaaac5a2fa8d2b4bba68172a4afcd6292f43b9))
* correct ClickUp API documentation URL ([cf33df9](https://github.com/heyramzi/clickup-utils/commit/cf33df98bb26cd869bc76362c3270106b3854f16))
* **esm:** add .js extensions to relative imports ([466eb6b](https://github.com/heyramzi/clickup-utils/commit/466eb6b7199ef1f21a53d10286e823bf0665e38a))
* make status.id and status.orderindex optional to match ClickUp API ([7677c0d](https://github.com/heyramzi/clickup-utils/commit/7677c0dc9c78e3003c3f0b1799265a514f74742e))
* standardize function parameter formatting in hierarchy API and transformers ([af7c42d](https://github.com/heyramzi/clickup-utils/commit/af7c42d99812c0b3fd63128973a45fb63c021171))
* **transformers:** clarify list transformation in transformFolder function ([87d08ac](https://github.com/heyramzi/clickup-utils/commit/87d08ac7fec86ad34a56cb57b76c57d0bd8d0637))
* **types:** update ClickUp Doc types to match API responses ([239324c](https://github.com/heyramzi/clickup-utils/commit/239324ca1625da7aab870893915433e71e9def19))
* Update StoredWorkspaces to use teams to match ClickUp API structure ([3a659a2](https://github.com/heyramzi/clickup-utils/commit/3a659a232cf8e647dea3fed72a01ec5eed409bc9))


### Code Refactoring

* restructure clickup-types to clickup-utils with framework-specific services ([9246c5e](https://github.com/heyramzi/clickup-utils/commit/9246c5edccc6c2261b75cc00e6cb1778da001814))

## [2.1.0](https://github.com/heyramzi/clickup-utils/compare/clickup-utils-v2.0.0...clickup-utils-v2.1.0) (2026-04-28)

### Features

- add normalizeTaskDescription for clean markdown across task shapes ([2f5ed0c](https://github.com/heyramzi/clickup-utils/commit/2f5ed0c96a7dc3ed046dd46c1dd1d62e58570653))
- expand ClickUp view typings for additional view types, grouping options, and test coverage ([b10ef24](https://github.com/heyramzi/clickup-utils/commit/b10ef24))
- type space feature payloads and add getSpace ([7a30268](https://github.com/heyramzi/clickup-utils/commit/7a3026848fb442392510be8c7f370f81f2c2a6d5))

### Bug Fixes

- add idx to ClickUp view column fields ([61e8575](https://github.com/heyramzi/clickup-utils/commit/61e85754b1e852283f5669b5baae8afd95c62714))

## [2.0.0](https://github.com/heyramzi/clickup-utils/compare/clickup-utils-v1.0.0...clickup-utils-v2.0.0) (2026-04-27)

### ⚠ BREAKING CHANGES

- **cli:** package renamed from @clickup-utils/cli to @heyramzi/clickup-cli. Reinstall via: pnpm i -g @heyramzi/clickup-cli

### Features

- **cli:** rename to @heyramzi/clickup-cli ([eaa6eef](https://github.com/heyramzi/clickup-utils/commit/eaa6eeff92bf2cf64aa8e859513bbda580e60d6d))

### Bug Fixes

- **ci:** trigger publish on release published, not tag push ([3cf1a16](https://github.com/heyramzi/clickup-utils/commit/3cf1a16edec60411b538c988dab93e63a42e93f8))

## [1.0.0](https://github.com/heyramzi/clickup-utils/compare/clickup-utils-v0.1.0...clickup-utils-v1.0.0) (2026-04-27)

### ⚠ BREAKING CHANGES

- Reorganized package structure

### Features

- add ClickUp CLI for terminal and AI agent usage ([8804d9b](https://github.com/heyramzi/clickup-utils/commit/8804d9b8111b4b1fe2ec128a80d17ba1f559a331))
- add ClickUp Docs API create and search params types ([d218d7f](https://github.com/heyramzi/clickup-utils/commit/d218d7fe7534b50ec2242452e185b408d2e97312))
- add ClickUp prefix to all type names for clarity ([2a62bd8](https://github.com/heyramzi/clickup-utils/commit/2a62bd87e9c13edb6b37d31187c956cfa9699aad))
- add ClickUpEditPageRequest type for page updates ([37d388b](https://github.com/heyramzi/clickup-utils/commit/37d388bda0da51d81ace9b94eb5ec0d68a942921))
- add initial documentation files for changelog, product overview, code structure, tech stack, and project tracker ([2ffbed2](https://github.com/heyramzi/clickup-utils/commit/2ffbed2e39834595985d43d4bbeef6a9291a0267))
- Add members to ClickUpWorkspace and standardize type naming ([a412dc5](https://github.com/heyramzi/clickup-utils/commit/a412dc5012bdb3a2a5e9da553f2db10de2e7fa8f))
- add notification and hooks for Claude Code in settings.json ([6e4822c](https://github.com/heyramzi/clickup-utils/commit/6e4822cc272a588d317adc87b8873dc5ae136969))
- add OpenAPI SDK generator for ClickUp v2+v3 APIs ([a37b301](https://github.com/heyramzi/clickup-utils/commit/a37b301b248d22a0c631bab6bc18356d6d791236))
- add transformers and API fetch functions to index.ts ([f821191](https://github.com/heyramzi/clickup-utils/commit/f82119102baf58d434fd6f4c8b27ef9b67ff92d8))
- **cli:** comments update + delete + IDs in list (v0.4.0) ([9d64089](https://github.com/heyramzi/clickup-utils/commit/9d64089bb274eb27f57d4e95e240f0ed6d35a2fe))
- **cli:** migrate to @heyramzi/cli SDK, add README and CHANGELOG ([a071e02](https://github.com/heyramzi/clickup-utils/commit/a071e02ece6e12666b3f11891a899122d97460b1))
- **cli:** render custom fields on `task get --fields` (v0.3.0) ([8cd0d2b](https://github.com/heyramzi/clickup-utils/commit/8cd0d2b82e50900821c4bdf9467062891eb400b4))
- **cli:** support richer custom field creation ([05be036](https://github.com/heyramzi/clickup-utils/commit/05be03680276a54767138949b25eac97358cabf6))
- **cli:** v0.5.0, folder/list write commands and custom field value setters ([4da77f8](https://github.com/heyramzi/clickup-utils/commit/4da77f82f664bcdc2b109c99a7165a3e8178db53))
- **cli:** v0.6.0, view management commands ([bdde3ae](https://github.com/heyramzi/clickup-utils/commit/bdde3ae1a74af87cb7f4b7b2bc95dc40ff6bc597))
- **cli:** v0.7.0, inline scaffold and fix deep-command router ([a9b0199](https://github.com/heyramzi/clickup-utils/commit/a9b0199fbc709344f8c99f4febb43fc02c3cca7e))
- **cli:** workspace-wide call page discovery with type 3 doc support ([e689638](https://github.com/heyramzi/clickup-utils/commit/e6896382e4826681e6b4dfbb5e5e2df1253048f5))
- **constants:** add WEBHOOK endpoint to ClickUp API constants ([aef480a](https://github.com/heyramzi/clickup-utils/commit/aef480a8809841f9b17e1c92e2d1917494dc9136))
- enhance ClickUp task creation types with markdown description, parent, and flexible assignees, and remove a Claude notification hook. ([d565922](https://github.com/heyramzi/clickup-utils/commit/d5659224ef16a9227eabf179990a73b05c4bccb3))
- Improve SDK type generation by unifying response types, detecting dynamic maps, fixing array item `$ref`s, normalizing API tags, and generating an internal request helper. ([686e54b](https://github.com/heyramzi/clickup-utils/commit/686e54bf49281917f4b5799ed15642b3877c89a9))
- **pkg:** publish @heyramzi/clickup-utils to GitHub Packages ([920a3a2](https://github.com/heyramzi/clickup-utils/commit/920a3a2ece1d9c8422affc37e9c9a2ace611cb9e))
- **types:** add Chat API endpoints and authentication error codes ([835c50f](https://github.com/heyramzi/clickup-utils/commit/835c50f77f1befedafeadf2a74d908355a887a89))
- **types:** add chat message creation and reaction types ([f559314](https://github.com/heyramzi/clickup-utils/commit/f559314eef0628069e8b5a297d06bafc690705d7))
- **types:** add comment types to ClickUp API type definitions ([ab16deb](https://github.com/heyramzi/clickup-utils/commit/ab16debdc273df2303693621ecc3260cf37311de))
- **types:** add status.id field and make orderindex required ([59d4e9d](https://github.com/heyramzi/clickup-utils/commit/59d4e9d03ccaa543f7182d2b24f69c39db565356))
- **types:** enhance ClickUp OAuth and task types ([f78151e](https://github.com/heyramzi/clickup-utils/commit/f78151e7ba92a2295fdec583e1f2e0676ceef609))
- **types:** enhance ClickUpApiError with additional metadata fields ([a51fc77](https://github.com/heyramzi/clickup-utils/commit/a51fc779ffe60e74289eb8ac34deb06528cce954))
- **types:** extend authorization_failures in ClickUpApiError for detailed error context ([653b8a7](https://github.com/heyramzi/clickup-utils/commit/653b8a79258dcb79d42fbbf351a6081628408b2b))
- v0.2.0 — fix @heyramzi/cli path, smarter env tokens, updated doc types ([4df0b2d](https://github.com/heyramzi/clickup-utils/commit/4df0b2daa7d79c79a36bfdb121abfb9e411881cc))

### Bug Fixes

- **cli:** consume @heyramzi/cli from GitHub Packages registry ([9a78224](https://github.com/heyramzi/clickup-utils/commit/9a78224fa8a6f4c7d002ee1838f66ad54d2a7cea))
- **cli:** correct @heyramzi/cli file path after vibe-kit rename ([e86a62f](https://github.com/heyramzi/clickup-utils/commit/e86a62fda0920d2ea99549f54c0caa982877626b))
- **cli:** restore cli/package.json accidentally deleted in f8f68d5 ([32aaaac](https://github.com/heyramzi/clickup-utils/commit/32aaaac5a2fa8d2b4bba68172a4afcd6292f43b9))
- correct ClickUp API documentation URL ([cf33df9](https://github.com/heyramzi/clickup-utils/commit/cf33df98bb26cd869bc76362c3270106b3854f16))
- **esm:** add .js extensions to relative imports ([466eb6b](https://github.com/heyramzi/clickup-utils/commit/466eb6b7199ef1f21a53d10286e823bf0665e38a))
- make status.id and status.orderindex optional to match ClickUp API ([7677c0d](https://github.com/heyramzi/clickup-utils/commit/7677c0dc9c78e3003c3f0b1799265a514f74742e))
- standardize function parameter formatting in hierarchy API and transformers ([af7c42d](https://github.com/heyramzi/clickup-utils/commit/af7c42d99812c0b3fd63128973a45fb63c021171))
- **transformers:** clarify list transformation in transformFolder function ([87d08ac](https://github.com/heyramzi/clickup-utils/commit/87d08ac7fec86ad34a56cb57b76c57d0bd8d0637))
- **types:** update ClickUp Doc types to match API responses ([239324c](https://github.com/heyramzi/clickup-utils/commit/239324ca1625da7aab870893915433e71e9def19))
- Update StoredWorkspaces to use teams to match ClickUp API structure ([3a659a2](https://github.com/heyramzi/clickup-utils/commit/3a659a232cf8e647dea3fed72a01ec5eed409bc9))

### Code Refactoring

- restructure clickup-types to clickup-utils with framework-specific services ([9246c5e](https://github.com/heyramzi/clickup-utils/commit/9246c5edccc6c2261b75cc00e6cb1778da001814))
