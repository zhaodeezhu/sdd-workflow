# {功能名称} - 技术实现计划索引

> 版本: {version}
> 创建时间: {create_date}
> 更新时间: {update_date}
> 关联规格: [spec.md](../spec.md)
> 关联测试: [testcases.md](../testcases.md)

## 📋 文档结构

为了便于管理和按需加载，技术计划已拆分为以下模块：

```
plan/
├── README.md              # 本文件 - 计划索引和概览
├── architecture.md        # 架构设计
├── data-model.md          # 数据模型（DDL、DTO）
├── backend-api.md         # 后端 API 设计
├── backend-impl.md        # 后端实现细节
├── frontend-api.md        # 前端 API 对接
├── frontend-impl.md       # 前端实现细节
├── security.md            # 安全性设计
├── performance.md         # 性能优化
└── changelog.md           # 变更记录
```

## 📊 文档概览

| 模块 | 内容 | 文档 |
|------|------|------|
| 架构设计 | 整体架构、技术栈、模块划分 | [architecture.md](./architecture.md) |
| 数据模型 | DDL、DTO、实体关系 | [data-model.md](./data-model.md) |
| 后端API | Controller、接口定义 | [backend-api.md](./backend-api.md) |
| 后端实现 | Service、Repository实现 | [backend-impl.md](./backend-impl.md) |
| 前端API | API对接、请求封装 | [frontend-api.md](./frontend-api.md) |
| 前端实现 | 组件、Store、路由 | [frontend-impl.md](./frontend-impl.md) |
| 安全性 | 认证、授权、数据安全 | [security.md](./security.md) |
| 性能优化 | 缓存、索引、优化策略 | [performance.md](./performance.md) |
| 变更记录 | 版本变更历史 | [changelog.md](./changelog.md) |

## 🔗 快速导航

### 核心文档
- [架构设计](./architecture.md) - 了解整体架构和技术选型
- [数据模型](./data-model.md) - 查看数据库设计和DTO定义
- [后端API](./backend-api.md) - 查看API接口定义

### 实现文档
- [后端实现](./backend-impl.md) - 后端Service和Repository实现
- [前端API](./frontend-api.md) - 前端API对接方式
- [前端实现](./frontend-impl.md) - 前端组件和Store实现

### 辅助文档
- [安全性设计](./security.md) - 安全相关设计
- [性能优化](./performance.md) - 性能优化方案
- [变更记录](./changelog.md) - 版本变更历史

## 🎯 核心信息摘要

### 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 前端框架 | React | 17.x |
| UI组件库 | Ant Design | 4.x |
| 状态管理 | MobX | 5.x |
| 后端框架 | Spring Boot | 2.1.7 |
| 数据库 | PostgreSQL | 12.x |

### 架构概览

```
前端 (React + MobX)
    ↓ HTTP API
后端 (Spring Boot)
    ↓ JDBC
数据库 (PostgreSQL)
```

### 关键设计决策

1. **决策1**: {简要描述}
2. **决策2**: {简要描述}
3. **决策3**: {简要描述}

## 💡 使用说明

1. **查看概览**: 阅读本文件了解整体结构
2. **架构优先**: 从 [architecture.md](./architecture.md) 开始了解整体设计
3. **按需加载**: 根据开发阶段，打开对应的模块文档
4. **后端开发**: 参考 [backend-api.md](./backend-api.md) 和 [backend-impl.md](./backend-impl.md)
5. **前端开发**: 参考 [frontend-api.md](./frontend-api.md) 和 [frontend-impl.md](./frontend-impl.md)

---

*本文档遵循 SDD 规范，包含技术实现细节（SQL、代码、文件路径）*
