#!/usr/bin/env bash
# ==============================================================================
# Agentic Standards Initializer & Scaffolding Tool
# Propagates universal engineering standards, language rules, linter configs,
# and CI workflows to new or existing projects.
#
# Supports both:
# 1. Local execution:  ./scripts/init.sh [OPTIONS]
# 2. Remote cURL pipe: curl -fsSL https://raw.githubusercontent.com/igmrrf/Agentic/refs/heads/main/scripts/init.sh | bash -s -- [OPTIONS]
# ==============================================================================

set -euo pipefail

# ANSI color codes
COLOR_RESET="\033[0m"
COLOR_BOLD="\033[1m"
COLOR_GREEN="\033[32m"
COLOR_BLUE="\033[34m"
COLOR_YELLOW="\033[33m"
COLOR_RED="\033[31m"

# Default configuration
TARGET_DIR="."
LANGUAGE=""
AGENTS=()
INCLUDE_CI=true
INCLUDE_AGENT_RULES=true
FORCE_OVERWRITE=false
CREATE_BACKUP=false
DRY_RUN=false

# Remote source repository configuration
AGENTIC_BRANCH="${AGENTIC_BRANCH:-main}"
REPO_RAW_BASE="${AGENTIC_REPO_RAW_BASE:-https://raw.githubusercontent.com/igmrrf/Agentic/refs/heads/${AGENTIC_BRANCH}}"

# Determine if running locally from cloned repo or remotely via curl pipe
IS_REMOTE=true
SCRIPT_SOURCE_DIR=""

if [[ -n "${BASH_SOURCE[0]:-}" ]] && [[ -f "${BASH_SOURCE[0]}" ]]; then
    POSSIBLE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
    if [[ -f "$POSSIBLE_DIR/CODING.md" ]]; then
        IS_REMOTE=false
        SCRIPT_SOURCE_DIR="$POSSIBLE_DIR"
    fi
fi

# Helper functions
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
    echo "   ⚡ AGENTIC STANDARDS INITIALIZER"
    echo "   Universal Standards, Linter Configs & CI Scaffolding"
    echo "============================================================"
    echo -e "${COLOR_RESET}"
}

print_usage() {
    cat << EOF
Usage: init.sh [OPTIONS]

Options:
  -l, --lang <language>       Target language: rust, go, ts (typescript), python, lua, all
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
  -f, --force                 Overwrite existing configuration files
  -h, --help                  Show this help message

Examples:
  # Apply standards to an existing project (auto-detects language)
  ./scripts/init.sh

  # Target specific AI agent for rules
  ./scripts/init.sh --gemini
  ./scripts/init.sh -a claude

  # Remote execution via cURL
  curl -fsSL https://raw.githubusercontent.com/igmrrf/Agentic/refs/heads/main/scripts/init.sh | bash -s -- --lang=typescript --target=.
EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        -l|--lang)
            LANGUAGE="$2"
            shift 2
            ;;
        --lang=*)
            LANGUAGE="${1#*=}"
            shift
            ;;
        -a|--agent)
            IFS=',' read -ra ADDR <<< "$2"
            for a in "${ADDR[@]}"; do
                AGENTS+=("$(echo "$a" | tr '[:upper:]' '[:lower:]')")
            done
            shift 2
            ;;
        --agent=*)
            IFS=',' read -ra ADDR <<< "${1#*=}"
            for a in "${ADDR[@]}"; do
                AGENTS+=("$(echo "$a" | tr '[:upper:]' '[:lower:]')")
            done
            shift
            ;;
        --gemini)
            AGENTS+=("gemini")
            shift
            ;;
        --claude)
            AGENTS+=("claude")
            shift
            ;;
        --cursor)
            AGENTS+=("cursor")
            shift
            ;;
        --cline|--roocode)
            AGENTS+=("cline")
            shift
            ;;
        --windsurf)
            AGENTS+=("windsurf")
            shift
            ;;
        --copilot)
            AGENTS+=("copilot")
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
        -b|--backup)
            CREATE_BACKUP=true
            shift
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        --no-ci)
            INCLUDE_CI=false
            shift
            ;;
        --no-agent-rules)
            INCLUDE_AGENT_RULES=false
            shift
            ;;
        -f|--force)
            FORCE_OVERWRITE=true
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

