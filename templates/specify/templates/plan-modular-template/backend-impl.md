# Backend Implementation Details

> This document describes backend Service and Repository implementation

## 1. Service Layer Implementation

### 1.1 Service Interface

**File Path**: `{backend_source_path}/services/{Name}Service.{ext}`

```{backend_language}
// {Name}Service interface
// - list(keyword, status, pageNum, pageSize) -> PageInfo
// - getById(id) -> DTO
// - create(request) -> id
// - update(id, request)
// - delete(id)
```

### 1.2 Service Implementation

**File Path**: `{backend_source_path}/services/impl/{Name}ServiceImpl.{ext}`

```{backend_language}
// {Name}ServiceImpl
//
// list():
//   1. Build query conditions
//   2. Execute paginated query
//   3. Convert to DTOs
//
// create():
//   1. Validate parameters
//   2. Convert to entity
//   3. Save to database
//   4. Return ID
//
// update():
//   1. Check resource exists
//   2. Validate parameters
//   3. Business rule validation
//   4. Convert and update
//
// delete():
//   1. Check resource exists
//   2. Check can delete (dependency check)
//   3. Execute delete
```

## 2. Repository/Data Access Layer Implementation

### 2.1 Repository Interface

**File Path**: `{backend_source_path}/repositories/{Name}Repository.{ext}`

```{backend_language}
// {Name}Repository interface
// - selectByQuery(query) -> List<Entity>
// - selectById(id) -> Entity
// - insert(entity) -> int
// - updateById(entity) -> int
// - deleteById(id) -> int
```

### 2.2 Query Mapping

**File Path**: `{backend_source_path}/mappers/{Name}Mapper.{ext}`

```{mapper_language}
<!-- Result mapping for {table_name} -->
<!-- Base columns: id, name, description, status, created_by, created_time, updated_by, updated_time -->

<!-- Query list with dynamic conditions (keyword search, status filter) -->
<!-- Query by ID -->
<!-- Insert -->
<!-- Update (dynamic set) -->
<!-- Delete -->
```

## 3. Entity/Model Classes

**File Path**: `{backend_source_path}/models/{Name}Entity.{ext}`

```{backend_language}
// {Name}Entity - maps to {table_name} table
// Fields:
// - id: primary key
// - name: name
// - description: description
// - status: status
// - createdBy: creator
// - createdTime: creation time
// - updatedBy: updater
// - updatedTime: update time
```

## 4. Business Logic Notes

### 4.1 Core Business Flows

1. **Create Flow**:
   - Parameter validation
   - Business rule validation
   - Data conversion
   - Save to database
   - Return ID

2. **Update Flow**:
   - Check resource exists
   - Parameter validation
   - Business rule validation
   - Data conversion
   - Update database

3. **Delete Flow**:
   - Check resource exists
   - Check can delete (dependency check)
   - Execute delete

### 4.2 Transaction Management

- All write operations (create, update, delete) use transactions
- Query operations do not use transactions
- Use default transaction propagation

### 4.3 Exception Handling

- Parameter errors: Throw validation exceptions
- Business errors: Throw business exceptions
- System errors: Throw system exceptions

---

Back to [Plan Index](./README.md)
