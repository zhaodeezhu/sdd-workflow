---
name: sdd-split
description: 将大型 SDD 文档拆分为模块化结构，支持 spec/plan/tasks 三种文档类型。支持 --auto 模式跳过确认。
invocable: true
---

# SDD Split - 文档拆分工具

将现有的大型 SDD 文档拆分为模块化结构，支持渐进式加载。

## 使用模式

### 手动模式（默认）
用户主动调用，拆分前需要确认。

```bash
/sdd-split spec {feature_id}
/sdd-split plan {feature_id}
/sdd-split tasks {feature_id}
```

### 自动模式（--auto）
由 sdd-run 或其他自动化流程调用，跳过确认直接执行。

```bash
/sdd-split spec {feature_id} --auto
/sdd-split plan {feature_id} --auto
/sdd-split tasks {feature_id} --auto
```

自动模式行为差异：
- 跳过 "❓ 是否确认拆分？" 步骤
- 直接执行拆分
- 输出简要日志而非完整报告

## 功能概述

将单个大文件（spec.md、plan.md、tasks.md）拆分为多个小文件，提高加载效率和维护性。

## 支持的文档类型

1. **spec.md** - 功能规格文档
2. **plan.md** - 技术实现计划
3. **tasks.md** - 任务分解文档

## 拆分阈值

| 文档类型 | 拆分阈值 | 说明 |
|---------|---------|------|
| spec.md | 500 行 | 超过此行数建议拆分 |
| plan.md | 1000 行 | 超过此行数建议拆分 |
| tasks.md | 800 行 | 超过此行数建议拆分 |

## 使用方式

```bash
/sdd-split spec 003-module-instance-compare
/sdd-split plan 003-module-instance-compare
/sdd-split tasks 003-module-instance-compare
```

## 执行步骤

### 1. 解析参数

- 提取文档类型（spec/plan/tasks）、feature_id、是否 --auto 模式
- 如果未指定文档类型，报错提示

### 2. 验证前置条件

- 检查文档是否存在
- 检查文档行数是否超过阈值
- 检查是否已经拆分（存在对应的子目录）

如果行数未超过阈值且非 --auto 模式：提示用户文档较小无需拆分，结束。

### 3. 确认拆分（手动模式）

仅在**非 --auto** 模式下执行此步骤：

```
📄 正在分析文档: .specify/specs/{feature_id}/{doc_type}.md
📊 文档行数: {N} 行
✅ 超过拆分阈值 ({threshold} 行)，建议拆分

🔍 识别到以下章节：
  1. {章节1} ({N} 行)
  2. {章节2} ({N} 行)
  ...

❓ 是否确认拆分？(y/n)
```

**--auto 模式**：跳过此步骤，直接执行拆分。

### 4. 读取原文档

使用 Read 工具读取完整文档内容。

### 5. 分析文档结构

根据文档类型，识别章节结构：

#### Spec 文档结构识别

```markdown
## 1. 功能概述          → overview.md
## 2. 用户故事          → user-stories.md
## 3. 验收标准          → acceptance-criteria.md (从用户故事中提取)
## 4. 约束条件          → constraints.md
## 变更记录             → changelog.md
```

#### Plan 文档结构识别

```markdown
## 1. 架构设计          → architecture.md
## 2. 数据模型          → data-model.md
## 3. API设计           → backend-api.md
## 4. 后端实现          → backend-impl.md
## 5. 前端API          → frontend-api.md
## 6. 前端实现          → frontend-impl.md
## 7. 安全性设计        → security.md
## 8. 性能优化          → performance.md
## 变更记录             → changelog.md
```

#### Tasks 文档结构识别

```markdown
## Phase 0: 准备工作    → phase-0-preparation.md
## Phase 1: 后端开发    → phase-1-backend.md
## Phase 2: 前端开发    → phase-2-frontend.md
## Phase 3: 测试验收    → phase-3-testing.md
## Phase N: ...        → phase-N-*.md
## 任务依赖关系         → dependencies.md
## 检查点               → checkpoints.md
## 实现记录             → implementation-notes.md
```

