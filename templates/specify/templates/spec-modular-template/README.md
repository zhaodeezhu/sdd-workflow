# {feature_name} - Feature Specification Index

> Version: {version}
> Created: {create_date}
> Updated: {update_date}
> Source: [{source_title}]({source_url})

## Document Structure

The specification has been split into the following modules for easier management and on-demand loading:

```
spec/
├── README.md              # This file - specification index and overview
├── overview.md            # Feature overview, business background
├── user-stories.md        # All user stories
├── acceptance-criteria.md # Acceptance criteria summary
├── constraints.md         # Constraints and non-functional requirements
└── changelog.md           # Change log
```

## Document Overview

| Module | Content | Document |
|--------|---------|----------|
| Feature Overview | Business background, feature description, related modules | [overview.md](./overview.md) |
| User Stories | All user stories (US-1, US-2...) | [user-stories.md](./user-stories.md) |
| Acceptance Criteria | Summary of acceptance criteria per user story | [acceptance-criteria.md](./acceptance-criteria.md) |
| Constraints | Technical constraints, performance requirements, security requirements | [constraints.md](./constraints.md) |
| Change Log | Version change history | [changelog.md](./changelog.md) |

## Quick Navigation

### Core Documents
- [Feature Overview](./overview.md) - Understand business background and goals
- [User Stories](./user-stories.md) - View all user stories
- [Acceptance Criteria](./acceptance-criteria.md) - Understand acceptance criteria

### Auxiliary Documents
- [Constraints](./constraints.md) - Technical and business constraints
- [Change Log](./changelog.md) - Version change history

## Core Information Summary

### Business Background

{Brief description of business background, 2-3 sentences}

### Feature Description

{Brief description of feature, 2-3 sentences}

### User Story Count

- Total: {total_stories} user stories
- Core stories: {core_stories}
- Extended stories: {extended_stories}

## Usage Guide

1. **View Overview**: Read this file to understand the overall structure
2. **On-demand Loading**: Open the corresponding module document as needed
3. **View User Stories**: Start from [user-stories.md](./user-stories.md)
4. **Acceptance Criteria**: Refer to [acceptance-criteria.md](./acceptance-criteria.md)
5. **Constraints**: View [constraints.md](./constraints.md) for limitations

---

*This document follows SDD specification, describing business requirements only, no technical implementation details*
