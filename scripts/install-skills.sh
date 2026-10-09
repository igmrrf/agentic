#!/usr/bin/env bash
set -euo pipefail

COLOR_RESET="\033[0m"
COLOR_BOLD="\033[1m"
COLOR_GREEN="\033[32m"
COLOR_BLUE="\033[34m"
COLOR_YELLOW="\033[33m"
COLOR_RED="\033[31m"

INSTALL_GLOBAL=false
TARGET_DIR="."
SELECTED_SKILLS=()
SELECTED_AGENTS=()
USE_SYMLINK=false
FORCE=false
DRY_RUN=false
LIST_ONLY=false
UNINSTALL=false

AGENTIC_REF="${AGENTIC_REF:-${AGENTIC_BRANCH:-main}}"
TARBALL_URL_OVERRIDE="${AGENTIC_TARBALL_URL:-}"

IS_REMOTE=true
SCRIPT_SOURCE_DIR=""
SKILLS_SOURCE_DIR=""
TEMP_WORK_DIR=""
AVAILABLE_SKILLS=()
FINAL_SKILLS=()
DESTINATIONS=()

if [[ -n "${BASH_SOURCE[0]:-}" ]] && [[ -f "${BASH_SOURCE[0]}" ]]; then
    POSSIBLE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
    if [[ -d "$POSSIBLE_DIR/skills" ]]; then
        IS_REMOTE=false
        SCRIPT_SOURCE_DIR="$POSSIBLE_DIR"
    fi
fi

log_info() {
    echo -e "${COLOR_BLUE}${COLOR_BOLD}[INFO]${COLOR_RESET} $1" >&2
}

log_success() {
    echo -e "${COLOR_GREEN}${COLOR_BOLD}[SUCCESS]${COLOR_RESET} $1" >&2
}

log_warn() {
    echo -e "${COLOR_YELLOW}${COLOR_BOLD}[WARN]${COLOR_RESET} $1" >&2
}

log_error() {
    echo -e "${COLOR_RED}${COLOR_BOLD}[ERROR]${COLOR_RESET} $1" >&2
}

die() {
    log_error "$1"
    exit 1
}

print_banner() {
    echo -e "${COLOR_BLUE}${COLOR_BOLD}" >&2
    echo "============================================================" >&2
    echo "   ⚡ AGENTIC SKILLS INSTALLER" >&2
    echo "   Codinary, TDD, Code Review & Engineering Agent Skills" >&2
    echo "============================================================" >&2
    echo -e "${COLOR_RESET}" >&2
}

print_usage() {
    cat << EOF
Usage: install-skills.sh [OPTIONS]

Options:
  -g, --global                Install into your home directory (all projects)
  -t, --target <directory>    Install into a project directory (default: current directory)
  -s, --skill <name>          Install specific skill (repeatable, comma-separated, or 'all')
  -a, --all                   Install all available skills (default)
  -A, --agent <name>          Agent to install for: claude, agents, or all (default: all; repeatable, comma-separated)
                                claude  -> ~/.claude/skills  or <target>/.claude/skills
                                agents  -> ~/.agents/skills  or <target>/.agents/skills (Antigravity, Codex, Gemini)
  -l, --list                  List available skills with descriptions
      --link                  Create symbolic links instead of copying (local clone only)
  -f, --force, --update       Overwrite existing installs (use to update to the latest version)
  -u, --uninstall             Remove the selected skills from the destination(s)
  -r, --ref <git-ref>         Branch, tag, or commit to fetch in remote mode (default: main; env AGENTIC_REF)
  -d, --dry-run               Preview without writing files
  -h, --help                  Show this help message

Examples:
  # Install all skills globally for Claude Code and other agents
  ./scripts/install-skills.sh --global

  # Install only codinary and tdd, for Claude Code only
  ./scripts/install-skills.sh --skill codinary,tdd --agent claude --global

  # Install into a project repository (commit .claude/skills to share with your team)
  ./scripts/install-skills.sh --target /path/to/my-project

  # Remote installation pinned to a tag
  curl -fsSL https://raw.githubusercontent.com/igmrrf/agentic/refs/heads/main/scripts/install-skills.sh | bash -s -- --global --ref v1.0.0
EOF
}

