---
name: sdd-specify
description: 创建功能规格文档（Specification）- 定义功能需求、用户故事和验收标准。支持从KB链接获取原始需求文档。
invocable: true
---

# SDD Specify - 功能规格生成器

创建功能规格文档，定义功能需求、用户故事和验收标准。支持从KB链接自动获取原始需求文档。

## 双模式执行

本 Skill 支持两种执行模式：

- **手动模式**（`/sdd-specify`）：交互式执行，每步确认，展示输出摘要
- **Agent 模式**（由 `sdd-run` 自动调用）：自动执行，跳过交互确认，直接将结果保存到指定文件

两种模式共享以下所有领域规则，Agent 模式额外遵循 agent prompt 中的执行约束。

## ⚠️ 核心原则：Spec 只描述 What，不描述 How

> **Spec 是需求文档，不是技术设计文档。** 它回答"系统应该做什么"，而不是"系统如何实现"。
> 技术实现细节（SQL、代码、文件路径、架构图）属于 plan.md，不属于 spec.md。

### 内容边界

#### ✅ spec 中应该包含的内容
- **业务需求**：用户需要什么、为什么需要
- **用户故事**：角色、目标、价值
- **验收标准**：Given-When-Then 格式的行为描述
- **功能点列表**：功能名称、描述、优先级
- **界面需求**：页面布局示意（简单 ASCII 即可）、交互流程（用户视角）
- **数据需求**：业务实体、字段含义、业务规则（不含SQL/DDL）
- **接口需求**：接口名称、用途、输入输出概述（不含代码实现）
- **非功能需求**：性能、安全、兼容性的业务指标
- **边界条件**：异常场景和处理策略（业务层面）
- **术语表**：业务术语定义

#### ❌ spec 中不应该包含的内容（这些属于 plan.md / tasks.md）
- ~~SQL 查询语句或 DDL~~
- ~~代码片段（Java/JavaScript/任何语言）~~
- ~~具体文件路径~~（如 `src/pages/xxx/CreateModal.jsx`）
- ~~类名、方法名~~（如 `findEarliestSubTaskId()`、`getSubSoftTask()`）
- ~~代码调用链路~~（如 Controller → Service → Repository）
- ~~数据库表的字段级定义~~（如 column type、index）
- ~~修改清单汇总~~（哪些文件需要改）
- ~~架构图中的代码级细节~~
- ~~MobX Store 变量名、React 组件内部状态~~

### 反面示例（001 spec.md 中的问题）

| 问题 | spec 中写了什么 | 应该写什么 |
|------|-----------------|------------|
| SQL 出现在 spec | `SELECT sub.SFW_TASK_ID FROM ...` | "通过父子任务关联关系查找子任务" |
| 代码调用链 | `Controller → ServiceImpl → Repository.findEarliestSubTaskId()` | "系统根据父任务查找关联的子任务" |
| 文件路径 | `cap-front/.../CreateModal.jsx` | "自动引用配置页面" |
| 方法名 | `getSubSoftTask()` | "获取子任务" |
| 修改清单 | 7个文件的修改列表 | ���删除，移到 plan/tasks）|

### 关联模块的正确写法

**❌ 错误**（太具体）:
```
| 前端组件 | cap-front/frontend/src/pages/admin/.../CreateModal.jsx | 配置弹窗 |
| 后端Service | cplm-software-application/.../AutoQuoteServiceImpl.java | 自动引用 |
```

**✅ 正确**（模块级别）:
```
| 前端 | 自动引用配置页面 | 配置创建/编辑 |
| 后端 | 软件中心 - 自动引用模块 | 自动引用执行逻辑 |
| 数据 | 条件配置存储 | 复用现有条件表 |
```

## KB链接识别

自动识别以下格式的KB链接：
- `https://kb.cvte.com/display/xxx/...`
- `https://kb.cvte.com/pages/viewpage.action?pageId=xxx`
- `kb.cvte.com` 域名下的任何链接

