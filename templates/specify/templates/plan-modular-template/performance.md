# Performance Optimization

> This document describes performance optimization strategies

## 1. Database Optimization

### 1.1 Index Design

```sql
-- Single column index
CREATE INDEX idx_{table}_{column} ON {table}({column});

-- Composite index
CREATE INDEX idx_{table}_{col1}_{col2} ON {table}({col1}, {col2});

-- Unique index
CREATE UNIQUE INDEX uk_{table}_{column} ON {table}({column});
```

### 1.2 Query Optimization

- Avoid SELECT *
- Use pagination
- Avoid N+1 queries
- Use batch operations

```
// Bad: N+1 query
for each item in items:
    query database for item details

// Good: Batch query
collect all item IDs
query database for all item details at once
use Map for lookup
```

## 2. Caching Strategy

### 2.1 Application Cache

```
// Cache frequently accessed data
// Invalidate cache on update/delete
// Set appropriate TTL
```

### 2.2 Cache Invalidation Strategy

- Active invalidation: Clear cache on update/delete
- Passive invalidation: Set expiration time (TTL)
- Cache warmup: Load hot data on system startup

## 3. Frontend Optimization

### 3.1 Code Splitting

```
// Route-level lazy loading
// Load components on demand
```

### 3.2 List Optimization

- Virtual scrolling (for large data sets)
- Pagination
- Debounce/throttle user input

```
// Debounce search input
const debouncedSearch = debounce(handleSearch, 300);

// Throttle scroll handler
const throttledScroll = throttle(handleScroll, 100);
```

## 4. API Optimization

### 4.1 Batch APIs

```
// Batch query endpoint
// POST /batch with list of IDs
// Returns map of ID to data
```

### 4.2 Async Processing

```
// Long-running operations processed asynchronously
// Return task ID, poll for completion
```

## 5. Performance Monitoring

### 5.1 Slow Query Monitoring

```sql
-- Enable slow query log
-- Set appropriate threshold
-- Monitor and optimize slow queries
```

### 5.2 API Performance Monitoring

- Response time monitoring
- QPS monitoring
- Error rate monitoring

---

Back to [Plan Index](./README.md)
