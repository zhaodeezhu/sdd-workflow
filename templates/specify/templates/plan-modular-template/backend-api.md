# 后端 API 设计

> 本文档描述后端 REST API 接口定义

## 1. Controller 设计

### 1.1 Controller 类

**文件路径**: `cplm-pdm/.../controller/{Name}Controller.java`

```java
@RestController
@RequestMapping("/v1/{module}/{resource}")
public class {Name}Controller {

    @Autowired
    private {Name}Service service;

    // API 方法定义见下文
}
```

## 2. API 接口列表

### 2.1 查询接口

#### GET /v1/{module}/{resource}

**功能**: 查询列表

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| keyword | String | 否 | 关键字搜索 |
| status | String | 否 | 状态筛选 |
| pageNum | Integer | 否 | 页码（默认1） |
| pageSize | Integer | 否 | 每页数量（默认20） |

**响应示例**:

```json
{
  "status": "0",
  "message": "success",
  "data": {
    "total": 100,
    "list": [
      {
        "id": "1",
        "name": "名称",
        "status": "ACTIVE"
      }
    ]
  }
}
```

**实现代码**:

```java
@GetMapping
public ResponseEntity<RestResponse> list(
    @RequestParam(required = false) String keyword,
    @RequestParam(required = false) String status,
    @RequestParam(defaultValue = "1") Integer pageNum,
    @RequestParam(defaultValue = "20") Integer pageSize) {

    PageInfo<{Name}DTO> result = service.list(keyword, status, pageNum, pageSize);
    return ResponseFactory.getOkResponse(result);
}
```

### 2.2 详情接口

#### GET /v1/{module}/{resource}/{id}

**功能**: 查询详情

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 资源ID |

**响应示例**:

```json
{
  "status": "0",
  "message": "success",
  "data": {
    "id": "1",
    "name": "名称",
    "description": "描述"
  }
}
```

**实现代码**:

```java
@GetMapping("/{id}")
public ResponseEntity<RestResponse> getById(@PathVariable Long id) {
    {Name}DTO result = service.getById(id);
    return ResponseFactory.getOkResponse(result);
}
```

### 2.3 创建接口

#### POST /v1/{module}/{resource}

**功能**: 创建资源

**请求体**:

```json
{
  "name": "名称",
  "description": "描述"
}
```

**响应示例**:

```json
{
  "status": "0",
  "message": "创建成功",
  "data": {
    "id": "1"
  }
}
```

**实现代码**:

```java
@PostMapping
public ResponseEntity<RestResponse> create(@RequestBody @Valid {Name}RequestDTO request) {
    Long id = service.create(request);
    return ResponseFactory.getOkResponse(id);
}
```

### 2.4 更新接口

#### PUT /v1/{module}/{resource}/{id}

**功能**: 更新资源

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 资源ID |

**请求体**:

```json
{
  "name": "新名称",
  "description": "新描述"
}
```

**响应示例**:

```json
{
  "status": "0",
  "message": "更新成功"
}
```

**实现代码**:

```java
@PutMapping("/{id}")
public ResponseEntity<RestResponse> update(
    @PathVariable Long id,
    @RequestBody @Valid {Name}RequestDTO request) {

    service.update(id, request);
    return ResponseFactory.getOkResponse();
}
```

### 2.5 删除接口

#### DELETE /v1/{module}/{resource}/{id}

**功能**: 删除资源

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 资源ID |

**响应示例**:

```json
{
  "status": "0",
  "message": "删除成功"
}
```

**实现代码**:

```java
@DeleteMapping("/{id}")
public ResponseEntity<RestResponse> delete(@PathVariable Long id) {
    service.delete(id);
    return ResponseFactory.getOkResponse();
}
```

## 3. 统一响应格式

### 3.1 成功响应

```json
{
  "status": "0",
  "message": "success",
  "data": {}
}
```

### 3.2 错误响应

```json
{
  "status": "1",
  "message": "错误信息",
  "data": null
}
```

## 4. 错误码定义

| 错误码 | 说明 | HTTP状态码 |
|--------|------|-----------|
| 0 | 成功 | 200 |
| 1 | 业务错误 | 200 |
| 400 | 参数错误 | 400 |
| 401 | 未认证 | 401 |
| 403 | 无权限 | 403 |
| 404 | 资源不存在 | 404 |
| 500 | 服务器错误 | 500 |

---

返回 [计划索引](./README.md)
