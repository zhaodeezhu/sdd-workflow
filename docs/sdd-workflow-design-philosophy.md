# SDD Workflow：让 AI 写代码变得可靠

> Specification-Driven Development —— 用文档契约驱动 AI 编程的实践框架

## 一、我们面临的问题

团队引入 Claude Code 后，AI 写代码的能力令人印象深刻，但实际落地中反复遇到几个痛点：

**1. AI 容易"自由发挥"**

给 AI 一个模糊的需求描述，它可能用任何技术方案来实现。两次执行的结果可能完全不同，缺乏一致性。更糟糕的是，AI 倾向于选择"看起来合理"的方案，而不是项目实际需要的方案。

**2. 复杂功能容易遗漏**

一个包含 10 个功能点的需求，AI 可能在实现 7-8 个后就认为"差不多了"。剩余的功能要么以 TODO 的形式残留，要么被悄悄简化。人工 review 时，如果没有对照清单，很难发现遗漏。

**3. AI 自评不可信**

AI 对自己写的代码评价普遍偏高。让同一个 AI 既写代码又 review 代码，就像让学生自己批改自己的试卷——得分通常虚高。

**4. 大型需求缺乏结构化拆解**

直接让 AI 实现"用户管理模块"这样的大需求，它往往无从下手，或者产出质量参差不齐。需要一种将大需求拆解为可控小任务的方法论。

**5. 项目上下文缺失**

每个新对话都要重新告诉 AI 项目的技术栈、架构约束、编码规范。这些重复性的上下文传递不仅浪费时间，还容易遗漏。

---

## 二、SDD 的核心理念

### 2.1 文档即契约

SDD（Specification-Driven Development）的核心理念是：**文档是契约，AI 按契约实现，独立评审验证契约履行**。

```
需求 ──→ 规格文档(spec) ──→ 测试用例(testcases) ──→ 技术方案(plan) ──→ 任务分解(tasks) ──→ 编码(implement) ──→ 评审(review)
  What        What                Verify                How                When              Code              Quality
```

每个阶段产出的文档，是下一阶段的输入契约：

| 阶段 | 文档 | 回答的问题 | 内容边界 |
|------|------|-----------|---------|
| Specify | spec.md | **What** — 做什么？为什么？ | 业务需求、用户故事、验收标准。禁止出现 SQL/代码/文件路径 |
| Test Cases | testcases.md | **Verify** — 怎么验证？ | 测试场景、Given-When-Then、测试金字塔 |
| Plan | plan.md | **How** — 怎么实现？ | 技术方案、架构设计、API 设计、数据模型 |
| Tasks | tasks.md | **When** — 什么时候做？ | 任务拆分、执行顺序、验收标准 |

这种分层设计带来了两个关键好处：

- **关注点分离**：写 spec 时不需要考虑技术实现，写 plan 时不需要重复需求描述。每份文档职责单一，减少信息冗余。
- **可追溯性**：review 时可以精确定位问题出在哪个环节——是 spec 没定义清楚，还是 plan 设计有缺陷，还是 implement 偏离了方案。

### 2.2 项目宪法（Constitution）

每个项目的技术栈、架构模式、编码规范都不一样。SDD 通过"项目宪法"来固化这些项目特有的约束。

宪法由 `sdd-init` 命令自动生成。它会：

1. **探测项目结构**：扫描 package.json、pom.xml 等识别技术栈
2. **识别架构模式**：从目录结构推断 DDD/MVC/模块化等
3. **检测测试框架**：识别 Jest/Vitest/JUnit/pytest 等
4. **交互式补充**：只问探测不到的关键信息（如 API 响应格式）

生成的宪法包含：

```
.specify/memory/constitution.md
├── 绝对铁律          ← 数据完整性、查询性能、安全底线
├── 开发原则          ← 简单性原则、代码质量、测试标准
├── 架构约束          ← 基于探测结果的技术栈和分层约束
├── SDD 文档职责边界   ← What/How/When 的分工定义
├── 评审标准          ← 评审维度、权重、硬阈值
└── 经验教训          ← 项目积累的问题和解决方案（持续更新）
```

宪法一旦生成，所有后续 SDD 命令都以此为上下文。**一次配置，持续生效**。

### 2.3 测试先行

SDD 强制要求在编码之前设计测试用例。这不是形式主义，而是出于实际考虑：

