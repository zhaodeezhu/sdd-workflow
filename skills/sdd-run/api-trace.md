# API 链路追踪

> 本文件从 `SKILL.md` 拆出，仅在涉及无 SDD 文档的旧功能时由主进程 Read 加载。

## 适用场景

- 需要修改的功能是 SDD 流程引入之前开发的（无 spec/plan 文档）
- 文档中的字段描述不完整（如只有中文名，缺少 apiName）
- 数据来自后端动态配置（如对象引擎的 `attributeDtoList`），前端不硬编码
- Confluence 文档过时，数据库 MCP 不可用

## 追踪步骤

```
步骤 1: 从 URL/页面定位前端组件
  ├── 解析页面 URL 路径 → 匹配路由配置 → 找到页面组件
  ├── 在页面组件中找到目标区域（如表格、表单）使用的子组件
  └── 产出：目标组件文件路径、渲染逻辑

步骤 2: 从组件定位 API 调用
  ├── 在组件或 Store 中找到数据获取方法（如 fetch('API_KEY', ...)）
  ├── 提取 API Key（如 GET_OBJECT_SCHEME_USED）
  └── 产出：API Key、Store 方法名

步骤 3: 从 API Key 定位 BFF 路径
  ├── 在 backend/src/apiPath/modules/ 中搜索 API Key
  ├── 找到实际的 HTTP 方法和 URI 路径
  └── 产出：后端 API 路径（如 /scheme-used/）

步骤 4: 调用实际 API 获取真实数据
  ├── 使用 call-api.js 工具直接调用后端 API
  ├── 从响应数据中提取所需的字段定义（apiName ↔ 中文名映射）
  └── 产出：完整的字段列表、数据结构、实际值

步骤 5:（可选）追踪到后端 Java 代码
  ├── 根据 API 路径在 cplm-pdm 中搜索 Controller/Service
  ├── 找到数据模型定义（DTO、Entity、常量）
  └── 产出：后端业务逻辑、数据来源
```

## 常用 API 追踪工具

| 工具 | 用途 | 示例 |
|------|------|------|
| `call-api.js` | 直接调用后端 API 查看响应 | `node .claude/skills/diagnosis/scripts/call-api.js --user xxx GET "/scheme-used/?itemId=xxx"` |
| BFF apiPath | 查 API Key 对应的路径 | `Grep "API_KEY" backend/src/apiPath/modules/` |
| Store 文件 | 查前端调用的 API Key | `Grep "fetch(" _stores/models/` |
| BizConstants.java | 查后端常量定义 | `Grep "F_MO_LIST" cplm-pdm/` |

## 与文档优先流程的关系

```
有 SDD 文档的功能 → 文档优先流程（读 plan.md/spec.md）
无 SDD 文档的功能 → API 链路追踪（从前端 URL 出发追踪到后端）
两者结合         → 文档定位大方向 + API 追踪确认细节（如动态字段的 apiName）
```

> **深度追踪**：如需全链路梳理（含后端 Controller → Service → Mapper → DB），
> 可使用 `feature-trace` skill 进行完整的功能架构分析并输出文档。
