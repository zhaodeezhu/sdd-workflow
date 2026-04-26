---
name: sdd-run
description: SDD v6 全自动执行流水线 - Agent-Per-Phase + B1/B2 前后端拆分 + Phase D 知识提取
invocable: true
---

# SDD Run v6 — Agent-Per-Phase + 前后端拆分 + 自进化

> **v6 核心改进**（基于 2026-04-24 实战诊断）：
> - **Phase B 前后端拆分**：B1 后端 → 写 api-contract-actual.md → B2 前端，根除 context 爆炸
> - **R2+ 轻量评审分流**：fix ≤3 文件且 ≤50 行 → 单 Agent 评审，节省 ~10min/轮
> - **arbitrate 交叉引用检查**：R2+ 仲裁追踪上游引用，消除接口断裂盲区
> - **Phase D 知识提取**：Pipeline 收尾自动写 `iteration-patterns.md`（硬上限 50 条 + 晋升即淘汰）
> - **Pipeline 收尾自动化**：清理 .backup、生成 README、更新 REGISTRY、生成 iterations/INDEX
> - **Agent 级耗时埋点**：每个 sub-agent 独立 duration_sec
>
> **v5.1 沿用**：编译验证门禁、设计偏离豁免、代码级假设验证、增量评审、需求澄清强化

## 核心原则

1. **需求澄清彻底**：选择题为主，多轮追问，不带着模糊需求进入自动流程
2. **Agent 隔离**：每个阶段独立 Agent，独立上下文窗口，不累积上下文
3. **文档驱动**：Agent 之间通过文件产物传递上下文，主进程不读文档内容
4. **一次做对**：Implement Agent 含自审门禁，对照 spec/plan 逐项核对后才算完成
5. **评审务实**：功能+需求 ≥ 4 且无 HIGH 确认问题即 PASS
6. **人类主权**：Phase 0 需求澄清充分交互，L3 问题暂停等人类决策

## 前置条件

- 项目宪法: `.specify/memory/constitution.md`
- 项目配置: `CLAUDE.md`

## 输入格式

```
/sdd-run {feature_id} {功能描述或知识库链接}
/sdd-run {feature_id} --from {stage}     # 从指定阶段恢复
/sdd-run {feature_id} --bugfix {描述}    # bug修复（跳过评审）→ 按需读取 bugfix-patch.md
/sdd-run {feature_id} --patch {描述}     # 小优化（跳过评审）→ 按需读取 bugfix-patch.md
```

**feature_id 命名规范**：三位数字编号自增（001, 002, 003...），目录格式 `{id}-{name}/`

### 编号自增规则

所有编号必须在已有基础上自增，**禁止手动指定或跳号**：

1. **spec 目录编号**：扫描 `.specify/specs/` 下已有目录，取最大编号 +1
2. **iterations 编号**：扫描 `iterations/` 下已有文件，取最大编号 +1
3. **v{N} 子目录编号**：扫描已有 v{N} 目录，取最大编号 +1

---

## ⚠️ 需求归属规则

> 对已有需求的 bug 修复、小优化、功能增强，必须在原需求目录下迭代，禁止新建独立的 spec 目录。

### 判断流程

1. **扫描已有 spec 目录**：`ls .specify/specs/`
2. **语义匹配**：判断新需求是否属于已有需求的 bug/优化/增强
3. **归属决策**：归入已有目录 or 新建目录

### 归入已有目录时的处理

1. **文档存放**：在原目录下创建 `iterations/iter-{NNN}-{name}.md`
2. **迭代文件格式**：包含类型、日期、关联原需求、在原文档中的定位、变更内容、影响范围
3. **双向索引（必须）**：创建迭代文件后，同时更新原 spec.md 末尾的迭代索引表
4. **跳过评审**：`--bugfix` / `--patch` 跳过完整评审流程

**当判定为 bugfix/patch 时**：读取 `.claude/skills/sdd-run/bugfix-patch.md` 获取详细修复流程和 Agent 派发模板。

**当涉及无 SDD 文档的旧功能时**：读取 `.claude/skills/sdd-run/api-trace.md` 获取 API 链路追踪流程。

**大型增强**：仍需走完整 SDD 流程，文档存放在 `v{N}/` 子目录中。详见 `bugfix-patch.md`。

---

## 执行流程

### 总体架构

