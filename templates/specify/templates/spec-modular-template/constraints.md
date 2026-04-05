# Constraints and Non-Functional Requirements

> This document describes technical constraints, performance requirements, security requirements and other non-functional requirements

## 1. Technical Constraints

### 1.1 Technology Stack Constraints

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Frontend Framework | {frontend_framework} | {frontend_version} | {frontend_notes} |
| UI Library | {ui_library} | {ui_version} | {ui_notes} |
| Backend Framework | {backend_framework} | {backend_version} | {backend_notes} |
| Database | {database} | {database_version} | {database_notes} |

> Fill in from constitution.md or project configuration.

### 1.2 Compatibility Constraints

**Browser Compatibility**:
- Chrome 90+
- Edge 90+
- Firefox 88+
- Safari 14+

**Mobile Compatibility**:
- {mobile_support_policy}

### 1.3 Dependency Constraints

**Restricted Technologies**:
- No new third-party libraries without approval
- No framework version changes without approval

## 2. Performance Requirements

### 2.1 Response Time

| Operation | Target Response Time | Max Response Time |
|-----------|---------------------|-------------------|
| Page load | < 2s | < 5s |
| List query | < 1s | < 3s |
| Detail query | < 500ms | < 2s |
| Data save | < 1s | < 3s |

### 2.2 Concurrency Requirements

- Support {concurrent_users} concurrent users
- Peak QPS: {peak_qps}

### 2.3 Data Volume Requirements

- Max records per query: 1000
- Page size: 20-100 records

## 3. Security Requirements

### 3.1 Authentication & Authorization

- Must use unified authentication
- Support role-based access control
- Sensitive operations require confirmation

### 3.2 Data Security

- Sensitive data must be encrypted at rest
- Logs must not contain sensitive information
- Support data masking

### 3.3 Interface Security

- All APIs must require authentication
- Prevent SQL injection
- Prevent XSS attacks

## 4. Availability Requirements

### 4.1 System Availability

- Availability target: 99.9%
- Planned downtime: no more than 2 hours per month

### 4.2 Fault Tolerance

- Support graceful degradation
- Critical operations support retry
- Friendly error messages for exceptions

## 5. Maintainability Requirements

### 5.1 Code Standards

- Follow project code conventions
- Must pass lint/style checks
- Critical logic must have comments

### 5.2 Logging Standards

- Critical operations must be logged
- Log level usage follows conventions
- Include necessary context information

### 5.3 Documentation Requirements

- API documentation must be complete
- Complex logic must have design documentation
- Changes must update documentation

## 6. Other Constraints

### 6.1 Database Constraints

- No direct modification of production database
- DDL changes must be approved
- Must provide rollback plan

### 6.2 Deployment Constraints

- Must support gradual rollout
- Must provide health check endpoint
- Must support quick rollback

---

Back to [Specification Index](./README.md)
