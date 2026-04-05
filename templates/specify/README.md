# SDD (Specification-Driven Development) Guide

> This document describes how to use SDD specification for development in any project

## Quick Start

### 1. Create a New Feature

Use the script to create a feature directory:
```bash
./.specify/scripts/create-feature.sh <feature-name>
```

Example:
```bash
./.specify/scripts/create-feature.sh user-authentication
# Output: .specify/specs/001-user-authentication/
```

### 2. Using SDD Commands

| Command | Function | Example |
|---------|----------|---------|
| `/sdd-constitution` | Create/update project constitution | `/sdd-constitution` |
| `/sdd-specify` | Create feature specification | `/sdd-specify user authentication feature` |
| `/sdd-plan` | Create technical plan | `/sdd-plan implement authentication with JWT` |
| `/sdd-tasks` | Create task breakdown | `/sdd-tasks` |
| `/sdd-implement` | Execute development tasks | `/sdd-implement` |

## SDD Process

```
┌─────────────────────────────────────────────────────────────┐
│                    SDD Development Process                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Constitution  ->  Establish project principles & rules   │
│         |                                                   │
│  2. Specify      ->  Define requirements and user stories    │
│         |                                                   │
│  3. Plan         ->  Design technical solution & data model  │
│         |                                                   │
│  4. Tasks        ->  Break down development tasks            │
│         |                                                   │
│  5. Implement    ->  Execute development and validate        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
.specify/
├── memory/
│   ├── constitution.md           # Project constitution (development principles)
│   └── project-context.md        # Project context (optional)
│
├── specs/
│   ├── 000-existing-modules/     # Documentation for existing modules
│   │   ├── module-a/             # Module A
│   │   └── module-b/             # Module B
│   │
│   └── 001-new-feature/          # New feature
│       ├── spec.md               # Feature specification
│       ├── testcases.md          # Test cases
│       ├── plan.md               # Technical plan
│       ├── tasks.md              # Task breakdown
│       └── contracts/            # API contracts
│           └── api-spec.json
│
├── templates/
│   ├── constitution-template.md
│   ├── spec-template.md
│   ├── testcases-template.md
│   ├── plan-template.md
│   ├── tasks-template.md
│   ├── spec-modular-template/
│   ├── plan-modular-template/
│   ├── tasks-modular-template/
│   └── requirements/
│
├── scripts/
│   └── create-feature.sh         # Create feature directory
│
└── README.md                     # This document
```

## Document Specification

### Feature Specification (spec.md)

Must include:
- Feature overview (name, description, business background)
- User stories (role, goal, value)
- Functional requirements (core features, UI, data, interfaces)
- Non-functional requirements (performance, security, compatibility)
- Acceptance criteria (functional, quality, documentation)

### Test Cases (testcases.md)

Must include:
- Test strategy (test pyramid, coverage targets)
- Backend test cases (unit, integration, API)
- Frontend test cases (component, store)
- E2E test cases (critical user flows)
- Boundary condition tests
- Test execution plan

### Technical Plan (plan.md)

Must include:
- Architecture design (overall architecture, module breakdown)
- Data model (table design, entity classes)
- API design (interface list, request/response format)
- Frontend implementation (pages, components, state management)
- Backend implementation (layered design, core classes)
- Test plan (unit tests, integration tests)

### Task Breakdown (tasks.md)

Must include:
- Task list (description, files, dependencies, acceptance criteria)
- Phase breakdown (preparation, backend, frontend, testing)
- Checkpoints (phase validation points)
- Time estimates

## Best Practices

### 1. Documentation First
- Complete specification documents before coding
- Specification documents require team review

### 2. Acceptance-Driven
- Every feature has clear acceptance criteria
- Test cases are based on acceptance criteria

### 3. Progressive Refinement
- Specification -> Plan -> Tasks, progressively refined
- Each step can be traced back and modified

### 4. Continuous Updates
- Update documents when requirements change
- Record technical decisions in plan documents

### 5. Technology Stack Detection
- SDD automatically detects your project's technology stack
- Templates use placeholders that adapt to any stack
- Constitution records the detected stack for reference

## Documenting Existing Modules

For existing modules, follow these steps to add documentation:

```bash
# 1. Create module directory
mkdir -p .specify/specs/000-existing-modules/module-name

# 2. Use SDD commands to analyze existing code and generate documentation
# In Claude Code, run:
/sdd-specify Analyze the module-name module and generate specification documentation
```

## FAQ

### Q: Does SDD conflict with agile development?
A: No. SDD emphasizes documentation first, but documents can be lightweight. User stories are specifications in SDD.

### Q: Must all documents be completed before coding?
A: Recommended but not required. For simple features, steps can be merged. The key is to have clear acceptance criteria.

### Q: How to handle urgent requirements?
A: Implement first, then add documentation. But at minimum, write the feature specification.

### Q: How does SDD work with different technology stacks?
A: SDD templates use placeholders like `{frontend_framework}`, `{backend_framework}`, `{database}` that are automatically filled based on your project. The constitution detects your stack and all subsequent documents reference it.

---

*For more questions, refer to the project constitution or contact the team*
