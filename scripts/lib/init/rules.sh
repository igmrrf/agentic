#!/usr/bin/env bash

load_rules_template() {
    local key="$LANGUAGE"
    if [[ "$key" == "all" ]]; then
        key="universal"
    fi
    local template="$SCRIPT_SOURCE_DIR/templates/rules/$key.$1"
    if [[ ! -f "$template" ]]; then
        log_error "Missing rules template: $template"
        exit 1
    fi
    read -r -d '' "$2" < "$template" || true
}

has_agent() {
    local target="$1"
    for a in "${AGENTS[@]}"; do
        if [[ "$a" == "all" || "$a" == "$target" ]]; then
            return 0
        fi
    done
    return 1
}

write_agent_rules() {
    log_info "Setting up AI Coding Agent Rules for $LANGUAGE (${AGENTS[*]})..."
    load_rules_template md RULES_MD
    load_rules_template mdc CURSOR_MDC

    RULES_MD="${RULES_MD}"$'\n\n'"${UNIVERSAL_RULES}"$'\n\n'"${LANG_RULES}"
    CURSOR_MDC="${CURSOR_MDC}"$'\n\n'"${UNIVERSAL_RULES}"$'\n\n'"${LANG_RULES}"

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
}
