---
name: sdd-run
description: SDD v4 全自动执行流水线 - Agent-Per-Phase 架构，每个阶段独立 Agent 执行，主进程轻量编排，评审全 5 分制
invocable: true
---

# SDD Run v4 — Agent-Per-Phase 全自动流水线

> **v4 核心改进**：每个阶段由独立 Agent 执行（独立上下文窗口），主进程只做轻量编排。
> 评审全 5 分制，评审 Agent 只写文件，仲裁读文件综合评判。

## 核心原则

1. **Agent 隔离**：每个阶段独立 Agent，独立上下文窗口，不累积上下文
2. **文档驱动**：Agent 之间通过文件产物传递上下文，主进程不读文档内容
3. **评审严格**：全部维度 5 分 + 0 确认问题 = PASS，否则 ITERATE
4. **评审隔离**：每个评审 Agent 只写报告文件，仲裁 Agent 从文件读取综合评判
5. **人类主权**：Phase 0 需求澄清是唯一人类交互，L3 问题暂停等人类决策

## 前置条件

- 项目宪法: `.specify/memory/constitution.md`
- 项目配置: `CLAUDE.md`

## 输入格式

```
/sdd-run {feature_id} {功能描述或知识库链接}
/sdd-run {feature_id} --from {stage}     # 从指定阶段恢复
```

**feature_id 命名规范**：三位数字编号自增（001, 002, 003...），目录格式 `{id}-{name}/`

---

## 执行流程

### 总体架构

```
主进程（轻量编排器）
│  职责：派发 Agent、检查文件存在、读结论行、控制迭代
│  不读文档内容、不累积上下文
│
├── Phase 0: 需求澄清（主进程 — 唯一人类交互）
│
├── Agent: Specify → spec.md
├── Agent: Testcases → testcases.md
├── Agent: Plan → plan.md
├── Agent: Tasks → tasks.md
│
├── Agent: Implement（不拆分，内部严格串行）
│
├── 评审循环（最多 3 轮）：
│   ├── Agent: Review-A → reviews/r{n}/agent-a.md     ─┐
│   ├── Agent: Review-B → reviews/r{n}/agent-b.md      │ 并行
│   ├── Agent: Review-C → reviews/r{n}/agent-c.md     ─┘
│   ├── Agent: Arbitrate → reviews/r{n}/arbitrate.md
│   │   ├── PASS → reviews/summary.md → 结束
│   │   └── ITERATE → reviews/r{n}/fix-directives.md
│   │       └── Agent: Fix → 回到评审循环
│
└── 最终报告 → 人类验收
```

---

### Phase 0: 需求澄清（主进程执行）

> 全流程中唯一的人类交互环节。

#### 0.1 需求预分析

1. **解析输入**：提取功能名称、描述、知识库链接（如有）
2. **获取知识库文档**（如有链接）：如果项目配置了知识库 MCP 工具（如 Confluence），使用对应工具获取原始需求
3. **读取项目上下文**：
   - `.specify/memory/constitution.md`（技术栈约束）
   - `CLAUDE.md`（项目配置）
   - 同模块已有的 spec 文档（如有）
4. **扫描相关代码**（如涉及现有模块）：了解当前实现状态

#### 0.2 生成澄清问题

基于预分析结果，列出需要确认的问题。**只问真正不确定的**，不问文档中已明确的内容。

**典型问题分类**：

| 分类 | 示例问题 |
|------|----------|
| 业务范围 | 这个功能是新增还是对现有功能的修改？影响哪些页面/接口？ |
| 规则确认 | 对比的基准是哪个？差异判定规则是什么？ |
| 数据来源 | 数据从哪个表/接口获取？有现成的 API 可复用吗？ |
| 边界条件 | 最多支持多少条数据？并发场景需要考虑吗？ |
| 排除项 | 这次不需要做 XX 功能对吧？（确认负向范围） |
| 非功能需求 | 性能要求？权限控制？ |

**输出格式**：

```
━━━ 需求澄清 ━━━

我已分析你的需求「{功能描述}」，以下问题需要确认：

1. {问题} — （{为什么需要确认}）
2. {问题} — （{为什么需要确认}）
3. ...

请逐一回答，或补充你认为重要的信息。确认完毕后我将全自动执行，不再打扰。
```