- **测试用例是可执行的需求**：Given-When-Then 格式比自然语言更精确，能消除需求歧义
- **测试先行为 review 提供量化依据**：评审时可以直接对照测试覆盖率判断功能完整性
- **测试驱动 AI 实现**：AI 按 testcases.md 逐项实现，比按模糊的需求描述实现更可控

测试用例遵循测试金字塔：

```
        /\
       /  \      E2E Tests (10%)
      /----\     - 关键用户流程
     /      \
    /--------\   Integration Tests (20%)
   /          \  - API 集成
  /            \ - 数据库交互
 /--------------\
/                \ Unit Tests (70%)
------------------  - 业务逻辑
                    - 边界条件
```

---

## 三、系统架构设计

### 3.1 整体分层架构

SDD Workflow 从上到下分为四层：**安装分发层**、**Skill 编排层**、**Agent Team 层**、**文件存储层**。

```
┌─────────────────────────────────────────────────────────────────┐
│                    安装分发层 (Distribution)                     │
│  ┌──────────────────────┐    ┌─────────────────────────────┐    │
│  │  Marketplace 模式     │    │  文件模式 (npx sdd-workflow) │    │
│  │  .claude-plugin/     │    │  bin/sdd-init.js            │    │
│  │  marketplace.json    │    │  src/installer/              │    │
│  │  registry/registry   │    │  templates/ → .claude/       │    │
│  │       .json          │    │               .specify/      │    │
│  └──────────┬───────────┘    └──────────────┬───────────────┘    │
│             │                               │                    │
│             └──────────┬────────────────────┘                    │
│                        ▼                                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Skill Marketplace CLI (src/marketplace/)     │   │
│  │   install | uninstall | list | search | publish | create  │   │
│  └──────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                    Skill 编排层 (Orchestration)                   │
│                                                                 │
│  ┌────────────┐  ┌─────────────┐  ┌──────────┐  ┌──────────┐  │
│  │  sdd-idea   │  │  sdd-init   │  │ sdd-split│  │ sdd-     │  │
│  │  需求随想录  │  │  项目初始化  │  │ 文档拆分 │  │ constitu-│  │
│  │             │  │             │  │          │  │ tion     │  │
│  └──────┬─────┘  └──────┬──────┘  └──────────┘  └──────────┘  │
│         │               │                                       │
│         ▼               ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              sdd-run (全自动流水线编排器)                    │   │
│  │                                                          │   │
│  │   Phase 0          Phase A           Phase B   Phase C   │   │
│  │   需求澄清    →    Planner       →   Generator → Evaluator│   │
│  │                  ┌──────────┐      ┌────────┐ ┌────────┐ │   │
│  │                  │ specify  │      │implement│ │ review │ │   │
│  │                  │ testcase │      │(红-绿-  │ │(MACE   │ │   │
│  │                  │ plan     │      │ 重构)   │ │ 3Agent)│ │   │
│  │                  │ tasks    │      └────────┘ └────────┘ │   │
│  │                  └──────────┘                              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           独立 Skill（可单独使用，也可被 sdd-run 编排）      │   │
│  │  sdd-specify | sdd-testcases | sdd-plan | sdd-tasks       │   │
│  │  sdd-implement | sdd-review                               │   │
│  └──────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                   Agent Team 层 (Collaboration)                  │
│                                                                 │
│  ┌────────────┐  ┌────────────┐  ┌─────────┐  ┌────────────┐  │
│  │ 功能开发    │  │ 代码审查    │  │ 问题排查 │  │ SDD 规划   │  │
│  │ Team       │  │ Team       │  │ Team    │  │ Team       │  │
│  │ (5 roles)  │  │ (3 roles)  │  │ (4 roles)│  │ (4 roles)  │  │
│  └────────────┘  └────────────┘  └─────────┘  └────────────┘  │
│                                                                 │
│  templates/teams/sdd-development-team.md                        │
├─────────────────────────────────────────────────────────────────┤
│                    文件存储层 (Persistence)                       │
│                                                                 │
│  .specify/                          .claude/                    │
│  ├── memory/                        ├── skills/sdd-*/           │
│  │   └── constitution.md            └── teams/                  │
│  ├── specs/{id}-{name}/                                        │
│  │   ├── spec.md                   CLAUDE.md                    │
│  │   ├── testcases.md              (项目配置，SDD 不修改)        │
│  │   ├── plan.md                                                │
│  │   ├── tasks.md                                               │
│  │   ├── requirements/                                          │
│  │   ├── contracts/                                             │
│  │   └── review-*.md                                            │
│  ├── ideas/{id}-{slug}.json                                     │
│  └── templates/                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 安装分发：双模式设计

SDD 支持两种安装模式，满足不同使用场景：

**Marketplace 模式** — 轻量、即插即用

通过 Claude Code 的插件市场机制安装。`.claude-plugin/marketplace.json` 声明所有 Skill 的路径，Claude Code 运行时动态加载。用户无需修改项目文件，Skill 存留在 SDD Workflow 仓库内。

```
.claude-plugin/
├── marketplace.json     ← 插件清单（声明 11 个 Skill）
└── plugin.json          ← 插件元数据
```

优点：零文件侵入、自动更新、多项目共享。
代价：Skill 不可自定义、需要网络。

**文件模式** — 完全控制

通过 `npx sdd-workflow` 安装。`src/installer` 将 `templates/` 下的 Skill 文件、模板文件、团队配置复制到项目的 `.claude/` 和 `.specify/` 目录。

```
npx sdd-workflow              # 安装（跳过已有文件）
npx sdd-workflow --update     # 增量更新（只更新源文件变更的，保留用户自定义）
npx sdd-workflow --force      # 全量覆盖
npx sdd-workflow --dry-run    # 预览安装内容
```

增量更新的设计原理：通过文件哈希比对，区分"源文件变更"和"用户自定义"。只有源文件发生了变化才会更新，用户自定义的内容（如修改了模板、补充了宪法）不受影响。

优点：可离线、可自定义模板、可 fork 修改。
代价：文件侵入项目、需手动更新。

### 3.3 Skill 编排：编排与原子操作分离

` sdd-run` 是纯编排层，不包含任何业务逻辑。它的工作只是按顺序调用其他 Skill 的等价逻辑：

```
sdd-run（编排器）
  ├── Phase 0: 需求澄清          ← sdd-run 自有逻辑
  ├── Phase A: Planner
  │   ├── A1: specify            ← 等价于 /sdd-specify
  │   ├── A2: testcases          ← 等价于 /sdd-testcases
  │   ├── A3: plan               ← 等价于 /sdd-plan
  │   └── A4: tasks              ← 等价于 /sdd-tasks
  ├── Phase B: Generator
  │   └── B1: implement          ← 等价于 /sdd-implement
  └── Phase C: Evaluator
      ├── C1: 3 Agent 并行评审    ← 等价于 /sdd-review
      ├── C2: 仲裁合并
      └── C3: 自动迭代
