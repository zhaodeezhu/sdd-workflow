# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2026-04-04

### Added
- **Incremental update mode** (`--update`): only updates source-changed files, skips user-customized files
- **Installation manifest** (`.specify/.sdd-manifest.json`): tracks installed file hashes for smart updates
- `npx sdd-workflow` command alias (previously only `npx sdd-init`)
- `--update --dry-run` to preview what would be updated
- Update analysis report showing: updated/new/customized/unchanged counts

### Changed
- MACE multi-agent competitive evaluation (3 independent reviewers + arbitration)
- Auto-split triggers in sdd-run (spec >500 lines, plan >1000, tasks >800)
- `--auto` mode for sdd-split (skip confirmation in automated pipelines)
- feature_id naming convention: three-digit zero-padded (001, 002, 003...)

## [1.0.0] - 2026-04-01

### Added
- Initial release of SDD Workflow npm package
- 10 Claude Code skills: sdd-init, sdd-constitution, sdd-specify, sdd-testcases, sdd-plan, sdd-tasks, sdd-implement, sdd-review, sdd-run, sdd-split
- 26 template files for spec, plan, tasks, testcases documents (single-file and modular)
- Team configuration templates (5 team types)
- CLI installer: `npx sdd-init`
- Dry-run and force-overwrite support
- Auto-detection of project tech stack via `/sdd-init`
- Idempotent installation (skip existing files)
