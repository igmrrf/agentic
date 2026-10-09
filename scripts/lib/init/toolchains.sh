#!/usr/bin/env bash

apply_rust() {
    log_info "Applying Rust 2024 Standards..."
    LANG_RULES="${LANG_RULES}$(fetch_file_content "rust/CODING.md")"$'\n\n'
    install_file "rust/rustfmt.toml" "$TARGET_DIR/rustfmt.toml"
    install_file "rust/clippy.toml" "$TARGET_DIR/clippy.toml"

    if [[ "$INCLUDE_STARTER" == "true" ]]; then
        if [[ ! -f "$TARGET_DIR/Cargo.toml" ]]; then
            install_file "rust/Cargo.toml" "$TARGET_DIR/Cargo.toml"
        fi
        if [[ ! -f "$TARGET_DIR/src/lib.rs" && ! -f "$TARGET_DIR/src/main.rs" ]]; then
            install_file "rust/src/lib.rs" "$TARGET_DIR/src/lib.rs"
        fi
    fi

    if [[ "$INCLUDE_CI" == "true" ]]; then
        install_file "templates/ci/rust-ci.yml" "$TARGET_DIR/.github/workflows/rust-ci.yml"
    fi
}

apply_go() {
    log_info "Applying Go 1.26 Standards..."
    LANG_RULES="${LANG_RULES}$(fetch_file_content "go/CODING.md")"$'\n\n'
    install_file "go/.golangci.yml" "$TARGET_DIR/.golangci.yml"

    if [[ "$INCLUDE_STARTER" == "true" ]]; then
        if [[ ! -f "$TARGET_DIR/go.mod" ]]; then
            install_file "go/go.mod" "$TARGET_DIR/go.mod"
        fi
        if [[ ! -f "$TARGET_DIR/internal/domain/account.go" ]]; then
            install_file "go/internal/domain/account.go" "$TARGET_DIR/internal/domain/account.go"
            install_file "go/internal/domain/account_test.go" "$TARGET_DIR/internal/domain/account_test.go"
        fi
    fi

    if [[ "$INCLUDE_CI" == "true" ]]; then
        install_file "templates/ci/go-ci.yml" "$TARGET_DIR/.github/workflows/go-ci.yml"
    fi
}

apply_typescript() {
    log_info "Applying TypeScript Standards..."
    LANG_RULES="${LANG_RULES}$(fetch_file_content "typescript/CODING.md")"$'\n\n'
    install_file "typescript/biome.json" "$TARGET_DIR/biome.json"
    install_file "typescript/tsconfig.json" "$TARGET_DIR/tsconfig.json"

    if [[ "$INCLUDE_STARTER" == "true" ]]; then
        if [[ ! -f "$TARGET_DIR/src/index.ts" && ! -f "$TARGET_DIR/src/main.ts" && ! -f "$TARGET_DIR/src/index.tsx" ]]; then
            install_file "typescript/src/index.ts" "$TARGET_DIR/src/index.ts"
        fi
    fi

    if [[ "$INCLUDE_CI" == "true" ]]; then
        install_file "templates/ci/typescript-ci.yml" "$TARGET_DIR/.github/workflows/typescript-ci.yml"
    fi
}

apply_python() {
    log_info "Applying Python 3.12+ Standards..."
    LANG_RULES="${LANG_RULES}$(fetch_file_content "python/CODING.md")"$'\n\n'
    if [[ ! -f "$TARGET_DIR/pyproject.toml" ]]; then
        install_file "python/pyproject.toml" "$TARGET_DIR/pyproject.toml"
    else
        log_info "Existing pyproject.toml detected; leaving configuration intact."
    fi

    if [[ "$INCLUDE_STARTER" == "true" ]]; then
        if [[ ! -d "$TARGET_DIR/src" ]]; then
            install_file "python/src/service/__init__.py" "$TARGET_DIR/src/service/__init__.py"
            install_file "python/src/service/domain/__init__.py" "$TARGET_DIR/src/service/domain/__init__.py"
            install_file "python/src/service/domain/account.py" "$TARGET_DIR/src/service/domain/account.py"
            install_file "python/tests/test_account.py" "$TARGET_DIR/tests/test_account.py"
        fi
    fi

    if [[ "$INCLUDE_CI" == "true" ]]; then
        install_file "templates/ci/python-ci.yml" "$TARGET_DIR/.github/workflows/python-ci.yml"
    fi
}

