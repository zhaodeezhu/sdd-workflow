# Test Case Design (Test Cases)

> Feature ID: {feature_id}
> Related Spec: {spec_file}
> Created: {date}
> Status: Draft
> Test-First Principle: Write tests before implementation

---

## 0. Test Strategy

### 0.1 Test Pyramid

```
        /\
       /  \      E2E Tests (10%)
      /----\     - Critical user flows
     /      \
    /--------\   Integration Tests (20%)
   /          \  - API integration
  /            \ - Database interaction
 /--------------\
/                \ Unit Tests (70%)
------------------  - Business logic
                    - Utility functions
                    - Boundary conditions
```

### 0.2 Test Coverage Targets

| Test Type | Coverage Target | Priority |
|-----------|----------------|----------|
| Unit Tests | >= 80% | P0 |
| Integration Tests | Core flows 100% | P0 |
| E2E Tests | Critical paths | P1 |

### 0.3 Test-First Principles

> **Test-First Development**

1. **Write tests first, then implement**: Every feature must have corresponding test cases
2. **Tests as documentation**: Test cases are living documentation describing system behavior
3. **Red-Green-Refactor**: Make tests fail, then pass, then optimize code
4. **Boundaries first**: Prioritize testing boundary conditions and exception scenarios

---

## 1. Backend Test Cases

### 1.1 Unit Tests

#### 1.1.1 Service Layer Tests

**Test Target**: `{ServiceClass}`

| ID | Test Scenario | Given | When | Then | Priority |
|----|---------------|-------|------|------|----------|
| UT-001 | {scenario} | {given} | {when} | {then} | P0 |
| UT-002 | {scenario} | {given} | {when} | {then} | P0 |
| UT-003 | Boundary - null input | Input is null | Call method | Throws IllegalArgumentException | P0 |
| UT-004 | Boundary - invalid params | Input violates validation rules | Call method | Throws BusinessException | P0 |

**Test Code Skeleton**:
```{test_language}
// File: {backend_test_path}/{ServiceClass}Test.{test_file_ext}
// Test framework: {test_framework}

// UT-001: Normal scenario
test("{scenario} success", () => {
    // Given
    {given_code}

    // When
    {when_code}

    // Then
    {then_code}
});

// UT-003: Boundary - null input
test("{scenario} nullInput throws exception", () => {
    // Given
    {input} = null;

    // When & Then
    expect(() => {
        {service}.{method}({input});
    }).toThrow();
});
```

#### 1.1.2 Utility Class Tests

**Test Target**: `{UtilsClass}`

| ID | Test Scenario | Input | Expected Output | Priority |
|----|---------------|-------|-----------------|----------|
| UT-010 | {scenario} | {input} | {expected} | P1 |

---

### 1.2 Integration Tests

#### 1.2.1 Repository Layer Tests

**Test Target**: `{Repository}`

| ID | Test Scenario | Operation | Verification | Priority |
|----|---------------|-----------|--------------|----------|
| IT-001 | Insert record | insert | Record exists, fields correct | P0 |
| IT-002 | Query record | findById | Returns correct entity | P0 |
| IT-003 | Update record | update | Fields updated correctly | P0 |
| IT-004 | Delete record | delete | Record does not exist | P0 |
| IT-005 | Batch query | findByIds | Returns correct count and content | P1 |

**Test Code Skeleton**:
```{test_language}
// File: {backend_test_path}/{Repository}Test.{test_file_ext}

// IT-001: Insert record
test("insert success", () => {
    // Given
    {Entity} entity = {Entity}Builder.build();

    // When
    {repository}.insert(entity);

    // Then
    {Entity} saved = {repository}.findById(entity.getId());
    expect(saved).toBeDefined();
    expect(saved.{getField}()).toBe(entity.{getField}());
});
```

#### 1.2.2 API Interface Tests

**Test Target**: `{Controller}`

| ID | Interface | Method | Scenario | Request | Expected Response | Priority |
|----|-----------|--------|----------|---------|-------------------|----------|
| API-001 | {path} | POST | Normal create | {request} | 200 + data | P0 |
| API-002 | {path} | POST | Validation failure | Missing required field | 400 + error | P0 |
| API-003 | {path} | POST | Business exception | Business rule violation | 500 + business error | P0 |
| API-004 | {path} | GET | Normal query | {params} | 200 + list | P0 |
| API-005 | {path} | GET | Empty result | No matching data | 200 + empty list | P1 |

