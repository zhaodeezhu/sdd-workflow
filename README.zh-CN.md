# SDD Workflow

[Claude Code](https://claude.ai/claude-code) 的规格驱动开发（Specification-Driven Development）工具包。安装技能、模板和工具到任何项目，让 AI 辅助开发流程化、结构化。

## 什么是 SDD？

SDD（Specification-Driven Development）是一种先写规格再写代码的开发工作流。它将 TDD 的纪律与 AI 辅助实现相结合，通过 Claude Code 技能强制执行。

流水线：

```
Specify --> Test Cases --> Plan --> Tasks --> Implement --> Review
 (做什么)    (怎么验证)   (怎么做)  (什么时候)  (写代码)    (质量把关)
```

每个阶段产出一份文档。文档即合约。AI 按合约实现代码。独立评审验证合规性。

## 快速开始

### 方式 A：通过插件市场安装（推荐）

添加 SDD Workflow 市场，然后安装插件：

```bash
# 第 1 步：添加市场
claude plugin marketplace add zhaodeezhu/sdd-workflow

# 第 2 步：安装插件
claude plugin install sdd-workflow@sdd-workflow
```

技能带有 `sdd-workflow` 命名空间前缀：

```
/sdd-workflow:sdd-init        初始化 SDD
/sdd-workflow:sdd-run         全自动流水线
/sdd-workflow:sdd-specify     创建功能规格
/sdd-workflow:sdd-testcases   设计测试用例
/sdd-workflow:sdd-plan        规划技术方案
/sdd-workflow:sdd-tasks       拆分开发任务
/sdd-workflow:sdd-implement   执行开发
/sdd-workflow:sdd-review      独立质量评审
...
```

更新到最新版本：

```bash
claude plugin update sdd-workflow
```

卸载：

```bash
claude plugin uninstall sdd-workflow
```

### 方式 B：通过 npx 安装（文件拷贝模式）

将技能、模板和团队配置直接拷贝到项目中：

```bash
npx sdd-workflow
```

安装后的目录结构：

```
your-project/
├── .claude/
│   ├── skills/sdd-*/       11 个 SDD 技能
│   └── teams/               团队配置
└── .specify/
    ├── memory/              项目宪法（后续生成）
    ├── specs/               功能规格目录
    ├── templates/           文档模板
    └── scripts/             工具脚本
```

技能无需命名空间前缀，直接调用：

```
/sdd-init                    初始化 SDD
/sdd-run                     全自动流水线
/sdd-specify                 创建功能规格
...
```

### 初始化与开发

无论哪种安装方式，在项目中打开 Claude Code 后运行：

```
/sdd-init                    # 市场用户用 /sdd-workflow:sdd-init
```

该命令分析项目结构，检测技术栈，在 `.specify/memory/constitution.md` 生成项目专属的宪法文件。

然后开始开发功能：

```
# 全自动流水线
/sdd-run 001 添加用户认证

# 或手动逐步执行
/sdd-specify 用户认证
/sdd-testcases
/sdd-plan
/sdd-tasks
/sdd-implement
/sdd-review
```

> **市场用户注意**：所有命令需加 `sdd-workflow:` 前缀，如 `/sdd-workflow:sdd-run 001 添加用户认证`

## 安装方式对比

|  | 市场安装 | npx 安装 |
|---|---|---|
| 安装命令 | `plugin marketplace add` + `plugin install` | `npx sdd-workflow` |
| 项目内文件 | 无 | 技能、模板、团队配置拷贝到项目 |
| 技能前缀 | `/sdd-workflow:sdd-*` | `/sdd-*` |
| 更新方式 | `plugin update sdd-workflow` | `npx sdd-workflow --update` |
| 自定义 | Fork 仓库后修改 | 直接编辑 `.claude/skills/` 中的文件 |
| 适用场景 | 快速上手、始终最新 | 完全控制、离线使用、深度定制 |

## npx 安装选项

```bash
npx sdd-workflow              # 标准安装（跳过已存在的文件）
npx sdd-workflow --update     # 增量更新（仅更新有变化的文件）
npx sdd-workflow --force      # 强制覆盖所有文件
npx sdd-workflow --dry-run    # 预览将要安装/更新的内容
npx sdd-workflow --update --dry-run  # 预览更新
```

### 更新模式

| 模式 | 行为 | 使用场景 |
|------|------|----------|
| (默认) | 跳过已存在的文件 | 首次安装 |
| `--update` | 仅更新源文件有变化的文件，跳过用户自定义的文件 | 升级 sdd-workflow 后 |
| `--force` | 覆盖所有文件 | 重置为默认值 |

**`--update` 工作原理**：首次安装时会创建清单文件（`.specify/.sdd-manifest.json`）记录文件哈希。运行 `--update` 时，对比源文件与清单：
- 源文件变化，目标文件未修改 → 自动更新
- 源文件变化，目标文件也被你修改过 → **跳过**（保护你的自定义内容）
- 源文件有新增 → 自动添加
- 无变化 → 跳过

## 可用命令

### 核心流水线

| 命令 | 说明 | 输入 | 输出 |
|------|------|------|------|
| `/sdd-specify` | 创建功能规格 | 功能名称或知识库链接 | `spec.md` |
| `/sdd-testcases` | 设计测试用例 | spec.md | `testcases.md` |
| `/sdd-plan` | 规划技术方案 | testcases.md + spec.md | `plan.md` |
| `/sdd-tasks` | 拆分开发任务 | plan.md | `tasks.md` |
| `/sdd-implement` | 执行开发任务 | tasks.md | 代码变更 |
| `/sdd-review` | 独立质量评审 | spec + plan + 代码 | 评审报告 |

### 自动化

| 命令 | 说明 |
|------|------|
| `/sdd-run <id> <描述>` | 全自动流水线：从规格到评审一站式完成 |
| `/sdd-init` | 初始化 SDD（仅首次） |
| `/sdd-constitution` | 创建或更新项目宪法 |

### 工具

| 命令 | 说明 |
|------|------|
| `/sdd-split` | 拆分大型 SDD 文档为模块化结构 |

## 项目宪法

宪法文件（`.specify/memory/constitution.md`）是 SDD 在你项目中的基础。它定义了：

- **技术栈** -- 从项目中检测到的语言、框架、库
- **绝对规则** -- 数据完整性、查询性能、安全基线
- **开发原则** -- 简洁性、代码质量、测试标准
- **架构约束** -- 基于项目架构模式的约束
- **评审标准** -- 评分维度、权重和通过阈值
- **经验教训** -- 积累的项目专属知识

宪法由 `/sdd-init` 生成，可用 `/sdd-constitution` 更新。所有后续 SDD 命令都会读取它作为上下文。

## 文档结构

每个功能在 `.specify/specs/` 下组织：

```
.specify/
├── memory/
│   └── constitution.md          项目宪法
└── specs/
    └── 001-feature-name/
        ├── spec.md              做什么（功能规格）
        ├── testcases.md         怎么验证（测试用例）
        ├── plan.md              怎么做（技术方案）
        └── tasks.md             什么时候做（任务拆分）
```

### 文档职责

| 文档 | 回答的问题 | 不包含的内容 |
|------|-----------|-------------|
| `spec.md` | 做什么、为什么做 | 技术实现细节 |
| `testcases.md` | 如何验证正确性 | 实现代码 |
| `plan.md` | 技术上如何实现 | 具体代码 |
| `tasks.md` | 按什么顺序实现 | 实现细节 |

## 与 Claude Code 的协作方式

SDD Workflow 提供两种安装方式，工作机制各有不同：

### 市场模式

1. `claude plugin marketplace add zhaodeezhu/sdd-workflow` 注册市场
2. `claude plugin install sdd-workflow@sdd-workflow` 从市场安装插件
3. Claude Code 在会话启动时加载技能名称和描述（渐进式加载）
4. 使用 `/sdd-workflow:sdd-<名称>` 调用技能
5. 完整技能内容按需加载——不会在你的项目中留下文件
6. 技能执行时按需创建 `.specify/` 目录

### 文件模式

1. `npx sdd-workflow` 将技能文件拷贝到 `.claude/skills/`
2. Claude Code 自动发现该目录下的技能
3. 使用 `/sdd-<名称>` 调用技能
4. Claude Code 读取技能指令并执行
5. 技能引用 `.specify/templates/` 中的模板和 `.specify/memory/` 中的宪法

### Agent 团队

本工具包还包含多 Agent 协作的团队配置，适用于需要多视角的复杂任务：

- **功能开发团队**（5 个角色）-- 全栈功能实现
- **代码评审团队**（3 个角色）-- 安全、性能、质量审查
- **调试团队**（4 个角色）-- 复杂 Bug 调查，含对抗性推理
- **研究团队**（3 个角色）-- 技术评估和架构分析
- **SDD 规划团队**（4 个角色）-- 协作式规格制定和方案规划

通过设置环境变量 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` 启用团队功能。

## 配置指南

### CLAUDE.md 集成

安装后，在项目的 `CLAUDE.md` 中添加以下内容（如已有则追加），让 Claude Code 始终知道 SDD 处于激活状态：

```markdown
## SDD Workflow

本项目使用 SDD（规格驱动开发）工作流。

### 快速开始
1. `/sdd-init` -- 初始化 SDD（仅首次）
2. `/sdd-run <id> <描述>` -- 全自动流水线（推荐）
3. 或使用独立命令：/sdd-specify, /sdd-testcases, /sdd-plan, /sdd-tasks, /sdd-implement, /sdd-review

### 文档结构
- `.specify/memory/constitution.md` -- 项目宪法
- `.specify/specs/<id>-<名称>/` -- 功能规格
```

### .gitignore

建议添加：

```
.specify/specs/     # 功能规格（项目专属，可重新生成）
.specify/memory/    # 项目记忆（本地上下文）
```

### 自定义

- **模板**：编辑 `.specify/templates/` 中的文件以匹配团队的文档风格
- **宪法**：编辑 `.specify/memory/constitution.md` 添加项目专属规则
- **技能**：修改 `.claude/skills/sdd-*/SKILL.md` 调整技能行为

## 环境要求

- [Claude Code](https://claude.ai/claude-code) CLI
- Node.js >= 14.0.0（仅安装时需要）
- Git（推荐）

## 许可证

MIT
