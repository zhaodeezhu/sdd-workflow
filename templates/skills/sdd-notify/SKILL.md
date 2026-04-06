---
name: sdd-notify
description: 任务完成通知 - 通过飞书应用消息推送 SDD 工作流执行报告，支持个人和群聊。sdd-run 和 sdd-review 完成时自动触发。
---

# SDD Notify - 任务完成通知

> SDD 工作流长任务执行完成后，通过飞书应用消息推送通知。
> 使用飞书开放平台应用 API（非 Webhook Bot），支持推送给个人和群聊。

## 核心定位

> sdd-notify 是 SDD 工作流的通知组件。它在 sdd-run、sdd-review 等长任务完成时，
> 自动读取配置并通过飞书应用 API 推送结构化报告。

## 前置条件

- curl 命令可用
- 已在飞书开放平台创建应用，获取 App ID 和 App Secret
- 已配置 `.specify/notification.json`

## 飞书应用消息原理

```
1. 用 App ID + App Secret 换取 tenant_access_token
   POST https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal

2. 用 token + receive_id 发送消息
   POST https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type={type}
   Header: Authorization: Bearer {token}
```

## 输入格式

```
/sdd-notify configure                           # 交互式配置
/sdd-notify test                                # 发送测试通知
/sdd-notify run-complete {feature_id}           # sdd-run 完成通知
/sdd-notify review-complete {feature_id}        # sdd-review 完成通知
```

### run-complete 参数

| 参数 | 说明 | 传递方式 |
|------|------|----------|
| feature_id | 功能编号 | 位置参数 |
| title | 功能名称 | 从上下文获取 |
| status | 执行状态 | 从上下文获取 |
| iteration | 迭代轮次 | 从上下文获取 |
| scores | 评审评分 | 从上下文获取 |
| files | 变更文件统计 | 从上下文获取 |

### review-complete 参数

| 参数 | 说明 | 传递方式 |
|------|------|----------|
| feature_id | 功能编号 | 位置参数 |
| title | 功能名称 | 从上下文获取 |
| verdict | 评审结论 (PASS/ITERATE) | 从上下文获取 |
| scores | 各维度评分 | 从上下文获取 |
| issues | 问题统计 | 从上下文获取 |

---

## 配置管理

### 配置文件格式

`.specify/notification.json`:

```json
{
  "appId": "cli_xxxxxxxxxxxxxxxx",
  "appSecret": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "receiveId": "ou_xxxxxxxxxxxxxxxx",
  "receiveIdType": "open_id",
  "enabled": true
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| appId | string | 是 | 飞书应用 App ID（`cli_` 开头） |
| appSecret | string | 是 | 飞书应用 App Secret |
| receiveId | string | 是 | 消息接收者标识（open_id / user_id / email / chat_id） |
| receiveIdType | string | 是 | 标识类型：`open_id` / `user_id` / `email` / `chat_id` |
| enabled | boolean | 否 | 是否启用通知，默认 true |

> ⚠️ **安全提醒**: `appId` 和 `appSecret` 是敏感信息。请确保 `.specify/notification.json` 已加入 `.gitignore`。

---

## 执行流程

### configure - 配置通知

**触发**: `/sdd-notify configure`

**步骤**:

1. **检查现有配置**：读取 `.specify/notification.json`（如存在），展示当前配置
2. **输入 App ID**：提示输入飞书应用 App ID（`cli_` 开头）
3. **输入 App Secret**：提示输入飞书应用 App Secret
4. **选择接收方式**：
   - `open_id` — 通过用户的 open_id 推送给个人（**推荐**）
   - `chat_id` — 推送到群聊
   - `user_id` — 通过用户的 user_id 推送给个人
5. **输入接收者标识**：根据上一步选择的类型，输入对应的 ID
6. **保存配置**：写入 `.specify/notification.json`
7. **验证配置**：发送测试消息确认配置正确
8. **.gitignore 检查**：检查 `.gitignore` 是否包含 `.specify/notification.json`，若未包含则提示

> **⚠️ 重要：如何获取 open_id**
>
> 飞书的 open_id 是**应用级别**的，每个应用看到的同一用户 open_id 不同。
> **不能用其他应用的 open_id，也不能用工号代替。**
>
> 获取步骤：
> 1. 打开 [飞书 API 调试台](https://open.feishu.cn/api-explorer/)
> 2. 右上角选择你的应用
> 3. 搜索「**通过手机号获取用户 ID**」
> 4. 输入你的手机号，点击调试
> 5. 返回的 `open_id`（`ou_` 开头）就是这个应用下可用的 ID
>
> 如果是推送到群聊，chat_id 可在群设置 → 群机器人中查看。

**输出示例**:
```
━━━ 通知配置 ━━━

  应用: cli_xxxxx***
  接收: open_id → ou_xxxxx***

  ✅ 测试消息发送成功

  💡 建议: 将 .specify/notification.json 加入 .gitignore
