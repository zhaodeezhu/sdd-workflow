#!/bin/bash
# SDD Feature Creator
# 创建新的功能规格目录

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 获取.specify目录
SPECIFY_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SPECS_DIR="$SPECIFY_DIR/specs"
TEMPLATES_DIR="$SPECIFY_DIR/templates"

# 检查目录是否存在
if [ ! -d "$SPECIFY_DIR" ]; then
    echo -e "${RED}错误: .specify 目录不存在${NC}"
    exit 1
fi

# 获取下一个功能编号
get_next_feature_id() {
    local max_id=0
    for dir in "$SPECS_DIR"/*/; do
        if [ -d "$dir" ]; then
            dirname=$(basename "$dir")
            id=$(echo "$dirname" | grep -o '^[0-9]*' || echo "0")
            if [ "$id" -gt "$max_id" ] 2>/dev/null; then
                max_id=$id
            fi
        fi
    done
    printf "%03d" $((max_id + 1))
}

# 创建功能目录
create_feature() {
    local feature_name=$1
    local feature_id=$(get_next_feature_id)
    local feature_dir="$SPECS_DIR/${feature_id}-${feature_name}"

    # 检查目录是否已存在
    if [ -d "$feature_dir" ]; then
        echo -e "${RED}错误: 功能目录已存在: $feature_dir${NC}"
        exit 1
    fi

    # 创建目录
    mkdir -p "$feature_dir/contracts"

    # 获取当前日期
    local date=$(date +%Y-%m-%d)

    # 创建spec.md
    if [ -f "$TEMPLATES_DIR/spec-template.md" ]; then
        sed -e "s/{feature_id}/$feature_id/g" \
            -e "s/{date}/$date/g" \
            -e "s/{feature_name}/$feature_name/g" \
            "$TEMPLATES_DIR/spec-template.md" > "$feature_dir/spec.md"
    else
        touch "$feature_dir/spec.md"
    fi

    # 创建plan.md
    if [ -f "$TEMPLATES_DIR/plan-template.md" ]; then
        sed -e "s/{feature_id}/$feature_id/g" \
            -e "s/{date}/$date/g" \
            "$TEMPLATES_DIR/plan-template.md" > "$feature_dir/plan.md"
    else
        touch "$feature_dir/plan.md"
    fi

    # 创建tasks.md
    if [ -f "$TEMPLATES_DIR/tasks-template.md" ]; then
        sed -e "s/{feature_id}/$feature_id/g" \
            -e "s/{date}/$date/g" \
            "$TEMPLATES_DIR/tasks-template.md" > "$feature_dir/tasks.md"
    else
        touch "$feature_dir/tasks.md"
    fi

    echo -e "${GREEN}✅ 功能目录已创建: $feature_dir${NC}"
    echo ""
    echo "文件结构:"
    echo "  ${feature_id}-${feature_name}/"
    echo "  ├── spec.md          # 功能规格"
    echo "  ├── plan.md          # 技术计划"
    echo "  ├── tasks.md         # 任务分解"
    echo "  └── contracts/       # API契约"
    echo ""
    echo "下一步:"
    echo "  1. 使用 /sdd.specify 命令完善功能规格"
    echo "  2. 使用 /sdd.plan 命令创建技术计划"
    echo "  3. 使用 /sdd.tasks 命令分解任务"
}

# 列出现有功能
list_features() {
    echo -e "${YELLOW}📋 现有功能列表:${NC}"
    echo ""
    for dir in "$SPECS_DIR"/*/; do
        if [ -d "$dir" ]; then
            dirname=$(basename "$dir")
            echo "  - $dirname"
        fi
    done
}

# 帮助信息
show_help() {
    echo "SDD Feature Creator"
    echo ""
    echo "用法:"
    echo "  $0 <feature-name>    创建新功能目录"
    echo "  $0 list              列出现有功能"
    echo "  $0 help              显示帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 user-authentication"
    echo "  $0 bom-import"
    echo "  $0 software-task-workflow"
}

# 主逻辑
case "$1" in
    ""|help|--help|-h)
        show_help
        ;;
    list|--list|-l)
        list_features
        ;;
    *)
        # 验证功能名称格式
        if [[ ! "$1" =~ ^[a-z][a-z0-9-]*$ ]]; then
            echo -e "${RED}错误: 功能名称必须是小写字母、数字和中划线，且以字母开头${NC}"
            echo "示例: user-authentication, bom-import, software-task"
            exit 1
        fi
        create_feature "$1"
        ;;
esac