```
主进程（轻量编排器）
│  职责：派发 Agent、检查文件存在、读结论行、控制迭代、写 REGISTRY
│
├── Phase 0: 需求澄清（主进程 — 唯一人类交互）
│
├── Phase A: 规划器
│   ├── A1 Agent: Specify+Testcases → spec.md + testcases.md
│   └── A2 Agent: Plan+Tasks → plan.md (含「关键文件索引」+「Fix 白名单预设」) + tasks.md
│
├── Worktree Setup：为涉及的 repo 创建 git worktree
│
├── Phase B: 执行器（v6 拆分）
│   ├── 判定：plan.md 包含的项目类型
│   │   ├── 仅后端 → B-only（implement-backend.md）
│   │   ├── 仅前端 → B-only（implement-frontend.md）
│   │   ├── 跨前后端 → B1 后端 → 输出 api-contract-actual.md → B2 前端
│   │   └── 既无前端段也无后端段（小修复） → 兼容路径 implement.md（单 Agent）
│   └── 每个 Implement Agent 含编译/Lint 自审门禁
│
├── Phase C: 评审循环（最多 3 轮）
│   ├── R1: 三 Agent 全量并行评审 + arbitrate
│   ├── ITERATE → Fix Agent（白名单铁律 + OPT 跳过）
│   ├── R2+ 评审模式分流：
│   │   ├── fix ≤3 文件且 ≤50 行 → review-r2-lite (单 Agent) → arbitrate 轻量模式
│   │   └── 否则 → 三 Agent 全量评审
│   └── R2+ arbitrate 强制交叉引用检查
│
├── Phase D: 知识提取（v6 新增，最终 PASS 后触发）
│   └── knowledge-extract Agent → 写回 iteration-patterns.md（硬上限 50）
│
└── Pipeline 收尾自动化
    ├── 清理 .backup 文件
    ├── 写/更新 specs/{id}/README.md
    ├── 更新 REGISTRY.md
    └── 生成 iterations/INDEX.md（如有 iterations/）
```

---

### Phase 0: 需求澄清（主进程执行）

> **宁可多问一轮，不可带着模糊需求进入自动流程。**

#### 0.0 需求归属判断

1. 扫描已有 spec 目录，读取 spec.md 前几行
2. 判断新需求是否属于已有需求的迭代
3. 如果是 → 按 bugfix/patch 处理（读取 `bugfix-patch.md`）
4. 如果涉及旧功能无 SDD 文档 → 读取 `api-trace.md` 先理清现有实现
5. 如果是全新功能 → 继续 Phase 0 → A → B → C

#### 0.1 需求预分析

1. 解析输入（功能名称、描述、KB 链接、页面 URL）
2. 获取 KB 文档（如有链接）
3. 读取项目上下文：constitution.md、CLAUDE.md
4. **扫描相关代码**：使用 `Agent(subagent_type="Explore")` 扫描现有实现，主进程只接收摘要，避免代码内容污染上下文

#### 0.2 生成澄清问题

**核心原则：让用户选择，而不是让用户写答案。** 每个问题提供 2-4 个选项。

使用 AskQuestion 工具或格式化选择题（`Q1-A, Q2-B`）。标注 [必答]/[可选]，提供推荐选项。

#### 0.3 多轮澄清

**禁止一轮就结束澄清。** 用户回答后必须检查是否有新的不确定项。

**澄清完成标准**（全部满足）：
1. 所有 [必答] 问题已有明确答案
2. 业务范围和排除项已确认
3. 核心业务规则已确认
4. 用户回答中没有引出新的不确定项
5. 复述理解后用户确认无误

#### 0.4 澄清完成

保存到 `clarification.md`，复述完整理解，等用户确认后进入自动模式。

#### 0.5 取号原子化（多人并发防冲突）

> **必须执行**：进入 Phase A 前，主进程在 master 上完成"取号 + 占位 push"，避免多人并行 SDD 时撞号。
> 详细流程见 `.claude/skills/sdd-specify/SKILL.md` §6.3。

主进程在此处执行：
1. `git pull --rebase origin master`
2. 扫描 `.specify/specs/` 取最大编号 N，候选 `feature_id = N+1`
3. `mkdir .specify/specs/{feature_id}-{name}/`，把 `clarification.md` 移入
4. 在 `REGISTRY.md` 追加 DRAFT 行
5. 独立 commit：`chore(sdd): reserve {feature_id}-{name}`
6. `git push origin master`
   - 失败（non-fast-forward）→ 按 §6.3 冲突恢复流程重试，**最多 3 次**
   - 3 次仍失败 → 报错停止 pipeline，提示用户手动协调

