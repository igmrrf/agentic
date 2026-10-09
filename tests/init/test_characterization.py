#!/usr/bin/env python3
import argparse
import difflib
import hashlib
import os
import shutil
import subprocess
import sys
import tempfile
from collections.abc import Callable
from dataclasses import dataclass
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
INIT = REPO / "scripts" / "init.sh"
GOLDEN = Path(__file__).resolve().parent / "golden"
BASH = os.environ.get("TEST_BASH", "bash")
LANGUAGES = ["rust", "go", "typescript", "python", "lua", "swift", "kotlin", "all"]
EMBEDDED_DOCS = ["CODING.md"] + [f"{lang}/CODING.md" for lang in LANGUAGES if lang != "all"]
SKILL_ROOTS = (".claude/skills/", ".agents/skills/")
LOG_MARKERS = ("[WARN]", "[ERROR]", "Auto-detected", "Existing pyproject")


def no_setup(_target: Path) -> None:
    return


def report(line: str) -> None:
    sys.stdout.write(line + "\n")


def touch(*paths: str, content: str = "") -> Callable[[Path], None]:
    def setup(target: Path) -> None:
        for rel in paths:
            file = target / rel
            file.parent.mkdir(parents=True, exist_ok=True)
            file.write_text(content)

    return setup


def make_dirs(*paths: str) -> Callable[[Path], None]:
    def setup(target: Path) -> None:
        for rel in paths:
            (target / rel).mkdir(parents=True, exist_ok=True)

    return setup


@dataclass
class Scenario:
    name: str
    args: list[str]
    setup: Callable[[Path], None] = no_setup
    same_as: str = ""


def language_scenarios() -> list[Scenario]:
    scenarios = []
    for lang in LANGUAGES:
        scenarios.append(Scenario(f"{lang}-default", [f"--lang={lang}"]))
        scenarios.append(
            Scenario(
                f"{lang}-starter",
                [f"--lang={lang}", "--with-starter", "--no-ci", "--no-agent-rules"],
            )
        )
    return scenarios


def alias_scenarios() -> list[Scenario]:
    aliases = {
        "rs": "rust",
        "golang": "go",
        "ts": "typescript",
        "js": "typescript",
        "javascript": "typescript",
        "py": "python",
        "kt": "kotlin",
        "multi": "all",
        "GO": "go",
    }
    return [
        Scenario(f"alias-{alias}", [f"--lang={alias}"], same_as=f"{lang}-default")
        for alias, lang in aliases.items()
    ]


def flag_scenarios() -> list[Scenario]:
    return [
        Scenario("go-no-ci-no-rules", ["--lang=go", "--no-ci", "--no-agent-rules"]),
        Scenario("go-claude-only", ["--lang=go", "--claude"]),
        Scenario("go-agent-list", ["--lang=go", "-a", "cursor,COPILOT"]),
        Scenario("go-agent-equals", ["--lang=go", "--agent=windsurf"]),
        Scenario(
            "go-agent-shortcuts",
            [
                "--lang=go",
                "--gemini",
                "--cline",
                "--roocode",
                "--windsurf",
                "--copilot",
                "--cursor",
            ],
        ),
        Scenario("go-dry-run", ["--lang=go", "--dry-run"]),
        Scenario(
            "go-dry-run-existing",
            ["--lang=go", "--claude", "--dry-run", "--force", "--backup"],
            setup=touch(".golangci.yml", "CLAUDE.md", content="USER\n"),
        ),
        Scenario("go-skills", ["--lang=go", "--claude", "--no-ci", "--skills"]),
        Scenario("go-short-flags", ["-l", "go", "-t", "{target}", "-s", "-b", "-f"]),
    ]


def conflict_scenarios() -> list[Scenario]:
    existing = touch(".golangci.yml", "CLAUDE.md", ".github/workflows/go-ci.yml", content="USER\n")
    return [
        Scenario("existing-no-force", ["--lang=go", "--claude"], setup=existing),
        Scenario("existing-force", ["--lang=go", "--claude", "--force"], setup=existing),
        Scenario(
            "existing-force-backup",
            ["--lang=go", "--claude", "--force", "--backup"],
            setup=existing,
        ),
        Scenario(
            "existing-backup-without-force", ["--lang=go", "--claude", "--backup"], setup=existing
        ),
        Scenario(
            "python-existing-pyproject",
            ["--lang=python", "--no-agent-rules", "--force"],
            setup=touch("pyproject.toml", content="USER\n"),
        ),
    ]