**Test Code Skeleton**:
```{test_language}
// File: {backend_test_path}/{Controller}Test.{test_file_ext}

// API-001: Normal create
test("create success", async () => {
    // Given
    const request = {json_request};

    // When & Then
    const response = await {http_client}.post("{path}", request);
    expect(response.status).toBe(200);
    expect(response.data.id).toBeDefined();
});

// API-002: Validation failure
test("create missingRequiredField returns 400", async () => {
    // Given
    const request = {}; // Missing required fields

    // When & Then
    const response = await {http_client}.post("{path}", request);
    expect(response.status).toBe(400);
});
```

---

## 2. Frontend Test Cases

### 2.1 Component Tests

#### 2.1.1 Page Component Tests

**Test Target**: `{PageComponent}`

| ID | Test Scenario | Operation | Expected Result | Priority |
|----|---------------|-----------|-----------------|----------|
| FT-001 | Component renders | Render component | Component displays normally | P0 |
| FT-002 | Data loading | Component mounts | API request is made | P0 |
| FT-003 | Interaction response | Click button | Callback triggered | P0 |
| FT-004 | Form validation | Submit invalid data | Error message displayed | P0 |
| FT-005 | Empty state | No data | Empty state message shown | P1 |

**Test Code Skeleton**:
```{frontend_test_language}
// File: {frontend_test_path}/{Feature}/__tests__/index.test.{test_file_ext}

describe("{Feature}Page", () => {
  // FT-001: Component renders
  it("should render correctly", () => {
    render(<{Feature}Page />);
    expect(screen.getByText("{expected_text}")).toBeInTheDocument();
  });

  // FT-003: Interaction response
  it("should trigger callback when button clicked", () => {
    const onClick = jest.fn();
    render(<{Feature}Page />);

    fireEvent.click(screen.getByRole("button", { name: /{button_text}/i }));

    expect(onClick).toHaveBeenCalled();
  });
});
```

### 2.2 Store Tests

**Test Target**: `{Feature}Store`

| ID | Test Scenario | Operation | Expected State | Priority |
|----|---------------|-----------|----------------|----------|
| ST-001 | Initial state | Create Store | State is initial values | P0 |
| ST-002 | State update | Call action | State updates correctly | P0 |
| ST-003 | Async operation | Call async action | Loading state correct | P0 |
| ST-004 | Error handling | API failure | Error state correct | P0 |

---

## 3. End-to-End Tests (E2E)

### 3.1 Critical User Flows

#### Flow 1: {flow_name}

**Preconditions**:
- User is logged in
- {other_preconditions}

**Test Steps**:

| Step | Operation | Expected Result |
|------|-----------|-----------------|
| 1 | Open {page} page | Page loads normally |
| 2 | Click {button} | {expected_result} |
| 3 | Fill form | Form validation passes |
| 4 | Submit | Success message, data saved |

**E2E Test Code Skeleton**:
```{e2e_test_language}
// File: e2e/{feature}.spec.{test_file_ext}

describe("{Feature} E2E Tests", () => {

  // E2E-001: Complete user flow
  it("should complete {flow_name} successfully", async () => {
    // Step 1: Open page
    await page.goto("{page_url}");
    await expect(page.locator("{selector}")).toBeVisible();

    // Step 2: Click button
    await page.click("button:has-text(\"{button_text}\")");

    // Step 3: Fill form
    await page.fill("input[name=\"{field}\"]", "{value}");

    // Step 4: Submit
    await page.click("button[type=\"submit\"]");

    // Verify success
    await expect(page.locator(".success-message")).toBeVisible();
  });
});
```

### 3.2 E2E Automation Configuration

**E2E Automation Config**:

```yaml
e2e_config:
  # Console monitoring
  console:
    ignore_warnings: true
    allowed_patterns:
      - "DevTools"
      - "[HMR]"

  # Network request verification
  network:
    verify_apis:
      - path: /api/xxx
        method: POST
        expect_status: 200
        expect_data:
          status: 0

  # Performance metrics
  performance:
    max_lcp: 3000
    max_fcp: 1500

  # Screenshot config
  screenshot:
    on_step: [1, 4, 5]
    on_error: true

  # Failure handling
  on_failure: pause  # pause | continue | auto_fix
```

