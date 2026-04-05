# Backend API Design

> This document describes backend API interface definitions

## 1. API Handler Design

### 1.1 Handler/Controller Class

**File Path**: `{backend_source_path}/controllers/{Name}Controller.{ext}`

```{backend_language}
// {Name}Controller - API endpoints for {module}/{resource}
```

## 2. API Interface List

### 2.1 Query Interface

#### GET /v1/{module}/{resource}

**Purpose**: Query list

**Request Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| keyword | String | No | Keyword search |
| status | String | No | Status filter |
| pageNum | Integer | No | Page number (default 1) |
| pageSize | Integer | No | Page size (default 20) |

**Response Example**:

```json
{
  "status": "0",
  "message": "success",
  "data": {
    "total": 100,
    "list": [
      {
        "id": "1",
        "name": "Name",
        "status": "ACTIVE"
      }
    ]
  }
}
```

### 2.2 Detail Interface

#### GET /v1/{module}/{resource}/{id}

**Purpose**: Query detail

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | Long | Yes | Resource ID |

**Response Example**:

```json
{
  "status": "0",
  "message": "success",
  "data": {
    "id": "1",
    "name": "Name",
    "description": "Description"
  }
}
```

### 2.3 Create Interface

#### POST /v1/{module}/{resource}

**Purpose**: Create resource

**Request Body**:

```json
{
  "name": "Name",
  "description": "Description"
}
```

**Response Example**:

```json
{
  "status": "0",
  "message": "Created successfully",
  "data": {
    "id": "1"
  }
}
```

### 2.4 Update Interface

#### PUT /v1/{module}/{resource}/{id}

**Purpose**: Update resource

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | Long | Yes | Resource ID |

**Request Body**:

```json
{
  "name": "New Name",
  "description": "New Description"
}
```

**Response Example**:

```json
{
  "status": "0",
  "message": "Updated successfully"
}
```

### 2.5 Delete Interface

#### DELETE /v1/{module}/{resource}/{id}

**Purpose**: Delete resource

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | Long | Yes | Resource ID |

**Response Example**:

```json
{
  "status": "0",
  "message": "Deleted successfully"
}
```

## 3. Unified Response Format

### 3.1 Success Response

```json
{
  "status": "0",
  "message": "success",
  "data": {}
}
```

### 3.2 Error Response

```json
{
  "status": "1",
  "message": "Error message",
  "data": null
}
```

## 4. Error Code Definitions

| Error Code | Description | HTTP Status |
|------------|-------------|-------------|
| 0 | Success | 200 |
| 1 | Business error | 200 |
| 400 | Parameter error | 400 |
| 401 | Unauthorized | 401 |
| 403 | Forbidden | 403 |
| 404 | Not found | 404 |
| 500 | Server error | 500 |

---

Back to [Plan Index](./README.md)
