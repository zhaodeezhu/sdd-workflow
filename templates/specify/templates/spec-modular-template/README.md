# {feature_name} - 功能规格索引

> 版本: {version}
> 创建时间: {create_date}
> 更新时间: {update_date}
> KB: [{kb_title}]({kb_url})
>
> **示例**: 模块实例对比功能 - 功能规格索引

## 📋 文档结构

为了便于管理和按需加载，规格文档已拆分为以下模块：

```
spec/
├── README.md              # 本文件 - 规格索引和概览
├── overview.md            # 功能概述、业务背景
├── user-stories.md        # 所有用户故事
├── acceptance-criteria.md # 验收标准汇总
├── constraints.md         # 约束条件和非功能需求
└── changelog.md           # 变更记录
```

## 📊 文档概览

| 模块 | 内容 | 文档 |
|------|------|------|
| 功能概述 | 业务背景、功能描述、关联模块 | [overview.md](./overview.md) |
| 用户故事 | 所有用户故事（US-1, US-2...） | [user-stories.md](./user-stories.md) |
| 验收标准 | 各用户故事的验收标准汇总 | [acceptance-criteria.md](./acceptance-criteria.md) |
| 约束条件 | 技术约束、性能要求、安全要求 | [constraints.md](./constraints.md) |
| 变更记录 | 版本变更历史 | [changelog.md](./changelog.md) |

## 🔗 快速导航

### 核心文档
- [功能概述](./overview.md) - 了解功能的业务背景和目标
- [用户故事](./user-stories.md) - 查看所有用户故事
- [验收标准](./acceptance-criteria.md) - 了解功能的验收标准

### 辅助文档
- [约束条件](./constraints.md) - 技术和业务约束
- [变更记录](./changelog.md) - 版本变更历史

## 🎯 核心信息摘要

### 业务背景

{简要描述业务背景，2-3句话}

### 功能描述

{简要描述功能，2-3句话}

### 用户故事数量

- 总计: {total_stories} 个用户故事
- 核心故事: {core_stories} 个
- 扩展故事: {extended_stories} 个

## 💡 使用说明

1. **查看概览**: 阅读本文件了解整体结构
2. **按需加载**: 根据需要，打开对应的模块文档
3. **查看用户故事**: 从 [user-stories.md](./user-stories.md) 开始
4. **验收标准**: 参考 [acceptance-criteria.md](./acceptance-criteria.md)
5. **约束条件**: 查看 [constraints.md](./constraints.md) 了解限制

---

*本文档遵循 SDD 规范，只描述业务需求，不包含技术实现细节*
