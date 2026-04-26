# 项目宪法 (Constitution)

> 项目基本信息、技术栈、环境配置见 CLAUDE.md，本文档仅记录**开发约束和原则**。
> 创建日期: {date}
> 最后更新: {date}

---

## 一、绝对铁律

1. {iron_rule_1}

---

## 二、开发原则

### 2.1 简单性原则

> **优先复用现有方法，避免重复造轮子**

新增代码前必须检查：是否已有类似方法？是否可扩展现有方法？是否有更底层的公共方法？

### 2.2 N+1 查询禁令

禁止在循环内执行数据库查询，使用批量查询 + Map 缓存替代。

### 2.3 代码质量

{code_quality_principles}

### 2.4 测试标准

{testing_standards}

---

## 三、架构约束

### 3.1 DDD 分层（cplm-software-center）

{ddd_principles}

### 3.2 传统分层（cplm-pdm）

{traditional_layering}

### 3.3 API 响应格式

{api_response_format}

---

## 四、SDD 文档职责边界

| 文档 | 职责 | 内容边界 |
|------|------|----------|
| spec.md | What | 业务需求、用户故事、验收标准。禁止 SQL/代码/文件路径 |
| testcases.md | 行为验证 | 测试场景 Given-When-Then |
| plan.md | How | 技术方案、架构设计、代码设计 |
| tasks.md | When | 任务分解、执行顺序、进度跟踪 |

---

## 五、经验教训

{lessons_learned}

---

*本文档由 SDD 规范维护，如需更新请运行 `/sdd-constitution`*
