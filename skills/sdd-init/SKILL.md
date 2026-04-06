---
name: sdd-init
description: 初始化 SDD 工作流 - 分析项目结构，生成项目宪法，适配 SDD 配置
invocable: true
---

# SDD Init - 项目初始化

> 首次在项目中使用 SDD 时运行此命令，自动分析项目并生成项目宪法。

## 核心定位

> SDD Init 是 SDD 工作流的入口点。它分析项目结构、技术栈、架构模式，
> 生成一份项目宪法（constitution.md），作为后续所有 SDD 命令的上下文基础。

## 执行步骤

### 1. 项目结构探测

#### 1.1 探测项目类型

扫描项目根目录，识别项目类型：

| 文件标识 | 项目类型 |
|---------|---------|
| `package.json` | Node.js / 前端 |
| `pom.xml` | Java Maven |
| `build.gradle` / `build.gradle.kts` | Java Gradle / Kotlin |
| `go.mod` | Go |
| `Cargo.toml` | Rust |
| `requirements.txt` / `pyproject.toml` | Python |
| `.csproj` / `.sln` | .NET |
| 以上都有 | 全栈 / Monorepo |

#### 1.2 探测技术栈

**前端技术栈**（如果有 package.json）：
- 框架：React / Vue / Angular / Svelte / Next.js / Nuxt
- UI 库：Ant Design / Material UI / Element UI / Tailwind
- 状态管理：Redux / MobX / Vuex / Pinia / Zustand
- 构建工具：Webpack / Vite / Rspack / Rollup

**后端技术栈**（如果有 pom.xml / build.gradle 等）：
- 语言：Java / Kotlin / Go / Python / Rust / C#
- 框架：Spring Boot / Express / FastAPI / Gin / Actix
- ORM：MyBatis / JPA / Hibernate / Sequelize / Prisma
- 数据库：PostgreSQL / MySQL / MongoDB / SQLite

#### 1.3 探测架构模式

扫描目录结构推断架构模式：

| 目录特征 | 架构模式 |
|---------|---------|
| `domain/`, `application/`, `infrastructure/` | DDD 分层 |
| `controllers/`, `services/`, `models/` | MVC |
| `src/modules/`, `src/features/` | 模块化/特性驱动 |
| `cmd/`, `internal/` | Go 标准布局 |
| `pages/`, `components/`, `stores/` | 前端 SPA |
| 无明显分层 | 简单/待定 |

#### 1.4 探测测试框架

| 文件特征 | 测试框架 |
|---------|---------|
| `jest.config.*`, `*.test.js` | Jest |
| `vitest.config.*` | Vitest |
| `pytest.ini`, `conftest.py` | pytest |
| `*_test.go` | Go testing |
| `*Test.java`, `*Tests.java` | JUnit |
| `playwright.config.*` | Playwright (E2E) |
| `cypress.config.*` | Cypress (E2E) |

### 2. 展示探测结果并确认

向用户展示探测到的一切信息，询问是否需要修正：

```
━━━ 项目探测结果 ━━━

📁 项目类型: 全栈 (前端 + 后端)

🔧 前端技术栈:
  - 框架: React 17
  - UI 库: Ant Design 4
  - 状态管理: MobX 5
  - 构建工具: Webpack 5

🔧 后端技术栈:
  - 语言: Java 8
  - 框架: Spring Boot 2.1.7
  - ORM: MyBatis
  - 数据库: PostgreSQL

🏗️ 架构模式: DDD 分层 (后端) + SPA (前端)

🧪 测试框架: Jest (前端) + JUnit (后端)

❓ 以上信息是否正确？如有需要修正的地方请告诉我。
```

### 3. 交互式补充信息

基于探测结果，补充以下信息（只问探测不到的）：

1. **API 响应格式**：`{ status: "0", message: "", data: {} }` 或其他格式
2. **是否使用知识库 MCP**（如 Confluence）：是/否
3. **开发原则补充**：是否有团队特有的开发规范
4. **项目特殊约束**：如 Java 版本限制、浏览器兼容性等

