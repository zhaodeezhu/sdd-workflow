# 数据模型

> 本文档描述数据库设计（DDL）和数据传输对象（DTO）

## 1. 数据库设计

### 1.1 新增表

#### 表名: {table_name}

**表说明**: {表的用途描述}

**DDL**:

```sql
CREATE TABLE {table_name} (
    id BIGSERIAL PRIMARY KEY,
    {column_name} VARCHAR(100) NOT NULL COMMENT '{字段说明}',
    created_by VARCHAR(50) NOT NULL,
    created_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50),
    updated_time TIMESTAMP,
    CONSTRAINT uk_{table_name}_{column} UNIQUE ({column_name})
);

CREATE INDEX idx_{table_name}_{column} ON {table_name}({column_name});

COMMENT ON TABLE {table_name} IS '{表说明}';
COMMENT ON COLUMN {table_name}.{column_name} IS '{字段说明}';
```

### 1.2 修改表

#### 表名: {existing_table}

**变更说明**: {变更原因}

**DDL**:

```sql
ALTER TABLE {existing_table} ADD COLUMN {new_column} VARCHAR(100);
COMMENT ON COLUMN {existing_table}.{new_column} IS '{字段说明}';
```

### 1.3 实体关系图

```
┌─────────────┐         ┌─────────────┐
│   Table A   │ 1     N │   Table B   │
│─────────────│─────────│─────────────│
│ id (PK)     │         │ id (PK)     │
│ name        │         │ a_id (FK)   │
└─────────────┘         └─────────────┘
```

## 2. DTO 设计

### 2.1 请求 DTO

#### {Name}RequestDTO

**用途**: {用途说明}

```java
public class {Name}RequestDTO {
    /** {字段说明} */
    @NotNull(message = "{字段}不能为空")
    private String field1;

    /** {字段说明} */
    @Size(max = 100, message = "{字段}长度不能超过100")
    private String field2;

    // getters and setters
}
```

### 2.2 响应 DTO

#### {Name}ResponseDTO

**用途**: {用途说明}

```java
public class {Name}ResponseDTO {
    /** {字段说明} */
    private Long id;

    /** {字段说明} */
    private String field1;

    /** {字段说明} */
    private String field2;

    // getters and setters
}
```

### 2.3 DTO 转换

```java
// Entity -> DTO
public {Name}ResponseDTO toDTO({Name}Entity entity) {
    {Name}ResponseDTO dto = new {Name}ResponseDTO();
    dto.setId(entity.getId());
    dto.setField1(entity.getField1());
    return dto;
}

// DTO -> Entity
public {Name}Entity toEntity({Name}RequestDTO dto) {
    {Name}Entity entity = new {Name}Entity();
    entity.setField1(dto.getField1());
    return entity;
}
```

## 3. 数据字典

### 3.1 枚举类型

#### {EnumName}

| 值 | 说明 | 备注 |
|----|------|------|
| VALUE1 | 说明1 | 备注1 |
| VALUE2 | 说明2 | 备注2 |

### 3.2 状态流转

```
初始状态 → 处理中 → 完成
         ↓
       失败
```

---

返回 [计划索引](./README.md)