def starter_skip_scenarios() -> list[Scenario]:
    base = ["--with-starter", "--no-ci", "--no-agent-rules"]
    return [
        Scenario(
            "rust-starter-existing",
            ["--lang=rust", *base],
            setup=touch("Cargo.toml", "src/main.rs", content="USER\n"),
        ),
        Scenario(
            "go-starter-existing", ["--lang=go", *base], setup=touch("go.mod", content="USER\n")
        ),
        Scenario(
            "typescript-starter-existing",
            ["--lang=ts", *base],
            setup=touch("src/main.ts", content="USER\n"),
        ),
        Scenario("python-starter-existing-src", ["--lang=python", *base], setup=make_dirs("src")),
        Scenario("lua-starter-existing", ["--lang=lua", *base], setup=make_dirs("lua")),
        Scenario(
            "swift-starter-xcodeproj", ["--lang=swift", *base], setup=make_dirs("App.xcodeproj")
        ),
        Scenario(
            "swift-starter-existing-sources", ["--lang=swift", *base], setup=make_dirs("Sources")
        ),
        Scenario(
            "kotlin-starter-existing-gradle",
            ["--lang=kotlin", *base],
            setup=touch("build.gradle", content="USER\n"),
        ),
        Scenario("kotlin-starter-existing-src", ["--lang=kotlin", *base], setup=make_dirs("src")),
    ]


def detection_scenarios() -> list[Scenario]:
    markers = {
        "cargo": touch("Cargo.toml"),
        "gomod": touch("go.mod"),
        "package-json": touch("package.json"),
        "tsconfig": touch("tsconfig.json"),
        "biome": touch("biome.json"),
        "pyproject": touch("pyproject.toml"),
        "requirements": touch("requirements.txt"),
        "setup-py": touch("setup.py"),
        "luarc": touch(".luarc.json"),
        "stylua": touch("stylua.toml"),
        "luacheck": touch(".luacheckrc"),
        "rockspec": touch("x-1.0-1.rockspec"),
        "package-swift": touch("Package.swift"),
        "xcodeproj": make_dirs("App.xcodeproj"),
        "xcworkspace": make_dirs("App.xcworkspace"),
        "gradle-kts": touch("build.gradle.kts"),
        "gradle": touch("build.gradle"),
        "settings-gradle": touch("settings.gradle.kts"),
        "precedence-cargo-over-gomod": touch("Cargo.toml", "go.mod"),
        "nothing-no-tty": no_setup,
    }
    return [
        Scenario(f"detect-{name}", ["--no-ci", "--no-agent-rules"], setup=setup)
        for name, setup in markers.items()
    ]


def error_scenarios() -> list[Scenario]:
    return [
        Scenario("error-unsupported-language", ["--lang=cobol"]),
        Scenario("error-unknown-option", ["--lang=go", "--bogus"]),
    ]


def all_scenarios() -> list[Scenario]:
    return [
        *language_scenarios(),
        *alias_scenarios(),
        *flag_scenarios(),
        *conflict_scenarios(),
        *starter_skip_scenarios(),
        *detection_scenarios(),
        *error_scenarios(),
    ]


