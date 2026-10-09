#!/usr/bin/env bash

claim_destination() {
    local dest="$1"
    [[ -f "$dest" ]] || return 0
    if [[ "$FORCE_OVERWRITE" == "false" ]]; then
        log_warn "File already exists: $dest (use -f/--force to overwrite)"
        return 1
    fi
    if [[ "$CREATE_BACKUP" == "true" ]]; then
        if [[ "$DRY_RUN" == "true" ]]; then
            log_info "[DRY RUN] Would backup: $dest -> ${dest}.bak"
        else
            cp "$dest" "${dest}.bak"
            log_info "Backup created: ${dest}.bak"
        fi
    fi
}

copy_local_file() {
    local src="$1"
    local dest="$2"

    if [[ ! -f "$src" ]]; then
        log_warn "Source file not found: $src (skipping)"
        return
    fi

    if [[ -f "$dest" && "$src" -ef "$dest" ]]; then
        return
    fi

    claim_destination "$dest" || return 0

    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "[DRY RUN] Would create/update: $dest"
    else
        mkdir -p "$(dirname "$dest")"
        cp "$src" "$dest"
        log_success "Created: $dest"
    fi
}

install_file() {
    copy_local_file "$SCRIPT_SOURCE_DIR/$1" "$2"
}

fetch_file_content() {
    local src="$SCRIPT_SOURCE_DIR/$1"
    if [[ ! -f "$src" ]]; then
        log_error "Missing standards file: $src"
        exit 1
    fi
    cat "$src"
}

create_rule_file() {
    local file_path="$1"
    local content="$2"
    claim_destination "$file_path" || return 0
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "[DRY RUN] Would create: $file_path"
    else
        mkdir -p "$(dirname "$file_path")"
        echo "$content" > "$file_path"
        log_success "Created: $file_path"
    fi
}