apply_lua() {
    log_info "Applying Lua Standards..."
    LANG_RULES="${LANG_RULES}$(fetch_file_content "lua/CODING.md")"$'\n\n'
    install_file "lua/.stylua.toml" "$TARGET_DIR/.stylua.toml"
    install_file "lua/.luarc.json" "$TARGET_DIR/.luarc.json"
    install_file "lua/.luacheckrc" "$TARGET_DIR/.luacheckrc"

    if [[ "$INCLUDE_STARTER" == "true" ]]; then
        if [[ ! -d "$TARGET_DIR/lua" ]]; then
            install_file "lua/lua/service/account.lua" "$TARGET_DIR/lua/service/account.lua"
            install_file "lua/spec/account_spec.lua" "$TARGET_DIR/spec/account_spec.lua"
        fi
    fi

    if [[ "$INCLUDE_CI" == "true" ]]; then
        install_file "templates/ci/lua-ci.yml" "$TARGET_DIR/.github/workflows/lua-ci.yml"
    fi
}

apply_swift() {
    log_info "Applying Swift 6.0+ Standards..."
    LANG_RULES="${LANG_RULES}$(fetch_file_content "swift/CODING.md")"$'\n\n'
    install_file "swift/.swiftlint.yml" "$TARGET_DIR/.swiftlint.yml"
    install_file "swift/.swiftformat" "$TARGET_DIR/.swiftformat"

    if [[ "$INCLUDE_STARTER" == "true" ]]; then
        if [[ ! -f "$TARGET_DIR/Package.swift" ]] && ! ls "$TARGET_DIR"/*.xcodeproj >/dev/null 2>&1; then
            install_file "swift/Package.swift" "$TARGET_DIR/Package.swift"
            if [[ ! -d "$TARGET_DIR/Sources" ]]; then
                install_file "swift/Sources/SwiftService/Account.swift" "$TARGET_DIR/Sources/SwiftService/Account.swift"
                install_file "swift/Tests/SwiftServiceTests/AccountTests.swift" "$TARGET_DIR/Tests/SwiftServiceTests/AccountTests.swift"
            fi
        fi
    fi

    if [[ "$INCLUDE_CI" == "true" ]]; then
        install_file "templates/ci/swift-ci.yml" "$TARGET_DIR/.github/workflows/swift-ci.yml"
    fi
}

apply_kotlin() {
    log_info "Applying Kotlin 2.0+ Standards..."
    LANG_RULES="${LANG_RULES}$(fetch_file_content "kotlin/CODING.md")"$'\n\n'
    install_file "kotlin/detekt.yml" "$TARGET_DIR/detekt.yml"
    install_file "kotlin/.editorconfig" "$TARGET_DIR/.editorconfig"

    if [[ "$INCLUDE_STARTER" == "true" ]]; then
        if [[ ! -f "$TARGET_DIR/build.gradle.kts" && ! -f "$TARGET_DIR/build.gradle" ]]; then
            install_file "kotlin/build.gradle.kts" "$TARGET_DIR/build.gradle.kts"
            if [[ ! -d "$TARGET_DIR/src" ]]; then
                install_file "kotlin/src/main/kotlin/com/agentic/service/domain/Account.kt" "$TARGET_DIR/src/main/kotlin/com/agentic/service/domain/Account.kt"
                install_file "kotlin/src/test/kotlin/com/agentic/service/domain/AccountTest.kt" "$TARGET_DIR/src/test/kotlin/com/agentic/service/domain/AccountTest.kt"
            fi
        fi
    fi

    if [[ "$INCLUDE_CI" == "true" ]]; then
        install_file "templates/ci/kotlin-ci.yml" "$TARGET_DIR/.github/workflows/kotlin-ci.yml"
    fi
}

apply_toolchains() {
    if [[ "$LANGUAGE" == "rust" || "$LANGUAGE" == "all" ]]; then
        apply_rust
    fi
    if [[ "$LANGUAGE" == "go" || "$LANGUAGE" == "all" ]]; then
        apply_go
    fi
    if [[ "$LANGUAGE" == "typescript" || "$LANGUAGE" == "all" ]]; then
        apply_typescript
    fi
    if [[ "$LANGUAGE" == "python" || "$LANGUAGE" == "all" ]]; then
        apply_python
    fi
    if [[ "$LANGUAGE" == "lua" || "$LANGUAGE" == "all" ]]; then
        apply_lua
    fi
    if [[ "$LANGUAGE" == "swift" || "$LANGUAGE" == "all" ]]; then
        apply_swift
    fi
    if [[ "$LANGUAGE" == "kotlin" || "$LANGUAGE" == "all" ]]; then
        apply_kotlin
    fi
}