## 执行步骤

### 1. 解析用户输入
从用户输入中提取：
- 功能名称
- 功能描述
- 业务背景（如果有）
- **KB链接**（如果有）

### 2. 获取KB原始需求文档（如果有KB链接）

#### 2.1 使用MCP工具获取文档
如果检测到KB链接，使用 `kb-knowledge` MCP工具获取文档详情：

可用工具:
- `mcp__kb-knowledge__confluence_search`: 搜索文档
- `mcp__kb-knowledge__confluence_get_page`: 获取页面内容
- `mcp__kb-knowledge__confluence_get_page_children`: 获取子页面

#### 2.2 保存原始需求文档
将获取的KB文档保存到功能目录：

```
.specify/specs/{feature_id}-{feature-name}/
├── requirements/              # 原始需求文档目录
│   ├── original.md           # KB原始需求（Markdown格式）
│   └── metadata.json         # 文档元数据（来源、更新时间等）
├── spec.md                   # 功能规格
└── contracts/                # API契约（可选）
```

#### 2.3 元数据文件格式 (metadata.json)
```json
{
  "source": "confluence",
  "source_url": "https://kb.cvte.com/display/xxx/需求文档",
  "page_id": "123456789",
  "title": "XXX功能需求文档",
  "author": "作者名",
  "last_updated": "2026-03-19T12:00:00Z",
  "fetched_at": "2026-03-19T14:30:00Z"
}
```

### 3. 读取相关文档

#### 3.1 必读文档
- `.specify/memory/constitution.md` - 项目宪法
- `CLAUDE.md` - 项目配置

#### 3.2 可选文档（如果存在）
- 相关模块的现有规格文档
- API文档
- 数据库设计文档
- **刚获取的KB原始需求文档**（如果有）

### 4. 分析现有代码（如果涉及现有模块）
- 前端: `cap-front/frontend/src/pages/{module}/`
- 后端: `cplm-software-center/` 或 `cplm-pdm/`
- 数据库: 相关表结构

### 5. 生成规格文档

基于模板 `.specify/templates/spec-template.md` 生成文档，包括：

#### 核心内容：
1. **需求追溯**（如果有KB来源）
   - 原始需求链接
   - 需求版本信息

2. **功能概述**
   - 功能名称和描述
   - 业务背景
   - 关联模块

3. **用户故事**（至少2个）
   - 格式: 作为[角色]，我希望[目标]，以便于[价值]
   - 每个故事包含验收标准（Gherkin格式）

4. **功能需求**
   - 核心功能列表（带优先级）
   - 界面需求
   - 数据需求
   - 接口需求

5. **非功能需求**
   - 性能要求
   - 安全要求
   - 兼容性

6. **验收标准**
   - 功能验收
   - 质量验收
   - 文档验收

7. **功能分组与完成定义**（SDD v2 新增）

   > **受 Harness Planner 启发**: 将功能按交付批次分组，每组定义明确的"完成定义"（Definition of Done）。
   > 完成定义来源于验收标准，但更聚焦于**可端到端验证的用户可见行为**。
   > 这为下游的 Phase Contract（阶段合约）和 Review（评审）提供评判基准。

   格式示例：
   ```markdown
   ## 功能分组与完成定义

   ### Group A: 核心查询功能
   - 包含功能: US-1, US-2, US-3
   - 完成定义:
     - [ ] 用户可以通过列表页查询 XXX 数据
     - [ ] 支持按 YYY 条件筛选
     - [ ] 查询结果分页展示，每页默认 20 条
     - [ ] 无数据时显示空状态提示

   ### Group B: 详情与对比功能
   - 包含功能: US-4, US-5, US-6
   - 完成定义:
     - [ ] 点击列表项可查看详情
     - [ ] 支持 2-4 个实例同时对比
     - [ ] 对比结果以表格形式展示差异字段
   ```

   **设计原则**:
   - 分组粒度：每组对应一个可独立交付和评审的功能切片
   - 完成定义：使用业务语言描述可验证的用户行为，不涉及技术实现
   - 完成定义的条目数量：每组 3-8 项，太多应拆分，太少应合并
   - 优先级：按 Group 顺序隐含优先级，Group A 最重要

