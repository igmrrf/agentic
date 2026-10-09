#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INSTALLER="$REPO_ROOT/scripts/install-skills.sh"
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

quietly() {
    "$@" > /dev/null 2>&1 || true
}

check_fails() {
    local name="$1"
    shift
    if "$@" > /dev/null 2>&1; then fail "$name"; else pass "$name"; fi
}

expected_skills() {
    local dir
    for dir in "$REPO_ROOT"/skills/*/; do
        [[ -f "$dir/SKILL.md" ]] && basename "$dir"
    done
}

has_all_skills() {
    local skill
    for skill in $(expected_skills); do
        [[ -f "$1/$skill/SKILL.md" ]] || return 1
    done
}

fresh_home() {
    rm -rf "${WORK:?}/home" "${WORK:?}/proj" "${WORK:?}/tmp"
    mkdir -p "$WORK/home" "$WORK/proj" "$WORK/tmp"
}

run_local() {
    HOME="$WORK/home" TMPDIR="$WORK/tmp" "$TEST_BASH" "$INSTALLER" "$@"
}

run_piped() {
    HOME="$WORK/home" TMPDIR="$WORK/tmp" AGENTIC_TARBALL_URL="file://$WORK/repo.tar.gz" \
        "$TEST_BASH" -s -- "$@" < "$INSTALLER"
}

build_tarball() {
    tar -czf "$WORK/repo.tar.gz" -C "$(dirname "$REPO_ROOT")" \
        --exclude=.git --exclude=.ruff_cache "$(basename "$REPO_ROOT")"
}

tmp_is_empty() {
    [[ -z "$(ls -A "$WORK/tmp")" ]]
}

test_local_global() {
    fresh_home
    quietly run_local --global
    check "local global installs into ~/.claude/skills" has_all_skills "$WORK/home/.claude/skills"
    check "local global installs into ~/.agents/skills" has_all_skills "$WORK/home/.agents/skills"
}

test_skill_and_agent_selection() {
    fresh_home
    check "--skill all is accepted" run_local --global --skill all --dry-run
    quietly run_local --global --skill codinary,tdd --agent claude
    check "selected skill installed for claude" test -f "$WORK/home/.claude/skills/codinary/SKILL.md"
    check_fails "unselected skill not installed" test -e "$WORK/home/.claude/skills/code-review"
    check_fails "unselected agent untouched" test -e "$WORK/home/.agents/skills"
}

test_piped_project() {
    fresh_home
    quietly run_piped --target "$WORK/proj"
    check "piped install populates .claude/skills" has_all_skills "$WORK/proj/.claude/skills"
    check "piped install populates .agents/skills" has_all_skills "$WORK/proj/.agents/skills"
    check "piped install writes .agents/skills.json" test -f "$WORK/proj/.agents/skills.json"
    check "piped install removes its temp dir" tmp_is_empty
    check "piped --list prints skills" sh -c "HOME='$WORK/home' AGENTIC_TARBALL_URL='file://$WORK/repo.tar.gz' '$TEST_BASH' -s -- --list < '$INSTALLER' | grep -q codinary"
}

test_failures() {
    fresh_home
    check_fails "--target without value fails" run_local --target
    check_fails "unknown skill fails" run_local --global --skill nope
    check_fails "unknown agent fails" run_local --global --agent nope
    check_fails "missing target dir fails" run_local --target "$WORK/does-not-exist"
    check_fails "bad remote archive fails" sh -c "HOME='$WORK/home' AGENTIC_TARBALL_URL='file://$WORK/missing.tar.gz' '$TEST_BASH' -s -- --global < '$INSTALLER'"
}

test_force_update_uninstall() {
    fresh_home
    quietly run_local --global --skill tdd
    mkdir -p "$WORK/home/.claude/skills/tdd"
    echo stale > "$WORK/home/.claude/skills/tdd/SKILL.md"
    quietly run_local --global --skill tdd
    check "existing install kept without --force" grep -q stale "$WORK/home/.claude/skills/tdd/SKILL.md"
    quietly run_local --global --skill tdd --update
    check_fails "--update replaces existing install" grep -q stale "$WORK/home/.claude/skills/tdd/SKILL.md"
    quietly run_local --global --skill tdd --uninstall
    check_fails "--uninstall removes claude copy" test -e "$WORK/home/.claude/skills/tdd"
    check_fails "--uninstall removes agents copy" test -e "$WORK/home/.agents/skills/tdd"
}

test_link() {
    fresh_home
    quietly run_local --global --link --agent claude
    check "--link creates symlinks" test -L "$WORK/home/.claude/skills/codinary"
    check "--link points at the clone" test -f "$WORK/home/.claude/skills/codinary/SKILL.md"
}

test_marketplace_in_sync() {
    check "marketplace lists exactly the skills/ directories" python3 - "$REPO_ROOT" << 'EOF'
import json, pathlib, sys
root = pathlib.Path(sys.argv[1])
manifest = json.loads((root / ".claude-plugin/marketplace.json").read_text())
listed = {pathlib.Path(p).name for plugin in manifest["plugins"] for p in plugin.get("skills", [])}
present = {p.parent.name for p in (root / "skills").glob("*/SKILL.md")}
sys.exit(0 if listed == present else 1)
EOF
}

main() {
    echo "Using shell: $("$TEST_BASH" --version | head -n 1)"
    build_tarball
    test_local_global
    test_skill_and_agent_selection
    test_piped_project
    test_failures
    test_force_update_uninstall
    test_link
    test_marketplace_in_sync
    if [[ $FAILURES -gt 0 ]]; then
        echo "$FAILURES check(s) failed"
        exit 1
    fi
    echo "All checks passed"
}

main