if [ ${#AGENTS[@]} -eq 0 ]; then
    AGENTS=("all")
fi

# Auto-detect language in target directory if not specified
detect_language() {
    local dir="$1"
    if [[ -f "$dir/Cargo.toml" ]]; then
        echo "rust"
    elif [[ -f "$dir/go.mod" ]]; then
        echo "go"
    elif [[ -f "$dir/package.json" || -f "$dir/tsconfig.json" || -f "$dir/biome.json" ]]; then
        echo "typescript"
    elif [[ -f "$dir/pyproject.toml" || -f "$dir/setup.py" || -f "$dir/requirements.txt" ]]; then
        echo "python"
    elif [[ -f "$dir/.luacheckrc" || -f "$dir/stylua.toml" ]] || compgen -G "$dir/*.rockspec" > /dev/null; then
        echo "lua"
    else
        echo ""
    fi
}

if [[ -z "$LANGUAGE" ]]; then
    DETECTED="$(detect_language "$TARGET_DIR")"
    if [[ -n "$DETECTED" ]]; then
        log_info "Auto-detected project type in '$TARGET_DIR': $DETECTED"
        LANGUAGE="$DETECTED"
    else
        print_banner
        echo "Select target language for this project:"
        echo "  1) Rust (Rust 2024 Edition, MSRV 1.85.0+)"
        echo "  2) Go (Go 1.26+)"
        echo "  3) TypeScript (TypeScript 5.5+, Biome)"
        echo "  4) Python (3.11+, Ruff + mypy)"
        echo "  5) Lua (5.1 / LuaJIT / 5.4, StyLua + luacheck)"
        echo "  6) All Languages (Multi-language repository)"
        read -rp "Enter choice [1-6]: " CHOICE
        case "$CHOICE" in
            1) LANGUAGE="rust" ;;
            2) LANGUAGE="go" ;;
            3) LANGUAGE="ts" ;;
            4) LANGUAGE="python" ;;
            5) LANGUAGE="lua" ;;
            6) LANGUAGE="all" ;;
            *)
                log_error "Invalid selection. Exiting."
                exit 1
                ;;
        esac
    fi
fi

# Normalize language argument
LANGUAGE="$(echo "$LANGUAGE" | tr '[:upper:]' '[:lower:]')"
case "$LANGUAGE" in
    rust|rs) LANGUAGE="rust" ;;
    go|golang) LANGUAGE="go" ;;
    ts|typescript|js|javascript) LANGUAGE="typescript" ;;
    py|python) LANGUAGE="python" ;;
    lua) LANGUAGE="lua" ;;
    all|multi) LANGUAGE="all" ;;
    *)
        log_error "Unsupported language: $LANGUAGE. Choose rust, go, ts, python, lua, or all."
        exit 1
        ;;
esac

# Safe file copy utility for local execution
copy_local_file() {
    local src="$1"
    local dest="$2"

    if [[ ! -f "$src" ]]; then
        log_warn "Source file not found: $src (skipping)"
        return
    fi

    if [[ -f "$dest" ]]; then
        if [[ "$FORCE_OVERWRITE" == "false" ]]; then
            log_warn "File already exists: $dest (use -f/--force to overwrite)"
            return
        elif [[ "$CREATE_BACKUP" == "true" ]]; then
            if [[ "$DRY_RUN" == "true" ]]; then
                log_info "[DRY RUN] Would backup: $dest -> ${dest}.bak"
            else
                cp "$dest" "${dest}.bak"
                log_info "Backup created: ${dest}.bak"
            fi
        fi
    fi

    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "[DRY RUN] Would create/update: $dest"
    else
        mkdir -p "$(dirname "$dest")"
        cp "$src" "$dest"
        log_success "Created: $dest"
    fi
}

# Safe file download utility for remote cURL pipe execution
download_remote_file() {
    local url="$1"
    local dest="$2"

    if [[ -f "$dest" ]]; then
        if [[ "$FORCE_OVERWRITE" == "false" ]]; then
            log_warn "File already exists: $dest (use -f/--force to overwrite)"
            return
        elif [[ "$CREATE_BACKUP" == "true" ]]; then
            if [[ "$DRY_RUN" == "true" ]]; then
                log_info "[DRY RUN] Would backup: $dest -> ${dest}.bak"
            else
                cp "$dest" "${dest}.bak"
                log_info "Backup created: ${dest}.bak"
            fi
        fi
    fi

    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "[DRY RUN] Would download: $url -> $dest"
    else
        mkdir -p "$(dirname "$dest")"
        if curl -fsSL "$url" -o "$dest"; then
            log_success "Downloaded: $dest"
        else
            log_error "Failed to download $url"
        fi
    fi
}