```

**为什么这样设计？**

用户可以选择两种工作模式：

- **全自动模式**：`/sdd-run 004 功能描述`，一键执行全部流程
- **手动模式**：逐步执行 `/sdd-specify` → `/sdd-testcases` → `/sdd-plan` → `/sdd-tasks` → `/sdd-implement` → `/sdd-review`，每步可检查和调整

两种模式产出物完全一致，只是自动化程度不同。用户可以从手动模式起步，熟悉后切换到全自动模式。

### 3.4 Agent Team：多角色协作

SDD 提供了 5 种预配置的 Agent Team 模板，用于需要多 Agent 协作的复杂场景：

| Team | 角色数 | 适用场景 |
|------|--------|----------|
| 功能开发团队 | 5 | 新功能全流程开发（Tech Lead + 后端 + 前端 + 测试 + Reviewer） |
| 代码审查团队 | 3 | PR 审查（安全 + 性能 + 代码质量） |
| 问题排查团队 | 4 | 复杂 Bug 排查（主导 + 前端侦探 + 后端侦探 + 魔鬼代言人） |
| 技术调研团队 | 3 | 新技术评估（架构师 + UX 研究员 + 风险分析师） |
| SDD 规划团队 | 4 | 大型功能文档规划（产品分析师 + 测试设计师 + 方案架构师 + 任务规划师） |

**功能开发团队的红-绿-重构流程**：

```
每个任务:
  🔴 Test Engineer 先写测试（测试失败）
  → 🟢 Backend/Frontend 写实现（测试通过）
  → 🔵 Code Reviewer 审查代码（测试仍通过）
  → Tech Lead 综合验收
