---
name: sdd-workflow
description: SDD 工作流总览 - 查看 SDD (Specification-Driven Development) 的安装方式、使用方法和完整命令列表。一句话即可完成从需求到代码的全自动开发。
invocable: true
---

# SDD Workflow - 规格驱动开发工作流

> **先写规格，再写代码。** 一句话完成从需求到上线的全自动开发。

## 一句话完成需求

```
/sdd-run 001 新增用户登录功能
```

这一条命令会自动执行完整的 6 步流水线：**规格说明 → 测试用例 → 技术方案 → 任务分解 → 代码实现 → 质量评审**。中间无需人工干预，评审不通过自动修复迭代（最多 3 轮）。

---

## 安装

### 方式一：Marketplace 安装（推荐）

不往项目里添加任何文件，轻量无侵入：

```bash
# 1. 添加 marketplace
claude plugin marketplace add zhaodeezhu/sdd-workflow

# 2. 安装插件
claude plugin install sdd-workflow@sdd-workflow
```

安装后所有命令需要加命名空间前缀 `/sdd-workflow:`，例如：
```
/sdd-workflow:sdd-init
/sdd-workflow:sdd-run 001 新增用户登录功能
```

更新和卸载：
```bash
claude plugin update sdd-workflow        # 更新到最新版
claude plugin uninstall sdd-workflow     # 卸载
```

### 方式二：npx 文件安装

将 skill 文件复制到项目中，完全可控，支持自定义修改：

```bash
npx sdd-workflow              # 标准安装（跳过已有文件）
npx sdd-workflow --update     # 增量更新（保护你的自定义修改）
npx sdd-workflow --force      # 强制覆盖
npx sdd-workflow --dry-run    # 预览变更
```

安装后命令无前缀，直接使用：
```
/sdd-init
/sdd-run 001 新增用户登录功能
```

### 两种方式对比

| | Marketplace | npx 文件安装 |
|---|---|---|
| 项目内文件 | 无 | skill、模板、团队配置复制到项目 |
| 命令前缀 | `/sdd-workflow:sdd-*` | `/sdd-*` |
| 更新方式 | `plugin update` | `npx sdd-workflow --update` |
| 自定义 | 需 fork 仓库 | 直接编辑 `.claude/skills/` 下的文件 |
| 适合场景 | 快速体验、保持最新 | 完全控制、离线使用、深度定制 |

---

## 快速开始

### 第一步：初始化项目

```
/sdd-init
```

自动分析项目技术栈，生成项目宪法（`.specify/memory/constitution.md`）。项目宪法定义了技术栈、架构约束、开发原则和评审标准，后续所有命令都以此为上下文。

### 第二步：开始开发

**全自动模式**（推荐）：

```
/sdd-run 001 新增用户登录功能
```

流程会先澄清需求（唯一需要人工交互的环节），然后全自动执行：

```
需求澄清 → 规格说明 → 测试用例 → 技术方案 → 任务分解 → 代码实现 → MACE 多Agent评审
           └─────────────────────────────────────────────────────────────┘
                              全自动，不再打扰人类
```

**手动逐步模式**：

```
/sdd-specify 用户登录功能        # 1. 创建功能规格（描述 What）
/sdd-testcases                   # 2. 设计测试用例（描述 Verify）
/sdd-plan                        # 3. 制定技术方案（描述 How）
/sdd-tasks                       # 4. 分解开发任务（描述 When）
/sdd-implement                   # 5. 执行开发（写代码）
/sdd-review                      # 6. 独立质量评审
```

手动模式适合需要每步确认的场景。

### 中断恢复

如果流程中断，可以从指定阶段继续：

```
/sdd-run 001 --from implement    # 跳过规划，直接从实现开始
/sdd-run 001 --from review       # 只执行评审
```

---

## 全部命令

### 核心流水线

| 命令 | 说明 | 输入 | 输出 |
|------|------|------|------|
| `/sdd-specify` | 创建功能规格 | 功能名称或知识库链接 | `spec.md` |
| `/sdd-testcases` | 设计测试用例 | `spec.md` | `testcases.md` |
| `/sdd-plan` | 制定技术方案 | `spec.md` + `testcases.md` | `plan.md` |
| `/sdd-tasks` | 分解开发任务 | `plan.md` | `tasks.md` |
| `/sdd-implement` | 执行开发任务 | `tasks.md` | 代码变更 |
| `/sdd-review` | 独立质量评审 | spec + plan + 代码 | 评审报告 |

### 自动化

| 命令 | 说明 |
|------|------|
| `/sdd-run {id} {描述}` | 全自动流水线：从规格到评审一条龙 |
| `/sdd-init` | 初始化 SDD（仅首次） |
| `/sdd-constitution` | 创建或更新项目宪法 |

### 辅助工具

| 命令 | 说明 |
|------|------|
| `/sdd-idea` | 需求随想录：随手记录灵感，时机成熟一键升级到开发 |
| `/sdd-split` | 拆分大文档为模块化结构 |
| `/sdd-fix` | Bug 修复：3 Agent 并行诊断根因 |
| `/sdd-notify configure` | 配置飞书通知（任务完成时推送消息） |
| `/sdd-notify test` | 发送测试通知 |

---

## 项目结构

安装并初始化后，项目结构如下：

```
your-project/
├── .claude/
│   └── skills/sdd-*/          SDD skill 文件（npx 安装方式）
└── .specify/
    ├── memory/
    │   └── constitution.md    项目宪法（技术栈、约束、原则）
    └── specs/
        └── 001-feature-name/
            ├── spec.md        功能规格（What）
            ├── testcases.md   测试用例（Verify）
            ├── plan.md        技术方案（How）
            └── tasks.md       任务分解（When）
```

### 文档职责分离

| 文档 | 回答的问题 | 不包含 |
|------|-----------|--------|
| `spec.md` | 做什么、为什么 | 技术实现细节 |
| `testcases.md` | 如何验证正确性 | 实现代码 |
| `plan.md` | 技术上怎么做 | 具体代码 |
| `tasks.md` | 什么时候做 | 实现细节 |

---

## 核心特性

### MACE 多 Agent 竞争评审

评审环节不是 AI 自己审自己，而是派发 3 个独立 Agent 并行审查：

| Agent | 角色 | 审查维度 |
|-------|------|----------|
| A: 严苛审查员 | 找出所有代码问题 | 功能完整性 + 代码质量 |
| B: 需求守护者 | 代表最终用户 | 需求一致性 + 边界处理 |
| C: 集成检查员 | 端到端验证 | 集成完整性 + 架构合规 |

≥2 个 Agent 确认的问题才会被采纳，避免误报。评审不通过自动修复并重新评审。

### 飞书通知

长时间任务（`sdd-run`、`sdd-review`）完成时自动推送飞书消息，不用盯着终端。运行 `/sdd-notify configure` 配置。

### 项目宪法

所有代码必须符合项目宪法（`.specify/memory/constitution.md`）中定义的约束，包括技术栈、架构模式、开发原则等。宪法由 `/sdd-init` 自动生成，可随时用 `/sdd-constitution` 更新。

---

## 环境要求

- [Claude Code](https://claude.ai/claude-code) CLI
- Node.js >= 14.0.0（仅安装时需要）
- Git（推荐）
