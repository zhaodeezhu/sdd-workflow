---
name: sdd-implement
description: 执行SDD任务分解中的开发任务 - 遵循红-绿-重构流程，测试优先实现
invocable: true
---

# SDD Implement - 任务执行器

按顺序执行SDD任务分解中的开发任务，遵循测试优先的红-绿-重构流程。

## 双模式执行

本 Skill 支持两种执行模式：

- **手动模式**（`/sdd-implement`）：交互式执行，逐任务确认，可选择执行哪个 Phase。走单 Agent 路径（兼容老 spec）。
- **Agent 模式**（由 `sdd-run` 自动调用）：v6 起按 plan.md 内容自动选择执行路径：
  - **B1 → B2 拆分模式**（跨前后端）：Backend Agent 完成后输出 `api-contract-actual.md`，Frontend Agent 强制读取该合约
  - **B-only 单边模式**（仅前端 / 仅后端）：派发对应单 Agent
  - **Legacy 单 Agent 模式**：plan.md 既无前后端段也无文件索引时降级为 implement.md
  - 详见 `.claude/skills/sdd-run/SKILL.md` 的 Phase B 段

两种模式共享以下所有领域规则。Agent 模式额外遵循对应 agent prompt（`implement-backend.md` / `implement-frontend.md` / `implement.md`）中的执行约束。

## v6 关键约束

- **自审门禁不可降级**：ESLint / mvn compile / tsc 失败时禁止标记 `self_review=passed`，必须自修复 ≤3 轮
- **B1/B2 操作域硬限定**：B1 只能改 `repo/cplm-*/`；B2 只能改 `repo/cap-front/`、`repo/cat-master/`
- **API 合约真源**：B1 输出 `api-contract-actual.md` 后即冻结；B2 调用 API 时必须以该文件为唯一参考


## 核心定位

> Implement 是 SDD 流程的最终执行阶段，可以包含完整的代码、SQL、文件操作。
> 实现过程中发现的上游问题，**必须按自循环机制反向纠正**，不允许带病绕过。

## 前置条件

- spec.md 或 spec/README.md ✓
- testcases.md ✓
- plan.md 或 plan/README.md ✓
- tasks.md 或 tasks/README.md ✓

## 执行流程

### 1. 加载任务文档（渐进式）

检测 tasks 文档结构：
- **模块化结构** (`tasks/README.md` 存在): 先加载 README 获取概览，按需加载单个 Phase 文件
- **单文件结构** (`tasks.md`): 直接加载完整文件

### 2. 展示任务概览，让用户选择执行哪个 Phase

展示各 Phase 状态（任务数/工时/完成情况），用户选择后只加载对应 Phase 文档。

### 3. 执行模式

- **交互式（默认）**: 逐任务执行，每完成一个等待确认
- **自动**: 按顺序执行，遇错暂停
- **指定任务**: 只执行用户指定的任务

### 4. 每个任务的执行步骤（红-绿-重构）

1. **确认测试用例映射** - 如 Task 1.4 → UT-001~015
2. **🔴 红阶段** - 根据testcases.md写测试，运行确认失败
3. **🟢 绿阶段** - 写最小实现使测试通过
4. **🔵 重构阶段** - 在测试通过前提下优化代码
5. **反馈扫描** - 检查是否触发自循环反馈（见第5节）
6. **更新 tasks.md** - 标记状态，记录实现差异

### 5. 自循环反馈（核心！）

实现阶段是反馈最密集的阶段。**每个任务完成后，必须进行反馈扫描：**

#### 5.1 反馈触发条件

| 发现的问题 | 反馈目标 | 级别 | 处理方式 |
|-----------|---------|------|---------|
| API 路径/参数需要调整 | plan.md | L1 | 直接修改 plan + tasks，记录 CR |
| 可复用现有模块，无需新建 | plan.md | L1 | 简化 plan，更新 tasks，记录 CR |
| 实现逻辑与 plan 设计不一致 | plan.md | L2 | 暂停，向用户说明差异，确认后修改 |
| 边界条件 plan 未覆盖 | plan.md + testcases.md | L2 | 补充设计 + 补充测试用例 |
| bug 暴露设计缺陷 | plan.md | L2 | 分析根因，修正设计，记录 CR |
| bug 暴露需求逻辑漏洞 | spec.md | L2 | 暂停，向用户说明，确认后修正 spec + 级联更新 |
| 性能问题需架构调整 | plan.md | L3 | 暂停全部，输出影响分析，等用户决策 |
| 发现需求方向性错误 | spec.md | L3 | 暂停全部，输出影响分析，等用户决策 |