取号成功后,后续 Phase A/B/C/D 派发的 Agent prompt 中传入的 `feature_id` 即为已抢占的号,所有产出物落在已 push 的目录下。

---

### Phase A: 规划器（2 个串行 Agent）

> 每个 Agent 独立上下文窗口，完成后主进程只检查文件存在。
> **路径规则**：主进程派发 Agent 时，prompt 首行声明项目根目录的绝对路径。
> **Worktree 映射**：Phase B/C 的 Agent prompt 中注入实际路径映射表。

#### A1. Agent: Specify + Testcases

派发参数：
- name: `sdd-specify-testcases`
- subagent_type: `general-purpose`
- description: `SDD-Specify+Testcases`

Agent prompt 要点：
1. 首行声明 `项目根目录: {PROJECT_ROOT}`
2. 读取指令文件：`.specify/templates/agent-prompts/specify-testcases.md`
3. 输入文件：constitution.md、CLAUDE.md、clarification.md
4. 产出：`spec.md` + `testcases.md`
5. 完成回复："spec.md 和 testcases.md 已保存"

**主进程检查**：确认两个文件均已生成。

#### A2. Agent: Plan + Tasks

派发参数：
- name: `sdd-plan-tasks`
- subagent_type: `general-purpose`
- description: `SDD-Plan+Tasks`

Agent prompt 要点：
1. 首行声明 `项目根目录: {PROJECT_ROOT}`
2. 读取指令文件：`.specify/templates/agent-prompts/plan-tasks.md`
3. 输入文件：spec.md、testcases.md、constitution.md、CLAUDE.md、**项目级 `.claude/CLAUDE.md`**
4. 产出：`plan.md` + `tasks.md`
5. 完成回复："plan.md 和 tasks.md 已保存"

**主进程检查**：确认两个文件均已生成。

---

### Phase A→B 过渡: Worktree 隔离环境创建

1. **解析涉及的项目**：扫描 plan.md 中 `repo/{project}/` 路径前缀
2. **创建 worktree**：`git worktree add .worktrees/sdd-{feature_id} -b sdd/{feature_id}-{name} {base_branch}`
3. **更新 pipeline-state.json**：记录 worktree 路径和分支
4. **生成路径映射表**：注入后续 Agent prompt

> 创建失败时降级为主工作目录操作。

---

### Phase B: 执行器（v6 拆分，根除 context 爆炸）

#### B0. 拆分判定（主进程执行）

读取 `plan.md`，根据其内容选择执行路径：

```
扫描 plan.md：
  has_backend  = 含「§六 后端实现」段 OR plan「关键文件索引」表中存在 Phase=P0/P1 行 OR 涉及 repo/cplm-pdm | cplm-software-center | cplm-pcm
  has_frontend = 含「§五 前端实现」段 OR plan「关键文件索引」表中存在 Phase=P2/P3 行 OR 涉及 repo/cap-front | cat-master

if has_backend and has_frontend:
    路径 = "split"          → B1 → 检查 api-contract → B2
elif has_backend:
    路径 = "backend_only"   → 仅 B1（合约文件可选）
elif has_frontend:
    路径 = "frontend_only"  → 仅 B2（合约文件改为可选输入）
else:
    路径 = "legacy"         → 兼容老 implement.md（仅用于无明确前后端分类的小修复）
```

主进程在 `pipeline-state.json.stages.implement.mode` 中记录该选择。

#### B1. Backend Implement Agent（has_backend 时启动）

派发参数：
- name: `sdd-implement-backend`
- subagent_type: `general-purpose`
- description: `SDD-Implement-Backend`

Agent prompt 要点：
1. 首行声明 `项目根目录: {PROJECT_ROOT}`
2. 读取指令文件：`.specify/templates/agent-prompts/implement-backend.md`
3. 输入文件：spec.md（仅后端 US）、testcases.md（仅后端 TC）、plan.md（仅 §三/§四/§六/§七/附录）、tasks.md（仅 P0/P1）、constitution.md
4. 注入 `{WORKTREE_PATH_MAPPING}`
5. 操作域硬限定：仅 `repo/cplm-*/`
6. **强制输出**（split 模式）：`.specify/specs/{id}/api-contract-actual.md`
7. 完成回复："B1 后端实现完成，N 个文件，M 个 API。api-contract-actual.md 已就绪。"