```

Agent Team 与 sdd-run 的 MACE 评审不同：MACE 是评审专用的 3 Agent 并行模式，内嵌在 `sdd-review` 中；Agent Team 是通用的多角色协作模式，用于开发、调研、调试等多种场景。

### 3.5 文件存储：文档产物体系

所有 SDD 产出物都持久化到磁盘，保证可追溯、可恢复：

```
项目根目录/
├── .specify/                              ← SDD 工作目录
│   ├── memory/
│   │   └── constitution.md               ← 项目宪法（全局上下文）
│   ├── specs/                            ← 功能规格目录
│   │   ├── 001-user-auth/                ← 功能 001
│   │   │   ├── spec.md                   ← What：功能规格
│   │   │   ├── testcases.md              ← Verify：测试用例
│   │   │   ├── plan.md                   ← How：技术方案
│   │   │   ├── tasks.md                  ← When：任务分解
│   │   │   ├── requirements/             ← 原始需求文档
│   │   │   │   ├── original.md
│   │   │   │   └── metadata.json
│   │   │   ├── contracts/                ← API 契约（可选）
│   │   │   ├── review-phase1-r1.md       ← Phase 1 评审报告
│   │   │   ├── review-phase1-r2.md       ← Phase 1 迭代后评审
│   │   │   ├── review-final-r1.md        ← 最终评审
│   │   │   └── review-summary.md         ← 评审总结
│   │   ├── 002-data-export/
│   │   └── ...
│   ├── ideas/                            ← 需求随想录
│   │   ├── 006-bom-version-compare.json
│   │   └── 007-batch-import.json
│   └── templates/                        ← 文档模板（文件模式安装）
│       ├── spec-template.md
│       ├── testcases-template.md
│       ├── plan-template.md
│       ├── tasks-template.md
│       └── constitution-template.md
├── .claude/                              ← Claude Code 配置
│   ├── skills/sdd-*/                     ← SDD Skills（文件模式安装）
│   └── teams/                            ← Agent Team 模板
└── CLAUDE.md                             ← 项目配置（SDD 不修改此文件）
```

**编号规则**：功能 ID 为三位数字（001, 002, 003...），`specs/` 和 `ideas/` 共享编号空间。随想升级为正式开发时（`/sdd-idea promote`），ID 不变，无缝衔接。

**大文档拆分**：当 spec 超过 500 行、plan 超过 1000 行、tasks 超过 800 行时，`sdd-split` 自动将单文件拆分为模块化目录结构（`spec/README.md` + `spec/01-overview.md` + ...），下游 Skill 支持渐进式加载。

### 3.6 模板系统

SDD 的文档模板位于 `templates/specify/templates/`，控制每份文档的结构和必填章节：

| 模板 | 产出文档 | 核心章节 |
|------|---------|---------|
| spec-template.md | spec.md | 需求追溯、用户故事、功能需求、非功能需求、验收标准 |
| testcases-template.md | testcases.md | 测试策略、单元/集成/API/前端/E2E 测试、边界条件、执行计划 |
| plan-template.md | plan.md | 架构设计、数据模型、API 设计、前后端实现、安全设计、部署计划 |
| tasks-template.md | tasks.md | Phase 拆分、任务详情（文件/依赖/验收标准）、并行标记 |
| constitution-template.md | constitution.md | 铁律、原则、架构约束、文档边界、评审标准 |

模板系统支持自定义：文件模式下，用户可以直接编辑 `.specify/templates/` 中的模板文件，调整章节结构或添加项目特有的必填项。后续 `--update` 不会覆盖用户自定义的模板。

### 3.7 需求随想录（sdd-idea）：前置缓冲区

`sdd-idea` 是 SDD 流水线的前置缓冲区，解决"灵感来了但还没准备好开发"的场景：

```
灵感闪现 → /sdd-idea add "BOM版本对比"  →  draft
                                              │
         /sdd-idea edit 006 (补充笔记)    →  refined
                                              │
         /sdd-idea promote 006            →  promoted → 自动启动 /sdd-run
