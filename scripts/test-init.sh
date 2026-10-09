#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INIT="$REPO_ROOT/scripts/init.sh"
BIN="$REPO_ROOT/bin/agentic.js"
TEST_BASH="${TEST_BASH:-bash}"
WORK="$(mktemp -d)"
FAILURES=0

trap 'rm -rf "$WORK"' EXIT

pass() { echo "ok   - $1"; }
fail() { echo "FAIL - $1"; FAILURES=$((FAILURES + 1)); }

check() {
    local name="$1"
    shift
    if "$@" > /dev/null 2>&1; then pass "$name"; else fail "$name"; fi
}

check_fails() {
    local name="$1"
    shift
    if "$@" > /dev/null 2>&1; then fail "$name"; else pass "$name"; fi
}

quietly() {
    "$@" > /dev/null 2>&1 || true
}

fresh() {
    rm -rf "${WORK:?}/home" "${WORK:?}/proj" "${WORK:?}/tmp"
    mkdir -p "$WORK/home" "$WORK/proj" "$WORK/tmp"
}

build_tarball() {
    tar -czf "$WORK/repo.tar.gz" -C "$(dirname "$REPO_ROOT")" \
        --exclude=.git --exclude=.ruff_cache --exclude=node_modules "$(basename "$REPO_ROOT")"
}

run_piped() {
    HOME="$WORK/home" TMPDIR="$WORK/tmp" AGENTIC_TARBALL_URL="file://$WORK/repo.tar.gz" \
        "$TEST_BASH" -s -- "$@" < "$INIT"
}

run_piped_bad_archive() {
    HOME="$WORK/home" AGENTIC_TARBALL_URL="file://$WORK/missing.tar.gz" \
        "$TEST_BASH" -s -- --lang=go --target "$WORK/proj" < "$INIT"
}

tmp_is_empty() {
    [[ -z "$(ls -A "$WORK/tmp")" ]]
}

proj_is_empty() {
    [[ -z "$(ls -A "$WORK/proj")" ]]
}

test_piped_init() {
    fresh
    quietly run_piped --lang=go --claude --target "$WORK/proj"
    check "piped init writes CLAUDE.md" test -s "$WORK/proj/CLAUDE.md"
    check "CLAUDE.md embeds the Go standards" grep -qF "# Go Coding Rules & Standards" "$WORK/proj/CLAUDE.md"
    check "piped init copies linter config" test -f "$WORK/proj/.golangci.yml"
    check "piped init copies CI workflow" test -f "$WORK/proj/.github/workflows/go-ci.yml"
    check_fails "--claude skips other agents" test -e "$WORK/proj/GEMINI.md"
    check "piped init removes its temp dir" tmp_is_empty
}

test_piped_init_with_skills() {
    fresh
    quietly run_piped --lang=python --claude --skills --target "$WORK/proj"
    check "piped init --skills installs .claude/skills" test -f "$WORK/proj/.claude/skills/setup/SKILL.md"
    check "piped init --skills removes its temp dir" tmp_is_empty
}

test_failures() {
    fresh
    check_fails "bad remote archive fails" run_piped_bad_archive
    check_fails "unsupported language fails" "$TEST_BASH" "$INIT" --lang=cobol --target "$WORK/proj"
    quietly "$TEST_BASH" "$INIT" --lang=go --claude --target "$WORK/proj" --dry-run
    check "dry run writes nothing" proj_is_empty
}

test_npx_bin() {
    fresh
    check "agentic help exits 0" node "$BIN" help
    check_fails "agentic unknown command fails" node "$BIN" nope
    check "agentic skills --list lists setup" sh -c "node '$BIN' skills --list | grep -q setup"
    quietly node "$BIN" init --lang=rust --claude --no-ci --target "$WORK/proj"
    check "agentic init writes CLAUDE.md" test -s "$WORK/proj/CLAUDE.md"
    check "agentic init copies rustfmt.toml" test -f "$WORK/proj/rustfmt.toml"
    check "npm package includes scripts and skills" sh -c "cd '$REPO_ROOT' && npm pack --dry-run 2>&1 | grep -q 'skills/setup/SKILL.md'"
}

main() {
    echo "Using shell: $("$TEST_BASH" --version | head -n 1)"
    build_tarball
    test_piped_init
    test_piped_init_with_skills
    test_failures
    if command -v node > /dev/null; then
        test_npx_bin
    else
        echo "skip - node not installed; npx launcher not tested"
    fi
    if [[ $FAILURES -gt 0 ]]; then
        echo "$FAILURES check(s) failed"
        exit 1
    fi
    echo "All checks passed"
}

main