#### 5.2 反馈执行流程

```
发现问题时：
1. 创建 CR 记录（在当前文档的变更记录中）
2. 按 L1/L2/L3 级别处理
   L1: 直接修正源头 → 级联更新下游 → 继续执行
   L2: 暂停 → 向用户说明 → 用户确认 → 修正源头 → 级联更新 → 继续执行
   L3: 暂停全部 → 输出影响报告 → 等用户决策
3. 修正完成后，从修正点重新验证到当前阶段
```

#### 5.3 级联更新检查清单

修正源头文档后，检查下游是否需要同步更新：

- [ ] spec 修正 → testcases 是否需要补充？
- [ ] spec 修正 → plan 的设计是否仍然适用？
- [ ] plan 修正 → tasks 的任务分解是否需要调整？
- [ ] plan 修正 → 已完成的代码是否需要返工？
- [ ] testcases 修正 → plan 的测试覆盖是否完整？

### 6. 阶段合约自检（SDD v2 新增）

> **受 Harness Sprint Contract 启发**: 每个 Phase 完成后，对照 plan.md 中的"阶段合约"进行自检。

每个 Phase 完成后（在检查点之前），执行合约自检：

#### 6.1 自检流程

1. 读取 plan.md 中当前 Phase 的阶段合约
2. 逐项检查交付物清单（是否都已实现）
3. 逐项检查验证标准（是否都满足）
4. 检查质量阈值（是否都达到）

#### 6.2 自检输出

```
📋 Phase {N} 合约自检

交付物清单:
  ✅ Domain 层：XXXEntity, XXXService
  ✅ Repository 层：XXXRepository + Mapper
  ❌ Controller 层：XXXController（未实现分页参数）

验证标准:
  ✅ #1 创建 API 返回正确数据格式
  ✅ #2 查询支持筛选条件
  ❌ #3 查询支持分页（缺少分页参数）

质量阈值:
  ✅ 所有 API 端点可访问
  ✅ 无 N+1 查询
  ✅ DDD 分层正确

自检结论: FAIL - 2 项未通过，需修复后重新自检
```

#### 6.3 自检规则

- 自检全部 PASS → 进入步骤 7（检查点）
- 自检存在 FAIL → 修复问题 → 重新自检（最多 3 轮）
- 超过 3 轮仍未通过 → 暂停，向用户报告阻塞项

### 7. 检查点与评审触发（SDD v2 增强）

- **Checkpoint 1**: 后端完成 + 合约自检通过 + API可访问
  - → **建议运行 `/sdd-review {feature_id}` 进行后端独立评审**
- **Checkpoint 2**: 前端完成 + 合约自检通过 + 页面可访问
  - → **建议运行 `/sdd-review {feature_id}` 进行前端独立评审**
- **Checkpoint 3**: 全部测试通过 + Code Review通过
  - → **建议运行 `/sdd-review {feature_id}` 进行最终评审**
- **最终检查**: 检查所有 CR 记录是否已闭环，L2+ 的反馈是否已沉淀到宪法

> **评审是可选的但强烈建议**。小功能可以跳过评审直接提交，大功能务必经过评审。

### 7. 实现完成自审门禁（v5 新增，必须执行！）

> **核心理念：一次做对，不把问题留给评审。**
> 自审门禁是实现阶段的最后一关，通过后才能宣告实现完成。
> 从历史数据看，R1 评审发现的 80% 问题都可以在自审阶段提前捕获。

#### 7.1 自审检查清单

实现全部任务后，**必须**逐项检查以下清单：

**功能完整性检查**（对照 spec.md）：
- [ ] 重新读取 spec.md，逐个功能点核对是否已实现
- [ ] 每个用户故事（US-1, US-2...）是否都有对应代码
- [ ] 验收标准的每个 Given-When-Then 是否都覆盖
- [ ] 是否存在 TODO、FIXME、空实现、占位符代码

**需求一致性检查**（对照 spec.md + plan.md）：
- [ ] 前端 API 调用路径是否与 plan.md 中定义的后端 API 路径**完全一致**
- [ ] 请求参数名、类型是否与 plan.md 的 API 设计**完全一致**
- [ ] 响应数据格式是否与 plan.md 定义的**完全一致**
- [ ] 字段命名前后端是否统一（如 `typeId` vs `typeName` 这种低级不一致）

