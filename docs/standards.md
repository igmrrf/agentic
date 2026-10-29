# Language standards and architecture

[CODING.md](../CODING.md) defines universal naming, explicit errors, size limits, layering, and behavior-preserving refactoring. Each language guide adds its idioms and tool configurations.

The guides apply to libraries, CLIs, services, and applications, with framework-specific rules scoped explicitly. Named tools are defaults; choose one formatter, linter, and type checker, enforced in CI. Adopt standards in changed files without rewriting unrelated code.

| Language | Guide baseline | Standards | Blueprint | Configurations | CI template |
| --- | --- | --- | --- | --- | --- |
| Rust | Rust 2024 / 1.85+ | [Rules](../rust/CODING.md) | [Overview](../rust/README.md) | [rustfmt](../rust/rustfmt.toml), [Clippy](../rust/clippy.toml), [Cargo](../rust/Cargo.toml) | [Rust CI](../templates/ci/rust-ci.yml) |
| Go | Go 1.26 | [Rules](../go/CODING.md) | [Overview](../go/README.md) | [golangci-lint](../go/.golangci.yml) | [Go CI](../templates/ci/go-ci.yml) |
| TypeScript | TypeScript 5.5+ | [Rules](../typescript/CODING.md) | [Overview](../typescript/README.md) | [Biome](../typescript/biome.json), [tsconfig](../typescript/tsconfig.json) | [TypeScript CI](../templates/ci/typescript-ci.yml) |
| Python | Python 3.12+ | [Rules](../python/CODING.md) | [Overview](../python/README.md) | [pyproject](../python/pyproject.toml) | [Python CI](../templates/ci/python-ci.yml) |
| Lua | LuaJIT / Lua 5.4 | [Rules](../lua/CODING.md) | [Overview](../lua/README.md) | [StyLua](../lua/.stylua.toml), [Lua LS](../lua/.luarc.json), [Luacheck](../lua/.luacheckrc) | [Lua CI](../templates/ci/lua-ci.yml) |
| Swift | Swift 6+ | [Rules](../swift/CODING.md) | [Overview](../swift/README.md) | [SwiftLint](../swift/.swiftlint.yml), [SwiftFormat](../swift/.swiftformat), [Package](../swift/Package.swift) | [Swift CI](../templates/ci/swift-ci.yml) |
| Kotlin | Kotlin 2+ | [Rules](../kotlin/CODING.md) | [Overview](../kotlin/README.md) | [Detekt](../kotlin/detekt.yml), [EditorConfig](../kotlin/.editorconfig), [Gradle](../kotlin/build.gradle.kts) | [Kotlin CI](../templates/ci/kotlin-ci.yml) |

Baselines describe the idioms assumed. Version-gated rules and lower-version pinning live in each guide.

Choose the layout matching the project:

- **Library / SDK:** Rust §10 option A, Go §10 option A, TypeScript §12, Python §10, Lua §9, or Swift §7.
- **CLI:** Rust §10 option A, Go §10 option B, or TypeScript §12.
- **Backend service:** Go §10 option C, Rust §10 option B, TypeScript §12, Python §10, Swift §7, or Kotlin §7.
- **UI application:** TypeScript §12 and its UI framework appendix.
- **Multi-crate repository:** Rust §10 option C.

Dependencies point inward; the pure core does not import delivery or infrastructure. A library does not inherit a service's layering. The [standards review](../standards_review.md) provides original research and architecture references.

Return to [getting started](../README.md), or read [integration architecture](integration/architecture.md) for delivery and review contracts.