require_value() {
    if [[ $# -lt 2 || -z "$2" || "$2" == -* ]]; then
        die "Option '$1' requires a value"
    fi
}

append_csv() {
    local array_name="$1"
    local value
    local items=()
    IFS=',' read -ra items <<< "$2"
    [[ ${#items[@]} -gt 0 ]] || die "Empty value for ${array_name}"
    for value in "${items[@]}"; do
        if [[ -n "$value" ]]; then
            eval "$array_name+=(\"\$value\")"
        fi
    done
}

parse_args() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            -g|--global) INSTALL_GLOBAL=true; shift ;;
            -t|--target) require_value "$@"; TARGET_DIR="$2"; shift 2 ;;
            --target=*) TARGET_DIR="${1#*=}"; shift ;;
            -s|--skill) require_value "$@"; append_csv SELECTED_SKILLS "$2"; shift 2 ;;
            --skill=*) append_csv SELECTED_SKILLS "${1#*=}"; shift ;;
            -a|--all) SELECTED_SKILLS=("all"); shift ;;
            -A|--agent) require_value "$@"; append_csv SELECTED_AGENTS "$2"; shift 2 ;;
            --agent=*) append_csv SELECTED_AGENTS "${1#*=}"; shift ;;
            -l|--list) LIST_ONLY=true; shift ;;
            --link) USE_SYMLINK=true; shift ;;
            -f|--force|--update) FORCE=true; shift ;;
            -u|--uninstall) UNINSTALL=true; shift ;;
            -r|--ref) require_value "$@"; AGENTIC_REF="$2"; shift 2 ;;
            --ref=*) AGENTIC_REF="${1#*=}"; shift ;;
            -d|--dry-run) DRY_RUN=true; shift ;;
            -h|--help) print_banner; print_usage; exit 0 ;;
            *) log_error "Unknown option: $1"; print_usage >&2; exit 1 ;;
        esac
    done
}

cleanup() {
    if [[ -n "$TEMP_WORK_DIR" && -d "$TEMP_WORK_DIR" ]]; then
        rm -rf "$TEMP_WORK_DIR"
    fi
}

resolve_skills_source() {
    if [[ "$IS_REMOTE" == "false" ]]; then
        SKILLS_SOURCE_DIR="$SCRIPT_SOURCE_DIR/skills"
        return
    fi
    command -v curl > /dev/null || die "curl is required for remote installation"
    command -v tar > /dev/null || die "tar is required for remote installation"
    local url="${TARBALL_URL_OVERRIDE:-https://github.com/igmrrf/agentic/archive/${AGENTIC_REF}.tar.gz}"
    TEMP_WORK_DIR="$(mktemp -d)"
    log_info "Fetching skills bundle ($AGENTIC_REF) from $url"
    curl -fsSL "$url" | tar -xz -C "$TEMP_WORK_DIR" --strip-components=1 \
        || die "Failed to download or extract $url"
    [[ -d "$TEMP_WORK_DIR/skills" ]] || die "No skills directory in archive $url"
    SKILLS_SOURCE_DIR="$TEMP_WORK_DIR/skills"
}

load_available_skills() {
    local dir
    for dir in "$SKILLS_SOURCE_DIR"/*; do
        if [[ -d "$dir" && -f "$dir/SKILL.md" ]]; then
            AVAILABLE_SKILLS+=("$(basename "$dir")")
        fi
    done
    [[ ${#AVAILABLE_SKILLS[@]} -gt 0 ]] || die "No skills found in $SKILLS_SOURCE_DIR"
}

skill_description() {
    local desc
    desc="$(grep -m 1 '^description:' "$1/SKILL.md" | sed 's/^description: *//; s/^["'\'']//; s/["'\'']$//')"
    echo "${desc:-No description}"
}

list_skills() {
    print_banner
    echo -e "${COLOR_BOLD}Available Skills in Agentic Inventory:${COLOR_RESET}\n"
    local name
    for name in "${AVAILABLE_SKILLS[@]}"; do
        printf "  ${COLOR_GREEN}%-20s${COLOR_RESET} %s\n" "$name" "$(skill_description "$SKILLS_SOURCE_DIR/$name")"
    done
    echo ""
}

is_available() {
    local name
    for name in "${AVAILABLE_SKILLS[@]}"; do
        [[ "$name" == "$1" ]] && return 0
    done
    return 1
}