### 4. 通知配置（可选）

在生成宪法之前，引导用户配置任务完成通知。

**步骤**:

1. 询问用户是否需要配置飞书通知：
   ```
   🔔 是否配置任务完成通知？
   
   配置后 sdd-run / sdd-review 等长任务完成时，自动推送飞书消息通知你，无需盯盘。
   
   1. 现在配置（推荐）
   2. 暂不配置（后续可通过 /sdd-notify configure 配置）
   ```

2. 如果用户选择「现在配置」，执行以下引导：

   **a. 获取飞书应用凭证**：
   ```
   请提供飞书开放平台应用信息（在 https://open.feishu.cn/app 创建或查看）：
   - App ID（cli_ 开头）
   - App Secret
   ```

   **b. 获取接收者 open_id**：
   ```
   请提供你的飞书 open_id（ou_ 开头）。
   
   获取方式：
   1. 打开 https://open.feishu.cn/api-explorer/
   2. 右上角选择你的应用
   3. 搜索「通过手机号获取用户 ID」
   4. 输入你的手机号，点击调试
   5. 复制返回的 open_id
   ```

   **c. 保存并发送测试消息**：
   - 将配置写入 `.specify/notification.json`
   - 获取 tenant_access_token
   - 发送测试卡片消息验证配置
   - 检查 `.gitignore` 是否包含 `.specify/notification.json`

3. 如果用户选择「暂不配置」，跳过此步骤，继续执行

> **注意**：飞书 open_id 是应用级别的，每个应用看到的同一用户 open_id 不同。不能用其他应用的 open_id，也不能用工号。必须通过本应用的 API 调试台获取。

### 5. 生成项目宪法

基于确认的探测结果和补充信息，生成 `.specify/memory/constitution.md`。

使用模板：`.specify/templates/constitution-template.md`

如果模板不存在，则使用以下内置模板结构。

#### 自动填充的变量：

- `{frontend_stack}`: 前端技术栈详情
- `{backend_stack}`: 后端技术栈详情
- `{database}`: 数据库类型
- `{architecture_pattern}`: 架构模式描述
- `{test_frameworks}`: 测试框架列表
- `{api_response_format}`: API 响应格式

#### 必须包含的章节：

1. **绝对铁律** - 数据字段不可凭猜测、禁止 N+1 查询等通用铁律
2. **开发原则** - 简单性原则、代码质量、测试标准
3. **架构约束** - 基于探测到的架构模式
4. **SDD 文档职责边界** - spec/plan/tasks 的 What/How/When 分工
5. **SDD 阶段合约与评审标准** - 评审维度、权重、硬阈值
6. **经验教训** - 空白模板，供后续积累

#### 宪法内容模板

当 `.specify/templates/constitution-template.md` 不存在时，使用以下结构生成：