### 6. 创建功能目录

> **⚠️ 重要**：创建新目录前，必须先执行需求归属判断！

#### 6.1 需求归属判断

1. 扫描 `.specify/specs/` 下已有目录
2. 判断新需求是否属于已有需求的 bug 修复、小优化或功能增强
3. 如果是 → **不新建目录**，在原目录下的 `iterations/` 创建迭代记录
4. 如果是全新独立功能 → 新建目录

#### 6.2 新功能目录结构
```
.specify/specs/{feature_id}-{feature-name}/
├── requirements/              # 原始需求文档（如果有KB来源）
│   ├── original.md           # KB原始需求
│   └── metadata.json         # 文档元数据
├── spec.md                   # 功能规格
├── iterations/               # 迭代记录（bug修复/小优化）
└── contracts/                # API契约（可选）
```

命名规则：
- feature_id: 001, 002, 003...（自动递增）
- feature-name: 英文小写，中划线分隔

#### 6.3 取号原子化（多人并发防冲突）

> **背景**：多人并行跑 SDD 时，本地各自取 `max+1` 会撞号。必须把"取号"和"写内容"分两步，取号阶段做一次秒级的 push 抢占。

**前置约定**：
- SDD 全部在 `master` 分支上跑（本仓库当前规范）
- 取号操作只动 `.specify/` 路径，不涉及业务代码

**取号流程**（创建新目录前必须执行，手动模式与 agent 模式一致）：

```
Step 1. git pull --rebase origin master
Step 2. 扫描 .specify/specs/ 取最大数字编号 N，候选号 = N+1
Step 3. mkdir .specify/specs/{N+1}-{feature-name}/
Step 4. 在 REGISTRY.md 追加一行 DRAFT 占位：
        | {N+1} | {feature-name} | v1 | DRAFT | - | - | - | 0 | {today} | - |
Step 5. git add .specify/specs/{N+1}-{feature-name}/ .specify/specs/REGISTRY.md
        git commit -m "chore(sdd): reserve {N+1}-{feature-name}"
Step 6. git push origin master
        ├─ 成功 → 取号完成，进入 §7 spec 编写
        └─ 失败（non-fast-forward）→ 进入冲突恢复
```

**冲突恢复**（最多重试 3 次）：

```
1. git reset --soft HEAD~1                          # 撤掉占位 commit，保留改动
2. git restore --staged .                           # 取消暂存
3. mv .specify/specs/{N+1}-{name}/ /tmp/sdd-tmp/    # 临时挪走目录
4. 撤销 REGISTRY.md 的追加行（用 git checkout 恢复）
5. git pull --rebase origin master
6. 重新执行 Step 2-6（新的 N+1 通常变成 N+2）
7. 把 /tmp/sdd-tmp/ 内容挪回新目录名
```

**重试 3 次仍失败**：停止取号，向用户报告："并发冲突过于激烈，请手动协调下一个 feature_id 后再继续"，**不要** fallback 到时间戳前缀（保持顺序号风格统一）。

**注意事项**：
- 占位 commit 必须**只包含目录创建 + REGISTRY 追加**，不要混入 spec.md 内容；这样冲突时 reset 代价最小
- 占位行的 `名称` 字段写定后，后续 spec 写完只更新状态字段，不改名称
- 取号成功后，spec.md 的撰写、保存、commit 都在本地进行，最终随 SDD 流程的常规 commit 一起 push（不需要再为每次保存单独 push）
保存到: `.specify/specs/{feature_id}-{feature-name}/spec.md`

### 8. 检测文档大小