#### 0.3 澄清规则

- **一次性提问**：把所有问题集中在一轮提出，不要多轮追问
- **给出默认选项**：每个问题尽量提供 2-3 个候选答案，人类可以直接选择
- **标注优先级**：关键问题标注 [必答]，次要问题标注 [可选]
- **已有答案不问**：知识库文档或现有代码中已明确的信息不重复确认
- **最少问题原则**：如果预分析后没有不确定项，直接说明"无需澄清"并进入全自动

#### 0.4 澄清完成

人类回答后：
1. 整理澄清结论，保存到 `.specify/specs/{feature_id}/requirements/clarification.md`
2. 简要复述理解，确认无误解
3. **进入全自动模式**：此后直到最终报告输出，不再打扰人类

```
✅ 需求澄清完成，我的理解是：
  - {要点1}
  - {要点2}
  - ...

🚀 开始全自动执行（v4 Agent-Per-Phase 架构）
  每个阶段由独立 Agent 执行，评审全 5 分制。
  过程中如有 L3 级方向性问题会暂停，否则一路到底。
```

---

### Phase A: 规划器（4 个串行 Agent）

每个 Agent 独立派发，独立上下文窗口。Agent 完成后主进程只检查文件是否存在。

> **关键**：每个 Agent 的 prompt 告诉它"先读指令文件，再按指令执行"。
> 指令文件路径：`.specify/templates/agent-prompts/{stage}.md`

#### A1. Agent: Specify

使用 Agent 工具派发：

```python
Agent(
    name = "sdd-specify",
    subagent_type = "general-purpose",
    description = "SDD-Specify",
    prompt = """
你是 SDD 功能规格生成器。

第一步：读取你的执行指令文件：
.specify/templates/agent-prompts/specify.md

第二步：按指令执行，需要读取的项目文件：
- .specify/memory/constitution.md
- CLAUDE.md
- .specify/specs/{feature_id}/requirements/clarification.md（如有）

第三步：将功能规格写入：
.specify/specs/{feature_id}/spec.md

重要：你必须使用 Write 工具保存文件，不要只输出到终端。
完成后只回复"spec.md 已保存"。
"""
)
```

**主进程检查**：确认 `.specify/specs/{feature_id}/spec.md` 文件已生成

#### A2. Agent: Testcases

```python
Agent(
    name = "sdd-testcases",
    subagent_type = "general-purpose",
    description = "SDD-Testcases",
    prompt = """
你是 SDD 测试用例设计器。

第一步：读取你的执行指令文件：
.specify/templates/agent-prompts/testcases.md

第二步：按指令执行，需要读取的项目文件：
- .specify/specs/{feature_id}/spec.md

第三步：将测试用例写入：
.specify/specs/{feature_id}/testcases.md

重要：你必须使用 Write 工具保存文件，不要只输出到终端。
完成后只回复"testcases.md 已保存"。
"""
)
```

**主进程检查**：确认 `testcases.md` 文件已生成

#### A3. Agent: Plan

```python
Agent(
    name = "sdd-plan",
    subagent_type = "general-purpose",
    description = "SDD-Plan",
    prompt = """
你是 SDD 技术计划生成器。

第一步：读取你的执行指令文件：
.specify/templates/agent-prompts/plan.md

第二步：按指令执行，需要读取的项目文件：
- .specify/specs/{feature_id}/spec.md
- .specify/specs/{feature_id}/testcases.md
- .specify/memory/constitution.md
- CLAUDE.md

第三步：将技术计划写入：
.specify/specs/{feature_id}/plan.md

重要：你必须使用 Write 工具保存文件，不要只输出到终端。
完成后只回复"plan.md 已保存"。
"""
)
```

**主进程检查**：确认 `plan.md` 文件已生成

#### A4. Agent: Tasks

```python
Agent(
    name = "sdd-tasks",
    subagent_type = "general-purpose",
    description = "SDD-Tasks",
    prompt = """
你是 SDD 任务分解生成器。

第一步：读取你的执行指令文件：
.specify/templates/agent-prompts/tasks.md

第二步：按指令执行，需要读取的项目文件：
- .specify/specs/{feature_id}/spec.md
- .specify/specs/{feature_id}/testcases.md
- .specify/specs/{feature_id}/plan.md
- .specify/memory/constitution.md

第三步：将任务分解写入：
.specify/specs/{feature_id}/tasks.md

重要：你必须使用 Write 工具保存文件，不要只输出到终端。
完成后只回复"tasks.md 已保存"。
"""
)
```

