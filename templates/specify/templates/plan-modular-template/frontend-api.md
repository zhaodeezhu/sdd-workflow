# Frontend API Integration

> This document describes how the frontend integrates with backend APIs

## 1. API Service Layer

### 1.1 API File Structure

```
{frontend_source_path}/api/
├── index.{ext}              # API unified exports
├── {module}.{ext}           # Module API definitions
└── request.{ext}            # Request wrapper (existing)
```

### 1.2 API Definition

**File Path**: `{frontend_source_path}/api/{module}.{ext}`

```{frontend_language}
import { request } from '{http_client_path}';

/**
 * Query list
 */
export const list = (params) => {
  return request({
    url: '/v1/{module}/{resource}',
    method: 'GET',
    params
  });
};

/**
 * Query detail
 */
export const getById = (id) => {
  return request({
    url: `/v1/{module}/${id}`,
    method: 'GET'
  });
};

/**
 * Create
 */
export const create = (data) => {
  return request({
    url: '/v1/{module}/{resource}',
    method: 'POST',
    data
  });
};

/**
 * Update
 */
export const update = (id, data) => {
  return request({
    url: `/v1/{module}/${id}`,
    method: 'PUT',
    data
  });
};

/**
 * Delete
 */
export const deleteById = (id) => {
  return request({
    url: `/v1/{module}/${id}`,
    method: 'DELETE'
  });
};
```

## 2. Request Response Handling

### 2.1 Success Response

```{frontend_language}
// Backend response format (adjust to match your API contract)
{
  status: '0',    // Check your project's actual convention (string vs number)
  message: 'success',
  data: {}
}

// Frontend handling
const response = await list({ keyword: 'test' });
if (response.status === '0') {  // Adjust status check to match your project
  console.log(response.data);
}
```

### 2.2 Error Handling

```{frontend_language}
try {
  const response = await create(data);
  if (response.status === '0') {
    // Success handling
  } else {
    // Business error handling
  }
} catch (error) {
  // Network error handling
  console.error(error);
}
```

## 3. Notes

### 3.1 Response Status Check

**Important**: Check your project's API response convention for the status field type and success value.

### 3.2 Error Handling

- Network errors: catch with try-catch
- Business errors: check response status
- User notification: use appropriate UI feedback

---

Back to [Plan Index](./README.md)