```markdown
# 项目宪法 (Constitution)

> 自动生成于 {date}，由 SDD Init 分析项目结构后创建。
> 可随时通过 /sdd-constitution 命令更新。

---

## 1. 技术栈

{frontend_stack_section}

{backend_stack_section}

### 数据库
- 类型: {database}

### 测试框架
- {test_frameworks}

---

## 2. 绝对铁律

> 违反以下任何规则等同于生产事故。

### 2.1 数据完整性
- **数据字段不可凭猜测**：所有字段名、类型、约束必须从数据库或 API 文档确认
- **禁止假设数据格式**：日期格式、枚举值、ID 规则必须验证
- **修改前先读取**：任何修改操作前，先读取当前数据状态

### 2.2 查询性能
- **禁止 N+1 查询**：循环中不可有数据库查询，必须使用批量查询
- **新增查询必须有索引支持**：WHERE 条件字段必须有对应索引
- **分页必须带 LIMIT**：列表查询必须有上限保护

### 2.3 安全底线
- **SQL 参数化**：禁止字符串拼接 SQL
- **权限校验**：所有 API 入口必须有权限验证
- **敏感数据**：密码、密钥等不可出现在日志或响应中

---

## 3. 开发原则

### 3.1 简单性原则（Simplicity Principle）
1. **复用优先**：新增方法前先查找现有方法是否可复用
2. **最小改动**：只改必须改的，不做"顺便"的重构
3. **渐进式**：优先选择最简单的实现路径

### 3.2 代码质量标准
- 函数长度不超过 50 行
- 嵌套不超过 3 层
- 新增公共方法必须有注释说明用途
- 遵循项目已有的命名风格

### 3.3 测试标准
- 核心逻辑必须有测试覆盖
- 测试用例在实现之前编写（TDD / 红-绿-重构）
- 边界条件和异常路径必须测试

---

## 4. 架构约束

{architecture_constraint_section}

---

## 5. API 规范

### 响应格式
{api_response_format}

### 错误处理
- 所有异常必须有对应的错误码和用户友好提示
- 未知异常统一返回 500，不暴露内部细节

---

## 6. SDD 文档职责边界

| 阶段 | 文档 | 回答的问题 | 不包含 |
|------|------|-----------|--------|
| Specify | spec.md | What — 做什么？为什么？ | 技术实现细节 |
| Test Cases | testcases.md | How to verify — 怎么验证？ | 实现代码 |
| Plan | plan.md | How — 怎么实现？技术方案 | 具体代码 |
| Tasks | tasks.md | When — 什么时候做？任务拆分 | 实现细节 |

---

## 7. SDD 阶段合约与评审标准

### 评审维度与权重

| 维度 | 权重 | 硬阈值 |
|------|------|--------|
| 功能完整性 | 30% | 所有 spec 定义的场景已覆盖 |
| 代码质量 | 20% | 无 lint 错误，无重复代码 |
| 测试覆盖 | 20% | 核心逻辑测试通过率 100% |
| 架构合规 | 15% | 符合架构约束，分层正确 |
| 性能安全 | 15% | 无 N+1 查询，无安全漏洞 |

### 评审流程
1. 自动检查：lint、测试、类型检查
2. AI 审查：对照 spec + plan 合约逐项验证
3. 评分：满分 100，低于 70 分不通过
4. 不通过时：自动修复 → 重新评审（最多 3 轮）

---

## 8. 经验教训

> 开发过程中积累的经验，持续更新。

<!-- 在此添加项目中遇到的实际问题和解决方案 -->
```

### 6. 创建目录结构

确保以下目录存在：

```
.specify/
├── memory/
│   └── constitution.md    ← 刚生成的宪法
├── specs/                 ← 功能规格目录
├── templates/             ← 模板文件（已安装）
└── scripts/               ← 工具脚本（已安装）
```

使用 bash 命令创建不存在的目录：
```bash
mkdir -p .specify/memory .specify/specs
```

### 7. 输出初始化报告

```
━━━ SDD 初始化完成 ━━━

✅ 项目宪法已生成: .specify/memory/constitution.md

📋 项目配置摘要:
  - 项目类型: {type}
  - 前端: {frontend_stack}
  - 后端: {backend_stack}
  - 数据库: {database}
  - 架构: {architecture}
  - 测试: {test_frameworks}

🚀 开始使用 SDD:
  /sdd-specify <功能名称>          创建功能规格
  /sdd-run <id> <功能描述>         全自动流水线（推荐）

🔔 配置任务完成通知（可选）:
  /sdd-notify configure            配置飞书通知

  如果不配置，sdd-run/sdd-review 完成时不会打扰你。
  配置后长任务完成自动推送到飞书，无需盯盘。
```

## 注意事项

1. **不修改 CLAUDE.md**：只输出建议追加的内容，由用户决定是否添加
2. **幂等性**：重复运行时检测已有宪法，询问是更新还是重新生成
3. **渐进式**：探测不到的信息不强制要求，可后续通过 `/sdd-constitution` 补充
4. **最小化提问**：只问真正探测不到的关键信息，不超过 5 个问题
