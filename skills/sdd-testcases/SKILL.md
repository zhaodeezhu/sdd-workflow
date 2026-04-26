---
name: sdd-testcases
description: 创建测试用例设计（Test Cases）- 在实现前定义测试场景、边界条件和验收标准。测试优先，确保实现有据可依。
invocable: true
---

# SDD Test Cases - 测试用例设计器

在实现前创建测试用例设计，遵循测试优先原则（Test-First Development）。

## 双模式执行

本 Skill 支持两种执行模式：

- **手动模式**（`/sdd-testcases`）：交互式执行，展示测试统计摘要
- **Agent 模式**（由 `sdd-run` 自动调用）：自动执行，跳过交互确认，直接将结果保存到指定文件

两种模式共享以下所有领域规则，Agent 模式额外遵循 agent prompt 中的执行约束。

## ⚠️ 内容边界：测试用例聚焦行为验证

> 测试用例描述"系统应该表现出什么行为"，而非"系统如何实现"。
> - 测试场景表格中用 **业务语言** 描述 Given/When/Then
> - 代码骨架可以有，但应验证 **业务行为** 而非 **实现细节**
> - 测试方法名用 **业务动作** 命名，不暴露内部实现方式

### 示例对比

**❌ 过度暴露实现**:
```
| UT-020 | checkManyLotNumberForSubLotItem-正常 | 父任务通过 SFW_TASK_MO_LINE_SOURCE 关联了子任务 | 调用checkManyLotNumberForSubLotItem | 通过 findEarliestSubTaskId 找到子任务 |
```

**✅ 聚焦行为验证**:
```
| UT-020 | 子投料单过滤-有关联子任务 | 父任务存在关联的子任务且有投料单数据 | 执行子投料单过滤 | 返回子任务的投料单列表，过滤通过 |
```

## 核心理念

> **测试先行，实现有据**

1. **先写测试，再写实现**: 每个功能点必须有对应的测试用例
2. **测试即文档**: 测试用例描述系统期望行为
3. **红-绿-重构**: 先让测试失败，再让测试通过
4. **边界优先**: 优先覆盖边界条件和异常场景

## 前置条件
- 必须已有功能规格: `.specify/specs/{feature_id}/spec.md`
- 推荐已有项目宪法: `.specify/memory/constitution.md`

## 执行步骤

### 1. 读取规格文档
读取关联的功能规格: `.specify/specs/{feature_id}/spec.md`

重点提取：
- 用户故事和验收标准
- 功能需求列表
- 边界条件和异常处理
- 非功能需求（性能等）

### 2. 分析测试范围

#### 2.1 后端测试范围
- 领域服务业务逻辑
- 仓储层数据操作
- API接口契约
- 边界条件和异常

#### 2.2 前端测试范围
- 组件渲染和交互
- Store状态管理
- API调用和错误处理
- 用户交互流程

### 3. 设计测试用例

#### 3.1 单元测试设计
为每个业务方法设计：
- 正常场景 (Happy Path)
- 边界条件 (Boundary)
- 异常场景 (Exception)
- 空值/null处理

#### 3.2 集成测试设计
- 仓储层CRUD操作
- API接口请求响应
- 数据库事务

#### 3.3 前端测试设计
- 组件渲染测试
- 用户交互测试
- 表单校验测试
- Store状态测试

#### 3.4 E2E测试设计
- 关键用户流程
- 跨页面操作
- 完整业务场景

### 4. 生成测试代码骨架

为每个测试用例生成可执行的代码骨架：
- Java单元测试 (JUnit + Mockito)
- API测试 (MockMvc)
- 前端测试 (Jest + React Testing Library)
- E2E测试 (Playwright)

### 5. 建立测试与实现的映射

| 测试类型 | 关联任务 | 验证内容 |
|----------|----------|----------|
| 单元测试 | Task 1.4 领域服务 | 业务逻辑 |
| 集成测试 | Task 1.3 仓储实现 | 数据持久化 |
| API测试 | Task 1.6 Controller | 接口契约 |
| 前端测试 | Task 2.3 页面组件 | UI交互 |

### 6. 保存文档
保存到: `.specify/specs/{feature_id}/testcases.md`

### 7. 输出摘要

