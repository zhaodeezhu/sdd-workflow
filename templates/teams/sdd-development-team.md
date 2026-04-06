# SDD Development Agent Team 配置

> 专为 SDD (Specification-Driven Development) 工作流设计的 Agent Team 配置
> 适配任何全栈/前端/后端项目

## 启用 Agent Teams

在 `settings.json` 中添加：

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

---

## Team 1: 功能开发团队 (Feature Development Team)

**适用场景**: 新功能开发，需要完整的前后端实现

**团队结构**:

| 角色 | 职责 | 关注点 |
|------|------|--------|
| **Tech Lead** | 技术负责人，协调工作，审核决策 | 整体架构、技术方案 |
| **Backend Developer** | 后端开发，遵循项目架构分层 | 后端代码目录 |
| **Frontend Developer** | 前端开发，组件实现 | 前端代码目录 |
| **Test Engineer** | 测试验证，确保测试通过 | 单元测试、集成测试 |
| **Code Reviewer** | 代码审查，质量把关 | 代码规范、性能、安全 |

**启动提示词**:

```
创建一个功能开发团队来实现 [功能名称]。

团队配置：
1. Tech Lead - 负责整体技术方案审核，确保符合项目宪法(.specify/memory/constitution.md)
2. Backend Developer - 负责后端开发，遵循项目架构分层，优先复用现有方法
3. Frontend Developer - 负责前端开发，遵循组件化规范
4. Test Engineer - 负责测试验证，确保所有测试用例通过
5. Code Reviewer - 负责代码审查，检查N+1查询、安全漏洞、代码规范

参考文档：
- 功能规格: .specify/specs/{feature_id}/spec.md
- 测试用例: .specify/specs/{feature_id}/testcases.md ← 测试优先
- 技术计划: .specify/specs/{feature_id}/plan.md
- 任务分解: .specify/specs/{feature_id}/tasks.md

工作流程（红-绿-重构）：
1. Tech Lead 先审核技术方案，确认符合架构约束
2. 每个任务遵循 红-绿-重构 流程：
   - 🔴 Test Engineer 先写测试（测试失败）
   - 🟢 Backend/Frontend 写实现（测试通过）
   - 🔵 Code Reviewer 审查代码（测试仍通过）
3. Tech Lead 综合验收

注意：
- 后端开发遵循项目宪法中定义的架构分层
- 避免N+1查询，使用批量查询
- 优先复用现有方法
- **测试必须先写，测试通过才算任务完成**
```

---

## Team 2: 代码审查团队 (Code Review Team)

**适用场景**: PR审查、代码质量检查、安全审计

**团队结构**:

| 角色 | 职责 | 检查项 |
|------|------|--------|
| **Security Reviewer** | 安全审查 | SQL注入、XSS、权限控制 |
| **Performance Reviewer** | 性能审查 | N+1查询、索引使用、缓存策略 |
| **Code Quality Reviewer** | 代码质量 | 命名规范、代码复用、lint |

**启动提示词**:

```
创建一个代码审查团队来审查 PR #[编号]。

团队配置：
1. Security Reviewer - 检查安全漏洞（SQL注入、XSS、敏感信息暴露）
2. Performance Reviewer - 检查性能问题（N+1查询、批量查询、索引）
3. Code Quality Reviewer - 检查代码规范（命名、注释、复用、lint）

审查标准参考：
- 项目宪法: .specify/memory/constitution.md
- 简单性原则: 优先复用现有方法，避免重复造轮子

每个审查者独立审查后，汇总发现的问题。
重点关注：
- 是否有新增方法可以复用现有方法替代
- 是否存在循环内数据库查询
- 是否符合项目的架构分层原则
```

---

## Team 3: 问题排查团队 (Debug Team)

**适用场景**: 复杂Bug排查，需要多角度分析

**团队结构**:

| 角色 | 职责 | 排查方向 |
|------|------|----------|
| **Lead Investigator** | 主导排查，协调方向 | 问题复现、根因定位 |
| **Frontend Detective** | 前端链路追踪 | 组件渲染、API调用、状态管理 |
| **Backend Detective** | 后端链路追踪 | Service层、DAO层、数据库 |
| **Devil's Advocate** | 挑战假设 | 质疑其他队友的理论 |

**启动提示词**:

```
创建一个问题排查团队来调查 [问题描述]。

团队配置：
1. Lead Investigator - 主导排查方向，汇总发现
2. Frontend Detective - 从前端追踪，检查API调用、状态管理
3. Backend Detective - 从后端追踪，检查服务层、数据库
4. Devil's Advocate - 挑战其他队友的理论，防止过早下结论

问题描述：
[详细描述问题现象、复现步骤、预期行为]

排查方式：
- 使用全链路追踪，从用户操作到数据库逐层排查
- 队友之间相互质疑，辩论直到达成共识

输出：
- 根因分析
- 修复建议
- 防止复发的措施
```