### 6. 提取章节内容

使用正则表达式提取各章节内容：

```python
# 识别一级标题
pattern = r'^## (.+)$'

# 提取章节内容（从当前标题到下一个同级标题）
def extract_section(content, start_title, end_title=None):
    # 实现逻辑
    pass
```

### 7. 生成子文档

为每个章节创建独立的 Markdown 文件：

**文件命名规则**：
- Spec: `overview.md`, `user-stories.md`, `acceptance-criteria.md`, `constraints.md`, `changelog.md`
- Plan: `architecture.md`, `data-model.md`, `backend-api.md`, `backend-impl.md`, `frontend-api.md`, `frontend-impl.md`, `security.md`, `performance.md`, `changelog.md`
- Tasks: `phase-0-preparation.md`, `phase-1-backend.md`, `phase-2-frontend.md`, `phase-3-testing.md`, `dependencies.md`, `checkpoints.md`, `implementation-notes.md`

**文件内容格式**：

```markdown
# {章节标题}

> {章节说明}

{章节内容}

---

返回 [{type}索引](./README.md)
```

### 8. 生成 README.md 索引

根据文档类型，使用对应的模板生成 README.md：

- Spec: `.specify/templates/spec-modular-template/README.md`
- Plan: `.specify/templates/plan-modular-template/README.md`
- Tasks: 参考 `003-module-instance-compare/tasks/README.md`

**替换模板变量**：
- `{功能名称}`: 从原文档标题提取
- `{version}`: 从原文档提取
- `{create_date}`: 从原文档提取
- `{update_date}`: 当前日期
- 其他变量根据实际内容填充

### 9. 更新主索引文件

将原文档（spec.md/plan.md/tasks.md）转换为索引文件：

```markdown
# {功能名称} - {文档类型}

> **文档已拆分为模块化结构，请查看 [{type}/README.md](./{type}/README.md) 获取完整索引。**

## 快速导航

| 模块 | 状态 | 文档 |
|------|------|------|
| 模块1 | ✅ 已完成 | [链接](./{type}/module1.md) |
| 模块2 | ⏳ 进行中 | [链接](./{type}/module2.md) |

## 核心信息

[保留最关键的概览信息，约 50-100 行]

## 详细内容

请查看 [{type}/README.md](./{type}/README.md) 获取完整文档。
```

### 10. 备份原文档

将原文档重命名为 `{name}.md.backup`：

```bash
mv spec.md spec.md.backup
mv plan.md plan.md.backup
mv tasks.md tasks.md.backup
```

### 11. 验证拆分结果

- 检查所有子文档是否创建成功
- 检查 README.md 是否生成
- 检查索引文件是否更新
- 检查链接是否正确

### 12. 输出摘要

**手动模式**：向用户展示完整拆分结果。

```
✅ 文档拆分完成: .specify/specs/003-module-instance-compare/spec/

📊 拆分结果：
┌─────────────────┬──────────┬──────────┐
│ 文件            │ 行数     │ 大小     │
├─────────────────┼──────────┼──────────┤
│ README.md       │ 100      │ 5KB      │
│ overview.md     │ 150      │ 8KB      │
│ user-stories.md │ 200      │ 10KB     │
│ ...             │ ...      │ ...      │
├─────────────────┼──────────┼──────────┤
│ 总计            │ 614      │ 30KB     │
└─────────────────┴──────────┴──────────┘

📁 目录结构：
spec/
├── README.md
├── overview.md
├── user-stories.md
├── acceptance-criteria.md
├── constraints.md
└── changelog.md

💾 原文档已备份: spec.md.backup

✅ 拆分完成！现在可以按需加载各个模块。
```

## 实现细节

### 章节识别算法

