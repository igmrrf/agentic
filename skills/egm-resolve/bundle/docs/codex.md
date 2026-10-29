> Modified by Agentic, 2026-10-28: adapted runtime/packaging and permission guidance from Google EGM. Apache-2.0.

# Codex adapter

Read runtime.md. Dispatch general-purpose reviewers with the actual `spawn_agent` tool and `fork_turns: "none"`. Include exact persona/rubric/target paths and an explicit context allowlist. The parent persists raw reports. Use direct dispatch when nesting is unavailable. Do not register another EGM plugin or create user-owned chats for internal roles. Available tool restrictions must be discovered; fresh context alone does not enforce read-only filesystem access. Report permission enforcement as advisory unless the host actually constrains tools. Missing fresh isolation blocks Goldfish review.
