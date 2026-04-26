---
name: sdd-worktree
description: SDD Worktree 管理 - 为并行 feature 开发创建/查看/清理 git worktree 隔离环境
invocable: true
---

# SDD Worktree — 并行 Feature 隔离管理

> 为每个 SDD feature 在涉及的 repo 子项目中创建独立的 git worktree，
> 使多个 feature 可以并行开发，互不冲突。

## 输入格式

```
/sdd-worktree setup {feature_id}                        # 根据 plan.md 创建 worktree（从各 repo 当前 HEAD 切出）
/sdd-worktree setup {feature_id} --base {branch_name}   # 指定基准分支（推荐）
/sdd-worktree status                                    # 查看所有 feature 的 worktree 状态
/sdd-worktree status {feature_id}                       # 查看指定 feature 的 worktree
/sdd-worktree cleanup {feature_id}                      # 清理 worktree（保留分支）
/sdd-worktree cleanup {feature_id} --rm-branch          # 清理 worktree 并删除分支
```

## 核心概念

### 隔离模型

```
repo/cap-front/                           ← 主工作目录（主分支）
  └── .worktrees/
      ├── sdd-010/                        ← feature 010 的隔离副本
      └── sdd-011/                        ← feature 011 的隔离副本

repo/cplm-pdm/                            ← 主工作目录（主分支）
  └── .worktrees/
      └── sdd-010/                        ← feature 010 在后端的隔离副本
```

- 每个 feature 只在**涉及的** repo 子项目中创建 worktree
- `.specify/` 目录在所有 worktree 外部，天然共享无冲突
- 分支命名: `sdd/{feature_id}-{short_name}`（如 `sdd/010-bom-compare`）
- Worktree 路径: `repo/{project}/.worktrees/sdd-{feature_id}/`

### pipeline-state.json 扩展

setup 后在 pipeline-state.json 中记录 worktree 信息：

```json
{
  "feature_id": "010",
  "worktrees": {
    "cap-front": {
      "branch": "sdd/010-bom-compare",
      "worktree_path": "repo/cap-front/.worktrees/sdd-010",
      "base_branch": "master",
      "status": "active",
      "created_at": "2026-04-17T10:00:00Z"
    },
    "cplm-pdm": {
      "branch": "sdd/010-bom-compare",
      "worktree_path": "repo/cplm-pdm/.worktrees/sdd-010",
      "base_branch": "develop",
      "status": "active",
      "created_at": "2026-04-17T10:00:00Z"
    }
  }
}
```

---

## 命令详解

### setup — 创建 Worktree

**触发时机**: Phase A（Planning）完成后、Phase B（Implement）开始前。

**执行步骤**:

1. **解析涉及的项目**：读取 `.specify/specs/{feature_id}/plan.md`，从文件路径中提取涉及的 repo 子项目列表。

   识别规则：扫描 plan.md 中出现的 `repo/{project}/` 路径前缀，去重得到项目列表。
   
   常见项目：`cap-front`, `cat-master`, `cplm-pdm`, `cplm-pcm`, `cplm-software-center`

2. **确认用户**：列出将创建 worktree 的项目，等待用户确认（或在 sdd-run 自动模式下跳过确认）。

3. **为每个项目创建 worktree**：

   ```bash
   # 提取 feature 短名（从 spec 目录名）
   FEATURE_DIR=$(ls -d .specify/specs/{feature_id}-* | head -1)
   SHORT_NAME=$(basename $FEATURE_DIR | sed 's/^[0-9]*-//')
   BRANCH_NAME="sdd/{feature_id}-${SHORT_NAME}"
   
   # 对每个涉及的项目
   cd repo/{project}
   
   # 确保 .worktrees 目录存在
   mkdir -p .worktrees
   
   # 确定基准分支
   # 优先使用用户指定的 --base 参数，否则使用当前 HEAD
   if [ -n "$BASE_BRANCH_PARAM" ]; then
     BASE_BRANCH="$BASE_BRANCH_PARAM"
   else
     BASE_BRANCH=$(git symbolic-ref --short HEAD)
   fi
   
   # 如果基准分支存在远程，先 pull 最新内容
   if git ls-remote --heads origin "$BASE_BRANCH" | grep -q "$BASE_BRANCH"; then
     echo "Pulling latest from origin/$BASE_BRANCH..."
     git fetch origin "$BASE_BRANCH"
     git checkout "$BASE_BRANCH"
     git pull origin "$BASE_BRANCH"
   fi
   
   # 检查 worktree 是否已存在
   if git worktree list | grep -q ".worktrees/sdd-{feature_id}"; then
     echo "Worktree already exists for {project}, skipping"
   else
     # 创建 worktree + 新分支（基于指定的基准分支）
     git worktree add .worktrees/sdd-{feature_id} -b ${BRANCH_NAME} ${BASE_BRANCH}
   fi
   ```

