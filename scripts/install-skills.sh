#!/usr/bin/env bash
set -euo pipefail

COLOR_RESET="\033[0m"
COLOR_BOLD="\033[1m"
COLOR_GREEN="\033[32m"
COLOR_BLUE="\033[34m"
COLOR_YELLOW="\033[33m"
COLOR_RED="\033[31m"

INSTALL_GLOBAL=false
TARGET_DIR=""
SELECTED_SKILLS=()
USE_SYMLINK=false
FORCE=false
DRY_RUN=false
LIST_ONLY=false

AGENTIC_BRANCH="${AGENTIC_BRANCH:-main}"
REPO_TARBALL_URL="https://github.com/igmrrf/Agentic/archive/refs/heads/${AGENTIC_BRANCH}.tar.gz"

IS_REMOTE=true
SCRIPT_SOURCE_DIR=""

if [[ -n "${BASH_SOURCE[0]:-}" ]] && [[ -f "${BASH_SOURCE[0]}" ]]; then
    POSSIBLE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
    if [[ -d "$POSSIBLE_DIR/skills" ]]; then
        IS_REMOTE=false
        SCRIPT_SOURCE_DIR="$POSSIBLE_DIR"
    fi
fi

log_info() {
    echo -e "${COLOR_BLUE}${COLOR_BOLD}[INFO]${COLOR_RESET} $1"
}

log_success() {
    echo -e "${COLOR_GREEN}${COLOR_BOLD}[SUCCESS]${COLOR_RESET} $1"
}

log_warn() {
    echo -e "${COLOR_YELLOW}${COLOR_BOLD}[WARN]${COLOR_RESET} $1"
}

log_error() {
    echo -e "${COLOR_RED}${COLOR_BOLD}[ERROR]${COLOR_RESET} $1" >&2
}

print_banner() {
    echo -e "${COLOR_BLUE}${COLOR_BOLD}"
    echo "============================================================"
    echo "   ⚡ AGENTIC SKILLS INSTALLER"
    echo "   Codinary, TDD, Code Review & Engineering Agent Skills"
    echo "============================================================"
    echo -e "${COLOR_RESET}"
}

print_usage() {
    cat << EOF
Usage: install-skills.sh [OPTIONS]

Options:
  -g, --global                Install globally to ~/.agents/skills (accessible across all projects)
  -t, --target <directory>    Install to project directory <target>/.agents/skills (default: current directory)
  -s, --skill <name>          Install specific skill (repeatable, comma-separated, or 'all')
  -a, --all                   Install all available skills (default)
  -l, --list                  List available skills with descriptions
      --link                  Create symbolic links instead of copying (local mode only)
  -f, --force                 Overwrite existing skill installations
  -d, --dry-run               Preview installation without writing files
  -h, --help                  Show this help message

Examples:
  # Install all skills globally for all agent sessions
  ./scripts/install-skills.sh --global

  # Install only the codinary skill globally
  ./scripts/install-skills.sh --skill codinary --global

  # Install skills into a specific project repository
  ./scripts/install-skills.sh --target /path/to/my-project

  # Remote installation via cURL pipe
  curl -fsSL https://raw.githubusercontent.com/igmrrf/Agentic/refs/heads/main/scripts/install-skills.sh | bash -s -- --global
EOF
}

while [[ $# -gt 0 ]]; do
    case "$1" in
        -g|--global)
            INSTALL_GLOBAL=true
            shift
            ;;
        -t|--target)
            TARGET_DIR="$2"
            shift 2
            ;;
        --target=*)
            TARGET_DIR="${1#*=}"
            shift
            ;;
        -s|--skill)
            IFS=',' read -ra SKILL_NAMES <<< "$2"
            for s in "${SKILL_NAMES[@]}"; do
                SELECTED_SKILLS+=("$s")
            done
            shift 2
            ;;
        --skill=*)
            IFS=',' read -ra SKILL_NAMES <<< "${1#*=}"
            for s in "${SKILL_NAMES[@]}"; do
                SELECTED_SKILLS+=("$s")
            done
            shift
            ;;
        -a|--all)
            SELECTED_SKILLS=()
            shift
            ;;
        -l|--list)
            LIST_ONLY=true
            shift
            ;;
        --link)
            USE_SYMLINK=true
            shift
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -h|--help)
            print_banner
            print_usage
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            print_usage
            exit 1
            ;;
    esac
done

TEMP_WORK_DIR=""
cleanup() {
    if [[ -n "$TEMP_WORK_DIR" && -d "$TEMP_WORK_DIR" ]]; then
        rm -rf "$TEMP_WORK_DIR"
    fi
}
trap cleanup EXIT

