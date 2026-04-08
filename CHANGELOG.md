# Changelog

All notable changes to this project will be documented in this file.

## [2.0.0] - 2026-04-08

### Breaking Changes
- **SDD Run v4 — Agent-Per-Phase architecture**: Each pipeline phase now runs as an independent Agent with isolated context window. Main process is a lightweight orchestrator that only dispatches agents, checks file existence, and reads conclusion lines.
- **Review file structure changed**: Review reports now stored in `reviews/r{n}/agent-a.md`, `agent-b.md`, `agent-c.md`, `arbitrate.md` instead of flat `review-{phase}-r{n}.md` files.
- **Stricter PASS criteria**: All 6 dimensions must score 5/5 with 0 confirmed issues to PASS (previously ≥4 + no HIGH).

### Added
- **Dual-mode execution** for all core skills: manual mode (`/sdd-*`) for interactive use, Agent mode (auto-invoked by `sdd-run`) for automated pipelines.
- **Agent Prompt thin-shell templates** (10 files in `.specify/templates/agent-prompts/`): specify, testcases, plan, tasks, implement, review-a, review-b, review-c, arbitrate, fix. Each references its Skill file as single source of truth.
- **Single Source of Truth architecture**: Skill files (`.claude/skills/sdd-*/SKILL.md`) contain domain logic; Agent prompts are thin shells that reference Skills + add I/O paths.
- **Arbitrate Agent**: Dedicated agent reads 3 review reports from files and produces arbitration verdict.
- **Fix Agent**: Dedicated agent reads fix-directives and applies targeted code fixes.
- **`--from fix` resume option** in sdd-run for resuming from fix stage.
- **架构合规 (Architecture Compliance)** as 6th review dimension.

### Changed
- sdd-run rewritten from v3 (Planner/Generator/Evaluator inline) to v4 (Agent-Per-Phase dispatch)
- sdd-review simplified: removed secondary verification (二次验证), removed forced file save confirmation steps, removed review-summary.md generation (moved to arbitrate agent)
- Review arbitration now file-driven: each review agent writes to file, arbitrate agent reads files
- Removed notification steps from sdd-run and sdd-review (sdd-notify still available standalone)
- Removed auto-split checks from sdd-run (still available in individual skills)

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