```

### test - 发送测试通知

**触发**: `/sdd-notify test`

**步骤**:

1. 读取 `.specify/notification.json`
2. 如果配置不存在，提示运行 `/sdd-notify configure`
3. 获取 tenant_access_token
4. 发送测试消息
5. 报告发送结果

### run-complete - sdd-run 完成通知

**触发**: `/sdd-notify run-complete {feature_id}`（由 sdd-run 自动调用）

**步骤**:

1. **前置检查**:
   - 读取 `.specify/notification.json`
   - 文件不存在 → **静默结束**
   - JSON 解析失败 → 输出 `[sdd-notify] 配置文件格式错误，请运行 /sdd-notify configure` → 结束
   - `enabled` 为 false → **静默结束**
   - 字段缺失 → 输出 `[sdd-notify] 配置不完整，请运行 /sdd-notify configure` → 结束

2. **获取 Access Token**:
   ```bash
   curl -s -X POST 'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal' \
     -H 'Content-Type: application/json' \
     --connect-timeout 10 --max-time 10 \
     -d '{"app_id":"{appId}","app_secret":"{appSecret}"}'
   ```
   - 解析响应，提取 `tenant_access_token`
   - `code != 0` → 输出 `[sdd-notify] 获取 token 失败: {msg}` → 结束

3. **从上下文提取数据**: 功能名称、执行状态、迭代轮次、评审评分、变更文件统计

4. **发送消息**: 根据消息模板构建 JSON，发送 POST 请求
   ```bash
   curl -s -X POST 'https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type={receiveIdType}' \
     -H 'Content-Type: application/json' \
     -H 'Authorization: Bearer {tenant_access_token}' \
     --connect-timeout 10 --max-time 10 \
     -d '{消息JSON}'
   ```

5. **处理响应**:
   - 检查 `code == 0`
   - 失败: 输出 `[sdd-notify] 通知发送失败: {msg}`
   - 成功: 输出 `[sdd-notify] ✅ 通知已发送`

### review-complete - sdd-review 完成通知

**触发**: `/sdd-notify review-complete {feature_id}`（由 sdd-review 自动调用）

**步骤**: 与 run-complete 相同的前置检查和发送流程，区别在于消息模板和数据：
- 评审结论 (PASS/ITERATE)
- 各维度评分
- 问题统计（确认数/待确认数）

---

## 消息模板

所有消息使用飞书 `interactive` 卡片类型，通过 `im/v1/messages` API 发送。

API 请求体格式：
```json
{
  "receive_id": "{receiveId}",
  "msg_type": "interactive",
  "content": "{卡片JSON字符串，需要转义}"
}
```

> **注意**: `content` 字段的值是**转义后的 JSON 字符串**，不是嵌套对象。Claude 在构建 curl 命令时需要正确处理 JSON 转义。

### run-complete 模板

卡片 JSON：
```json
{
  "config": {
    "wide_screen_mode": true
  },
  "header": {
    "title": {
      "tag": "plain_text",
      "content": "SDD 任务完成"
    },
    "template": "blue"
  },
  "elements": [
    {
      "tag": "div",
      "text": {
        "tag": "lark_md",
        "content": "**功能**: {feature_id} - {title}\n**状态**: {status_emoji} {status}\n**迭代**: 第 {iteration} 轮"
      }
    },
    {
      "tag": "hr"
    },
    {
      "tag": "div",
      "text": {
        "tag": "lark_md",
        "content": "**评审结果**\n功能完整性: {score_func}/5\n需求一致性: {score_req}/5\n代码质量: {score_code}/5"
      }
    },
    {
      "tag": "div",
      "text": {
        "tag": "lark_md",
        "content": "**变更**: 新增 {files_added} 个文件, 修改 {files_modified} 个文件"
      }
    },
    {
      "tag": "hr"
    },
    {
      "tag": "note",
      "elements": [
        {
          "tag": "plain_text",
          "content": "来自 SDD Workflow"
        }
      ]
    }
  ]
}
```

状态 emoji 映射：
- 完成 → `✅`
- 部分完成 → `⚠️`
- 失败 → `❌`

### review-complete 模板

卡片 JSON：
```json
{
  "config": {
    "wide_screen_mode": true
  },
  "header": {
    "title": {
      "tag": "plain_text",
      "content": "SDD 评审完成"
    },
    "template": "{verdict_template}"
  },
  "elements": [
    {
      "tag": "div",
      "text": {
        "tag": "lark_md",
        "content": "**功能**: {feature_id} - {title}\n**结论**: {verdict_emoji} {verdict}"
      }
    },
    {
      "tag": "hr"
    },
    {
      "tag": "div",
      "text": {
        "tag": "lark_md",
        "content": "**评审评分**\n功能完整性: {score_func}/5 (A-严苛审查员)\n需求一致性: {score_req}/5 (B-需求守护者)\n集成完整性: {score_int}/5 (C-集成检查员)"
      }
    },
    {
      "tag": "div",
      "text": {
        "tag": "lark_md",
        "content": "**问题统计**\n确认问题: {confirmed_issues} 项 | 待确认: {pending_issues} 项"
      }
    },
    {
      "tag": "hr"
    },
    {
      "tag": "note",
      "elements": [
        {
          "tag": "plain_text",
          "content": "来自 SDD Workflow"
        }
      ]
    }
  ]
}
```

结论映射：
- PASS → emoji `✅`, template `green`
- ITERATE → emoji `⚠️`, template `orange`

### test 消息模板

```json
{
  "config": {
    "wide_screen_mode": true
  },
  "header": {
    "title": {
      "tag": "plain_text",
      "content": "SDD 通知测试"
    },
    "template": "turquoise"
  },
  "elements": [
    {
      "tag": "div",
      "text": {
        "tag": "lark_md",
        "content": "这是一条来自 **SDD Workflow** 的测试通知。\n如果你看到了这条消息，说明通知配置成功 ✅"
      }
    },
    {
      "tag": "note",
      "elements": [
        {
          "tag": "plain_text",
          "content": "来自 SDD Workflow"
        }
      ]
    }
  ]
}
```

---

## 配置验证

读取 `.specify/notification.json` 时，验证关键字段：

1. **appId 字段**：必须存在且非空
2. **appSecret 字段**：必须存在且非空
3. **receiveId 字段**：必须存在且非空
4. **receiveIdType 字段**：必须是 `open_id` / `user_id` / `email` / `chat_id` 之一
5. **字段缺失**：缺少任何必填字段，输出 `[sdd-notify] 配置不完整，请运行 /sdd-notify configure` 并跳过

---

## 错误处理

### 容错原则

> **通知是附加功能，任何通知失败都不得中断主工作流。**

| 场景 | 行为 |
|------|------|
| 配置文件不存在 | 静默跳过，无输出 |
| 配置文件 JSON 格式错误 | 输出友好错误提示，跳过 |
| enabled = false | 静默跳过 |
| 必填字段缺失 | 输出配置不完整提示，跳过 |
| 获取 token 失败 (code != 0) | 输出 `[sdd-notify] 获取 token 失败: {msg}`，跳过 |
| curl 超时 (>10s) | 输出 `[sdd-notify] 通知发送超时`，跳过 |
| 发送消息失败 (code != 0) | 输出 `[sdd-notify] 通知发送失败: {msg}`，跳过 |
| 网络不可用 | 输出 `[sdd-notify] 网络不可用，通知发送失败`，跳过 |

### 安全规范

- 错误输出中不显示完整 appSecret，仅显示前几位 + `***`
- 通知内容仅包含摘要信息，不包含代码细节
- curl 命令使用 `-s` 静默模式