```python
def identify_sections(content, doc_type):
    """
    识别文档章节结构

    Args:
        content: 文档内容
        doc_type: 文档类型 (spec/plan/tasks)

    Returns:
        List[Section]: 章节列表
    """
    sections = []
    lines = content.split('\n')

    current_section = None
    current_content = []

    for line in lines:
        # 识别一级标题 (## 标题)
        if line.startswith('## '):
            # 保存上一个章节
            if current_section:
                sections.append({
                    'title': current_section,
                    'content': '\n'.join(current_content)
                })

            # 开始新章节
            current_section = line[3:].strip()
            current_content = [line]
        else:
            if current_section:
                current_content.append(line)

    # 保存最后一个章节
    if current_section:
        sections.append({
            'title': current_section,
            'content': '\n'.join(current_content)
        })

    return sections
```

### 文件名映射

```python
def get_filename(section_title, doc_type):
    """
    根据章节标题生成文件名

    Args:
        section_title: 章节标题
        doc_type: 文档类型

    Returns:
        str: 文件名
    """
    # Spec 映射
    spec_mapping = {
        '功能概述': 'overview.md',
        '用户故事': 'user-stories.md',
        '验收标准': 'acceptance-criteria.md',
        '约束条件': 'constraints.md',
        '变更记录': 'changelog.md'
    }

    # Plan 映射
    plan_mapping = {
        '架构设计': 'architecture.md',
        '数据模型': 'data-model.md',
        'API设计': 'backend-api.md',
        '后端实现': 'backend-impl.md',
        '前端API': 'frontend-api.md',
        '前端实现': 'frontend-impl.md',
        '安全性': 'security.md',
        '性能优化': 'performance.md',
        '变更记录': 'changelog.md'
    }

    # Tasks 映射
    if doc_type == 'tasks':
        # Phase 0, Phase 1, Phase 2...
        if 'Phase' in section_title:
            phase_num = extract_phase_number(section_title)
            phase_name = extract_phase_name(section_title)
            return f'phase-{phase_num}-{phase_name}.md'
        elif '依赖' in section_title:
            return 'dependencies.md'
        elif '检查点' in section_title:
            return 'checkpoints.md'
        elif '实现' in section_title:
            return 'implementation-notes.md'

    # 使用映射表
    mapping = spec_mapping if doc_type == 'spec' else plan_mapping

    for key, filename in mapping.items():
        if key in section_title:
            return filename

    # 默认：转换为小写，替换空格为连字符
    return section_title.lower().replace(' ', '-') + '.md'
```

## 注意事项

1. **备份原文档**：拆分前必须备份原文档，防止数据丢失
2. **验证完整性**：拆分后验证所有内容是否完整
3. **链接更新**：确保所有内部链接正确指向新文件
4. **保留格式**：保留原文档的 Markdown 格式和代码块
5. **模式区分**: 手动模式需用户确认；--auto 模式跳过确认直接执行

## 错误处理

1. **文档不存在**：提示用户文档路径不正确
2. **已经拆分**：提示用户文档已经拆分，是否重新拆分
3. **行数不足**：提示用户文档行数未达到拆分阈值
4. **章节识别失败**：提示用户文档结构不符合规范

## 示例

### 拆分 Spec 文档

```bash
/sdd-split spec 003-module-instance-compare
```

**输出**：

```
📄 正在分析文档: .specify/specs/003-module-instance-compare/spec.md
📊 文档行数: 614 行
✅ 超过拆分阈值 (500 行)，建议拆分

🔍 识别到以下章节：
  1. 功能概述 (150 行)
  2. 用户故事 (300 行)
  3. 约束条件 (100 行)
  4. 变更记录 (64 行)

❓ 是否确认拆分？(y/n)
```

用户确认后：

```
✅ 开始拆分...
📁 创建目录: spec/
📝 生成 README.md
📝 生成 overview.md
📝 生成 user-stories.md
📝 生成 constraints.md
📝 生成 changelog.md
📝 更新 spec.md (索引文件)
💾 备份原文档: spec.md.backup

✅ 拆分完成！
```

---

## 相关文档

- [SDD 规范](../../templates/README.md)
- [模块化模板](../../templates/spec-modular-template/)
- [Tasks 拆分示例](../../specs/003-module-instance-compare/tasks/)
