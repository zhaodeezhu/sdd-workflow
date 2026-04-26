# 性能优化

> 本文档描述性能优化方案

## 1. 数据库优化

### 1.1 索引设计

```sql
-- 单列索引
CREATE INDEX idx_{table}_{column} ON {table}({column});

-- 复合索引
CREATE INDEX idx_{table}_{col1}_{col2} ON {table}({col1}, {col2});

-- 唯一索引
CREATE UNIQUE INDEX uk_{table}_{column} ON {table}({column});
```

### 1.2 查询优化

- 避免 SELECT *
- 使用分页查询
- 避免 N+1 查询
- 使用批量操作

```java
// ❌ N+1 查询
for (Order order : orders) {
    List<Item> items = itemRepository.findByOrderId(order.getId());
}

// ✅ 批量查询
List<Long> orderIds = orders.stream().map(Order::getId).collect(Collectors.toList());
Map<Long, List<Item>> itemsMap = itemRepository.findByOrderIds(orderIds);
```

## 2. 缓存策略

### 2.1 Redis 缓存

```java
@Cacheable(value = "user", key = "#id")
public User getById(Long id) {
    return userRepository.selectById(id);
}

@CacheEvict(value = "user", key = "#id")
public void update(Long id, User user) {
    userRepository.updateById(user);
}
```

### 2.2 缓存失效策略

- 主动失效：更新/删除时清除缓存
- 被动失效：设置过期时间（TTL）
- 缓存预热：系统启动时加载热点数据

## 3. 前端优化

### 3.1 代码分割

```javascript
// 路由懒加载
const List = LoadableComponent(() => import('./List'));
```

### 3.2 列表优化

- 虚拟滚动（大数据量）
- 分页加载
- 防抖/节流

```javascript
// 防抖
const debouncedSearch = debounce(handleSearch, 300);

// 节流
const throttledScroll = throttle(handleScroll, 100);
```

## 4. 接口优化

### 4.1 批量接口

```java
// 批量查询
@PostMapping("/batch")
public ResponseEntity<RestResponse> batchGet(@RequestBody List<Long> ids) {
    List<DTO> result = service.batchGetByIds(ids);
    return ResponseFactory.getOkResponse(result);
}
```

### 4.2 异步处理

```java
@Async
public CompletableFuture<Result> asyncProcess(Request request) {
    // 异步处理
    return CompletableFuture.completedFuture(result);
}
```

## 5. 性能监控

### 5.1 慢查询监控

```sql
-- 开启慢查询日志
SET slow_query_log = ON;
SET long_query_time = 1;
```

### 5.2 接口性能监控

- 响应时间监控
- QPS 监控
- 错误率监控

---

返回 [计划索引](./README.md)