**主进程检查**：确认 `tasks.md` 文件已生成

**Planner 完成标志**：四份文件均已保存到 `.specify/specs/{feature_id}/`

---

### Phase B: 执行器（1 个 Agent，不拆分）

```python
Agent(
    name = "sdd-implement",
    subagent_type = "general-purpose",
    description = "SDD-Implement",
    prompt = """
你是 SDD 任务执行器。

第一步：读取你的执行指令文件：
.specify/templates/agent-prompts/implement.md

第二步：按指令执行，需要读取的项目文件：
- .specify/specs/{feature_id}/spec.md
- .specify/specs/{feature_id}/testcases.md
- .specify/specs/{feature_id}/plan.md
- .specify/specs/{feature_id}/tasks.md
- .specify/memory/constitution.md

第三步：严格按照 tasks.md 中的 Phase 0→1→2→3 顺序执行所有任务。

重要纪律：
- 必须按步骤执行，不跳步
- 每完成一个 Task 立即更新 tasks.md 状态
- 不要 git commit
- 完成后只回复"实现完成，共修改 N 个文件"。
"""
)
```

**关键**：执行器不拆分为多个 Agent。一个 Agent 内部严格串行执行所有 Phase，保证文件不错乱。

**主进程检查**：确认 `tasks.md` 中的任务状态已更新（`grep -c "✅" tasks.md`）

---

### Phase C: 评审循环

#### C1. 确定评审范围和代码文件列表

主进程收集已修改的代码文件列表：
- 从 `git diff --name-only` 获取变更文件
- 或从 `tasks.md` 的执行记录中提取

#### C2. 创建评审目录

```bash
mkdir -p .specify/specs/{feature_id}/reviews/r{n}
```

#### C3. 并行派发 3 个评审 Agent

> **3 个 Agent 必须在同一条消息中并行派发**

```python
# Agent A: 严苛审查员
Agent(
    name = "review-a",
    subagent_type = "general-purpose",
    description = "SDD评审-严苛审查员",
    prompt = """
你是极其严苛的代码审查专家。

第一步：读取你的执行指令文件：
.specify/templates/agent-prompts/review-a.md

第二步：读取需要审查的文件：
- .specify/specs/{feature_id}/spec.md
- .specify/specs/{feature_id}/plan.md
- {代码文件列表，每行一个}

第三步：将评审报告写入：
.specify/specs/{feature_id}/reviews/r{n}/agent-a.md

重要：你必须使用 Write 工具保存文件，不要只输出到终端。
完成后只回复"agent-a.md 已保存"。
"""
)

# Agent B: 需求守护者
Agent(
    name = "review-b",
    subagent_type = "general-purpose",
    description = "SDD评审-需求守护者",
    prompt = """
你是最终用户的代言人。

第一步：读取你的执行指令文件：
.specify/templates/agent-prompts/review-b.md

第二步：读取需要审查的文件：
- .specify/specs/{feature_id}/spec.md
- .specify/specs/{feature_id}/testcases.md
- {代码文件列表，每行一个}

第三步：将评审报告写入：
.specify/specs/{feature_id}/reviews/r{n}/agent-b.md

重要：你必须使用 Write 工具保存文件，不要只输出到终端。
完成后只回复"agent-b.md 已保存"。
"""
)

# Agent C: 集成检查员
Agent(
    name = "review-c",
    subagent_type = "general-purpose",
    description = "SDD评审-集成检查员",
    prompt = """
你是系统集成专家。

第一步：读取你的执行指令文件：
.specify/templates/agent-prompts/review-c.md

第二步：读取需要审查的文件：
- .specify/specs/{feature_id}/plan.md
- .specify/specs/{feature_id}/testcases.md
- .specify/memory/constitution.md
- {代码文件列表，每行一个}

第三步：将评审报告写入：
.specify/specs/{feature_id}/reviews/r{n}/agent-c.md

重要：你必须使用 Write 工具保存文件，不要只输出到终端。
完成后只回复"agent-c.md 已保存"。
"""
)
```

#### C4. 检查评审报告文件

