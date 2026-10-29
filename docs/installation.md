# Installation

Install a native package or copy skills into your harness's discovery directory. Choose one channel per harness to avoid duplicate skill names. GitHub installation works directly from this repository; no npm publication is required.

## Claude Code plugin

```text
/plugin marketplace add igmrrf/agentic
/plugin install agentic@agentic
/agentic:setup
```

The shell equivalents are `claude plugin marketplace add igmrrf/agentic` and `claude plugin install agentic@agentic`. Skills use `/agentic:<name>`. The plugin also registers nine Claude design-review personas.

Update with `/plugin marketplace update agentic` followed by `/plugin update agentic@agentic`. Remove with `/plugin uninstall agentic@agentic`. For team defaults, configure `extraKnownMarketplaces` and `enabledPlugins` in `.claude/settings.json`; see the [Claude marketplace documentation](https://code.claude.com/docs/en/plugin-marketplaces).

## Codex

```bash
npx -y github:igmrrf/agentic skills --global --agent codex
```

Use `$setup` or `$codinary` in a new session. Codex scans repository `.agents/skills` and personal `~/.agents/skills`; see [OpenAI's skill documentation](https://learn.chatgpt.com/docs/build-skills).

For plugin-capable clients, register the bundled marketplace:

```bash
codex plugin marketplace add igmrrf/agentic
```

Select the Agentic marketplace in the app's plugin directory and install Agentic. CLI versions exposing `codex plugin add` can run `codex plugin add agentic@agentic`. Inspect your version with `codex plugin --help`.

For local testing, pass an absolute clone path to `codex plugin marketplace add`. The portable root manifest includes setup onboarding. Marketplace discovery alone does not enable the plugin. Repository marketplaces are separate from the public directory; this repository does not imply public-directory acceptance. See [OpenAI's packaging documentation](https://developers.openai.com/plugins/build/plugins).

## Pi package

```bash
pi install git:github.com/igmrrf/agentic
```

Add `--local` for a project-scoped package. For a clone, use `pi install /absolute/path/to/agentic`. The `pi.skills` entry in `package.json` exposes the canonical skills and supporting resources.

Run `/reload`, then `/skill:setup` or `/skill:codinary`. Inspect packages with `pi list`, update with `pi update --extensions`, and remove with `pi remove git:github.com/igmrrf/agentic`. Tagged or committed sources stay pinned. See [Pi packages](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/packages.md) and [skills](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/skills.md).

## Antigravity

```bash
agy plugin install https://github.com/igmrrf/agentic
agy plugin list --json
```

The CLI supports the portable root plugin. For a clone, pass its absolute directory to `agy plugin install`. Remove it with `agy plugin uninstall agentic`. Standalone skill installation is also available:

```bash
npx -y github:igmrrf/agentic skills --global --agent agy
npx -y github:igmrrf/agentic skills --global --agent antigravity
```

Choose `agy` for the CLI and `antigravity` for the App/IDE. Their global skill directories differ; project installs share `.agents/skills`. See [Antigravity skills](https://antigravity.google/docs/skills/) and [plugins](https://www.antigravity.google/docs/plugins).

## Direct skills installer

The launcher requires Node.js 18+ and Bash: macOS/Linux directly, or WSL/Git Bash on Windows. Native plugins and Pi packages use their own harness requirements.

```bash
npx -y github:igmrrf/agentic skills --global --agent opencode
npx -y github:igmrrf/agentic skills --target . --agent codex --skill codinary,tdd
npx -y github:igmrrf/agentic skills --agent claude,codex --dry-run
npx -y github:igmrrf/agentic skills --list
```

Omit `--global` for the current project; `--target` names another existing project. Selected skills include required dependencies. Existing installs are skipped until `--update`. Selected removal leaves dependencies and unrelated skills intact.

| Target (`--agent`) | Project directory | Global directory | Harness reference |
| --- | --- | --- | --- |
| `claude`, `claude-code` | `.claude/skills` | `~/.claude/skills` | [Claude](https://code.claude.com/docs/en/skills) |
| `codex`, `agents` | `.agents/skills` | `~/.agents/skills` | [Codex](https://learn.chatgpt.com/docs/build-skills) |
| `pi` | `.pi/skills` | `~/.pi/agent/skills` | [Pi](https://github.com/badlogic/pi-mono/tree/main/packages/coding-agent) |
| `opencode` | `.opencode/skills` | `$XDG_CONFIG_HOME/opencode/skills` | [OpenCode](https://opencode.ai/docs/skills/) |
| `agy`, `antigravity-cli` | `.agents/skills` | `~/.gemini/antigravity-cli/skills` | [Antigravity](https://antigravity.google/docs/skills/) |
| `antigravity` | `.agents/skills` | `~/.gemini/config/skills` | [Antigravity](https://antigravity.google/docs/skills/) |
| `gemini`, `gemini-cli` | `.gemini/skills` | `~/.gemini/skills` | [Gemini CLI](https://geminicli.com/docs/cli/skills/) |
| `cursor` | `.cursor/skills` | `~/.cursor/skills` | [Cursor](https://cursor.com/help/customization/skills) |
| `copilot`, `github-copilot` | `.github/skills` | `~/.copilot/skills` | [Copilot](https://docs.github.com/en/copilot/concepts/customizations/agent-skills) |
| `cline` | `.cline/skills` | `~/.cline/skills` | [Cline](https://github.com/cline/cline/blob/main/docs/customization/skills.mdx) |
| `windsurf` | `.windsurf/skills` | `~/.codeium/windsurf/skills` | [Cascade](https://docs.devin.ai/desktop/cascade/skills) |
| `amp` | `.agents/skills` | `$XDG_CONFIG_HOME/agents/skills` | [Amp](https://ampcode.app/docs/customize/skills) |

`XDG_CONFIG_HOME` defaults to `~/.config`. Repeated destinations are installed once. With no `--agent`, the shared default remains Claude and `.agents/skills`. Explicit `--agent all` installs into every supported location. Prefer a named target to avoid discovery overlap. Current Cascade clients still read `.windsurf/skills` alongside their newer `.devin/skills` directory.

Older installers mapped global `gemini` and `antigravity` to `.agents/skills`. After switching to a named native target, remove the old copy with `--agent agents --uninstall --skill <name>` if another harness no longer needs it.

### Updates and removal

Repeat the same scope, target, and skill selection:

```bash
npx -y github:igmrrf/agentic skills --global --agent opencode --update
npx -y github:igmrrf/agentic skills --global --agent opencode --uninstall
```

For reproducibility, append `#TAG_OR_COMMIT` to the GitHub package source. For curl installation, `--ref` selects the downloaded bundle; fetch the installer itself from that same ref to pin both code and content. An npm/Git package uses its already-selected contents; `--ref` does not switch a local checkout.

### Bash-only installation

```bash
curl -fsSL https://raw.githubusercontent.com/igmrrf/agentic/main/scripts/install-skills.sh | bash -s -- --global --agent agy
```

This path needs Bash, curl, and tar. Temporary downloads are removed on exit.

### Local links

```bash
git clone https://github.com/igmrrf/agentic.git
cd agentic
bash scripts/install-skills.sh --global --agent pi --link
```

Links track the clone; keep it in place and use `git pull` to update. Remote installers copy skills because their download is temporary.

### Other skill managers

The canonical layout also works with [Vercel's skills CLI](https://github.com/vercel-labs/skills): `npx skills add igmrrf/agentic`. That tool controls its target selection and updates. When selecting TDD alone, include `codebase-design` if the manager does not resolve `dependencies.txt`; Agentic resolves closure automatically.

## Troubleshooting

- **Missing skill:** reload the harness, inspect the destination above, and check project trust and skill settings.
- **Duplicate commands:** keep one install channel and remove stale copies from other discovery directories.
- **Unchanged copy:** use `--update` after reviewing local edits.
- **Unknown target:** update the package/clone; older pinned releases support fewer named targets.
- **Root instruction warnings:** a development clone has its own `AGENTS.md`, `CLAUDE.md`, and `GEMINI.md`. Plugin behavior comes from skills. Validate the distributable with `npm run test:plugins` (append `-- --agy` for Antigravity); development context and caches are excluded.
- **Review unavailable:** installation does not provide missing host capabilities. See [runtime compatibility](integration/compatibility-matrix.md).
