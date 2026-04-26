# Bugfix/Patch 文档优先修复流程

> 本文件从 `SKILL.md` 拆出，仅在 `--bugfix` / `--patch` 模式时由主进程 Read 加载。

## 核心原则

**先读文档定位，再改代码。禁止跳过文档直接全量搜索代码。**

plan.md 中已记录完整的文件路径、API 设计、调用链路，是最好的"代码导航地图"。
直接全量搜索代码会浪费大量上下文在无关文件上，导致简单问题复杂化。

## 修复步骤（严格按顺序执行）

```
步骤 1: 读文档定位（必须！）
  ├── 读取 plan.md → 找到相关模块的文件路径、方法名、调用链路
  ├── 读取 spec.md → 找到相关功能点的业务规则
  ├── 读取 tasks.md → 找到相关任务涉及的文件清单
  └── 读取已有的 iterations/ → 找到相关的历史修复记录
  
步骤 2: 精准定位代码
  ├── 根据文档中的文件路径，直接 Read 目标文件
  ├── 如果文档路径已过时，用文档中的方法名/类名做精准 Grep
  └── 禁止：在没有读文档的情况下做宽泛的代码搜索

步骤 3: 分析根因
  ├── 对照 spec 的业务规则理解预期行为
  ├── 对照 plan 的技术设计理解实现意图
  └── 定位代码中的偏差点

步骤 4: 修复代码

步骤 5: 记录迭代文档
  ├── 创建 iterations/iter-{NNN}-{name}.md
  ├── 必须填写「在原文档中的定位」章节
  └── 更新原 spec.md 的迭代索引（双向索引）
```

## 文档查找优先级

| 优先级 | 信息来源 | 能找到什么 |
|--------|---------|-----------|
| 1 | `plan.md` | 文件路径、方法名、API 路径、调用链路、数据模型 |
| 2 | `tasks.md` | 每个 Task 涉及的文件清单、实现细节 |
| 3 | `iterations/` | 历史修复涉及的文件、根因分析 |
| 4 | `spec.md` | 业务规则、功能点列表 |
| 5 | **API 链路追踪** | 动态字段定义、后端数据模型（详见 `api-trace.md`） |
| 6 | 代码搜索 | 仅当以上方式都不足时才使用 |

## Bugfix/Patch Agent 派发模板

当判定为 bugfix/patch 时，派发以下 Agent：

```python
Agent(
    name = "sdd-bugfix",
    subagent_type = "general-purpose",
    description = "SDD-Bugfix",
    prompt = """
项目根目录: {PROJECT_ROOT}

你是 SDD bug 修复执行器。

⚠️ 铁律：先读文档定位代码，禁止跳过文档直接搜索！

第一步（必须！）：读取已有文档定位代码
- 读取 .specify/specs/{feature_id}/plan.md → 找到相关模块的文件路径和方法名
- 读取 .specify/specs/{feature_id}/tasks.md → 找到相关任务涉及的文件清单
- 读取 .specify/specs/{feature_id}/spec.md → 找到相关功能点的业务规则
- 读取 .specify/specs/{feature_id}/iterations/ 下已有文件 → 找到相关的历史修复

第二步：根据文档中的路径精准定位
- 直接 Read 文档中提到的目标文件，不要做宽泛的全项目搜索
- 如果文档路径已过时，用文档中的方法名/类名做精准搜索

第三步：分析根因并修复

第四步：创建迭代记录
- .specify/specs/{feature_id}/iterations/iter-{NNN}-{name}.md
- 必须填写「在原文档中的定位」章节（引用 plan.md/spec.md 的具体章节）
- 更新原 spec.md 的迭代索引（双向索引）

Bug 描述: {描述}
"""
)
```

## 大型增强处理

如果迭代内容较大（新增多个功能点），仍需走完整 SDD 流程，但文档存放在原需求目录下的版本子目录中：

```
.specify/specs/{feature_id}/
├── spec.md                    # v1 原始规格
├── plan.md                    # v1 原始计划
├── tasks.md                   # v1 原始任务
├── v2/                        # 大型增强 v2（独立子目录）
│   ├── spec.md                # v2 增量规格（索引回原 spec.md）
│   ├── testcases.md
│   ├── plan.md                # v2 增量计划（索引回原 plan.md）
│   ├── tasks.md
│   └── reviews/
├── iterations/                # 小型 bug/优化记录
│   └── ...
```

**v{N} 子目录规则**：
- 文档内容是增量补充，不重复原文件中已有的内容
- 每个文档顶部必须索引回原文件
- 原文件必须反向索引（在迭代索引中追加 v{N} 条目）
- 走完整 SDD 流程，评审范围仅覆盖增量代码

## 反面示例

| 错误做法 | 正确做法 |
|----------|----------|
| 为 003 的 BOM 对比显示 bug 新建 `006-bom-compare-display-fix/` | 在 `003-module-instance-compare/iterations/iter-001-bom-display-fix.md` 记录 |
| 为 003 的基准切换刷新优化新建 `007-compare-base-switch-refresh/` | 在 `003-module-instance-compare/iterations/iter-002-base-switch-refresh.md` 记录 |
| 为 005 的进度对齐 bug 新建 `006-ntrd-progress-align-fix/` | 在 `005-ntrd-module-progress/iterations/iter-001-progress-align-fix.md` 记录 |
