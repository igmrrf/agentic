#!/usr/bin/env bash

detect_language() {
    local dir="$1"
    if [[ -f "$dir/Cargo.toml" ]]; then
        echo "rust"
    elif [[ -f "$dir/go.mod" ]]; then
        echo "go"
    elif [[ -f "$dir/package.json" || -f "$dir/tsconfig.json" || -f "$dir/biome.json" ]]; then
        echo "typescript"
    elif [[ -f "$dir/pyproject.toml" || -f "$dir/requirements.txt" || -f "$dir/setup.py" ]]; then
        echo "python"
    elif [[ -f "$dir/.luarc.json" || -f "$dir/.stylua.toml" || -f "$dir/stylua.toml" || -f "$dir/.luacheckrc" ]] || compgen -G "$dir/*.rockspec" > /dev/null; then
        echo "lua"
    elif [[ -f "$dir/Package.swift" ]] || ls "$dir"/*.xcodeproj >/dev/null 2>&1 || ls "$dir"/*.xcworkspace >/dev/null 2>&1; then
        echo "swift"
    elif [[ -f "$dir/build.gradle.kts" || -f "$dir/build.gradle" || -f "$dir/settings.gradle.kts" ]]; then
        echo "kotlin"
    else
        echo ""
    fi
}

prompt_language() {
    print_banner
    echo "Select target language for this project:"
    echo "  1) Rust (Rust 2024 Edition, MSRV 1.85.0+)"
    echo "  2) Go (Go 1.26+)"
    echo "  3) TypeScript (TypeScript 5.5+, Biome)"
    echo "  4) Python (Python 3.12+, Ruff, Mypy)"
    echo "  5) Lua (LuaJIT / Lua 5.4, StyLua, EmmyLua)"
    echo "  6) Swift (Swift 6.0+, SwiftLint, SwiftFormat)"
    echo "  7) Kotlin (Kotlin 2.0+, K2 Compiler, Detekt)"
    echo "  8) All Languages (Multi-language repository)"
    if ! { exec 3< /dev/tty; } 2> /dev/null; then
        log_error "No terminal available to choose a language. Pass --lang=<language>."
        exit 1
    fi
    read -rp "Enter choice [1-8]: " CHOICE <&3
    exec 3<&-
    case "$CHOICE" in
        1) LANGUAGE="rust" ;;
        2) LANGUAGE="go" ;;
        3) LANGUAGE="ts" ;;
        4) LANGUAGE="python" ;;
        5) LANGUAGE="lua" ;;
        6) LANGUAGE="swift" ;;
        7) LANGUAGE="kotlin" ;;
        8) LANGUAGE="all" ;;
        *)
            log_error "Invalid selection. Exiting."
            exit 1
            ;;
    esac
}

resolve_language() {
    if [[ -z "$LANGUAGE" ]]; then
        local detected
        detected="$(detect_language "$TARGET_DIR")"
        if [[ -n "$detected" ]]; then
            log_info "Auto-detected project type in '$TARGET_DIR': $detected"
            LANGUAGE="$detected"
        else
            prompt_language
        fi
    fi

    LANGUAGE="$(echo "$LANGUAGE" | tr '[:upper:]' '[:lower:]')"
    case "$LANGUAGE" in
        rust|rs) LANGUAGE="rust" ;;
        go|golang) LANGUAGE="go" ;;
        ts|typescript|js|javascript) LANGUAGE="typescript" ;;
        py|python) LANGUAGE="python" ;;
        lua) LANGUAGE="lua" ;;
        swift) LANGUAGE="swift" ;;
        kt|kotlin) LANGUAGE="kotlin" ;;
        all|multi) LANGUAGE="all" ;;
        *)
            log_error "Unsupported language: $LANGUAGE. Choose rust, go, ts, python, lua, swift, kotlin, or all."
            exit 1
            ;;
    esac
}
