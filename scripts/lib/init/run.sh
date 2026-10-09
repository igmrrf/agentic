#!/usr/bin/env bash
# shellcheck disable=SC2034

TARGET_DIR="."
LANGUAGE=""
AGENTS=()
INCLUDE_CI=true
INCLUDE_AGENT_RULES=true
INCLUDE_STARTER=false
INCLUDE_SKILLS=false
FORCE_OVERWRITE=false
CREATE_BACKUP=false
DRY_RUN=false
UNIVERSAL_RULES=""
LANG_RULES=""
RULES_MD=""
CURSOR_MDC=""

execution_mode() {
    if [[ -n "${AGENTIC_FETCHED_REF:-}" ]]; then
        echo "Remote ($AGENTIC_FETCHED_REF)"
    else
        echo "Local Repository ($SCRIPT_SOURCE_DIR)"
    fi
}

print_plan() {
    print_banner
    log_info "Execution Mode  : $(execution_mode)"
    log_info "Target Directory: $TARGET_DIR"
    log_info "Target Language : $LANGUAGE"
    log_info "Target Agent    : ${AGENTS[*]}"
    log_info "Include CI      : $INCLUDE_CI"
    log_info "Agent Rules     : $INCLUDE_AGENT_RULES"
    log_info "Include Starter : $INCLUDE_STARTER"
    log_info "Backup Mode     : $CREATE_BACKUP"
    log_info "Dry Run Mode    : $DRY_RUN"
    echo ""
}

install_skills() {
    log_info "Installing agent skills into '$TARGET_DIR'..."
    local skill_args=("--target" "$TARGET_DIR")
    if [[ "$FORCE_OVERWRITE" == "true" ]]; then
        skill_args+=("--force")
    fi
    if [[ "$DRY_RUN" == "true" ]]; then
        skill_args+=("--dry-run")
    fi
    bash "$SCRIPT_SOURCE_DIR/scripts/install-skills.sh" "${skill_args[@]}"
}

print_next_steps() {
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
}

run_init() {
    parse_args "$@"
    resolve_language
    print_plan
    if [[ "$DRY_RUN" == "false" ]]; then
        mkdir -p "$TARGET_DIR"
    fi
    log_info "Fetching Universal Coding Rules..."
    UNIVERSAL_RULES="$(fetch_file_content "CODING.md")"
    apply_toolchains
    if [[ "$INCLUDE_AGENT_RULES" == "true" ]]; then
        write_agent_rules
    fi
    if [[ "$INCLUDE_SKILLS" == "true" ]]; then
        install_skills
    fi
    print_next_steps
}
