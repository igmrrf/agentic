# Development and verification

## Source of truth

`registry/skills.json` owns identities, dependencies, invocation policy, and bundle requirements. `package.json` owns the release version and Pi resource manifest. The registry generator derives portable and Claude manifests, the Codex marketplace, Claude personas, skill metadata, dependencies, notices, and EGM bundles.

```bash
node scripts/registry.mjs generate
node scripts/registry.mjs check
```

After changing a version or registry entry, regenerate metadata. Drift fails checks. Pi reads the canonical skills directory. Claude uses default `skills/` discovery and explicit persona paths. Codex and Antigravity use the portable root manifest.

## Checks

```bash
TEST_BASH=/bin/bash scripts/test-install-skills.sh
TEST_BASH=/bin/bash scripts/test-init.sh
TEST_BASH=/bin/bash python3 tests/init/test_characterization.py
node scripts/registry.mjs check
node scripts/check-provenance.mjs
npm run test:integration
npm run test:security-audit
node --test skills/codinary/evals/scripts/recovery.test.mjs
shellcheck scripts/*.sh scripts/lib/init/*.sh
```

`/bin/bash` exercises macOS Bash 3.2. CI runs the scripts on macOS and Linux.

The harness installation suite covers twelve named targets in isolated homes/projects: paths with spaces, dependencies, preservation, updates, removal, links, aliases, XDG configuration, and rejection before writes. Packaging tests extract an actual npm archive, validate its registry, and run installed resources. The [initializer characterization suite](../tests/init/README.md) pins generated file behavior.

### Native manifest validation

With Claude Code installed, run `npm run test:plugins`. With Antigravity CLI also installed, run `npm run test:plugins -- --agy`.

Validation packs and extracts a fresh distribution. Local development instructions and ignored OS/build artifacts are excluded by the package allowlist. Repository rules are applied through setup rather than shipped as automatic plugin context. These checks do not call a model or authenticate services.

For native installation checks, use fresh harness profiles: register an absolute clone path with the Codex marketplace, install `agentic@agentic`, and inspect its metadata; use `pi install /absolute/path/to/agentic` for Pi. Registration is separate from running a model-driven workflow.

## Coverage boundaries

| Layer | Evidence |
| --- | --- |
| Canonical packaging | Registry drift, dependencies, references, bundles, metadata, and provenance |
| Twelve named targets | Global/project filesystem lifecycle tests through the launcher |
| Claude and Antigravity plugin shapes | Strict packaged validation when their validators are installed |
| npm, archive, and local installs | Pack/extract, remote archive fixture, copy/link, update/removal |
| Independent reviews and live execution | Host-specific [compatibility evidence](integration/compatibility-matrix.md) |

Filesystem coverage is separate from model execution. Native public-directory acceptance, account policies, sandbox capabilities, and fresh-worker support need their own evidence.

## Release checklist

1. Update `package.json` and `CHANGELOG.md`, then regenerate metadata.
2. Run the checks and strict validation of the distributable.
3. Exercise native installation in fresh profiles and confirm skill discovery.
4. Review `npm pack --dry-run --json` and retained upstream licenses.
5. Tag the verified commit so users can pin it.

Pi gallery metadata (`pi-package`) is included; Git installation needs no npm release. Public directories and galleries have their own submission processes. Manifests do not publish a release or submit a listing.