# Unified installer router
install_file() {
    local rel_path="$1"
    local dest="$2"

    if [[ "$IS_REMOTE" == "false" ]]; then
        copy_local_file "$SCRIPT_SOURCE_DIR/$rel_path" "$dest"
    else
        download_remote_file "$REPO_RAW_BASE/$rel_path" "$dest"
    fi
}

# Main Execution
print_banner
log_info "Execution Mode  : $(if [[ "$IS_REMOTE" == "false" ]]; then echo "Local Repository ($SCRIPT_SOURCE_DIR)"; else echo "Remote cURL ($REPO_RAW_BASE)"; fi)"
log_info "Target Directory: $TARGET_DIR"
log_info "Target Language : $LANGUAGE"
log_info "Target Agent    : ${AGENTS[*]}"
log_info "Include CI      : $INCLUDE_CI"
log_info "Agent Rules     : $INCLUDE_AGENT_RULES"
log_info "Backup Mode     : $CREATE_BACKUP"
log_info "Dry Run Mode    : $DRY_RUN"
echo ""

if [[ "$DRY_RUN" == "false" ]]; then
    mkdir -p "$TARGET_DIR"
fi

# Helper to fetch file content directly
fetch_file_content() {
    local rel_path="$1"
    if [[ "$IS_REMOTE" == "false" ]]; then
        if [[ -f "$SCRIPT_SOURCE_DIR/$rel_path" ]]; then
            cat "$SCRIPT_SOURCE_DIR/$rel_path"
        fi
    else
        curl -fsSL "$REPO_RAW_BASE/$rel_path" 2>/dev/null || true
    fi
}

# 1. Base Universal Coding Rules
log_info "Fetching Universal Coding Rules..."
UNIVERSAL_RULES="$(fetch_file_content "CODING.md")"
LANG_RULES=""

# 2. Language-Specific Standards & Tooling
if [[ "$LANGUAGE" == "rust" || "$LANGUAGE" == "all" ]]; then
    log_info "Applying Rust 2024 Standards..."
    LANG_RULES="${LANG_RULES}$(fetch_file_content "rust/CODING.md")"$'\n\n'
    install_file "rust/rustfmt.toml" "$TARGET_DIR/rustfmt.toml"
    install_file "rust/clippy.toml" "$TARGET_DIR/clippy.toml"
    
    if [[ ! -f "$TARGET_DIR/Cargo.toml" ]]; then
        install_file "rust/Cargo.toml" "$TARGET_DIR/Cargo.toml"
    else
        log_info "Existing Cargo.toml detected; leaving package configuration intact."
    fi

    if [[ "$INCLUDE_CI" == "true" ]]; then
        install_file "templates/ci/rust-ci.yml" "$TARGET_DIR/.github/workflows/rust-ci.yml"
    fi
fi

if [[ "$LANGUAGE" == "go" || "$LANGUAGE" == "all" ]]; then
    log_info "Applying Go 1.26 Standards..."
    LANG_RULES="${LANG_RULES}$(fetch_file_content "go/CODING.md")"$'\n\n'
    install_file "go/.golangci.yml" "$TARGET_DIR/.golangci.yml"

    if [[ "$INCLUDE_CI" == "true" ]]; then
        install_file "templates/ci/go-ci.yml" "$TARGET_DIR/.github/workflows/go-ci.yml"
    fi
fi

if [[ "$LANGUAGE" == "typescript" || "$LANGUAGE" == "all" ]]; then
    log_info "Applying TypeScript Standards..."
    LANG_RULES="${LANG_RULES}$(fetch_file_content "typescript/CODING.md")"$'\n\n'
    install_file "typescript/biome.json" "$TARGET_DIR/biome.json"
    install_file "typescript/tsconfig.json" "$TARGET_DIR/tsconfig.json"

    if [[ "$INCLUDE_CI" == "true" ]]; then
        install_file "templates/ci/typescript-ci.yml" "$TARGET_DIR/.github/workflows/typescript-ci.yml"
    fi
fi

if [[ "$LANGUAGE" == "python" || "$LANGUAGE" == "all" ]]; then
    log_info "Applying Python Standards..."
    LANG_RULES="${LANG_RULES}$(fetch_file_content "python/CODING.md")"$'\n\n'
fi