4. **更新 pipeline-state.json**：写入 worktrees 字段。

5. **输出路径映射表**：

   ```
   ✅ Worktree 创建完成
   
   | 项目 | 分支 | Worktree 路径 |
   |------|------|--------------|
   | cap-front | sdd/010-bom-compare | repo/cap-front/.worktrees/sdd-010/ |
   | cplm-pdm | sdd/010-bom-compare | repo/cplm-pdm/.worktrees/sdd-010/ |
   
   后续 implement/review/fix 将在 worktree 路径中操作代码。
   ```

### status — 查看状态

**执行步骤**:

1. 扫描所有 `.specify/specs/*/pipeline-state.json`，读取 worktrees 字段
2. 对每个有 worktree 的 feature，检查 worktree 是否仍存在
3. 输出汇总表

```
━━━ SDD Worktree 状态 ━━━

Feature 010 (bom-compare):
  cap-front  │ sdd/010-bom-compare │ active  │ 3 commits ahead
  cplm-pdm   │ sdd/010-bom-compare │ active  │ 1 commit ahead

Feature 011 (report-export):
  cap-front  │ sdd/011-report-export │ active │ 0 commits ahead

无 worktree: 001, 002, 003, 004, 005, 007, 008, 009
```

### cleanup — 清理 Worktree

**执行步骤**:

1. 读取 `pipeline-state.json` 获取 worktree 信息
2. 对每个项目：

   ```bash
   cd repo/{project}
   
   # 移除 worktree（保留分支）
   git worktree remove .worktrees/sdd-{feature_id} --force
   
   # 如果指定 --rm-branch，删除分支
   # git branch -d ${BRANCH_NAME}
   ```

3. 更新 pipeline-state.json 中的 worktree status 为 "removed"
4. 输出合并指引：

   ```
   ✅ Worktree 已清理
   
   保留的分支（可手动合并）:
     cd repo/cap-front && git merge sdd/010-bom-compare
     cd repo/cplm-pdm && git merge sdd/010-bom-compare
   
   合并后删除分支:
     cd repo/cap-front && git branch -d sdd/010-bom-compare
     cd repo/cplm-pdm && git branch -d sdd/010-bom-compare
   ```

---

## Worktree 路径映射（供 sdd-run 注入）

当 feature 使用 worktree 时，sdd-run 需要在 implement/review/fix agent 的 prompt 中注入路径映射：

```markdown
## ⚠️ Worktree 路径映射

本 feature 使用独立 worktree 隔离开发，代码文件的读写路径如下：

| 项目 | 标准路径前缀 | 实际路径前缀（使用此路径！） |
|------|-------------|--------------------------|
| cap-front | repo/cap-front/ | repo/cap-front/.worktrees/sdd-{feature_id}/ |
| cplm-pdm | repo/cplm-pdm/ | repo/cplm-pdm/.worktrees/sdd-{feature_id}/ |

**规则**：
1. plan.md/tasks.md 中的文件路径使用标准路径前缀
2. 实际读写代码文件时，必须替换为"实际路径前缀"
3. `.specify/` 目录的路径不变（不在 worktree 中）
4. ESLint 检查需在 worktree 目录内执行：
   `cd repo/{project}/.worktrees/sdd-{feature_id} && npx eslint {文件} --no-error-on-unmatched-pattern`
5. git diff 在 worktree 目录内执行
```

---

## 冲突防护

1. **Worktree 已存在检查**: setup 前检查目标路径，已存在则跳过
2. **分支名冲突检查**: 创建前检查分支是否已存在，已存在则复用
3. **多 feature 隔离**: git worktree 机制保证不同 feature 的 worktree 互不影响
4. **并发安全**: 每个 feature 操作自己的 pipeline-state.json，无竞争

---

## 与 sdd-run 的集成

sdd-run 在 Phase A→B 过渡时自动调用 setup，无需手动执行。流程如下：

```
Phase A 完成（plan.md 已生成）
  ↓
sdd-run 解析 plan.md 中涉及的项目
  ↓
sdd-run 执行 worktree setup
  ↓
sdd-run 在 Phase B/C 的 agent prompt 中注入路径映射
  ↓
Phase B/C 的 agent 在 worktree 中操作代码
  ↓
全流程完成后，输出合并指引
```

**手动使用场景**：
- 需要手动查看 worktree 状态：`/sdd-worktree status`
- 需要手动清理：`/sdd-worktree cleanup 010`
- 需要为不通过 sdd-run 执行的 feature 手动创建隔离环境
