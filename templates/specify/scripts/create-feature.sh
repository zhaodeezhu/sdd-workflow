#!/bin/bash
# SDD Feature Creator
# Creates a new feature specification directory

set -e

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get .specify directory
SPECIFY_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SPECS_DIR="$SPECIFY_DIR/specs"
TEMPLATES_DIR="$SPECIFY_DIR/templates"

# Check directory exists
if [ ! -d "$SPECIFY_DIR" ]; then
    echo -e "${RED}Error: .specify directory does not exist${NC}"
    exit 1
fi

# Get next feature ID
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

# Create feature directory
create_feature() {
    local feature_name=$1
    local feature_id=$(get_next_feature_id)
    local feature_dir="$SPECS_DIR/${feature_id}-${feature_name}"

    # Check if directory already exists
    if [ -d "$feature_dir" ]; then
        echo -e "${RED}Error: Feature directory already exists: $feature_dir${NC}"
        exit 1
    fi

    # Create directory
    mkdir -p "$feature_dir/contracts"

    # Get current date
    local date=$(date +%Y-%m-%d)

    # Create spec.md
    if [ -f "$TEMPLATES_DIR/spec-template.md" ]; then
        sed -e "s/{feature_id}/$feature_id/g" \
            -e "s/{date}/$date/g" \
            -e "s/{feature_name}/$feature_name/g" \
            "$TEMPLATES_DIR/spec-template.md" > "$feature_dir/spec.md"
    else
        touch "$feature_dir/spec.md"
    fi

    # Create plan.md
    if [ -f "$TEMPLATES_DIR/plan-template.md" ]; then
        sed -e "s/{feature_id}/$feature_id/g" \
            -e "s/{date}/$date/g" \
            "$TEMPLATES_DIR/plan-template.md" > "$feature_dir/plan.md"
    else
        touch "$feature_dir/plan.md"
    fi

    # Create tasks.md
    if [ -f "$TEMPLATES_DIR/tasks-template.md" ]; then
        sed -e "s/{feature_id}/$feature_id/g" \
            -e "s/{date}/$date/g" \
            "$TEMPLATES_DIR/tasks-template.md" > "$feature_dir/tasks.md"
    else
        touch "$feature_dir/tasks.md"
    fi

    echo -e "${GREEN}Feature directory created: $feature_dir${NC}"
    echo ""
    echo "File structure:"
    echo "  ${feature_id}-${feature_name}/"
    echo "  ├── spec.md          # Feature specification"
    echo "  ├── plan.md          # Technical plan"
    echo "  ├── tasks.md         # Task breakdown"
    echo "  └── contracts/       # API contracts"
    echo ""
    echo "Next steps:"
    echo "  1. Use /sdd-specify to complete the feature specification"
    echo "  2. Use /sdd-plan to create the technical plan"
    echo "  3. Use /sdd-tasks to break down tasks"
}

# List existing features
list_features() {
    echo -e "${YELLOW}Existing features:${NC}"
    echo ""
    for dir in "$SPECS_DIR"/*/; do
        if [ -d "$dir" ]; then
            dirname=$(basename "$dir")
            echo "  - $dirname"
        fi
    done
}

# Help information
show_help() {
    echo "SDD Feature Creator"
    echo ""
    echo "Usage:"
    echo "  $0 <feature-name>    Create new feature directory"
    echo "  $0 list              List existing features"
    echo "  $0 help              Show help"
    echo ""
    echo "Examples:"
    echo "  $0 user-authentication"
    echo "  $0 data-export"
    echo "  $0 notification-system"
}

# Main logic
case "$1" in
    ""|help|--help|-h)
        show_help
        ;;
    list|--list|-l)
        list_features
        ;;
    *)
        # Validate feature name format
        if [[ ! "$1" =~ ^[a-z][a-z0-9-]*$ ]]; then
            echo -e "${RED}Error: Feature name must be lowercase letters, numbers and hyphens, starting with a letter${NC}"
            echo "Examples: user-authentication, data-export, notification-system"
            exit 1
        fi
        create_feature "$1"
        ;;
esac