```

设计原则：

- **零摩擦记录**：添加随想只需标题，其他信息可选
- **渐进式完善**：支持多次 edit 追加笔记，不要求一次性写完整
- **无缝衔接**：promote 后自动创建规格目录并启动 `/sdd-run`，ID 不变
- **不删除**：remove 只是归档，保留完整历史

### 3.8 Registry：Skill 注册表

`registry/registry.json` 是 SDD 的 Skill 注册表，定义了每个 Skill 的元数据：

```json
{
  "name": "sdd-specify",
  "version": "1.1.0",
  "description": "创建功能规格文档",
  "source": "github:zhaodeezhu/sdd-workflow/templates/skills/sdd-specify",
  "category": "core-pipeline",
  "dependencies": { "sdd-specify": "^1.0.0" },
  "keywords": ["specification", "requirements", "spec"]
}
```

Registry 支持 Skill 间的依赖关系声明（如 `sdd-review` 依赖 `sdd-specify` 和 `sdd-plan`），为 Marketplace 模式的自动安装提供基础。

### 3.9 CLI 工具链

SDD 提供两级 CLI：

**sdd（Skill 管理）** — 用于创建、安装、发布自定义 Skill

```bash
sdd install ./my-skill                 # 从本地安装
sdd install github:user/repo/skill     # 从 GitHub 安装
sdd install sdd-specify                # 从注册表安装
sdd list                               # 查看已安装
sdd create my-custom-skill             # 脚手架创建新 Skill
sdd publish                            # 发布到注册表
sdd validate                           # 验证 Skill 包完整性
```

**sdd-workflow（项目安装）** — 用于将 SDD 安装到项目

```bash
npx sdd-workflow              # 安装
npx sdd-workflow --update     # 增量更新
npx sdd-workflow --dry-run    # 预览
```

---

## 四、全自动流水线（sdd-run）

### 4.1 设计灵感

SDD 的全自动流水线设计灵感来自 Anthropic 的 Harness 设计思想：将 AI 的角色拆分为三个独立阶段——规划器（Planner）、生成器（Generator）、评估器（Evaluator），形成自主闭环。

```
人类输入: "/sdd-run 004 新增XX功能"
         │
         ▼
