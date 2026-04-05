# {feature_name} - Task Breakdown Index

> Version: {version}
> Created: {create_date}
> Updated: {update_date}
> Related Spec: [spec.md](../spec.md)
> Implementation Plan: [plan.md](../plan.md)
> Test Cases: [testcases.md](../testcases.md)

## Document Structure

Tasks have been split into the following modules for easier management and on-demand loading:

```
tasks/
├── README.md                    # This file - task index and overview
├── phase-0-preparation.md       # Phase 0: Preparation
├── phase-1-backend.md           # Phase 1: Backend development (test-first)
├── phase-2-frontend.md          # Phase 2: Frontend development (test-first)
├── phase-3-testing.md           # Phase 3: Testing & acceptance
├── phase-N-*.md                 # Additional phases (iterations)
├── dependencies.md              # Task dependency relationships
├── checkpoints.md               # Checkpoints and acceptance criteria
└── implementation-notes.md      # Implementation records and notes
```

## Task Overview

| Phase | Task Count | Estimated Hours | Status | Document |
|-------|------------|-----------------|--------|----------|
| Phase 0: Preparation | {phase_0_tasks} | {phase_0_hours}h | {phase_0_status} | [phase-0-preparation.md](./phase-0-preparation.md) |
| Phase 1: Backend Dev | {phase_1_tasks} | {phase_1_hours}h | {phase_1_status} | [phase-1-backend.md](./phase-1-backend.md) |
| Phase 2: Frontend Dev | {phase_2_tasks} | {phase_2_hours}h | {phase_2_status} | [phase-2-frontend.md](./phase-2-frontend.md) |
| Phase 3: Testing | {phase_3_tasks} | {phase_3_hours}h | {phase_3_status} | [phase-3-testing.md](./phase-3-testing.md) |
| **Total** | **{total_tasks}** | **{total_hours}h** | **{progress}%** | - |

## Quick Navigation

### Core Phases
- [Preparation](./phase-0-preparation.md) - Environment check, test data, code research
- [Backend Development](./phase-1-backend.md) - Models, DTOs, services, controllers
- [Frontend Development](./phase-2-frontend.md) - API services, stores, page components, routing
- [Testing & Acceptance](./phase-3-testing.md) - E2E tests, boundary tests, performance tests

### Auxiliary Documents
- [Task Dependencies](./dependencies.md) - Dependency graph and execution order
- [Checkpoints](./checkpoints.md) - Phase acceptance criteria
- [Implementation Notes](./implementation-notes.md) - Actual vs planned differences, issue records

## Current Progress

**Current Phase**: {current_phase}

**Recently Completed**:
- {recent_task_1}
- {recent_task_2}
- {recent_task_3}

**Next Steps**:
- {next_task_1}
- {next_task_2}

## Usage Guide

1. **View Overview**: Read this file to understand overall progress and structure
2. **On-demand Loading**: Open the corresponding Phase document for your current work
3. **Check Dependencies**: Before starting a task, check [dependencies.md](./dependencies.md) for prerequisites
4. **Acceptance Criteria**: After completing a phase, refer to [checkpoints.md](./checkpoints.md) for validation
5. **Issue Tracking**: When encountering issues, check [implementation-notes.md](./implementation-notes.md) for records

## Change Log

| Version | Date | Change |
|---------|------|--------|
| {version} | {date} | {change_description} |

---

*This document follows SDD test-first principles, tasks organized in Red-Green-Refactor cycles*
