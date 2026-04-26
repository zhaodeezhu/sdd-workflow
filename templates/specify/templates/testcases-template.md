# 测试用例设计 (Test Cases)

> 功能编号: {feature_id}
> 关联规格: {spec_file}
> 创建日期: {date}
> 状态: 草稿
> 测试优先原则: 先写测试，再写实现

---

## 〇、测试策略

### 0.1 测试金字塔

```
        /\
       /  \      E2E测试 (10%)
      /----\     - 关键用户流程
     /      \
    /--------\   集成测试 (20%)
   /          \  - API集成
  /            \ - 数据库交互
 /--------------\
/                \ 单元测试 (70%)
------------------  - 业务逻辑
                    - 工具函数
                    - 边界条件
```

### 0.2 测试覆盖目标

| 测试类型 | 覆盖率目标 | 优先级 |
|----------|------------|--------|
| 单元测试 | >= 80% | P0 |
| 集成测试 | 核心流程100% | P0 |
| E2E测试 | 关键路径 | P1 |

### 0.3 测试优先原则

> **Test-First Development**

1. **先写测试，再写实现**: 每个功能点必须有对应的测试用例
2. **测试即文档**: 测试用例是活的文档，描述系统行为
3. **红-绿-重构**: 先让测试失败，再让测试通过，最后优化代码
4. **边界优先**: 优先测试边界条件和异常场景

---

## 一、后端测试用例

### 1.1 单元测试

#### 1.1.1 领域服务测试

**测试目标**: `{DomainService}`

| ID | 测试场景 | Given | When | Then | 优先级 |
|----|----------|-------|------|------|--------|
| UT-001 | {scenario} | {given} | {when} | {then} | P0 |
| UT-002 | {scenario} | {given} | {when} | {then} | P0 |
| UT-003 | 边界条件-空输入 | 输入为null | 调用方法 | 抛出IllegalArgumentException | P0 |
| UT-004 | 边界条件-无效参数 | 输入不满足校验规则 | 调用方法 | 抛出BusinessException | P0 |

**测试代码骨架**:
```java
// 文件: cplm-software-test/src/test/java/.../{DomainService}Test.java
@SpringBootTest
public class {DomainService}Test {

    @Autowired
    private {DomainService} {domainService};

    // UT-001: 正常场景
    @Test
    public void test_{scenario}_success() {
        // Given
        {given_code}

        // When
        {when_code}

        // Then
        {then_code}
    }

    // UT-003: 边界条件-空输入
    @Test
    public void test_{scenario}_nullInput_throwsException() {
        // Given
        {input} = null;

        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            {domainService}.{method}({input});
        });
    }
}
```

#### 1.1.2 工具类测试

**测试目标**: `{UtilsClass}`

| ID | 测试场景 | 输入 | 期望输出 | 优先级 |
|----|----------|------|----------|--------|
| UT-010 | {scenario} | {input} | {expected} | P1 |

---

### 1.2 集成测试

#### 1.2.1 仓储层测试

**测试目标**: `{Repository}`

| ID | 测试场景 | 操作 | 验证点 | 优先级 |
|----|----------|------|--------|--------|
| IT-001 | 新增记录 | insert | 记录存在，字段正确 | P0 |
| IT-002 | 查询记录 | findById | 返回正确实体 | P0 |
| IT-003 | 更新记录 | update | 字段更新正确 | P0 |
| IT-004 | 删除记录 | delete | 记录不存在 | P0 |
| IT-005 | 批量查询 | findByIds | 返回正确数量和内容 | P1 |

**测试代码骨架**:
```java
// 文件: cplm-software-test/src/test/java/.../{Repository}Test.java
@SpringBootTest
@Transactional
public class {Repository}Test {

    @Autowired
    private {Repository} {repository};

    // IT-001: 新增记录
    @Test
    public void test_insert_success() {
        // Given
        {Entity} entity = {Entity}Builder.build();

        // When
        {repository}.insert(entity);

        // Then
        {Entity} saved = {repository}.findById(entity.getId());
        assertNotNull(saved);
        assertEquals(entity.{getField}(), saved.{getField}());
    }
}
```

#### 1.2.2 API接口测试

**测试目标**: `{Controller}`