if [[ "$LANGUAGE" == "lua" || "$LANGUAGE" == "all" ]]; then
    log_info "Applying Lua Standards..."
    LANG_RULES="${LANG_RULES}$(fetch_file_content "lua/CODING.md")"$'\n\n'
fi

# 3. AI Agent Rules Setup
if [[ "$INCLUDE_AGENT_RULES" == "true" ]]; then
    log_info "Setting up AI Coding Agent Rules for $LANGUAGE (${AGENTS[*]})..."
    
    create_rule_file() {
        local file_path="$1"
        local content="$2"
        if [[ "$DRY_RUN" == "true" ]]; then
            log_info "[DRY RUN] Would create: $file_path"
        else
            mkdir -p "$(dirname "$file_path")"
            echo "$content" > "$file_path"
            log_success "Created: $file_path"
        fi
    }

    if [[ "$LANGUAGE" == "typescript" ]]; then
        read -r -d '' RULES_MD << 'EOF' || true
# Repository Coding Standards (TypeScript & React)

- **Zero Explanatory Comments:** Write self-documenting code. Never explain what code does.
- **Fail Fast & Explicitly:** Never swallow errors; avoid empty catches.
- **Iteration Rules:**
  - MUST use `for...of` loops for side effects or operations that return no data.
  - ONLY use `.map()` when creating and returning a new array or transformed object.
- **Custom Hooks & Component Architecture:**
  - For any custom hook logic reimplemented more than twice, extract into a standalone hook (`use*.ts`) under `hooks/`.
  - Component body size cap: <= 150 lines.
- **Strict Typing & Modern Syntax:**
  - Zero `any` in production code (use `unknown` and narrow).
  - Schema-first validation with Zod at all external boundaries.
  - Always use `import type` for type-only imports (`verbatimModuleSyntax`).
  - Use `object-as-const` instead of TypeScript `enum` (`erasableSyntaxOnly`).
- **Size Caps:** File <= 400 lines, Component <= 150 lines, Function <= 60 lines.
- **Refactoring:** Zero behavior/layout changes without characterization tests.
EOF

        read -r -d '' CURSOR_MDC << 'EOF' || true
---
description: TypeScript and React engineering and coding standards
globs: *
alwaysApply: true
---

- No explanatory comments.
- Use `for...of` loops for side effects / no-return operations; `.map()` strictly for transformations.
- Extract standalone hooks (`use*.ts`) when hook logic is reused >2 times.
- Component body cap <= 150 lines, Function <= 60 lines, File <= 400 lines.
- Zero `any`, schema-first validation (Zod), explicit `import type`.
- No TypeScript `enum` or `namespace` (use `object-as-const` and ES modules).
EOF

    elif [[ "$LANGUAGE" == "rust" ]]; then
        read -r -d '' RULES_MD << 'EOF' || true
# Repository Coding Standards (Rust 2024)

- **Zero Explanatory Comments:** Write self-documenting code.
- **Zero Panics in Production:** Zero `.unwrap()` or `.expect()` calls in production paths. Propagate all errors via `Result<T, E>`.
- **Rust 2024 Idioms:**
  - Explicit `unsafe { ... }` blocks inside `unsafe fn` bodies (`unsafe_op_in_unsafe_fn`).
  - Use `use<..>` syntax for precise lifetime capturing in RPIT.
  - Native `async fn` in traits.
- **Error Modeling:** Strongly typed `thiserror` for libraries/domain; `anyhow` restricted to CLI/main.
- **Borrowing & Invariants:** Borrowed slices (`&str`, `&[T]`, `&Path`) over owned allocations; typestate pattern and newtypes (`AccountId(Uuid)`).
- **Size Caps:** File <= 400 lines, Struct `impl` <= 150 lines, Function <= 60 lines.
- **Refactoring:** Parity-first refactoring with characterization tests.
EOF

        read -r -d '' CURSOR_MDC << 'EOF' || true
---
description: Rust 2024 engineering and coding standards
globs: *
alwaysApply: true
---

- No explanatory comments.
- Zero `.unwrap()` / `.expect()` in production (enforce typed `Result<T, E>`).
- Rust 2024: explicit `unsafe { ... }` blocks, `use<..>` lifetime capturing.
- Borrowed slices over owned types; typestate and newtypes for domain safety.
- Struct `impl` <= 150 lines, Function <= 60 lines, File <= 400 lines.
EOF

    elif [[ "$LANGUAGE" == "go" ]]; then
        read -r -d '' RULES_MD << 'EOF' || true