┌──────────────────────────────────────────────┐
│  Phase 0: 需求澄清（唯一的人类交互环节）        │
│    分析需求 → 一次性提出所有澄清问题             │
│    → 人类回答 → 确认无误 → 进入全自动           │
│         │                                     │
│         ▼  ⛔ 此后全自动，不再打扰人类           │
│  Phase A: 规划器（Planner）                    │
│    A1. specify → A2. testcases →              │
│    A3. plan → A4. tasks                       │
│         │                                     │
│         ▼                                     │
│  Phase B: 生成器（Generator）                  │
│    B1. implement（全自动）                     │
│         │                                     │
│         ▼                                     │
│  Phase C: 评估器（MACE 多Agent竞争评审）        │
│    C1. 并行派发 3 个评审 Agent                  │
│    ├─ A:严苛审查员 → 功能+代码质量              │
│    ├─ B:需求守护者 → 需求+边界处理              │
│    └─ C:集成检查员 → 集成+架构合规              │
│    C2. 仲裁合并 → 不通过？                      │
│         │          │                          │
│         │          ▼                          │
│         │    自动修复 → 重新评审（最多3轮）      │
│         ▼                                     │
│  输出最终报告 ──→ 人类验证                      │
└──────────────────────────────────────────────┘
```

### 4.2 为什么只有 Phase 0 需要人类

软件工程中最大的浪费不是写代码，而是返工。返工的根因通常是需求理解偏差——AI 按自己的理解实现了，但不符合用户的预期。

SDD 的解决方案是：**在动手之前一次性问清楚所有不确定的点**。

Phase 0 的设计原则：

- **一次性提问**：把所有问题集中在一轮提出，避免多轮来回
- **给出默认选项**：每个问题提供候选答案，用户可以直接选择
- **已有答案不问**：文档或代码中已明确的信息不重复确认
- **最少问题原则**：如果预分析后没有不确定项，直接跳过澄清

澄清完成后，AI 进入全自动模式。此后直到最终报告输出，不再打扰人类。

### 4.3 规划器（Planner）

规划器自动生成四份文档：

**A1. spec.md — 功能规格**
- 用户故事 + 验收标准（Gherkin 格式）
- 功能需求列表（含优先级）
- 界面需求（ASCII 示意）
- 边界条件和异常场景
- 功能分组与完成定义

**A2. testcases.md — 测试用例**
- 单元测试 / 集成测试 / API 测试 / 前端组件测试 / E2E 测试
- 边界条件测试
- 性能测试场景
- 测试-实现映射关系

**A3. plan.md — 技术方案**
- 架构设计
- 数据模型（DDL）
- API 设计（URL、参数、响应格式）
- 前后端实现设计
- 阶段合约（每个 Phase 的交付物 + 验证标准）

**A4. tasks.md — 任务分解**
- 按阶段拆分的可执行任务
- 每个任务包含文件路径、依赖关系、验收标准
- 支持并行标记（标 [P] 的任务可并行执行）

规划器的关键特点是**文件驱动**：每份文档实时保存到磁盘，即使中途中断，也可以通过 `--from` 参数从任意阶段恢复。

### 4.4 生成器（Generator）

生成器按 tasks.md 逐任务执行：

1. 逐 Phase 推进：后端 → 前端 → 测试验收
2. 每个 Phase 完成后自动合约自检
3. 遇到问题按反馈级别自动处理：
   - **L1（方案调整）**：自动修正 plan/tasks + 代码
   - **L2（需求漏洞）**：自动补充 spec + 级联更新
   - **L3（方向性错误）**：暂停，等待人类决策

与手动模式的区别：跳过"每完成一个任务等待确认"，直接一口气执行完。

### 4.5 评估器与 MACE 评审

这是 SDD 最核心的设计创新。

---

## 五、MACE：多 Agent 竞争评审

### 5.1 为什么需要 MACE

单 Agent 自评存在两个系统性问题：

1. **自我肯定偏差**：AI 倾向于积极评价自己的工作，尤其是实现完成后立即评审
2. **单点盲区**：单个 Agent 的审查视角有限，容易遗漏特定维度的问题

MACE（Multi-Agent Competitive Evaluation）通过三个机制解决这些问题：

- **独立性**：3 个 Agent 各自拥有独立上下文窗口，看不到 Generator 的思考过程
- **分工性**：每个 Agent 审查不同维度，减少盲区
- **竞争性**：通过共识机制（≥2 个 Agent 认同）提高评审准确性

### 5.2 三个评审 Agent

| Agent | 角色 | 审查维度 | 输入上下文 |
|-------|------|----------|------------|
| A: 严苛审查员 | 找出所有代码问题 | 功能完整性 + 代码质量 | spec + plan + 代码 |
| B: 需求守护者 | 代表最终用户 | 需求一致性 + 边界处理 | spec + testcases + 代码 |
| C: 集成检查员 | 端到端验证 | 集成完整性 + 架构合规 | plan + testcases + 代码 + constitution |

三个 Agent **必须在同一条消息中并行派发**，确保独立性。每个 Agent 的 prompt 中直接注入所需文档内容，无需自行定位文件。

### 5.3 仲裁规则

收集 3 个 Agent 的评审结果后，执行仲裁合并：

**问题确认机制**：
- ≥2 个 Agent 同时发现的问题 → **确认**，并提升一级严重度
- 仅 1 个 Agent 发现的非 HIGH 问题 → **待确认**，进入二次验证

**二次验证**：对待确认问题，再派发 3 个 Agent 进行聚焦式评审：
- ≥2 个 Agent 确认 → 升级为「确认」，纳入修复清单
- ≤1 个 Agent 确认 → 标记为「过度审查」，不纳入修复清单

**硬阈值**：
- 功能完整性 ≥ 4/5（必须）
- 需求一致性 ≥ 4/5（必须）
- 任意维度出现 HIGH 问题 → 必须迭代

### 5.4 自动迭代

评审不通过时，SDD 自动执行修复循环：

```
评审不通过 → 提取确认问题 → 按严重度排序 → 逐一修复 → 重新派发 3 个 Agent → 仲裁 → ...
（最多 3 轮，超过则暂停等待人类）
```

每一轮迭代的评审报告独立保存，保证完整的可追溯性：

```
.specify/specs/001-user-auth/
├── review-phase1-r1.md    # Phase 1 第 1 轮评审
├── review-phase1-r2.md    # Phase 1 第 2 轮（迭代后）
├── review-final-r1.md     # 最终评审
└── review-summary.md      # 评审总结（通过后汇总）
```

---

## 六、反馈闭环机制

SDD 不是简单的线性流水线，而是包含反馈闭环的自纠错系统。

### 6.1 三级反馈

| 级别 | 场景 | 处理方式 | 示例 |
|------|------|----------|------|
| L1 方案调整 | 实现发现 plan 设计需微调 | 自动修正 plan/tasks + 代码 | 某个 API 需要额外参数 |
| L2 需求漏洞 | 发现 spec 中遗漏的边界条件 | 自动补充 spec + 级联更新所有下游文档 | 发现并发场景未处理 |
| L3 方向错误 | 需求理解有根本性偏差 | 暂停，输出影响分析，等待人类决策 | 需求实际是报表而非列表 |

### 6.2 级联更新

当上游文档被修正时，所有下游文档自动级联更新：

```
spec 变更 → testcases 更新 → plan 更新 → tasks 更新 → implement 更新
```

每次变更都记录 CR（Change Record），保证可追溯。

---

## 七、安装与使用

### 7.1 两种安装模式

**Marketplace 模式（推荐）**

```bash
# 通过 Claude Code 插件市场安装
claude plugin marketplace add zhaodeezhu/sdd-workflow
claude plugin install sdd-workflow@sdd-workflow
```

- 命令前缀：`/sdd-workflow:sdd-*`
- 无文件侵入项目
- 支持自动更新

**文件模式（完全控制）**

```bash
# 通过 npx 安装到项目
npx sdd-workflow
```

- 命令前缀：`/sdd-*`
- 文件复制到 `.claude/` 和 `.specify/`
- 可自定义模板
- 支持离线使用

### 7.2 快速开始

```bash
# 1. 初始化项目
/sdd-init                          # 分析项目，生成宪法

