#!/usr/bin/env bash
# shellcheck disable=SC2034

print_banner() {
    echo -e "${COLOR_BLUE}${COLOR_BOLD}"
    echo "============================================================"
    echo "   ⚡ AGENTIC STANDARDS INITIALIZER"
    echo "   Universal Standards, Linter Configs & CI Scaffolding"
    echo "============================================================"
    echo -e "${COLOR_RESET}"
}

print_usage() {
    cat << EOF
Usage: init.sh [OPTIONS]

Options:
  -l, --lang <language>       Target language: rust, go, ts (typescript), python, lua, swift, kotlin, all
                              (Auto-detected if run in an existing project)
  -a, --agent <agent>         Target AI agent: gemini, claude, cursor, cline, windsurf, copilot, all (default: all)
      --gemini                Shortcut for --agent gemini
      --claude                Shortcut for --agent claude
      --cursor                Shortcut for --agent cursor
      --cline                 Shortcut for --agent cline
      --windsurf              Shortcut for --agent windsurf
      --copilot               Shortcut for --agent copilot
  -t, --target <directory>    Target project directory (default: current directory)
  -b, --backup                Create .bak backup copies before overwriting existing files
  -d, --dry-run               Preview changes without modifying or creating files
      --no-ci                 Skip copying GitHub Actions CI workflows
      --no-agent-rules        Skip setting up AI agent rules
  -s, --with-starter          Include sample starter code and test files (default: false, standards & linters only)
      --skills, --with-skills Include engineering agent skills (codinary, tdd, code-review, etc.)
  -r, --ref <git-ref>         Branch, tag, or commit to fetch in remote mode (default: main; env AGENTIC_REF)
  -f, --force                 Overwrite existing configuration files
  -h, --help                  Show this help message

Examples:
  # Apply standards to an existing project (auto-detects language)
  ./scripts/init.sh

  # Target specific language and AI agent
  ./scripts/init.sh --lang=swift --gemini
  ./scripts/init.sh --lang=kotlin -a claude
  ./scripts/init.sh --lang=python --cursor

  # Remote execution via cURL or npx (no clone needed)
  curl -fsSL https://raw.githubusercontent.com/igmrrf/agentic/refs/heads/main/scripts/init.sh | bash -s -- --lang=rust --target=.
  npx -y github:igmrrf/agentic init --lang=rust
EOF
}

add_agents() {
    local agent
    local agents=()
    IFS=',' read -ra agents <<< "$1"
    for agent in ${agents[@]+"${agents[@]}"}; do
        AGENTS+=("$(echo "$agent" | tr '[:upper:]' '[:lower:]')")
    done
}

parse_args() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            -l|--lang) LANGUAGE="$2"; shift 2 ;;
            --lang=*) LANGUAGE="${1#*=}"; shift ;;
            -a|--agent) add_agents "$2"; shift 2 ;;
            --agent=*) add_agents "${1#*=}"; shift ;;
            --gemini) AGENTS+=("gemini"); shift ;;
            --claude) AGENTS+=("claude"); shift ;;
            --cursor) AGENTS+=("cursor"); shift ;;
            --cline|--roocode) AGENTS+=("cline"); shift ;;
            --windsurf) AGENTS+=("windsurf"); shift ;;
            --copilot) AGENTS+=("copilot"); shift ;;
            -t|--target) TARGET_DIR="$2"; shift 2 ;;
            --target=*) TARGET_DIR="${1#*=}"; shift ;;
            -b|--backup) CREATE_BACKUP=true; shift ;;
            -d|--dry-run) DRY_RUN=true; shift ;;
            --no-ci) INCLUDE_CI=false; shift ;;
            --no-agent-rules) INCLUDE_AGENT_RULES=false; shift ;;
            -s|--with-starter|--starter) INCLUDE_STARTER=true; shift ;;
            --skills|--with-skills) INCLUDE_SKILLS=true; shift ;;
            -r|--ref) AGENTIC_REF="$2"; shift 2 ;;
            --ref=*) AGENTIC_REF="${1#*=}"; shift ;;
            -f|--force) FORCE_OVERWRITE=true; shift ;;
            -h|--help) print_banner; print_usage; exit 0 ;;
            *) log_error "Unknown option: $1"; print_usage; exit 1 ;;
        esac
    done

    if [ ${#AGENTS[@]} -eq 0 ]; then
        AGENTS=("all")
    fi
}