**代码质量检查**（对照 constitution.md）：
- [ ] 是否存在 N+1 查询（for 循环内有数据库调用）
- [ ] DDD 分层是否正确（Domain 不依赖 Infrastructure）
- [ ] 是否有重复代码可以抽取（≥3 处相似逻辑）
- [ ] 命名是否清晰、一致

**集成完整性检查**：
- [ ] 前端请求 URL 与后端 Controller 端点是否匹配
- [ ] 数据流是否闭环（用户操作 → API → 数据库 → 返回 → UI 更新）
- [ ] 空数据、错误状态是否有处理

**前端代码规范检查**（ESLint 自动门禁）：
- [ ] 如果本次修改涉及 `repo/cap-front` 的文件，运行 ESLint 检查：
  ```bash
  cd repo/cap-front && npm run lint:fix
  ```
- [ ] ESLint 报告的 error 级别问题**必须修复**后才能通过自审
- [ ] ESLint 报告的 warning 级别问题记录到自审报告，不阻塞

**后端编译检查**（v5.1 新增，MANDATORY；完整 Bash 示例见 `agent-prompts/implement.md §4.5.1`）：
- [ ] 如果修改了 `repo/cplm-pdm/` 下的 `.java` / `*Mapper.xml` / `pom.xml`：执行 `cd repo/cplm-pdm && mvn compile -pl {affected-modules} -am -q`
- [ ] 如果修改了 `repo/cplm-software-center/` 下的后端文件：执行 `cd repo/cplm-software-center && mvn compile -q`
- [ ] 如果修改了 `repo/cplm-pcm/` 下的后端文件：执行 `cd repo/cplm-pcm && mvn compile -pl {affected-modules} -am -q`
- [ ] BUILD FAILURE → 分析错误 → 修复 → 重编译，最多 3 轮；3 轮仍失败 → 记录失败详情，暂停等主进程介入（不允许降级为"跳过"）
- [ ] 编译通过后自审报告记录：`mvn compile: BUILD SUCCESS，尝试 N 次`

**TypeScript 类型检查**（v5.1 新增，若项目含 `tsconfig.json` 则 MANDATORY；完整示例见 `agent-prompts/implement.md §4.5.2`）：
- [ ] 修改了 `.ts` / `.tsx` 文件时，执行 `npx tsc --noEmit --project tsconfig.json`
- [ ] 类型错误必须修复；自审报告记录 `tsc --noEmit: N errors`

#### 7.2 自审执行流程

```
1. 重新读取 spec.md（完整读取，不跳读）
2. 逐个功能点检查代码实现
3. 重新读取 plan.md 的 API 设计章节
4. 逐个 API 检查前后端参数一致性
5. 检查 constitution.md 的铁律是否违反
6. 对前端修改文件运行 ESLint 检查，修复所有 error 级别问题
7. 如果发现问题 → 立即修复 → 重新检查
8. 全部通过 → 宣告实现完成
```

#### 7.3 自审报告输出

自审结果追加到 tasks.md 末尾：

```markdown
## 实现自审报告

> 自审时间: {date}

### 功能完整性: ✅ 全部通过
- US-1 创建功能: ✅ 已实现
- US-2 查询功能: ✅ 已实现
- US-3 对比功能: ✅ 已实现

### 需求一致性: ✅ 全部通过
- API-1 POST /api/xxx: ✅ 前后端参数一致
- API-2 GET /api/yyy: ✅ 响应格式一致

### 代码质量: ✅ 全部通过
- N+1 查询: ✅ 无
- DDD 分层: ✅ 正确
- 重复代码: ✅ 无

### 集成完整性: ✅ 全部通过
- 数据流闭环: ✅
- 空数据处理: ✅
- 错误处理: ✅
```

#### 7.4 自审规则

- 自审全部 PASS → 宣告实现完成，进入评审
- 自审发现问题 → 修复 → 重新自审（最多 3 轮）
- 超过 3 轮仍有问题 → 记录未解决项，进入评审由评审 Agent 判断

### 8. 完成后生成执行报告

汇总：任务统计、变更文件列表、CR 反馈统计、自审结果、待处理事项、下一步操作。

## 注意事项

- 不跳过单元测试，不忽略 ESLint/Checkstyle 警告
- 注意 N+1 查询问题，注意 SQL 注入和 XSS 防护
- API 变更时同步更新文档
- **自审门禁不可跳过**：这是减少评审轮次的关键
- **L2+ 级别的反馈经验，必须提炼为经验教训追加到宪法**