# 2. 全自动模式（推荐）
/sdd-run 001 用户登录功能            # 一键从需求到代码

# 3. 或手动逐步模式
/sdd-specify 用户登录功能            # 写规格
/sdd-testcases                     # 写测试用例
/sdd-plan                          # 写技术方案
/sdd-tasks                         # 拆任务
/sdd-implement                     # 写代码
/sdd-review                        # 评审
```

### 7.3 全自动流水线示例

```
> /sdd-run 004 新增版本对比功能

━━━ 需求澄清 ━━━

我已分析你的需求「新增版本对比功能」，以下问题需要确认：

1. 对比的基准是什么？ — （影响算法设计）
   [a] 最新版本 vs 历史版本
   [b] 任意两个版本互比
   [c] 连续版本逐一对比

2. 差异粒度？ — （影响展示方式）
   [a] 字段级对比
   [b] 行级对比

请逐一回答，或补充你认为重要的信息。确认完毕后我将全自动执行，不再打扰。

> ab

✅ 需求澄清完成，我的理解是：
  - 支持任意两个版本互比
  - 字段级差异展示

🚀 开始全自动执行...

[... 全自动执行 specify → testcases → plan → tasks → implement → review ...]

━━━ SDD v3 执行报告 ━━━

功能: 004 - 版本对比
迭代轮次: 2

📋 产出文件:
  ✅ spec.md
  ✅ testcases.md (32 个测试场景)
  ✅ plan.md (3 Phase, 12 合约项)
  ✅ tasks.md (18 个任务)

📊 最终评审（MACE 多Agent竞争评审）:
  功能完整性: 5/5 (A-严苛审查员) | 需求一致性: 5/5 (B-需求守护者)
  代码质量: 4/5 (A-严苛审查员)   | 边界处理: 5/5 (B-需求守护者)
  集成完整性: 5/5 (C-集成检查员)
  结论: PASS

📝 变更文件:
  后端: 6 个文件新增, 2 个文件修改
  前端: 4 个文件新增, 1 个文件修改

🔄 迭代记录:
  Round 1: ITERATE - 缺少空数据边界处理 → 已补充空状态组件
  Round 2: PASS