```
✅ 测试用例设计已生成: .specify/specs/{feature_id}/testcases.md

📊 测试用例统计：
┌─────────────┬────────┬──────────┐
│ 测试类型    │ 用例数 │ 优先级   │
├─────────────┼────────┼──────────┤
│ 单元测试    │ 15     │ P0       │
│ 集成测试    │ 8      │ P0       │
│ API测试     │ 10     │ P0       │
│ 前端测试    │ 12     │ P0       │
│ E2E测试     │ 3      │ P1       │
│ 边界测试    │ 8      │ P0       │
├─────────────┼────────┼──────────┤
│ 总计        │ 56     │          │
└─────────────┴────────┴──────────┘

🔗 测试与实现映射：
- UT-001~015 → Task 1.4 领域服务
- IT-001~008 → Task 1.3 仓储实现
- API-001~010 → Task 1.6 Controller
- FT-001~012 → Task 2.3 页面组件

📋 下一步：
1. 审查测试用例设计
2. 运行 /sdd-plan 生成技术实现计划
3. 实现时先写测试，再写实现
```

## 测试用例设计规范

### 命名规范

#### Java测试方法
```java
// 格式: test_{方法名}_{场景}_{期望结果}
@Test
public void test_createOrder_validInput_success() { }

@Test
public void test_createOrder_nullInput_throwsException() { }

@Test
public void test_createOrder_insufficientStock_throwsException() { }
```

#### 前端测试
```javascript
// 格式: should {期望行为} when {条件}
it('should display error message when form is invalid', () => { });
it('should submit form when all fields are valid', () => { });
```

### 测试用例ID规范

| 前缀 | 类型 | 示例 |
|------|------|------|
| UT- | 单元测试 | UT-001, UT-002 |
| IT- | 集成测试 | IT-001, IT-002 |
| API- | API测试 | API-001, API-002 |
| FT- | 前端测试 | FT-001, FT-002 |
| ST- | Store测试 | ST-001, ST-002 |
| E2E- | 端到端测试 | E2E-001, E2E-002 |
| B- | 边界测试 | B-001, B-002 |
| PT- | 性能测试 | PT-001, PT-002 |

### Gherkin格式

使用 Given-When-Then 格式描述测试场景：

```gherkin
场景: UT-001 正常创建订单
  Given 用户已登录
  And 购物车中有商品
  When 用户点击提交订单
  Then 系统创建订单
  And 订单状态为"待支付"
```

## 上下游关系

- **上游**: spec.md → 本阶段
- **下游**: 本阶段 → sdd-plan / sdd-tasks / sdd-implement

## 反馈触发点

设计测试用例时，以下情况**必须触发向上反馈**：

1. **验收标准无法写出 Given-When-Then** → spec 中需求描述模糊，反馈回 spec 澄清
2. **发现 spec 未覆盖的异常场景** → 补充到 spec 的用户故事/验收标准中
3. **多个用户故事之间存在矛盾** → 反馈回 spec 统一逻辑

反馈流程：在 testcases.md 中创建 CR 记录 → 修正 spec.md → 同步更新 testcases.md → 继续设计

## 注意事项

1. **覆盖边界**: 每个功能点至少包含正常+异常+边界三种测试
2. **独立性**: 测试用例之间相互独立，可并行执行
3. **可重复**: 测试结果可重复，不依赖外部状态
4. **快速反馈**: 单元测试应快速执行，便于频繁运行
5. **有意义的断言**: 断言应该验证业务价值，而非实现细节
6. **测试数据**: 使用明确的测试数据，避免魔法数字

## 示例输出

```markdown
## 1.1 单元测试

### 测试目标: OrderService

| ID | 测试场景 | Given | When | Then |
|----|----------|-------|------|------|
| UT-001 | 正常创建订单 | 购物车有商品，库存充足 | 调用createOrder | 返回订单ID |
| UT-002 | 库存不足 | 购物车有商品，库存不足 | 调用createOrder | 抛出InsufficientStockException |
| UT-003 | 购物车为空 | 购物车无商品 | 调用createOrder | 抛出EmptyCartException |
| UT-004 | 用户未登录 | 当前用户为null | 调用createOrder | 抛出UnauthorizedException |
```