> **推荐**：对于需要结构化排查和完整文档沉淀的 Bug，建议使用 `/sdd-fix` skill 代替手动创建团队。
> `/sdd-fix` 提供 3 Agent 并行排查 + 红-绿-重构修复 + 自动文档沉淀的完整流程。
> 此 Team 3 模板适用于需要人工协作讨论的复杂 Bug 排查场景。

---

## Team 4: 技术调研团队 (Research Team)

**适用场景**: 新技术调研、架构评估、竞品分析

**团队结构**:

| 角色 | 职责 | 调研方向 |
|------|------|----------|
| **Architect** | 架构评估 | 技术选型、架构影响 |
| **UX Researcher** | 用户体验 | 交互设计、用户流程 |
| **Risk Analyst** | 风险分析 | 技术风险、兼容性、性能 |

**启动提示词**:

```
创建一个技术调研团队来评估 [调研主题]。

团队配置：
1. Architect - 评估技术选型和架构影响
2. UX Researcher - 评估用户体验和交互设计
3. Risk Analyst - 分析技术风险和潜在问题

调研目标：
[描述需要调研的内容]

输出要求：
- 每个角色独立调研后分享发现
- 相互质疑和补充
- 最终形成统一建议
```

---

## Team 5: SDD规划团队 (SDD Planning Team)

**适用场景**: 大型功能的SDD规划阶段，需要多角度分析

**团队结构**:

| 角色 | 职责 | 输出 |
|------|------|------|
| **Product Analyst** | 需求分析 | 功能规格（spec.md） |
| **Test Designer** | 测试设计 | 测试用例（testcases.md） |
| **Solution Architect** | 技术方案 | 技术计划（plan.md） |
| **Task Planner** | 任务分解 | 任务列表（tasks.md） |

**启动提示词**:

```
创建一个SDD规划团队来规划 [功能名称]。

团队配置：
1. Product Analyst - 分析需求，编写功能规格文档
2. Test Designer - 设计测试用例（测试优先！）
3. Solution Architect - 基于测试用例设计技术方案
4. Task Planner - 分解任务，标注测试任务

参考资料：
- 项目宪法: .specify/memory/constitution.md

工作流程（测试优先）：
1. Product Analyst 分析需求
2. Test Designer 基于需求设计测试用例（先定义测试）
3. Solution Architect 基于测试用例设计技术方案
4. Task Planner 基于技术方案分解任务（包含测试任务）

输出：
- .specify/specs/{feature_id}/spec.md
- .specify/specs/{feature_id}/testcases.md ← 测试优先
- .specify/specs/{feature_id}/plan.md
- .specify/specs/{feature_id}/tasks.md

注意：
- 测试用例必须在技术计划之前完成
- 技术方案必须能够通过所有测试用例
- 任务粒度控制在0.5-4小时
- 标注可并行执行的任务
```

---

## 最佳实践

### 1. 团队规模建议
- **3-4人**: 最常见的配置，平衡并行性和协调成本
- **5人**: 用于复杂任务，如全面代码审查
- **避免超过5人**: 协调开销会超过收益

### 2. 任务分配原则
```
好的分配：
- Backend Developer 处理后端代码目录中的文件
- Frontend Developer 处理前端代码目录中的文件
- 两人不编辑同一文件

避免的分配：
- 两个队友同时修改同一个文件
- 后端队友处理前端组件（或反之）
```

### 3. 显示模式选择
```json
// settings.json
{
  "teammateMode": "tmux"  // 推荐：每个队友独立窗格
}
```

### 4. 检查点设置
在任务中设置检查点，确保质量：
- **Checkpoint 1**: 后端API完成，可联调
- **Checkpoint 2**: 前端组件完成，可演示
- **Checkpoint 3**: 代码审查通过

### 5. 使用 Hooks 强制质量门
```json
// settings.json
{
  "hooks": {
    "TeammateIdle": "echo '队友即将空闲，请检查工作成果'"
  }
}
```

---

## 快速启动命令

### 功能开发
```
创建一个功能开发团队来实现 [功能名称]。
参考 .specify/specs/{feature_id}/ 下的SDD文档。
```

### 代码审查
```
创建一个代码审查团队来审查最近的代码变更。
重点关注N+1查询、代码复用、安全漏洞。
```

### 问题排查
```
创建一个问题排查团队来调查 [问题描述]。
使用竞争假设方式，队友相互质疑。
```

### SDD规划
```
创建一个SDD规划团队来规划 [功能名称]。
```

---

## 注意事项

### 令牌成本
- 每个队友有独立的 context window
- 4人团队的令牌消耗约为单会话的3-4倍
- 建议在任务明确后再创建团队

### 避免的问题
1. **文件冲突**: 确保队友不编辑同一文件
2. **过度并行**: 简单任务不需要团队
3. **无人值守**: 定期检查队友进度

### 与 Subagents 的选择
| 场景 | 使用 |
|------|------|
| 只需要结果，不需要协作 | Subagents |
| 队友需要讨论、相互质疑 | Agent Teams |
| 快速验证、简单查询 | Subagents |
| 代码审查、复杂调试 | Agent Teams |

---

*此配置基于 Claude Code Agent Teams 功能和 SDD 开发流程设计*