请验收以上结果。
```

### 7.4 中断恢复

流水线支持从任意阶段恢复：

```bash
/sdd-run 004 --from implement    # 计划已就绪，只执行实现
/sdd-run 004 --from review       # 代码已写完，只执行评审
```

产出文件实时保存，不会因中断丢失进度。

---

## 八、12 个 Skill 概览

| Skill | 用途 | 分类 |
|-------|------|------|
| `sdd-init` | 初始化项目，生成宪法 | 入口 |
| `sdd-run` | 全自动流水线（specify → review） | 自动化 |
| `sdd-specify` | 创建功能规格文档 | 核心流水线 |
| `sdd-testcases` | 设计测试用例 | 核心流水线 |
| `sdd-plan` | 创建技术实施方案 | 核心流水线 |
| `sdd-tasks` | 分解开发任务 | 核心流水线 |
| `sdd-implement` | 执行编码实现 | 核心流水线 |
| `sdd-review` | MACE 多 Agent 评审 | 核心流水线 |
| `sdd-constitution` | 创建/更新项目宪法 | 配置 |
| `sdd-fix` | Bug 修复（3 Agent 并行排查 + 沉淀闭环） | 核心流水线 |
| `sdd-idea` | 功能创意头脑风暴 | 工具 |
| `sdd-split` | 拆分大型文档 | 工具 |

所有 Skill 既可以独立使用（手动模式），也可以通过 `sdd-run` 编排执行（全自动模式）。

---

## Bug 修复流程（sdd-fix）

### 问题

SDD 的功能开发流水线很完善，但开发完后的 Bug 修复是割裂的：
- Bug 修完没有文档记录，经验无法复用
- 同一个坑反复踩，没有防坑规则沉淀
- Bug 修复与原始 spec/plan/testcases 无关联

### 解决方案：sdd-fix

`sdd-fix` 是一个全自动 Bug 修复 skill，核心创新是**3 Agent 并行排查 + 沉淀闭环**：

```
/sdd-fix 001 "提交表单后数据丢失"
     │
     ▼
Phase 1: 根因分析
  ├─ A: 代码侦探（追踪代码逻辑）
  ├─ B: 规格对比（对照 spec/plan 找偏差）
  └─ C: 测试侦探（分析测试盲区）
  → 仲裁合并 → 确认根因

Phase 2: 红-绿-重构修复
  🔴 写回归测试 → 🟢 修复代码 → 🔵 验证

Phase 3: 沉淀闭环
  ├─ 回归测试追加到 testcases.md
  ├─ Bug 报告保存到 bugs/ 目录
  └─ 防坑规则提炼到 constitution.md
```

### 良性循环

每次 Bug 修复都沉淀经验，下次开发时自动参考：

```
开发功能 → 发现 Bug → sdd-fix 排查修复 → 沉淀到宪法和测试用例
    ↑                                              │
    └────────── 下次开发自动参考防坑规则 ─────────────┘
```

### 产出文件

Bug 报告保存在已有 spec 目录下：

```
.specify/specs/{feature_id}/
├── bugs/BUG-001-form-data-loss.md   ← Bug 报告
├── testcases.md                     ← 追加回归测试
├── spec.md                          ← 如有规格遗漏会更新
└── plan.md                          ← 如有设计缺陷会更新
```

---

## 九、设计哲学总结

### 1. 人类只做决策，不做传话

SDD 将人类参与压缩到最少：只在需求澄清时参与一次，在最终验收时参与一次。中间的所有步骤——规格编写、方案设计、任务拆分、编码、评审、修复——全部由 AI 自主完成。

人类不再充当 AI 之间的"传话筒"，而是充当"决策者"。

### 2. 文档是契约，不是形式

SDD 中的文档不是应付流程的文书，而是 AI 执行的输入契约。每份文档都有明确的内容边界（What/How/When），模糊地带会被下游阶段发现并反馈修正。

### 3. 评审独立于实现

AI 不应该审查自己的代码。MACE 通过 3 个独立 Agent 并行评审 + 共识仲裁，最大程度消除自我肯定偏差和单点盲区。

### 4. 自动不等于降低标准

全自动执行的质量标准与手动逐步执行完全一致：
- 硬阈值不变（功能完整性 ≥ 4，需求一致性 ≥ 4）
- 评审维度不变（5 个维度，加权评分）
- 文档产出不变（spec/testcases/plan/tasks 全量产出）

自动化的不是质量标准，而是重复的人工确认环节。

### 5. 失败可恢复

所有产出文件实时保存到磁盘。中途中断后，通过 `--from` 参数从任意阶段恢复。反馈分级（L1/L2/L3）确保大部分问题自动修复，只有方向性错误才需要人类介入。

---

## 十、适用场景

**SDD 适合：**

- 中大型功能开发（3+ 个文件，涉及前后端）
- 需求明确的功能实现（有文档或清晰的口头描述）
- 团队协作场景（需要文档留痕和可追溯性）
- 对代码质量有要求的项目（需要结构化评审）

**SDD 可能过重：**

- 单文件 bug 修复
- 简单配置变更
- 探索性原型开发
- 紧急热修复

对于轻量场景，可以直接使用 Claude Code 的原生能力。SDD 是在"快"和"稳"之间选择了"稳"。

---

*SDD Workflow 由 zhaodeezhu 开发，开源在 GitHub：zhaodeezhu/sdd-workflow*