def file_hash(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def repo_index() -> dict[str, list[str]]:
    index: dict[str, list[str]] = {}
    git = shutil.which("git") or "git"
    listing = subprocess.run(  # noqa: S603
        [git, "ls-files"], cwd=REPO, capture_output=True, text=True, check=True
    )
    tracked = listing.stdout.split()
    for rel in tracked:
        index.setdefault(file_hash(REPO / rel), []).append(rel)
    return index


def copy_source(rel: str, candidates: list[str]) -> str:
    by_suffix = sorted(c for c in candidates if c.endswith(rel) or Path(c).name == Path(rel).name)
    return (by_suffix or sorted(candidates))[0]


def normalize_rules(text: str) -> str:
    for doc in EMBEDDED_DOCS:
        text = text.replace((REPO / doc).read_text().rstrip("\n"), f"<<embedded {doc}>>")
    return text


def skill_root(rel: str) -> str:
    return next((root for root in SKILL_ROOTS if rel.startswith(root)), "")


def describe_skills(installed: dict[str, set[str]]) -> list[str]:
    inventory = {p.parent.name for p in (REPO / "skills").glob("*/SKILL.md")}
    lines = []
    for root, names in sorted(installed.items()):
        if names == inventory:
            lines.append(f"{root}  [every skill in skills/]")
        else:
            lines.extend(f"{root}{name}/  [skill]" for name in sorted(names))
    return lines


def describe_files(target: Path, index: dict[str, list[str]], seeded: dict[str, str]) -> list[str]:
    lines, generated, skills = [], {}, {}
    for path in sorted(p for p in target.rglob("*") if p.is_file()):
        rel = path.relative_to(target).as_posix()
        root = skill_root(rel)
        if root:
            skills.setdefault(root, set()).add(rel[len(root) :].split("/")[0])
        elif seeded.get(rel) == file_hash(path):
            lines.append(f"{rel}  [untouched pre-existing]")
        elif file_hash(path) in index:
            lines.append(f"{rel}  [copy of {copy_source(rel, index[file_hash(path)])}]")
        else:
            body = normalize_rules(path.read_text())
            twin = next((name for name, text in generated.items() if text == body), "")
            lines.append(f"{rel}  [generated{', same as ' + twin if twin else ''}]")
            if not twin:
                generated[rel] = body
    sections = [f"--- {rel}\n{body}" for rel, body in generated.items()]
    return describe_skills(skills) + lines + [""] + sections


def run_scenario(scenario: Scenario, index: dict[str, list[str]]) -> str:
    with tempfile.TemporaryDirectory() as tmp:
        target = Path(tmp) / "project"
        target.mkdir()
        scenario.setup(target)
        seeded = {
            p.relative_to(target).as_posix(): file_hash(p) for p in target.rglob("*") if p.is_file()
        }
        args = [a.replace("{target}", str(target)) for a in scenario.args]
        if "-t" not in args:
            args.append(f"--target={target}")
        env = {**os.environ, "HOME": tmp, "NO_COLOR": "1"}
        proc = subprocess.run(  # noqa: S603
            [BASH, str(INIT), *args],
            cwd=tmp,
            env=env,
            stdin=subprocess.DEVNULL,
            capture_output=True,
            text=True,
            start_new_session=True,
            check=False,
        )
        logs = [
            line.replace(str(target), "<TARGET>").replace(str(REPO), "<REPO>")
            for line in (proc.stdout + proc.stderr).splitlines()
            if any(m in line for m in LOG_MARKERS)
        ]
        return (
            "\n".join(
                [
                    f"exit: {proc.returncode}",
                    "== log",
                    *logs,
                    "== files",
                    *describe_files(target, index, seeded),
                ]
            ).rstrip()
            + "\n"
        )


def strip_ansi(text: str) -> str:
    out, skipping = [], False
    for char in text:
        if char == "\x1b":
            skipping = True
        elif skipping and char == "m":
            skipping = False
        elif not skipping:
            out.append(char)
    return "".join(out)


def check(scenario: Scenario, actual: str, update: bool) -> bool:
    golden = GOLDEN / f"{scenario.same_as or scenario.name}.txt"
    if update and not scenario.same_as:
        golden.write_text(actual)
        return True
    if not golden.exists():
        report(f"FAIL - {scenario.name}: missing golden {golden.name} (run with --update)")
        return False
    expected = golden.read_text()
    if actual == expected:
        report(f"ok   - {scenario.name}")
        return True
    diff = difflib.unified_diff(
        expected.splitlines(), actual.splitlines(), golden.name, scenario.name, lineterm="", n=2
    )
    report(f"FAIL - {scenario.name}\n" + "\n".join(list(diff)[:60]))
    return False


def main() -> int:
    parser = argparse.ArgumentParser(description="Characterization tests for scripts/init.sh")
    parser.add_argument(
        "--update", action="store_true", help="rewrite golden files from current behaviour"
    )
    parser.add_argument("-k", default="", help="only run scenarios whose name contains this text")
    opts = parser.parse_args()
    GOLDEN.mkdir(exist_ok=True)
    index = repo_index()
    scenarios = [s for s in all_scenarios() if opts.k in s.name]
    scenarios.sort(key=lambda s: bool(s.same_as))
    failures = sum(not check(s, strip_ansi(run_scenario(s, index)), opts.update) for s in scenarios)
    report(f"{len(scenarios) - failures}/{len(scenarios)} scenarios match")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
