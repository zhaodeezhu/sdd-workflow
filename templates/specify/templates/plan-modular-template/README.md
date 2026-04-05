# {feature_name} - Implementation Plan Index

> Version: {version}
> Created: {create_date}
> Updated: {update_date}
> Related Spec: [spec.md](../spec.md)
> Related Test Cases: [testcases.md](../testcases.md)

## Document Structure

The implementation plan has been split into the following modules for easier management and on-demand loading:

```
plan/
├── README.md              # This file - plan index and overview
├── architecture.md        # Architecture design
├── data-model.md          # Data model (DDL, DTO)
├── backend-api.md         # Backend API design
├── backend-impl.md        # Backend implementation details
├── frontend-api.md        # Frontend API integration
├── frontend-impl.md       # Frontend implementation details
├── security.md            # Security design
├── performance.md         # Performance optimization
└── changelog.md           # Change log
```

## Document Overview

| Module | Content | Document |
|--------|---------|----------|
| Architecture Design | Overall architecture, tech stack, module breakdown | [architecture.md](./architecture.md) |
| Data Model | DDL, DTO, entity relationships | [data-model.md](./data-model.md) |
| Backend API | Controller, interface definitions | [backend-api.md](./backend-api.md) |
| Backend Implementation | Service, Repository implementation | [backend-impl.md](./backend-impl.md) |
| Frontend API | API integration, request wrapper | [frontend-api.md](./frontend-api.md) |
| Frontend Implementation | Components, Store, routing | [frontend-impl.md](./frontend-impl.md) |
| Security | Authentication, authorization, data security | [security.md](./security.md) |
| Performance Optimization | Caching, indexing, optimization strategies | [performance.md](./performance.md) |
| Change Log | Version change history | [changelog.md](./changelog.md) |

## Quick Navigation

### Core Documents
- [Architecture Design](./architecture.md) - Understand overall architecture and technology choices
- [Data Model](./data-model.md) - View database design and DTO definitions
- [Backend API](./backend-api.md) - View API interface definitions

### Implementation Documents
- [Backend Implementation](./backend-impl.md) - Backend Service and Repository implementation
- [Frontend API](./frontend-api.md) - Frontend API integration approach
- [Frontend Implementation](./frontend-impl.md) - Frontend component and Store implementation

### Auxiliary Documents
- [Security Design](./security.md) - Security-related design
- [Performance Optimization](./performance.md) - Performance optimization strategies
- [Change Log](./changelog.md) - Version change history

## Core Information Summary

### Technology Stack

> Read from constitution.md or project configuration.

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend Framework | {frontend_framework} | {frontend_version} |
| UI Library | {ui_library} | {ui_version} |
| State Management | {state_management} | {state_version} |
| Backend Framework | {backend_framework} | {backend_version} |
| Database | {database} | {database_version} |

### Architecture Overview

```
Frontend ({frontend_framework} + {state_management})
    | HTTP API
Backend ({backend_framework})
    | {database_driver}
Database ({database})
```

### Key Design Decisions

1. **Decision 1**: {brief_description}
2. **Decision 2**: {brief_description}
3. **Decision 3**: {brief_description}

## Usage Guide

1. **View Overview**: Read this file to understand the overall structure
2. **Architecture First**: Start with [architecture.md](./architecture.md) for overall design
3. **On-demand Loading**: Open the corresponding module document for your development phase
4. **Backend Development**: Refer to [backend-api.md](./backend-api.md) and [backend-impl.md](./backend-impl.md)
5. **Frontend Development**: Refer to [frontend-api.md](./frontend-api.md) and [frontend-impl.md](./frontend-impl.md)

---

*This document follows SDD specification and includes technical implementation details (SQL, code, file paths)*
