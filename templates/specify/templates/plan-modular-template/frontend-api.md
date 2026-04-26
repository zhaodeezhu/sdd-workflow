# 前端 API 对接

> 本文档描述前端如何对接后端 API

## 1. API 服务层

### 1.1 API 文件结构

```
frontend/src/_utils/api/
├── index.js              # API 统一导出
├── {module}.js           # 模块 API 定义
└── request.js            # 请求封装（已存在）
```

### 1.2 API 定义

**文件路径**: `cap-front/frontend/src/_utils/api/{module}.js`

```javascript
import { request } from '~/_utils/http';

// API 服务器标识
const SERVER = 'OBJECT_CLASS_SERVER';

/**
 * 查询列表
 */
export const list = (params) => {
  return request({
    _s: SERVER,
    url: '/v1/{module}/{resource}',
    method: 'GET',
    params
  });
};

/**
 * 查询详情
 */
export const getById = (id) => {
  return request({
    _s: SERVER,
    url: `/v1/{module}/{resource}/${id}`,
    method: 'GET'
  });
};

/**
 * 创建
 */
export const create = (data) => {
  return request({
    _s: SERVER,
    url: '/v1/{module}/{resource}',
    method: 'POST',
    data
  });
};

/**
 * 更新
 */
export const update = (id, data) => {
  return request({
    _s: SERVER,
    url: `/v1/{module}/{resource}/${id}`,
    method: 'PUT',
    data
  });
};

/**
 * 删除
 */
export const deleteById = (id) => {
  return request({
    _s: SERVER,
    url: `/v1/{module}/{resource}/${id}`,
    method: 'DELETE'
  });
};
```

## 2. 请求响应处理

### 2.1 成功响应

```javascript
// 后端返回格式
{
  status: '0',    // 字符串类型！
  message: 'success',
  data: {}
}

// 前端处理
const response = await list({ keyword: 'test' });
if (response.status === '0') {  // 注意：status 是字符串
  console.log(response.data);
}
```

### 2.2 错误处理

```javascript
try {
  const response = await create(data);
  if (response.status === '0') {
    message.success('创建成功');
  } else {
    message.error(response.message || '创建失败');
  }
} catch (error) {
  message.error('网络错误');
  console.error(error);
}
```

## 3. BFF 层配置

### 3.1 API 路径注册

**文件路径**: `cap-front/backend/src/apiPath/modules/{module}.js`

```javascript
module.exports = {
  // 查询列表
  GET_{MODULE}_{RESOURCE}_LIST: {
    method: 'GET',
    uri: '/v1/{module}/{resource}'
  },

  // 查询详情
  GET_{MODULE}_{RESOURCE}_DETAIL: {
    method: 'GET',
    uri: '/v1/{module}/{resource}/:id'
  },

  // 创建
  POST_{MODULE}_{RESOURCE}_CREATE: {
    method: 'POST',
    uri: '/v1/{module}/{resource}'
  },

  // 更新
  PUT_{MODULE}_{RESOURCE}_UPDATE: {
    method: 'PUT',
    uri: '/v1/{module}/{resource}/:id'
  },

  // 删除
  DELETE_{MODULE}_{RESOURCE}_DELETE: {
    method: 'DELETE',
    uri: '/v1/{module}/{resource}/:id'
  }
};
```

### 3.2 导出配置

**文件路径**: `cap-front/backend/src/apiPath/index.js`

```javascript
const {module}Api = require('./modules/{module}');

module.exports = {
  ...{module}Api,
  // 其他模块...
};
```

## 4. 请求示例

### 4.1 查询列表

```javascript
import { list } from '~/_utils/api/{module}';

// 调用
const fetchList = async () => {
  const response = await list({
    keyword: 'test',
    status: 'ACTIVE',
    pageNum: 1,
    pageSize: 20
  });

  if (response.status === '0') {
    return response.data;
  }
  return null;
};
```

### 4.2 创建资源

```javascript
import { create } from '~/_utils/api/{module}';

// 调用
const handleCreate = async (formData) => {
  const response = await create({
    name: formData.name,
    description: formData.description
  });

  if (response.status === '0') {
    message.success('创建成功');
    return response.data.id;
  } else {
    message.error(response.message);
    return null;
  }
};
```

## 5. 注意事项

### 5.1 响应状态判断

**重要**：后端返回的 `status` 是字符串类型，不是数字！

```javascript
// ❌ 错误
if (response.status === 0) { ... }

// ✅ 正确
if (response.status === '0') { ... }
```

### 5.2 请求服务器标识

使用 `_s` 参数指定后端服务器：

```javascript
const SERVER = 'OBJECT_CLASS_SERVER';  // 对象引擎服务器

request({
  _s: SERVER,  // 必须指定
  url: '/v1/...',
  method: 'GET'
});
```

### 5.3 错误处理

- 网络错误：try-catch 捕获
- 业务错误：检查 response.status
- 统一提示：使用 message.error()

---

返回 [计划索引](./README.md)
