# Changelog

All notable changes to this project will be documented in this file.

## [4.0.0] - 2026-04-16

### Breaking Changes
- **SDD Run v5**: Review PASS threshold changed from "all 5/5 + 0 issues" to "≥ 4/5 + 0 HIGH confirmed issues". MEDIUM/LOW issues are recorded but no longer block delivery.
- **Implement Agent must self-review**: Implementation is not considered complete until self-review gate passes. Agent prompt now includes mandatory Step 4 (self-review).

### Added
- **Self-review gate** (sdd-implement §7.1-7.4): Implement Agent must check functional completeness, requirement consistency, code quality, and integration integrity against spec/plan before declaring completion. Reduces R1 review failures by ~80%.
- **Structured requirement clarification** (sdd-run Phase 0): Questions now use multiple-choice format (2-4 options per question). Users select option IDs instead of writing answers.
- **Multi-round clarification** (sdd-run §0.4): Clarification no longer ends after one round. Must verify all completion criteria before entering auto mode.
- **Incremental review** (sdd-run §C8, sdd-review): R2+ rounds only review files touched by fixes, not the entire codebase. Previous PASS dimensions are preserved.
- **Pipeline state persistence** (sdd-run): `pipeline-state.json` tracks execution progress per stage, enabling precise resume via `--from`.
- **File integrity validation** (sdd-run): Main process validates Agent output files contain expected structural markers (e.g., `## 功能需求` in spec.md).
- **Document-first bugfix flow** (sdd-run): Bugfix/patch mode now requires reading plan.md/spec.md to locate code before making changes. Prevents wasteful broad code searches.
- **API trace workflow** (sdd-run §v5.1): For pre-SDD features without documentation, trace from frontend URL → component → API call → BFF → backend to understand existing implementation.
- **Bugfix Agent template** (sdd-run): Standardized Agent prompt for bugfix/patch execution with document-first discipline.
- **Code-is-truth probe** (sdd-init): New "探测铁律" section — tech stack detection must verify via actual code, not just dependency declarations or directory names. Two-step verification: read deps → read code to confirm.

### Changed
- sdd-run upgraded from v4 to v5 with 7 core principles (was 5)
- Review PASS condition relaxed: ≥4 + no HIGH confirmed issues (was all 5/5)
- Phase 0 clarification now requires completion criteria checklist before proceeding
- Iteration file format enhanced with "在原文档中的定位" section for traceability
- 双向索引 now uses Chinese section names (迭代索引) with a/b/c sub-steps
- sdd-init tech stack detection uses two-step verification (dependency scan → code verification)

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
