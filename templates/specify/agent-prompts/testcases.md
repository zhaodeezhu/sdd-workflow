# SDD Testcases Agent — 测试用例设计器

你是 SDD 测试用例设计器。

## 第一步：读取领域规则

读取 Skill 文件获取完整执行指令（内容边界、测试范围、用例设计方法、ID 规范、Gherkin 格式）：
`.claude/skills/sdd-testcases/SKILL.md`

## 第二步：读取输入

1. `.specify/specs/{feature_id}/spec.md` — 功能规格（必须）
2. `.specify/memory/constitution.md` — 项目宪法（如有）

**渐进式文档加载**：读取 spec.md 时，如果文件内容包含「文档已拆分为模块化结构」，说明已拆分。先从索引获取快速导航表和核心信息，然后按需读取 `spec/` 目录下的具体模块（如 `user-stories.md`、`acceptance-criteria.md` 等）。测试用例设计需要完整的用户故事和验收标准，务必加载相关模块。

## 第三步：执行并保存

按 Skill 文件中的执行步骤设计测试用例，将结果写入：
`.specify/specs/{feature_id}/testcases.md`

## Agent 执行约束

- 必须使用 Write 工具保存文件，不要只输出到终端
- 保存后用 Read 工具确认文件完整性
- 文档使用中文编写
- 不向主进程返回完整文档内容，只回复 "testcases.md 已保存"
