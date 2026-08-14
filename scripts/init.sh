#!/usr/bin/env bash
# ==============================================================================
# Agentic Standards Initializer & Scaffolding Tool
# Propagates universal engineering standards, language rules, linter configs,
# and CI workflows to new or existing projects.
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
INCLUDE_CI=true
INCLUDE_AGENT_RULES=true
FORCE_OVERWRITE=false
CREATE_BACKUP=false
DRY_RUN=false

# Determine script source directory
SCRIPT_SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

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
Usage: $(basename "$0") [OPTIONS]

Options:
  -l, --lang <language>       Target language: rust, go, ts (typescript), all
                              (Auto-detected if run in an existing project)
  -t, --target <directory>    Target project directory (default: current directory)
  -b, --backup                Create .bak backup copies before overwriting existing files
  -d, --dry-run               Preview changes without modifying or creating files
      --no-ci                 Skip copying GitHub Actions CI workflows
      --no-agent-rules        Skip setting up .gemini and .cursor AI agent rules
  -f, --force                 Overwrite existing configuration files
  -h, --help                  Show this help message

Examples:
  # Apply standards to an existing project (auto-detects language)
  ./scripts/init.sh

  # Explicit language targeting with backup protection
  ./scripts/init.sh --lang=rust --target=./existing-app --backup --force

  # Dry run preview on an existing repository
  ./scripts/init.sh --target=./my-project --dry-run
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

# Auto-detect language in target directory if not specified
detect_language() {
    local dir="$1"
    if [[ -f "$dir/Cargo.toml" ]]; then
        echo "rust"
    elif [[ -f "$dir/go.mod" ]]; then
        echo "go"
    elif [[ -f "$dir/package.json" || -f "$dir/tsconfig.json" || -f "$dir/biome.json" ]]; then
        echo "typescript"
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
        echo "  3) TypeScript (TypeScript 7.0+, Biome)"
        echo "  4) All Languages (Multi-language repository)"
        read -rp "Enter choice [1-4]: " CHOICE
        case "$CHOICE" in
            1) LANGUAGE="rust" ;;
            2) LANGUAGE="go" ;;
            3) LANGUAGE="ts" ;;
            4) LANGUAGE="all" ;;
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
    all|multi) LANGUAGE="all" ;;
    *)
        log_error "Unsupported language: $LANGUAGE. Choose rust, go, ts, or all."
        exit 1
        ;;
esac