主进程确认 3 个报告文件都已生成：
```
.specify/specs/{feature_id}/reviews/r{n}/agent-a.md
.specify/specs/{feature_id}/reviews/r{n}/agent-b.md
.specify/specs/{feature_id}/reviews/r{n}/agent-c.md
```

#### C5. 派发仲裁 Agent

```python
Agent(
    name = "sdd-arbitrate",
    subagent_type = "general-purpose",
    description = "SDD-仲裁",
    prompt = """
你是评审仲裁器。

第一步：读取你的执行指令文件：
.specify/templates/agent-prompts/arbitrate.md

第二步：读取 3 份评审报告：
- .specify/specs/{feature_id}/reviews/r{n}/agent-a.md
- .specify/specs/{feature_id}/reviews/r{n}/agent-b.md
- .specify/specs/{feature_id}/reviews/r{n}/agent-c.md

第三步：执行仲裁，将结果写入：
- .specify/specs/{feature_id}/reviews/r{n}/arbitrate.md

如果结论为 ITERATE，额外写入修复指令：
- .specify/specs/{feature_id}/reviews/r{n}/fix-directives.md

如果结论为 PASS，额外写入评审总结：
- .specify/specs/{feature_id}/reviews/summary.md

重要：你必须使用 Write 工具保存文件，不要只输出到终端。
完成后只回复"arbitrate.md 已保存，结论: PASS/ITERATE"。
"""
)
```

#### C6. 读取仲裁结论

主进程只读取 `arbitrate.md` 的结论行：

```bash
grep "结论:" .specify/specs/{feature_id}/reviews/r{n}/arbitrate.md
```

**判定规则**：
- 所有维度 = 5 且 0 个确认问题 → **PASS**
- 否则 → **ITERATE**

- **PASS** → 生成最终报告，流程结束
- **ITERATE** → 进入 C7

#### C7. 派发修复 Agent（ITERATE 时）

```python
Agent(
    name = "sdd-fix",
    subagent_type = "general-purpose",
    description = "SDD-修复",
    prompt = """
你是评审修复执行器。

第一步：读取你的执行指令文件：
.specify/templates/agent-prompts/fix.md

第二步：读取修复指令：
.specify/specs/{feature_id}/reviews/r{n}/fix-directives.md

参考文件（按需读取）：
- .specify/specs/{feature_id}/plan.md

第三步：按指令逐项修复代码。

重要纪律：
- 严格按照修复指令修复，不做额外改动
- 不要修改 spec/testcases/plan/tasks 文档
- 不要 git commit
- 完成后只回复"修复完成，共修复 N 项"。
"""
)
```

修复完成后，回到 C2（创建 `r{n+1}` 目录，重新派发 3 个评审 Agent）。

#### 迭代限制

最多 3 轮评审。超过 3 轮仍未 PASS → 暂停，输出影响分析，等待人类决策。

---

### 最终输出

全自动流水线完成后，输出执行报告：

```
━━━ SDD v4 执行报告 ━━━

功能: {feature_id} - {功能名称}
执行时间: {start} ~ {end}
迭代轮次: {n}

📋 产出文件:
  ✅ spec.md
  ✅ testcases.md
  ✅ plan.md
  ✅ tasks.md
  ✅ reviews/summary.md

📊 最终评审（MACE 全5分制）:
  功能完整性: 5/5 (A-严苛审查员)
  需求一致性: 5/5 (B-需求守护者)
  代码质量: 5/5 (A-严苛审查员)
  边界处理: 5/5 (B-需求守护者)
  集成完整性: 5/5 (C-集成检查员)
  架构合规: 5/5 (C-集成检查员)
  结论: PASS

📝 变更文件:
  后端: {N} 个文件新增, {N} 个文件修改
  前端: {N} 个文件新增, {N} 个文件修改

🔄 迭代记录:
  Round 1: ITERATE - {问题摘要} → {修复摘要}
  Round 2: PASS

📁 评审文件:
  reviews/r1/ — 第 1 轮评审（agent-a/b/c.md, arbitrate.md, fix-directives.md）
  reviews/r2/ — 第 2 轮评审（agent-a/b/c.md, arbitrate.md）
  reviews/summary.md — 评审总结

请验收以上结果。如需修改，告诉我具体问题。
```

---

