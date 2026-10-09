#!/usr/bin/env bash
# ==============================================================================
# Agentic Standards Initializer & Scaffolding Tool
# Propagates universal engineering standards, language rules, linter configs,
# and CI workflows to new or existing projects.
#
# Supports both:
# 1. Local execution:  ./scripts/init.sh [OPTIONS]
# 2. Remote cURL pipe: curl -fsSL https://raw.githubusercontent.com/igmrrf/agentic/refs/heads/main/scripts/init.sh | bash -s -- [OPTIONS]
#
# Remote runs download the requested ref and run that version's own init.sh.
# The implementation lives in scripts/lib/init/.
# ==============================================================================

set -euo pipefail

COLOR_RESET="\033[0m"
COLOR_BOLD="\033[1m"
COLOR_GREEN="\033[32m"
COLOR_BLUE="\033[34m"
COLOR_YELLOW="\033[33m"
COLOR_RED="\033[31m"

AGENTIC_REF="${AGENTIC_REF:-${AGENTIC_BRANCH:-main}}"
TARBALL_URL_OVERRIDE="${AGENTIC_TARBALL_URL:-}"
SCRIPT_SOURCE_DIR=""
TEMP_WORK_DIR=""
FORWARDED_ARGS=()

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

locate_local_root() {
    if [[ -z "${BASH_SOURCE[0]:-}" || ! -f "${BASH_SOURCE[0]}" ]]; then
        return
    fi
    local root
    root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
    if [[ -f "$root/CODING.md" && -d "$root/scripts/lib/init" ]]; then
        echo "$root"
    fi
}

extract_ref() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            -r|--ref) AGENTIC_REF="${2:-$AGENTIC_REF}"; shift $(( $# > 1 ? 2 : 1 )) ;;
            --ref=*) AGENTIC_REF="${1#*=}"; shift ;;
            *) FORWARDED_ARGS+=("$1"); shift ;;
        esac
    done
}

cleanup_remote_source() {
    if [[ -n "$TEMP_WORK_DIR" && -d "$TEMP_WORK_DIR" ]]; then
        rm -rf "$TEMP_WORK_DIR"
    fi
}

fetch_remote_source() {
    local url="${TARBALL_URL_OVERRIDE:-https://github.com/igmrrf/agentic/archive/${AGENTIC_REF}.tar.gz}"
    command -v curl > /dev/null || { log_error "curl is required for remote execution"; exit 1; }
    command -v tar > /dev/null || { log_error "tar is required for remote execution"; exit 1; }
    TEMP_WORK_DIR="$(mktemp -d "${TMPDIR:-/tmp}/agentic.XXXXXX")"
    trap cleanup_remote_source EXIT
    log_info "Fetching standards bundle ($AGENTIC_REF) from $url"
    if ! curl -fsSL "$url" | tar -xz -C "$TEMP_WORK_DIR" --strip-components=1; then
        log_error "Failed to download or extract $url"
        exit 1
    fi
    if [[ ! -f "$TEMP_WORK_DIR/CODING.md" || ! -f "$TEMP_WORK_DIR/scripts/init.sh" ]]; then
        log_error "Archive $url does not contain the Agentic standards"
        exit 1
    fi
}

run_remote() {
    extract_ref "$@"
    fetch_remote_source
    local status=0
    AGENTIC_FETCHED_REF="$AGENTIC_REF" bash "$TEMP_WORK_DIR/scripts/init.sh" \
        ${FORWARDED_ARGS[@]+"${FORWARDED_ARGS[@]}"} < /dev/null || status=$?
    exit "$status"
}

run_local() {
    SCRIPT_SOURCE_DIR="$1"
    shift
    local lib
    for lib in cli language files toolchains rules run; do
        # shellcheck source=/dev/null
        source "$SCRIPT_SOURCE_DIR/scripts/lib/init/$lib.sh"
    done
    run_init "$@"
}

main() {
    local root
    root="$(locate_local_root)"
    if [[ -n "$root" ]]; then
        run_local "$root" "$@"
    else
        run_remote "$@"
    fi
}

main "$@"