spec.md 超过 500 行时，自动执行 `/sdd-split spec {feature_id} --auto` 拆分（在 sdd-run 中）或提示用户使用 `/sdd-split spec {feature_id}`（手动模式下）。

### 9. 交互确认
向用户展示生成的文档大纲，询问是否需要补充或修改。

## 输出示例

### 有KB链接时：
```
📥 检测到KB链接: https://kb.cvte.com/display/PDM/软件任务自动引用功能

正在获取KB文档...
✅ KB文档已获取并保存: .specify/specs/001-auto-quote/requirements/original.md

📄 需求来源信息:
- 标题: 软件任务自动引用功能需求文档
- 作者: 产品经理A
- 最后更新: 2026-03-18

✅ 功能规格已生成: .specify/specs/001-auto-quote/spec.md

📋 文档大纲：
1. 需求追溯
2. 功能概述
3. 用户故事
4. 功能需求
5. 非功能需求
6. 验收标准

请检查文档内容，如需补充请告诉我具体内容。
```

### 无KB链接时：
```
✅ 功能规格已生成: .specify/specs/001-user-authentication/spec.md

📋 文档大纲：
1. 功能概述
2. 用户故事
3. 功能需求
4. 非功能需求
5. 验收标准

请检查文档内容，如需补充请告诉我具体内容。
```

## 需求澄清强化规范（v5 新增）

> **spec 质量 = 澄清质量**。如果需求不清楚就直接写 spec，下游所有阶段都会偏离。

### 澄清的核心原则

1. **选择题优先**：80% 以上的澄清问题必须是选择题（2-4 个选项），让用户选编号而非写长文
2. **多轮追问**：第一轮问方向，第二轮问细节，用户回答引出新问题必须追问
3. **不假设**：任何"我认为应该是这样"的地方，都必须和用户确认
4. **排除项明确**：必须确认"本次不做什么"，防止实现范围蔓延
5. **复述确认**：澄清结束后完整复述理解，等用户说"对"才进入 spec 编写

### 选择题设计规范

```
Q1. [必答] 这个功能的数据更新频率？
   A) 用户手动触发刷新（推荐）
   B) 自动轮询（间隔 ___）
   C) WebSocket 实时推送
   → 不确定选 A

Q2. [可选] 空数据时的展示方式？
   A) 显示"暂无数据"空状态（推荐）
   B) 隐藏整个模块
   → 不回答按 A 处理
```

### 必须澄清的问题清单

以下问题在**每个 spec** 中都必须有明确答案（来自用户输入、KB 文档、或澄清确认）：

- [ ] 功能范围：做哪些、不做哪些
- [ ] 用户角色：谁来使用这个功能
- [ ] 核心业务规则：关键判断逻辑
- [ ] 数据来源：新建还是复用现有
- [ ] 交互方式：页面级还是弹窗级
- [ ] 边界条件：数据量上限、空数据处理、异常处理

## 注意事项

1. **需求聚焦**: Spec 只描述 What（做什么），不描述 How（怎么做）。所有技术实现细节留给 plan.md
2. **业务术语**: 使用PDM领域的标准术语（物料、BOM、变更等），不使用代码术语
3. **优先级**: 合理设置功能优先级（P0/P1/P2）
4. **验收标准**: 确保可测试、可验证，用 Given-When-Then 描述行为
5. **关联模块**: 只标注模块名称和业务功能，不标注文件路径或类名
6. **数据需求**: 描述业务实体和字段含义，不写 SQL/DDL
7. **接口需求**: 描述接口用途和输入输出，不写代码实现
8. **KB文档格式**: KB文档可能使用Confluence格式，需要转换为Markdown
9. **渐进式披露**: 原始需求保存后，可按需加载详细内容
10. **禁止修改清单**: 不在 spec 中列出需要修改的文件清单，这属于 plan/tasks
11. **接收反馈**: 当下游阶段（testcases/plan/implement）触发反馈回 spec 时，必须修正源头并在变更记录中登记 CR