**主进程 B1→B2 之间硬门禁**（split 模式必须）：
- `api-contract-actual.md` 存在且非空
- 文件含 `## API-` 段
- B1 自审报告含 `BUILD SUCCESS`

任一失败 → 阻断 B2，进入修复或人类介入。

#### B2. Frontend Implement Agent（has_frontend 时启动；split 模式在 B1 完成后启动）

派发参数：
- name: `sdd-implement-frontend`
- subagent_type: `general-purpose`
- description: `SDD-Implement-Frontend`

Agent prompt 要点：
1. 首行声明 `项目根目录: {PROJECT_ROOT}`
2. 读取指令文件：`.specify/templates/agent-prompts/implement-frontend.md`
3. **强制输入**（split 模式）：`api-contract-actual.md`，缺失则 Agent 报错退出
4. 其余输入：spec.md（仅前端 US）、testcases.md（仅 UI/交互 TC）、plan.md（仅 §五/§七/附录）、tasks.md（仅 P2/P3）、constitution.md
5. 注入 `{WORKTREE_PATH_MAPPING}`
6. 操作域硬限定：仅 `repo/cap-front/`、`repo/cat-master/`
7. 完成回复："B2 前端实现完成，N 个文件。API 合约 M 项全部对齐。"

#### B-legacy（兼容路径）

仅当 has_backend 与 has_frontend 都为 false 时启用：
- 派发 implement.md 单 Agent（原 v5.1 路径）
- 用于无明确前后端分类的小型修补，向下兼容老 spec

#### B 阶段埋点

```json
"implement": {
  "status": "completed",
  "mode": "split | backend_only | frontend_only | legacy",
  "started_at": "...", "completed_at": "...",
  "duration_sec": 720,
  "b1": { "duration_sec": 380, "files_modified": 4, "compile_attempts": 1, "api_count": 2 },
  "b2": { "duration_sec": 340, "files_modified": 5, "eslint_errors_fixed": 0 }
}
```

---

### Phase C: 评审循环

#### C1. 评审模式判定

| 轮次 | 触发条件 | 评审模式 |
|------|---------|---------|
| R1 | 总修改文件 ≤3 | **R1 轻量**：派发 1 个 review-single Agent，跳过仲裁 |
| R1 | 总修改文件 >3 | **R1 全量**：3 Agent 并行 + arbitrate |
| R2+ | 上轮 fix 修改 ≤3 文件 且 diff_lines ≤50 | **R2 轻量**：派发 1 个 review-r2-lite Agent + arbitrate（轻量模式） |
| R2+ | 上轮 fix 修改 >3 文件 或 diff_lines >50 | **R2 全量**：3 Agent 并行 + arbitrate（含交叉引用检查） |

**diff_lines 统计**：`git diff --stat {fix_base}...HEAD | tail -1` 解析 `N insertions, M deletions`，取 N+M。

#### C2. R1 轻量评审（≤ 3 文件）

派发参数：
- name: `sdd-review-single`
- subagent_type: `general-purpose`
- description: `SDD-综合评审`

Agent prompt 要点：
1. 读取指令文件：`.specify/templates/agent-prompts/review-single.md`
2. 输入：spec.md、testcases.md、plan.md、constitution.md、代码文件
3. 产出**必须**为 `reviews/r{n}/review-single.md`（含评分+结论+问题清单）。**禁止**在 R1 轻量评审下产出 `arbitrate.md`
4. ITERATE 时额外产出 `fix-directives.md`（含「允许修改的文件」白名单），PASS 时产出 `summary.md`

主进程读取结论行判断 PASS/ITERATE。

#### C3. R1 全量评审（> 3 文件）

**3 个 Review Agent 并行派发**：

| Agent | 角色 | 指令文件 | 产出 |
|-------|------|----------|------|
| review-a | 严苛审查员 | `review-a.md` | `agent-a.md` |
| review-b | 需求守护者 | `review-b.md` | `agent-b.md` |
| review-c | 集成检查员 | `review-c.md` | `agent-c.md` |

