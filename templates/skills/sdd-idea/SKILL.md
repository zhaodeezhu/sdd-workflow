---
name: sdd-idea
description: 需求随想录 - 记录、管理和升级随想需求到 SDD 开发流水线。当用户提到记录想法、新增需求灵感、查看待办需求、升级需求到开发时使用。
invocable: true
---

# SDD Idea - 需求随想录

> SDD 流水线的**前置缓冲区**：随手记录需求灵感，时机成熟时一键升级到 `/sdd-run` 执行。

## 输入格式

```
/sdd-idea                                    # 列出所有随想（默认 list）
/sdd-idea add {标题}                         # 交互式添加随想
/sdd-idea add {标题} --desc {描述}           # 直接添加（跳过交互）
/sdd-idea view {id}                          # 查看随想详情
/sdd-idea edit {id}                          # 编辑随想
/sdd-idea promote {id}                       # 升级到 SDD 开发流水线
/sdd-idea remove {id}                        # 归档/移除随想
/sdd-idea list [--status {status}] [--tag {tag}] [--priority {priority}]
```

## 存储位置

`.specify/ideas/` 目录，每条随想一个 JSON 文件。

文件命名：`{id}-{slug}.json`（slug 从标题自动生成）

### 随想数据结构

```json
{
  "id": "006",
  "title": "BOM版本对比功能",
  "slug": "bom-version-compare",
  "description": "支持两个BOM版本的逐行对比，高亮差异行，支持导出对比结果",
  "priority": "medium",
  "tags": ["BOM", "对比"],
  "status": "draft",
  "source": "",
  "notes": [],
  "createdAt": "2026-04-05",
  "updatedAt": "2026-04-05"
}
```

### 字段说明

| 字段 | 说明 | 值域 |
|------|------|------|
| id | 3位数字，全局递增 | 与 .specify/specs/ 共享编号空间 |
| title | 简短标题 | 必填 |
| slug | URL友好标识 | 从标题自动生成 |
| description | 需求描述 | 可选 |
| priority | 优先级 | `high` / `medium` / `low`（默认 medium） |
| tags | 分类标签 | 字符串数组 |
| status | 状态 | `draft` → `refined` → `promoted` / `archived` |
| source | 来源 | KB链接、Jira链接等 |
| notes | 补充笔记 | 字符串数组，支持多次追加 |
| createdAt | 创建日期 | YYYY-MM-DD |
| updatedAt | 更新日期 | YYYY-MM-DD |

### ID 分配规则

1. 扫描 `.specify/specs/` 和 `.specify/ideas/` 中所有现有 ID
2. 取最大 ID + 1 作为新 ID
3. 如果两个目录都没内容，从 `001` 开始（但实际项目中已有 001-005，会从 006 开始）

---

## 操作流程

### add - 添加随想

**触发**：`/sdd-idea add {标题}`

**流程**：
1. 解析标题和 `--desc` 参数
2. 分配下一个可用 ID
3. 如果未提供 `--desc`，询问用户补充描述、优先级、标签
4. 生成 JSON 文件保存到 `.specify/ideas/{id}-{slug}.json`
5. 输出确认信息

**输出示例**：
```
✅ 随想已记录

  #006 BOM版本对比功能
  优先级: medium | 标签: BOM, 对比

  时机成熟时执行: /sdd-idea promote 006
```

### list - 列出随想

**触发**：`/sdd-idea` 或 `/sdd-idea list`

**流程**：
1. 读取 `.specify/ideas/` 下所有 JSON 文件
2. 支持按 status / tag / priority 过滤
3. 按 ID 排序展示

**输出格式**：
```
━━━ 需求随想录 ━━━

  #006  [medium] BOM版本对比功能         draft    BOM, 对比
  #007  [high]   物料批量导入优化         refined  导入, 性能
  #008  [low]    配置项变更历史           draft    配置, 历史

  共 3 条 | draft: 2 | refined: 1 | promoted: 0
```

### view - 查看详情

**触发**：`/sdd-idea view {id}`

**流程**：
1. 按 ID 查找对应 JSON 文件
2. 展示完整信息，包括所有 notes
3. 如果有 source 链接，尝试获取并展示摘要

**输出格式**：
```
━━━ 随想详情 #006 ━━━

  标题:   BOM版本对比功能
  优先级: medium
  状态:   draft
  标签:   BOM, 对比
  来源:   https://kb.cvte.com/display/PDM/XX
  创建:   2026-04-05

  描述:
    支持两个BOM版本的逐行对比，高亮差异行，支持导出对比结果

  笔记 (2):
    [2026-04-05] 需要考虑BOM行数较多时的性能问题
    [2026-04-06] 和产品确认了对比维度：新增、删除、修改

  操作:
    补充笔记: /sdd-idea edit 006
    开始开发: /sdd-idea promote 006
```

### edit - 编辑随想

**触发**：`/sdd-idea edit {id}`

**流程**：
1. 读取当前随想数据
2. 询问用户要修改的字段（标题/描述/优先级/标签/来源）或追加笔记
3. 更新 JSON 文件的 `updatedAt`
4. 输出变更摘要

**追加笔记**：edit 时支持直接追加 notes，不需要打开文件编辑。

### promote - 升级到开发

**触发**：`/sdd-idea promote {id}`

**这是核心操作**：将随想从想法升级为正式开发需求，无缝衔接 `/sdd-run`。

**流程**：
1. 读取随想 JSON 文件
2. 确认信息完整性（至少有标题和描述）
3. 如果信息不够完整，询问补充后再继续
4. 创建规格目录：`.specify/specs/{id}-{slug}/`
5. 在目录下生成 `requirements/original.md`，内容来自随想的描述、笔记等
6. 更新随想 JSON 的 status 为 `promoted`
7. **自动调用** `/sdd-run {id} {title}` 开始执行

**original.md 生成模板**：
```markdown
# {title}

## 来源

- 随想记录 ID: {id}
- 记录日期: {createdAt}
{source 如果有}
- 来源链接: {source}

## 需求描述

{description}

## 补充笔记

{notes 合并}

## 标签

{tags}
```

**输出示例**：
```
━━━ 随想升级 #006 ━━━

  ✅ 创建规格目录: .specify/specs/006-bom-version-compare/
  ✅ 生成原始需求: requirements/original.md
  ✅ 更新随想状态: promoted

  🚀 启动 SDD 流水线...
  /sdd-run 006 BOM版本对比功能
```

### remove - 归档/移除

**触发**：`/sdd-idea remove {id}`

**流程**：
1. 读取随想数据，展示摘要
2. 确认操作
3. 将 status 设为 `archived`（不删除文件，保留历史）
4. 输出确认

---

## 状态流转

```
  draft ──→ refined ──→ promoted ──→ [进入 sdd-run]
    │                        ↑
    └────────────────────────┘
         (edit 补充信息)
    │
    └──→ archived (remove)
```

- **draft**: 初始记录，信息可能不完整
- **refined**: 已补充完善，随时可 promote
- **promoted**: 已升级到 SDD 流水线
- **archived**: 归档，不再考虑

---

## 设计原则

1. **零摩擦记录**：添加随想只需标题，其他信息都是可选的
2. **渐进式完善**：支持多次 edit 追加笔记，不要求一次性写完整
3. **无缝衔接**：promote 后自动进入 sdd-run，无需手动拷贝信息
4. **ID 连续**：与 specs 目录共享编号空间，promote 后 ID 不变
5. **不删除**：remove 只是归档，保留完整历史记录