# Safe file copy utility
copy_file() {
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

# Main Execution
print_banner
log_info "Target Directory: $TARGET_DIR"
log_info "Target Language : $LANGUAGE"
log_info "Include CI      : $INCLUDE_CI"
log_info "Agent Rules     : $INCLUDE_AGENT_RULES"
log_info "Backup Mode     : $CREATE_BACKUP"
log_info "Dry Run Mode    : $DRY_RUN"
echo ""

if [[ "$DRY_RUN" == "false" ]]; then
    mkdir -p "$TARGET_DIR"
fi

# 1. Base Universal Coding Rules
log_info "Setting up Universal Coding Rules..."
copy_file "$SCRIPT_SOURCE_DIR/CODING.md" "$TARGET_DIR/CODING.md"

# 2. Language-Specific Standards & Tooling
if [[ "$LANGUAGE" == "rust" || "$LANGUAGE" == "all" ]]; then
    log_info "Applying Rust 2024 Standards..."
    copy_file "$SCRIPT_SOURCE_DIR/rust/CODING.md" "$TARGET_DIR/docs/CODING_RUST.md"
    copy_file "$SCRIPT_SOURCE_DIR/rust/rustfmt.toml" "$TARGET_DIR/rustfmt.toml"
    copy_file "$SCRIPT_SOURCE_DIR/rust/clippy.toml" "$TARGET_DIR/clippy.toml"
    
    if [[ ! -f "$TARGET_DIR/Cargo.toml" ]]; then
        copy_file "$SCRIPT_SOURCE_DIR/rust/Cargo.toml" "$TARGET_DIR/Cargo.toml"
    else
        log_info "Existing Cargo.toml detected; leaving package configuration intact."
    fi

    if [[ "$INCLUDE_CI" == "true" ]]; then
        copy_file "$SCRIPT_SOURCE_DIR/templates/ci/rust-ci.yml" "$TARGET_DIR/.github/workflows/rust-ci.yml"
    fi
fi

if [[ "$LANGUAGE" == "go" || "$LANGUAGE" == "all" ]]; then
    log_info "Applying Go 1.26 Standards..."
    copy_file "$SCRIPT_SOURCE_DIR/go/CODING.md" "$TARGET_DIR/docs/CODING_GO.md"
    copy_file "$SCRIPT_SOURCE_DIR/go/.golangci.yml" "$TARGET_DIR/.golangci.yml"

    if [[ "$INCLUDE_CI" == "true" ]]; then
        copy_file "$SCRIPT_SOURCE_DIR/templates/ci/go-ci.yml" "$TARGET_DIR/.github/workflows/go-ci.yml"
    fi
fi

if [[ "$LANGUAGE" == "typescript" || "$LANGUAGE" == "all" ]]; then
    log_info "Applying TypeScript 7.0 Standards..."
    copy_file "$SCRIPT_SOURCE_DIR/typescript/CODING.md" "$TARGET_DIR/docs/CODING_TYPESCRIPT.md"
    copy_file "$SCRIPT_SOURCE_DIR/typescript/biome.json" "$TARGET_DIR/biome.json"
    copy_file "$SCRIPT_SOURCE_DIR/typescript/tsconfig.json" "$TARGET_DIR/tsconfig.json"

    if [[ "$INCLUDE_CI" == "true" ]]; then
        copy_file "$SCRIPT_SOURCE_DIR/templates/ci/typescript-ci.yml" "$TARGET_DIR/.github/workflows/typescript-ci.yml"
    fi
fi

# 3. AI Agent Rules Setup (Antigravity, Gemini, Cursor)
if [[ "$INCLUDE_AGENT_RULES" == "true" ]]; then
    log_info "Setting up AI Coding Agent Rules..."
    
    # Gemini / Antigravity Agent Rules
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "[DRY RUN] Would create: $TARGET_DIR/.gemini/rules/coding_standards.md"
        log_info "[DRY RUN] Would create: $TARGET_DIR/.cursor/rules/coding.mdc"
    else
        mkdir -p "$TARGET_DIR/.gemini/rules"
        cat << 'EOF' > "$TARGET_DIR/.gemini/rules/coding_standards.md"
# Repository Coding Standards

Always follow the root `CODING.md` and the language-specific standards under `docs/`:
- **Universal Standards:** `CODING.md`
- **Zero Explanatory Comments:** Write self-documenting code.
- **Fail Fast & Explicitly:** Never swallow errors or use empty catches.
- **Strict Size Caps:** File <= 400 lines, Function <= 60 lines.
- **Refactoring:** Zero behavior/contract changes without characterization tests.
EOF
        log_success "Created: $TARGET_DIR/.gemini/rules/coding_standards.md"

        # Cursor MDC Agent Rules
        mkdir -p "$TARGET_DIR/.cursor/rules"
        cat << 'EOF' > "$TARGET_DIR/.cursor/rules/coding.mdc"
---
description: Universal repository engineering and coding standards
globs: *
alwaysApply: true
---

Always adhere to the authoritative engineering standards in `CODING.md` and `docs/`:
- No explanatory comments.
- No backwards-compatibility `if`-branch shims.
- Single responsibility, early returns, max nesting depth 3.
- Strict typing (zero `any`, schema-first boundaries).
EOF
        log_success "Created: $TARGET_DIR/.cursor/rules/coding.mdc"
    fi
fi

echo ""
if [[ "$DRY_RUN" == "true" ]]; then
    log_info "Dry run finished. No files were written."
else
    log_success "Standards setup complete for $LANGUAGE in '$TARGET_DIR'!"
    log_info "Next Steps for Existing Projects:"
    echo "  1. Review CODING.md and docs/ for domain alignment."
    echo "  2. Run your linter in changed-files mode (ratchet principle)."
    echo "  3. Commit standards with: git commit -m 'chore: adopt agentic engineering standards'"
fi
echo "============================================================"