**Test Data**:

```yaml
test_data:
  fieldName: "E2E_Test_${timestamp}"
```

---

## 4. Boundary Condition Tests

### 4.1 Input Boundaries

| ID | Boundary Type | Input Value | Expected Behavior | Priority |
|----|---------------|-------------|-------------------|----------|
| B-001 | Null/empty | null/empty | Reject, show error | P0 |
| B-002 | Max length | Exceeds limit | Truncate or reject | P0 |
| B-003 | Min value | Below minimum | Reject | P0 |
| B-004 | Max value | Above maximum | Reject | P0 |
| B-005 | Special chars | SQL/XSS characters | Escape or reject | P0 |

### 4.2 Business Boundaries

| ID | Boundary Scenario | Condition | Expected Behavior | Priority |
|----|-------------------|-----------|-------------------|----------|
| B-010 | Concurrent operation | Simultaneous modification | Lock or optimistic lock prompt | P0 |
| B-011 | Permission boundary | Unauthorized user access | Deny access | P0 |
| B-012 | Data dependency | Dependency data not found | Show error | P0 |

---

## 5. Performance Tests

### 5.1 API Performance

| ID | API | Concurrency | Expected Response Time | Expected TPS | Priority |
|----|-----|-------------|------------------------|--------------|----------|
| PT-001 | {api} | 10 | < 200ms | > 50 | P1 |
| PT-002 | {api} | 100 | < 500ms | > 100 | P1 |

### 5.2 Large Data Volume Tests

| ID | Scenario | Data Volume | Expected Behavior | Priority |
|----|----------|-------------|-------------------|----------|
| PT-010 | List query | 10000 records | Pagination works | P1 |
| PT-011 | Batch import | 1000 records | < 30s | P2 |

---

## 6. Test Data Preparation

### 6.1 Test Data

```sql
-- Test data (adjust table names to match your project schema)
INSERT INTO {schema}.{test_table} (id, name, class_id) VALUES
('TEST_DATA_001', 'Test Data 1', 'test_class_id');

INSERT INTO {schema}.{test_table_2} (id, name, class_id) VALUES
('TEST_DATA_002', 'Test Data 2', 'test_class_id');
```

### 6.2 Mock Data

```{frontend_test_language}
// mock/{feature}.mock.js
export const mock{Feature}Data = {
  id: "test_id",
  name: "Test Name",
  // ...
};
```

---

## 7. Test Execution Plan

### 7.1 Execution Order

```
1. Unit Tests (UT-*)      -> Run automatically on each commit
2. Integration Tests (IT-*) -> Run before merge
3. API Tests (API-*)       -> Run after deployment
4. Frontend Tests (FT-*)   -> Run automatically on each commit
5. E2E Tests (E2E-*)       -> Run before release
6. Performance Tests (PT-*) -> Run in performance environment
```

### 7.2 Pass Criteria

| Stage | Pass Criteria |
|-------|---------------|
| Unit Tests | 100% pass, coverage >= 80% |
| Integration Tests | 100% pass |
| API Tests | 100% pass |
| Frontend Tests | 100% pass |
| E2E Tests | Critical paths 100% pass |
| Performance Tests | Meet performance targets |

---

## 8. Test-to-Implementation Mapping

> **Important**: Every test case must map to an implementation task

| Test Case IDs | Related Implementation Task | Verification Content |
|---------------|---------------------------|---------------------|
| UT-001~004 | Task 1.x Service implementation | Business logic correctness |
| IT-001~005 | Task 1.x Repository implementation | Data persistence |
| API-001~005 | Task 1.x API Controller | Interface contract |
| FT-001~005 | Task 2.x Page components | UI interaction |
| ST-001~004 | Task 2.x Store definition | State management |

---

## 9. Change Log

| Date | Version | Change | Author |
|------|---------|--------|--------|
| {date} | v1.0 | Initial version | {author} |

---

*This document is generated based on SDD test-first specification template*
*Tests first, ensure quality*