resolve_final_skills() {
    local s
    if [[ ${#SELECTED_SKILLS[@]} -eq 0 ]]; then
        FINAL_SKILLS=("${AVAILABLE_SKILLS[@]}")
        return
    fi
    for s in "${SELECTED_SKILLS[@]}"; do
        if [[ "$s" == "all" ]]; then
            FINAL_SKILLS=("${AVAILABLE_SKILLS[@]}")
            return
        fi
        is_available "$s" || die "Skill '$s' not found. Available skills: ${AVAILABLE_SKILLS[*]}"
        FINAL_SKILLS+=("$s")
    done
}

agent_base_dir() {
    if [[ "$INSTALL_GLOBAL" == "true" ]]; then
        echo "$HOME/.$1/skills"
    else
        echo "$TARGET_DIR/.$1/skills"
    fi
}

resolve_destinations() {
    local agent
    if [[ ${#SELECTED_AGENTS[@]} -eq 0 ]]; then
        SELECTED_AGENTS=("all")
    fi
    for agent in "${SELECTED_AGENTS[@]}"; do
        case "$(echo "$agent" | tr '[:upper:]' '[:lower:]')" in
            all) DESTINATIONS=("$(agent_base_dir claude)" "$(agent_base_dir agents)"); return ;;
            claude) DESTINATIONS+=("$(agent_base_dir claude)") ;;
            agents|antigravity|codex|gemini) DESTINATIONS+=("$(agent_base_dir agents)") ;;
            *) die "Unknown agent '$agent'. Use: claude, agents, all" ;;
        esac
    done
}

absolute_path() {
    (cd "$1" && pwd)
}

install_skill() {
    local skill="$1" dest_dir="$2"
    local src="$SKILLS_SOURCE_DIR/$skill"
    local dest="$dest_dir/$skill"
    if [[ -e "$dest" || -L "$dest" ]]; then
        if [[ "$FORCE" != "true" ]]; then
            log_warn "'$skill' already exists at '$dest'. Use --force to update. Skipping."
            return
        fi
        rm -rf "$dest"
    fi
    if [[ "$USE_SYMLINK" == "true" ]]; then
        ln -s "$src" "$dest"
        log_success "Linked $skill -> $dest"
    else
        cp -R "$src" "$dest"
        log_success "Installed $skill -> $dest"
    fi
}

uninstall_skill() {
    local dest="$2/$1"
    if [[ -e "$dest" || -L "$dest" ]]; then
        rm -rf "$dest"
        log_success "Removed $dest"
    else
        log_warn "'$1' is not installed at '$dest'. Nothing to remove."
    fi
}

write_workspace_config() {
    local config_file="$TARGET_DIR/.agents/skills.json"
    [[ -f "$config_file" ]] && return
    cat << 'EOF' > "$config_file"
{
  "entries": [
    {
      "path": ".agents/skills"
    }
  ]
}
EOF
    log_success "Configured workspace discovery in $config_file"
}

print_plan() {
    local action="Install"
    [[ "$UNINSTALL" == "true" ]] && action="Uninstall"
    print_banner
    log_info "Action          : $action"
    log_info "Scope           : $(if [[ "$INSTALL_GLOBAL" == "true" ]]; then echo "Global ($HOME)"; else echo "Project ($TARGET_DIR)"; fi)"
    log_info "Destinations    : ${DESTINATIONS[*]}"
    log_info "Mode            : $(if [[ "$USE_SYMLINK" == "true" ]]; then echo "Symlink"; else echo "Copy"; fi)"
    log_info "Selected Skills : ${FINAL_SKILLS[*]}"
}

run_dry_run() {
    local dest_dir skill
    log_info "Dry run requested. Paths that would change:"
    for dest_dir in "${DESTINATIONS[@]}"; do
        for skill in "${FINAL_SKILLS[@]}"; do
            echo "  - $dest_dir/$skill" >&2
        done
    done
}

apply_changes() {
    local dest_dir skill
    for dest_dir in "${DESTINATIONS[@]}"; do
        if [[ "$UNINSTALL" == "true" ]]; then
            for skill in "${FINAL_SKILLS[@]}"; do uninstall_skill "$skill" "$dest_dir"; done
            continue
        fi
        mkdir -p "$dest_dir"
        for skill in "${FINAL_SKILLS[@]}"; do install_skill "$skill" "$dest_dir"; done
        if [[ "$INSTALL_GLOBAL" == "false" && "$dest_dir" == "$TARGET_DIR/.agents/skills" ]]; then
            write_workspace_config
        fi
    done
}

print_next_steps() {
    echo "" >&2
    if [[ "$UNINSTALL" == "true" ]]; then
        log_success "Skills removed."
        return
    fi
    log_success "Skills installation complete!"
    log_info "Restart Claude Code (or start a new session) to pick up new skills; check with /skills."
    if [[ "$INSTALL_GLOBAL" == "false" ]]; then
        log_info "Commit .claude/skills and .agents/ to share these skills with your team."
    fi
}

main() {
    parse_args "$@"
    trap cleanup EXIT
    if [[ "$USE_SYMLINK" == "true" && "$IS_REMOTE" == "true" ]]; then
        log_warn "--link needs a local clone; the downloaded copy is temporary. Copying instead."
        USE_SYMLINK=false
    fi
    resolve_skills_source
    load_available_skills
    if [[ "$LIST_ONLY" == "true" ]]; then
        list_skills
        exit 0
    fi
    if [[ "$INSTALL_GLOBAL" == "false" ]]; then
        [[ -d "$TARGET_DIR" ]] || die "Target directory '$TARGET_DIR' does not exist"
        TARGET_DIR="$(absolute_path "$TARGET_DIR")"
    fi
    resolve_final_skills
    resolve_destinations
    print_plan
    if [[ "$DRY_RUN" == "true" ]]; then
        run_dry_run
        exit 0
    fi
    apply_changes
    print_next_steps
}

main "$@"