# Repository Coding Standards (Go 1.26)

- **Zero Explanatory Comments:** Write self-documenting code.
- **Context & Goroutines:**
  - Pass `ctx context.Context` as the first argument in all I/O and DB calls. Never store `context.Context` in a struct.
  - Every goroutine must have an explicit exit lifecycle (`sync.WaitGroup`, `errgroup.Group`, or `ctx.Done()`). No goroutine leaks.
- **Error Handling:**
  - Errors are values; never ignore them (`_ = fn()`).
  - Wrap errors with `%w`: `fmt.Errorf("...: %w", err)`.
  - Use `errors.Join` for multi-error aggregation and `errors.Is` / `errors.As` for inspection.
- **Idioms & Structs:**
  - Accept interfaces, return concrete structs. Small, consumer-driven interfaces (1-3 methods).
  - Use `new(expr)` for direct pointer initialization.
  - Use `iter.Seq` / `iter.Seq2` with `range-over-func` for collection streaming.
- **Size Caps:** File <= 400 lines, Type file <= 200 lines, Function <= 50 lines.
- **Refactoring:** Parity-first refactoring with table-driven tests and `-race` detection.
EOF

        read -r -d '' CURSOR_MDC << 'EOF' || true
---
description: Go 1.26 engineering and coding standards
globs: *
alwaysApply: true
---

- No explanatory comments.
- `ctx context.Context` first argument; zero unmanaged goroutines.
- Errors wrapped with `%w`; zero swallowed errors.
- Small consumer-driven interfaces; concrete return structs.
- Type file <= 200 lines, Function <= 50 lines, File <= 400 lines.
EOF

    else
        read -r -d '' RULES_MD << 'EOF' || true
# Repository Coding Standards

- **Zero Explanatory Comments:** Write self-documenting code.
- **Fail Fast & Explicitly:** Never swallow errors or use empty catches.
- **Strict Size Caps:** File <= 400 lines, Component/Struct <= 150 lines, Function <= 60 lines.
- **Refactoring:** Zero behavior/contract changes without characterization tests.
EOF

        read -r -d '' CURSOR_MDC << 'EOF' || true
---
description: Universal repository engineering and coding standards
globs: *
alwaysApply: true
---

- No explanatory comments.
- No backwards-compatibility `if`-branch shims.
- Single responsibility, early returns, max nesting depth 3.
- Strict typing (zero `any`, schema-first boundaries).
EOF
    fi

    # Append the full standards content to the rules
    RULES_MD="${RULES_MD}"$'\n\n'"${UNIVERSAL_RULES}"$'\n\n'"${LANG_RULES}"
    CURSOR_MDC="${CURSOR_MDC}"$'\n\n'"${UNIVERSAL_RULES}"$'\n\n'"${LANG_RULES}"

    has_agent() {
        local target="$1"
        for a in "${AGENTS[@]}"; do
            if [[ "$a" == "all" || "$a" == "$target" ]]; then
                return 0
            fi
        done
        return 1
    }

    if has_agent "gemini"; then
        create_rule_file "$TARGET_DIR/GEMINI.md" "$RULES_MD"
    fi
    if has_agent "claude"; then
        create_rule_file "$TARGET_DIR/CLAUDE.md" "$RULES_MD"
    fi
    if has_agent "cursor"; then
        create_rule_file "$TARGET_DIR/.cursor/rules/coding.mdc" "$CURSOR_MDC"
    fi
    if has_agent "cline"; then
        create_rule_file "$TARGET_DIR/.clinerules" "$RULES_MD"
    fi
    if has_agent "windsurf"; then
        create_rule_file "$TARGET_DIR/.windsurfrules" "$RULES_MD"
    fi
    if has_agent "copilot"; then
        create_rule_file "$TARGET_DIR/.github/copilot-instructions.md" "$RULES_MD"
    fi
fi

echo ""
if [[ "$DRY_RUN" == "true" ]]; then
    log_info "Dry run finished. No files were written."
else
    log_success "Standards setup complete for $LANGUAGE in '$TARGET_DIR'!"
    log_info "Next Steps:"
    echo "  1. Review the generated agent rules files for domain alignment."
    echo "  2. Run your linter in changed-files mode (ratchet principle)."
    echo "  3. Commit standards with: git commit -m 'chore: adopt agentic engineering standards'"
fi
echo "============================================================"