| ID | 接口 | 方法 | 场景 | 请求 | 期望响应 | 优先级 |
|----|------|------|------|------|----------|--------|
| API-001 | {path} | POST | 正常创建 | {request} | 200 + data | P0 |
| API-002 | {path} | POST | 参数校验失败 | 缺少必填字段 | 400 + 错误信息 | P0 |
| API-003 | {path} | POST | 业务异常 | 违反业务规则 | 500 + 业务错误 | P0 |
| API-004 | {path} | GET | 正常查询 | {params} | 200 + 列表 | P0 |
| API-005 | {path} | GET | 空结果 | 无匹配数据 | 200 + 空列表 | P1 |

**测试代码骨架**:
```java
// 文件: cplm-software-test/src/test/java/.../{Controller}Test.java
@SpringBootTest
@AutoConfigureMockMvc
public class {Controller}Test {

    @Autowired
    private MockMvc mockMvc;

    // API-001: 正常创建
    @Test
    public void test_create_success() throws Exception {
        // Given
        String request = "{json_request}";

        // When & Then
        mockMvc.perform(post("{path}")
                .contentType(MediaType.APPLICATION_JSON)
                .content(request))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.id").exists());
    }

    // API-002: 参数校验失败
    @Test
    public void test_create_missingRequiredField_returns400() throws Exception {
        // Given
        String request = "{}"; // 缺少必填字段

        // When & Then
        mockMvc.perform(post("{path}")
                .contentType(MediaType.APPLICATION_JSON)
                .content(request))
            .andExpect(status().isBadRequest());
    }
}
```

---

## 二、前端测试用例

### 2.1 组件测试

#### 2.1.1 页面组件测试

**测试目标**: `{PageComponent}`

| ID | 测试场景 | 操作 | 期望结果 | 优先级 |
|----|----------|------|----------|--------|
| FT-001 | 组件渲染 | 渲染组件 | 组件正常显示 | P0 |
| FT-002 | 数据加载 | 组件挂载 | 发起API请求 | P0 |
| FT-003 | 交互响应 | 点击按钮 | 触发回调 | P0 |
| FT-004 | 表单校验 | 提交无效数据 | 显示错误提示 | P0 |
| FT-005 | 空状态 | 无数据 | 显示空状态提示 | P1 |

**测试代码骨架**:
```javascript
// 文件: cap-front/frontend/src/pages/{module}/{Feature}/__tests__/index.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {Feature}Page from '../index';

describe('{Feature}Page', () => {
  // FT-001: 组件渲染
  it('should render correctly', () => {
    render(<{Feature}Page />);
    expect(screen.getByText('{expected_text}')).toBeInTheDocument();
  });

  // FT-003: 交互响应
  it('should trigger callback when button clicked', () => {
    const onClick = jest.fn();
    render(<{Feature}Page />);

    fireEvent.click(screen.getByRole('button', { name: /{button_text}/i }));

    expect(onClick).toHaveBeenCalled();
  });
});
```

### 2.2 Store测试

**测试目标**: `{Feature}Store`

| ID | 测试场景 | 操作 | 期望状态 | 优先级 |
|----|----------|------|----------|--------|
| ST-001 | 初始状态 | 创建Store | 状态为初始值 | P0 |
| ST-002 | 状态更新 | 调用action | 状态正确更新 | P0 |
| ST-003 | 异步操作 | 调用async action | loading状态正确 | P0 |
| ST-004 | 错误处理 | API失败 | 错误状态正确 | P0 |

---

## 三、端到端测试 (E2E)

### 3.1 关键用户流程

#### 流程1: {flow_name}

**前置条件**:
- 用户已登录
- {other_preconditions}

**测试步骤**:

| 步骤 | 操作 | 期望结果 |
|------|------|----------|
| 1 | 打开{page}页面 | 页面正常加载 |
| 2 | 点击{button} | {expected_result} |
| 3 | 填写表单 | 表单验证通过 |
| 4 | 提交 | 成功提示，数据保存 |

**E2E测试代码骨架**:
```javascript
// 文件: e2e/{feature}.spec.js (Playwright/Cypress)
describe('{Feature} E2E Tests', () => {

  // E2E-001: 完整用户流程
  it('should complete {flow_name} successfully', async () => {
    // 步骤1: 打开页面
    await page.goto('{page_url}');
    await expect(page.locator('{selector}')).toBeVisible();

    // 步骤2: 点击按钮
    await page.click('button:has-text("{button_text}")');

    // 步骤3: 填写表单
    await page.fill('input[name="{field}"]', '{value}');

    // 步骤4: 提交
    await page.click('button[type="submit"]');

    // 验证成功
    await expect(page.locator('.success-message')).toBeVisible();
  });
});
```

### 3.2 E2E 自动化配置

**E2E 自动化配置**:

```yaml
e2e_config:
  # Console 监控
  console:
    ignore_warnings: true
    allowed_patterns:
      - "DevTools"
      - "[HMR]"

  # 网络请求验证
  network:
    verify_apis:
      - path: /api/xxx
        method: POST
        expect_status: 200
        expect_data:
          status: 0

  # 性能指标
  performance:
    max_lcp: 3000
    max_fcp: 1500

  # 截图配置
  screenshot:
    on_step: [1, 4, 5]
    on_error: true

  # 问题处理
  on_failure: pause  # pause | continue | auto_fix
```

**测试数据**:

```yaml
test_data:
  fieldName: "E2E测试_${timestamp}"
```

---

## 四、边界条件测试

### 4.1 输入边界

| ID | 边界类型 | 输入值 | 期望行为 | 优先级 |
|----|----------|--------|----------|--------|
| B-001 | 空值 | null/empty | 拒绝，提示错误 | P0 |
| B-002 | 最大长度 | 超过限制 | 截断或拒绝 | P0 |
| B-003 | 最小值 | 小于最小值 | 拒绝 | P0 |
| B-004 | 最大值 | 大于最大值 | 拒绝 | P0 |
| B-005 | 特殊字符 | SQL/XSS字符 | 转义或拒绝 | P0 |

### 4.2 业务边界

| ID | 边界场景 | 条件 | 期望行为 | 优先级 |
|----|----------|------|----------|--------|
| B-010 | 并发操作 | 同时修改同一记录 | 锁定或乐观锁提示 | P0 |
| B-011 | 权限边界 | 无权限用户访问 | 拒绝访问 | P0 |
| B-012 | 数据依赖 | 依赖数据不存在 | 提示错误 | P0 |

---

## 五、性能测试

### 5.1 接口性能

| ID | 接口 | 并发数 | 期望响应时间 | 期望TPS | 优先级 |
|----|------|--------|--------------|---------|--------|
| PT-001 | {api} | 10 | < 200ms | > 50 | P1 |
| PT-002 | {api} | 100 | < 500ms | > 100 | P1 |

### 5.2 大数据量测试

| ID | 场景 | 数据量 | 期望行为 | 优先级 |
|----|------|--------|----------|--------|
| PT-010 | 列表查询 | 10000条 | 分页正常 | P1 |
| PT-011 | 批量导入 | 1000条 | < 30s | P2 |

---

## 六、测试数据准备

### 6.1 测试数据

```sql
-- 测试用户
INSERT INTO cplm.obj_item (id, name, class_id) VALUES
('TEST_USER_001', '测试用户1', 'user_class_id');

-- 测试物料
INSERT INTO cplm.obj_item (id, name, class_id) VALUES
('TEST_MATERIAL_001', '测试物料1', 'material_class_id');
```

### 6.2 Mock数据

```javascript
// mock/{feature}.mock.js
export const mock{Feature}Data = {
  id: 'test_id',
  name: '测试名称',
  // ...
};
```

---

## 七、测试执行计划

### 7.1 执行顺序

```
1. 单元测试 (UT-*)     → 每次提交自动执行
2. 集成测试 (IT-*)     → 合并前执行
3. API测试 (API-*)     → 部署后执行
4. 前端测试 (FT-*)     → 每次提交自动执行
5. E2E测试 (E2E-*)     → 发布前执行
6. 性能测试 (PT-*)     → 压测环境执行
```

### 7.2 通过标准

| 阶段 | 通过标准 |
|------|----------|
| 单元测试 | 100%通过，覆盖率>=80% |
| 集成测试 | 100%通过 |
| API测试 | 100%通过 |
| 前端测试 | 100%通过 |
| E2E测试 | 关键路径100%通过 |
| 性能测试 | 满足性能指标 |

---

## 八、测试与实现的映射

> **重要**: 每个测试用例必须关联到实现任务

| 测试用例ID | 关联实现任务 | 验证内容 |
|------------|--------------|----------|
| UT-001~004 | Task 1.4 领域服务 | 业务逻辑正确性 |
| IT-001~005 | Task 1.3 仓储实现 | 数据持久化 |
| API-001~005 | Task 1.6 API Controller | 接口契约 |
| FT-001~005 | Task 2.3 页面组件 | UI交互 |
| ST-001~004 | Task 2.2 Store定义 | 状态管理 |

---

## 九、变更记录

| 日期 | 版本 | 变更内容 | 作者 |
|------|------|----------|------|
| {date} | v1.0 | 初始版本 | {author} |

---

*本文档基于SDD测试优先规范模板生成*
*测试先行，确保质量*