## 中断与恢复

### `--from` 参数

```
/sdd-run 004 --from specify     # 从规格开始
/sdd-run 004 --from testcases   # 已有 spec
/sdd-run 004 --from plan        # 已有 spec + testcases
/sdd-run 004 --from tasks       # 已有 spec + testcases + plan
/sdd-run 004 --from implement   # 已有完整计划，只执行实现
/sdd-run 004 --from review      # 已实现，从 r1 开始评审
/sdd-run 004 --from fix         # 从修复继续（自动检测轮次）
```

**恢复逻辑**：
1. 检查指定阶段的前置文件是否存在
2. 缺少前置文件时报错并提示需要先完成的阶段
3. 从指定阶段开始派发 Agent

### 评审恢复

`--from review` 时：
1. 检查 `reviews/` 目录下已有的轮次
2. 如果最新的 `arbitrate.md` 结论为 ITERATE，从修复继续
3. 如果没有评审记录，从 r1 开始

---

## 文件产出结构

```
.specify/specs/{feature_id}/
├── requirements/
│   ├── original.md              # 知识库原始需求（如有）
│   └── clarification.md         # 需求澄清记录
├── spec.md                      # 功能规格
├── testcases.md                 # 测试用例
├── plan.md                      # 技术计划
├── tasks.md                     # 任务分解
└── reviews/                     # 评审专用文件夹
    ├── r1/                      # 第 1 轮评审
    │   ├── agent-a.md           # 严苛审查员报告
    │   ├── agent-b.md           # 需求守护者报告
    │   ├── agent-c.md           # 集成检查员报告
    │   ├── arbitrate.md         # 仲裁报告
    │   └── fix-directives.md    # 修复指令（ITERATE 时）
    ├── r2/                      # 第 2 轮（如需要）
    │   └── ...
    └── summary.md               # 最终评审总结（PASS 后生成）
```

---

## 与现有 Skill 的关系

> **单一真相源架构**：Skill 文件（`.claude/skills/sdd-*/SKILL.md`）是领域逻辑的唯一真相源。
> Agent prompt（`.specify/templates/agent-prompts/*.md`）是薄壳，引用 Skill 文件获取领域规则，只补充输入/输出路径和 Agent 执行约束。

| Skill | Agent 模式用途 | 手动模式用途 |
|-------|--------------|-------------|
| sdd-specify | Specify Agent 读取领域规则 | `/sdd-specify` 交互式执行 |
| sdd-testcases | Testcases Agent 读取领域规则 | `/sdd-testcases` 交互式执行 |
| sdd-plan | Plan Agent 读取领域规则 | `/sdd-plan` 交互式执行 |
| sdd-tasks | Tasks Agent 读取领域规则 | `/sdd-tasks` 交互式执行 |
| sdd-implement | Implement Agent 读取执行流程 | `/sdd-implement` 交互式执行 |
| sdd-review | Review/Arbitrate/Fix Agent 读取评审规则 | `/sdd-review` 交互式执行 |

Agent prompt 薄壳存储在 `.specify/templates/agent-prompts/` 目录下：
- `specify.md` / `testcases.md` / `plan.md` / `tasks.md` — 薄壳，引用对应 Skill
- `implement.md` — 薄壳，引用 sdd-implement Skill
- `review-a.md` / `review-b.md` / `review-c.md` — 薄壳，引用 sdd-review Skill + 角色专属输出格式
- `arbitrate.md` — 薄壳，引用 sdd-review Skill + 仲裁输出格式
- `fix.md` — 薄壳，引用 sdd-implement + sdd-review Skill + 修复执行步骤

**维护规则**：修改领域逻辑时只需更新 Skill 文件，Agent prompt 自动生效。

---

## 注意事项

1. **不跳过质量**：自动不等于降低标准，全 5 分评审阈值不变
2. **Agent 隔离**：每个 Agent 独立上下文，不共享对话历史
3. **主进程轻量**：主进程只检查文件、派发 Agent、读结论行
4. **文档必存**：所有 Agent 必须用 Write 工具保存文件，不能只输出到终端
5. **不自动提交**：代码修改不自动 git commit
6. **宪法优先**：所有代码必须符合 `.specify/memory/constitution.md` 约束
7. **CR 记录**：自动修正都记录 CR，保持可追溯性
