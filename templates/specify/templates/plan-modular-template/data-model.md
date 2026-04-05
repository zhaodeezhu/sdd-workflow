# Data Model

> This document describes database design (DDL) and data transfer objects (DTO)

## 1. Database Design

### 1.1 New Tables

#### Table: {table_name}

**Description**: {table_purpose}

**DDL**:

```sql
CREATE TABLE {table_name} (
    id BIGSERIAL PRIMARY KEY,
    {column_name} VARCHAR(100) NOT NULL,
    created_by VARCHAR(50) NOT NULL,
    created_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50),
    updated_time TIMESTAMP,
    CONSTRAINT uk_{table_name}_{column} UNIQUE ({column_name})
);

CREATE INDEX idx_{table_name}_{column} ON {table_name}({column_name});

COMMENT ON TABLE {table_name} IS '{table_description}';
COMMENT ON COLUMN {table_name}.{column_name} IS '{column_description}';
```

### 1.2 Modified Tables

#### Table: {existing_table}

**Change Description**: {change_reason}

**DDL**:

```sql
ALTER TABLE {existing_table} ADD COLUMN {new_column} VARCHAR(100);
COMMENT ON COLUMN {existing_table}.{new_column} IS '{column_description}';
```

### 1.3 Entity Relationship Diagram

```
┌─────────────┐         ┌─────────────┐
│   Table A   │ 1     N │   Table B   │
│─────────────│─────────│─────────────│
│ id (PK)     │         │ id (PK)     │
│ name        │         │ a_id (FK)   │
└─────────────┘         └─────────────┘
```

## 2. DTO Design

### 2.1 Request DTO

#### {Name}RequestDTO

**Purpose**: {purpose_description}

```{dto_language}
class {Name}RequestDTO {
    /** {field_description} */
    {field1}: {type}  // required

    /** {field_description} */
    {field2}: {type}  // optional
}
```

### 2.2 Response DTO

#### {Name}ResponseDTO

**Purpose**: {purpose_description}

```{dto_language}
class {Name}ResponseDTO {
    {id}: {type}
    {field1}: {type}
    {field2}: {type}
}
```

### 2.3 DTO Conversion

```{dto_language}
// Entity -> DTO
function toDTO(entity) {
    return {
        id: entity.id,
        field1: entity.field1,
        // ...
    };
}

// DTO -> Entity
function toEntity(dto) {
    return {
        field1: dto.field1,
        // ...
    };
}
```

## 3. Data Dictionary

### 3.1 Enum Types

#### {EnumName}

| Value | Description | Notes |
|-------|-------------|-------|
| VALUE1 | Description 1 | Notes 1 |
| VALUE2 | Description 2 | Notes 2 |

### 3.2 State Transitions

```
Initial -> Processing -> Complete
         |
       Failed
```

---

Back to [Plan Index](./README.md)
