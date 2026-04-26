# {feature_name} - 任务分解索引

> 版本: {version}
> 创建时间: {create_date}
> 更新时间: {update_date}
> 关联规格: [spec.md](../spec.md)
> 技术计划: [plan.md](../plan.md)
> 测试用例: [testcases.md](../testcases.md)
>
> **示例**: 模块实例对比功能 - 任务分解索引

## 📋 文档结构

为了便于管理和按需加载，任务文档已拆分为以下模块：

```
tasks/
├── README.md                    # 本文件 - 任务索引和概览
├── phase-0-preparation.md       # Phase 0: 准备工作
├── phase-1-backend.md           # Phase 1: 后端开发（测试优先）
├── phase-2-frontend.md          # Phase 2: 前端开发（测试优先）
├── phase-3-testing.md           # Phase 3: 测试验收
├── phase-N-*.md                 # 其他阶段（版本迭代）
├── dependencies.md              # 任务依赖关系
├── checkpoints.md               # 检查点和验收标准
└── implementation-notes.md      # 实现记录和注意事项
```

## 📊 任务概览

| 阶段 | 任务数 | 预估工时 | 状态 | 文档 |
|------|--------|----------|------|------|
| Phase 0: 准备工作 | {phase_0_tasks} | {phase_0_hours}h | {phase_0_status} | [phase-0-preparation.md](./phase-0-preparation.md) |
| Phase 1: 后端开发 | {phase_1_tasks} | {phase_1_hours}h | {phase_1_status} | [phase-1-backend.md](./phase-1-backend.md) |
| Phase 2: 前端开发 | {phase_2_tasks} | {phase_2_hours}h | {phase_2_status} | [phase-2-frontend.md](./phase-2-frontend.md) |
| Phase 3: 测试验收 | {phase_3_tasks} | {phase_3_hours}h | {phase_3_status} | [phase-3-testing.md](./phase-3-testing.md) |
| **总计** | **{total_tasks}** | **{total_hours}h** | **{progress}%** | - |

**示例数据**：
- Phase 0: 3 任务, 1h, ✅ 已完成
- Phase 1: 14 任务, 10h, ✅ 已完成
- Phase 2: 16 任务, 12h, ✅ 已完成
- Phase 3: 5 任务, 4h, ⏳ 进行中
- 总计: 38 任务, 27h, 85%

## 🔗 快速导航

### 核心阶段
- [准备工作](./phase-0-preparation.md) - 环境检查、测试数据准备、代码调研
- [后端开发](./phase-1-backend.md) - 领域层、DTO、应用服务、Controller
- [前端开发](./phase-2-frontend.md) - API服务、Store、页面组件、路由配置
- [测试验收](./phase-3-testing.md) - E2E测试、边界测试、性能测试、功能验收

### 辅助文档
- [任务依赖关系](./dependencies.md) - 任务依赖图和执行顺序
- [检查点](./checkpoints.md) - 各阶段验收标准
- [实现记录](./implementation-notes.md) - 实际实现与计划差异、问题修复记录

## 🎯 当前进度

**当前阶段**: {current_phase}

**最近完成**：
- ✅ {recent_task_1}
- ✅ {recent_task_2}
- ✅ {recent_task_3}

**下一步**：
- {next_task_1}
- {next_task_2}

**示例**：
- 当前阶段: Phase 3 - 测试验收
- 最近完成: Phase 2 所有任务
- 下一步: 执行 E2E 测试、功能验收

## 💡 使用说明

1. **查看概览**: 阅读本文件了解整体进度和结构
2. **按需加载**: 根据当前工作阶段，打开对应的 Phase 文档
3. **查看依赖**: 在开始任务前，查看 [dependencies.md](./dependencies.md) 了解前置依赖
4. **验收标准**: 完成阶段后，参考 [checkpoints.md](./checkpoints.md) 进行验收
5. **问题排查**: 遇到问题时，查看 [implementation-notes.md](./implementation-notes.md) 中的实现记录

## 📝 变更记录

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| {version} | {date} | {change_description} |

**示例**：
| 版本 | 日期 | 变更内容 |
|------|------|----------|
| 1.4 | 2026-03-27 | 文档拆分为模块化结构，便于按需加载 |
| 1.3 | 2026-03-27 | 新增 Phase 6: 接口实例对比功能 |
| 1.0 | 2026-03-26 | 初始版本 |

---

*本文档遵循 SDD 测试优先原则，任务按 Red-Green-Refactor 循环组织*
