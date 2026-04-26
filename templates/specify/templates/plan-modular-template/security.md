# 安全性设计

> 本文档描述安全相关设计

## 1. 认证授权

### 1.1 认证机制

- 使用统一认证平台（SSO）
- Token 存储在 Cookie 中
- Token 过期自动跳转登录页

### 1.2 权限控制

**后端权限控制**：

```java
@PreAuthorize("hasRole('ADMIN')")
public void deleteById(Long id) {
    // 只有管理员可以删除
}
```

**前端权限控制**：

```jsx
{hasPermission('delete') && (
  <Button danger>删除</Button>
)}
```

## 2. 数据安全

### 2.1 敏感数据加密

- 密码使用 BCrypt 加密
- 敏感字段使用 AES 加密存储
- 传输使用 HTTPS

### 2.2 数据脱敏

```java
// 手机号脱敏
public String maskPhone(String phone) {
    return phone.replaceAll("(\\d{3})\\d{4}(\\d{4})", "$1****$2");
}

// 身份证脱敏
public String maskIdCard(String idCard) {
    return idCard.replaceAll("(\\d{6})\\d{8}(\\d{4})", "$1********$2");
}
```

## 3. 接口安全

### 3.1 参数校验

```java
@PostMapping
public ResponseEntity<RestResponse> create(@RequestBody @Valid RequestDTO request) {
    // @Valid 触发参数校验
}
```

### 3.2 SQL 注入防护

- 使用 MyBatis 参数化查询
- 禁止拼接 SQL
- 使用 `#{}` 而不是 `${}`

```xml
<!-- ✅ 正确 -->
<select id="selectById">
    SELECT * FROM table WHERE id = #{id}
</select>

<!-- ❌ 错误 -->
<select id="selectById">
    SELECT * FROM table WHERE id = ${id}
</select>
```

### 3.3 XSS 防护

- 前端输入过滤
- 后端输出转义
- 使用 Content-Security-Policy

```javascript
// 前端过滤
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(dirty);
```

## 4. 日志安全

### 4.1 日志脱敏

```java
@Slf4j
public class LogUtil {
    public static void logSensitive(String message, Object... args) {
        // 脱敏处理
        String masked = maskSensitiveData(message);
        log.info(masked, args);
    }
}
```

### 4.2 日志内容

- 不记录密码
- 不记录完整身份证号
- 不记录银行卡号

---

返回 [计划索引](./README.md)