resolve_skills_source() {
    if [[ "$IS_REMOTE" == "false" ]]; then
        echo "$SCRIPT_SOURCE_DIR/skills"
    else
        TEMP_WORK_DIR="$(mktemp -d)"
        log_info "Fetching skills bundle from repository..."
        curl -fsSL "$REPO_TARBALL_URL" | tar -xz -C "$TEMP_WORK_DIR" --strip-components=1
        if [[ ! -d "$TEMP_WORK_DIR/skills" ]]; then
            log_error "Failed to locate skills directory in remote repository archive"
            exit 1
        fi
        echo "$TEMP_WORK_DIR/skills"
    fi
}

SKILLS_SOURCE_DIR="$(resolve_skills_source)"

get_available_skills() {
    local skills=()
    for dir in "$SKILLS_SOURCE_DIR"/*; do
        if [[ -d "$dir" && -f "$dir/SKILL.md" ]]; then
            skills+=("$(basename "$dir")")
        fi
    done
    echo "${skills[@]}"
}

list_skills() {
    print_banner
    echo -e "${COLOR_BOLD}Available Skills in Agentic Inventory:${COLOR_RESET}\n"
    for dir in "$SKILLS_SOURCE_DIR"/*; do
        if [[ -d "$dir" && -f "$dir/SKILL.md" ]]; then
            local name
            name="$(basename "$dir")"
            local desc
            desc="$(grep '^description:' "$dir/SKILL.md" | head -n 1 | sed 's/^description: *//; s/^["'\'']//; s/["'\'']$//' || echo "No description")"
            printf "  ${COLOR_GREEN}%-20s${COLOR_RESET} %s\n" "$name" "$desc"
        fi
    done
    echo ""
}

if [[ "$LIST_ONLY" == "true" ]]; then
    list_skills
    exit 0
fi

if [[ "$INSTALL_GLOBAL" == "true" ]]; then
    DEST_DIR="$HOME/.agents/skills"
else
    if [[ -z "$TARGET_DIR" ]]; then
        TARGET_DIR="."
    fi
    DEST_DIR="$TARGET_DIR/.agents/skills"
fi

AVAILABLE_SKILLS_LIST=($(get_available_skills))

if [[ ${#SELECTED_SKILLS[@]} -eq 0 ]]; then
    FINAL_SKILLS=("${AVAILABLE_SKILLS_LIST[@]}")
else
    FINAL_SKILLS=()
    for s in "${SELECTED_SKILLS[@]}"; do
        if [[ " ${AVAILABLE_SKILLS_LIST[*]} " =~ [[:space:]]${s}[[:space:]] ]]; then
            FINAL_SKILLS+=("$s")
        else
            log_error "Skill '$s' not found. Available skills: ${AVAILABLE_SKILLS_LIST[*]}"
            exit 1
        fi
    done
fi

print_banner
log_info "Destination     : $DEST_DIR"
log_info "Installation    : $(if [[ "$INSTALL_GLOBAL" == "true" ]]; then echo "Global (~/.agents/skills)"; else echo "Project ($DEST_DIR)"; fi)"
log_info "Mode            : $(if [[ "$USE_SYMLINK" == "true" ]]; then echo "Symlink"; else echo "Copy"; fi)"
log_info "Selected Skills : ${FINAL_SKILLS[*]}"

if [[ "$DRY_RUN" == "true" ]]; then
    log_info "Dry run requested. Files to be installed:"
    for skill in "${FINAL_SKILLS[@]}"; do
        echo "  - $DEST_DIR/$skill"
    done
    exit 0
fi

mkdir -p "$DEST_DIR"

for skill in "${FINAL_SKILLS[@]}"; do
    src="$SKILLS_SOURCE_DIR/$skill"
    dest="$DEST_DIR/$skill"

    if [[ -e "$dest" || -L "$dest" ]]; then
        if [[ "$FORCE" == "true" ]]; then
            rm -rf "$dest"
        else
            log_warn "Skill '$skill' already exists at '$dest'. Use --force to overwrite. Skipping."
            continue
        fi
    fi

    if [[ "$USE_SYMLINK" == "true" && "$IS_REMOTE" == "false" ]]; then
        ln -s "$src" "$dest"
        log_success "Linked $skill -> $dest"
    else
        cp -r "$src" "$dest"
        log_success "Installed $skill -> $dest"
    fi
done

if [[ "$INSTALL_GLOBAL" == "false" ]]; then
    CONFIG_FILE="$TARGET_DIR/.agents/skills.json"
    if [[ ! -f "$CONFIG_FILE" ]]; then
        mkdir -p "$TARGET_DIR/.agents"
        cat << 'EOF' > "$CONFIG_FILE"
{
  "entries": [
    {
      "path": ".agents/skills"
    }
  ]
}
EOF
        log_success "Configured workspace discovery in $CONFIG_FILE"
    fi
fi

echo ""
log_success "Skills installation complete!"
log_info "Installed skills are immediately available to Antigravity, Claude Code, and agent tools."