3 份报告生成后，派发仲裁 Agent：
- 指令文件：`arbitrate.md`
- 输入：3 份报告 + plan.md（含「假设验证记录」+「Fix 白名单预设」）
- 产出：`arbitrate.md`，ITERATE 时附加 `fix-directives.md`（含白名单），PASS 时附加 `summary.md`

#### C4. R2+ 轻量评审（小修复专用）

主进程统计：上轮 fix 涉及文件数 = `len(fix-directives.md 中所有「允许修改的文件」并集)`，diff_lines = git diff --stat。

满足 ≤3 文件 且 ≤50 行 时：

派发参数：
- name: `sdd-review-r2-lite`
- subagent_type: `general-purpose`
- description: `SDD-R2轻量评审`

Agent prompt 要点：
1. 读取指令文件：`.specify/templates/agent-prompts/review-r2-lite.md`
2. 输入：spec.md（仅 fix 涉及的 US 段）、plan.md（仅相关段）、`r{N-1}/fix-directives.md`、`r{N-1}/arbitrate.md`、本轮修改文件清单
3. 产出：`reviews/r{n}/agent-lite.md`（评分 + 问题清单 + 交叉引用检查表）

随后派发 arbitrate（轻量模式）：
- prompt 中明确传入 `评审模式: 轻量（单 Agent）`
- 输入仅 `agent-lite.md`
- 产出 `arbitrate.md`，必要时 `fix-directives.md`

#### C5. R2+ 全量评审

3 个 Review Agent 并行派发，再 arbitrate（全量模式）。
arbitrate 必须执行**交叉引用检查**（v6 新增）：对上轮 fix 的所有修改文件执行 grep 上游引用，未被覆盖的引用文件标记为 `CROSS-REF-MISS-N` 并强制追加 FIX-N。

#### C6. 判定规则

- 功能完整性 ≥ 4 且 需求一致性 ≥ 4 且 0 个 HIGH 确认问题 → **PASS**
- 否则 → **ITERATE**
- MEDIUM/LOW 问题记录到 summary.md，不阻塞交付

#### C7. 修复（ITERATE 时）

派发 Fix Agent：
- 指令文件：`fix.md`（v6 含文件白名单铁律 + OPT 默认跳过）
- 输入：`fix-directives.md`（必含「允许修改的文件」字段）、plan.md
- 注入 Worktree 映射
- Fix Agent 修改前比对白名单，修改后 git diff 复核，越权立即回滚

#### C8. 增量评审（R2+）

R2+ 评审 Agent 只读修改文件 + 上轮 fix-directives + arbitrate。
arbitrate 必须扩展审查范围至「交叉引用」上游文件。

#### 迭代限制

最多 3 轮。超过 3 轮 → 暂停，输出影响分析，等待人类决策。

---

### Phase D: 知识提取（v6 新增，Review 最终 PASS 后触发）

**触发条件**：Phase C 最终结论 = PASS（无论 R1/R2/R3 哪一轮）。

派发参数：
- name: `sdd-knowledge-extract`
- subagent_type: `general-purpose`
- description: `SDD-知识提取`

Agent prompt 要点：
1. 首行声明 `项目根目录: {PROJECT_ROOT}`
2. 读取指令文件：`.specify/templates/agent-prompts/knowledge-extract.md`
3. 输入：本 spec 全部 reviews/r*/、iterations/*.md（如有）、pipeline-state.json、`.specify/memory/iteration-patterns.md`、constitution §VII
4. 产出：更新 `.specify/memory/iteration-patterns.md`（新增 / 验证次数+1 / 淘汰最旧）
5. 完成回复："Phase D 完成。新增 N 条，验证 +1 共 M 条，淘汰 K 条，待晋升 L 条：[PTN-XXX...]"

**主进程检查**：
- iteration-patterns.md 文件存在
- 文件内总条目数 ≤50（硬上限）
- 头部 frontmatter 已更新（容量 / 最后更新 / 本次新增/淘汰统计）

**主进程提示**：若 Agent 回复中含「待晋升」清单 → 在最终输出中提醒人类「下次维护时审核晋升清单」。

**Phase D 不阻塞 Pipeline 完成**：即便提取失败也只记录 warning，不影响 PASS 结论。

---

### Pipeline 收尾自动化（v6 新增）

Phase D 完成后，主进程依次执行：

1. **清理 .backup 文件**：
   ```bash
   find .specify/specs/{feature_id}/ -name "*.backup" -delete
   ```

2. **写/更新 specs/{id}/README.md**（若已存在则覆盖）：
   ```markdown
   # {feature_id}: {feature_name}

   - 状态: COMPLETED
   - 当前版本: v{N}
   - R1 结果: PASS / ITERATE
   - 最终轮次: R{n}
   - 涉及项目: cap-front, cplm-pdm
   - 创建: YYYY-MM-DD
   - 完成: YYYY-MM-DD

   ## 摘要
   {从 spec.md 提取首段}

   ## 文档导航
   - [spec.md](./spec.md)
   - [testcases.md](./testcases.md)
   - [plan.md](./plan.md)
   - [tasks.md](./tasks.md)
   - [api-contract-actual.md](./api-contract-actual.md)（如有）
   - [reviews/summary.md](./reviews/summary.md)
   - [iterations/INDEX.md](./iterations/INDEX.md)（如有）
   ```

3. **更新 REGISTRY.md**（见下文 REGISTRY 段）

4. **生成 iterations/INDEX.md**（仅当 iterations/ 目录存在且含文件）：
   ```markdown
   # 迭代索引

   | 编号 | 类型 | 主题 | 日期 |
   |------|------|------|------|
   | iter-001 | bugfix | 修复导出空数据 | 2026-04-01 |
   ```

收尾失败 → 记录 warning 到 pipeline-state.json，不阻塞最终输出。

---

### 流水线状态持久化（v6 埋点扩展）

每个阶段**开始时**写 `started_at`，**结束时**写 `completed_at + duration_sec`。
每轮评审结束追加问题统计与 Agent 级耗时。Pipeline 结束写 `files_modified[] + metrics`。

```json
{
  "feature_id": "{id}",
  "feature_name": "{name}",
  "version": "v6",
  "started_at": "2026-04-25T10:00:00Z",
  "completed_at": null,
  "current_stage": "{stage}",
  "worktrees": { "{project}": { "branch": "...", "worktree_path": "...", "base_branch": "..." } },
  "stages": {
    "clarification":     { "status": "completed", "duration_sec": 300 },
    "specify_testcases": { "status": "completed", "duration_sec": 480 },
    "plan_tasks":        { "status": "completed", "duration_sec": 420 },
    "implement": {
      "status": "completed",
      "mode": "split",
      "duration_sec": 720,
      "b1": { "duration_sec": 380, "files_modified": 4, "compile_attempts": 1, "api_count": 2 },
      "b2": { "duration_sec": 340, "files_modified": 5, "eslint_errors_fixed": 0 }
    },
    "review_r1": {
      "status": "completed", "duration_sec": 540,
      "mode": "full",
      "result": "ITERATE",
      "issues_high": 2, "issues_medium": 3, "issues_low": 1,
      "agents": {
        "review-a":  { "duration_sec": 110 },
        "review-b":  { "duration_sec": 105 },
        "review-c":  { "duration_sec": 120 },
        "arbitrate": { "duration_sec": 60 }
      }
    },
    "fix_r1": {
      "status": "completed", "duration_sec": 180,
      "fixes_applied": 5, "fixes_skipped": 2,
      "modified_files": 3, "diff_lines": 42
    },
    "review_r2": {
      "status": "completed", "duration_sec": 200,
      "mode": "lite",
      "result": "PASS",
      "issues_high": 0, "issues_medium": 1, "issues_low": 2,
      "agents": {
        "review-r2-lite": { "duration_sec": 130 },
        "arbitrate":      { "duration_sec": 40 }
      }
    },
    "knowledge_extract": {
      "status": "completed", "duration_sec": 90,
      "patterns_added": 1, "patterns_validated": 2, "patterns_evicted": 0,
      "promotion_candidates": ["PTN-012"]
    }
  },
  "files_modified": ["repo/cap-front/src/...", "repo/cplm-pdm/..."],
  "metrics": {
    "total_duration_sec": 0,
    "review_rounds": 2,
    "files_count": 9,
    "r1_pass": false
  }
}
```

**主进程写入时机**（硬约束，禁止省略）：

1. 派发 Agent **前**：`stages.{name} = { status: "in_progress", started_at: <now> }`
2. Agent 完成**后**：追加 `completed_at, duration_sec, status: "completed"`
3. B1/B2 拆分时：B1 完成后写 `stages.implement.b1.{...}`；B2 完成后写 `b2.{...}`，并汇总 `stages.implement.duration_sec = b1 + b2`
4. Review 完成后：扫描 `arbitrate.md`（或 `review-single.md` / `agent-lite.md`）问题清单与各 Agent 报告 → 写入 `issues_{high,medium,low}`、`result`、`mode`、`agents.{name}.duration_sec`
5. Fix Agent 完成后：写 `fixes_applied`、`fixes_skipped`、`modified_files`、`diff_lines`（用于下一轮 R2 模式判定）
6. Phase D 完成后：写 `stages.knowledge_extract.{...}`
7. Pipeline 结束：
   - `git diff --name-only {base_branch}...HEAD` → `files_modified`
   - 汇总 `metrics.total_duration_sec`、`review_rounds`、`files_count`、`r1_pass`
   - 追写顶层 `completed_at`

### 文件完整性校验

| 文件 | 必须包含 |
|------|---------|
| spec.md | `## 功能需求` 或 `## 用户故事` |
| testcases.md | `UT-` 或 `FT-` 或 `E2E-` |
| plan.md | `## 阶段合约` 或 `### Phase` |
| tasks.md | `Phase 0` 和 `Phase 1` |
| 评审报告 | `## 评分` 和 `## 问题清单` |

校验失败 → 最多重试 1 次，仍失败 → 暂停等人类介入。

---

### 最终步骤: REGISTRY 自动维护（v5.1 新增，MANDATORY）

Pipeline 每阶段结束时，主进程按下列规则更新 `.specify/specs/REGISTRY.md`：

1. **Phase 0 结束**：若 `feature_id` 不在 REGISTRY 中 → 追加一行，状态 `DRAFT`
2. **Phase A 结束**：状态置为 `IN_PROGRESS`
3. **最终 Review PASS**：
   - 状态置为 `COMPLETED`
   - 填入 `R1 结果`（来自 `stages.review_r1.result`）
   - 填入 `最终轮次`（R1/R2/R3 取决于评审轮数）
   - 填入 `迭代数`（`ls iterations/iter-*.md | wc -l`）
   - 填入 `完成` 日期（today）
   - 填入 `涉及项目`（从 `files_modified[]` 的 `repo/{project}/` 前缀提取去重）
4. **`--from` 恢复 ≥7 天未更新**：主进程提示用户是否标记 `ABANDONED`，同意后写入
5. **存在 `v2/`/`v3/` 子目录**：追加 `,MULTI_VERSION` 到状态列

**实现要点**：
- 读 REGISTRY.md → 找到对应 ID 行 → 构造新行 → `Edit` 工具替换 → `Read` 校验
- ID 不存在时按升序插入（在首个比当前 ID 大的行之前）
- 不允许并发写入：同一时刻只有 pipeline 主进程写 REGISTRY

### 最终输出

```
━━━ SDD v5 执行报告 ━━━

功能: {feature_id} - {功能名称}
迭代轮次: {n}

📋 产出文件: spec.md / testcases.md / plan.md / tasks.md / reviews/summary.md
📊 最终评审: {各维度评分} → PASS
📝 变更文件: 后端 {N} 个, 前端 {N} 个

请验收以上结果。
```

**使用 Worktree 时追加合并指引**：

```
🔀 代码合并: cd repo/{project} && git merge sdd/{feature_id}-{name}
   合并后清理: /sdd-worktree cleanup {feature_id}
```

---

## 中断与恢复

```
/sdd-run {id} --from specify     # 从规格开始
/sdd-run {id} --from plan        # 已有 spec + testcases
/sdd-run {id} --from implement   # 已有完整计划
/sdd-run {id} --from review      # 已实现，从评审开始
/sdd-run {id} --from fix         # 从修复继续
```

恢复时读取 `pipeline-state.json`，从 `current_stage` 的下一个阶段继续。

---

## 注意事项

1. 需求澄清充分，宁可多问一轮
2. Implement Agent 必须执行自审门禁
3. 评审务实：≥ 4 分 + 无 HIGH 即 PASS
4. Agent 隔离：每个 Agent 独立上下文
5. 主进程轻量：只检查文件、派发 Agent、读结论行
6. 所有 Agent 必须用 Write 工具保存文件
7. 每个阶段完成后更新 pipeline-state.json
8. 不自动 git commit
9. 宪法优先：所有代码必须符合 constitution.md 约束
