# Verify the running product

Read sections matching every affected surface before writing the brief. Discover
launch/build commands, supported targets, and automation tools from the project
and session. Use available browser, simulator, device, desktop automation, or CLI
tools; do not assume a particular tool exists. If execution or visual inspection
is unavailable, record a prerequisite gap and request the missing capability.
For unavailable devices/targets, follow the user-authorized waiver protocol in
[verification.md](verification.md): continue without that coverage when the user
explicitly says so, disclose it, and never call unavailability a product failure.

Launch task-owned services with identifiable process/session IDs and capture
startup/runtime logs. Wait for readiness using bounded probes, verify the source
state and environment, and use isolated data. Clean up only task-owned processes
and test data; preserve the user's sessions. State when a preview is left running.

## Web applications

1. Start the actual application and required local/test services. Open its URL
   in a real browser or supported browser automation session and confirm the
   changed route is reachable. An HTTP success or HTML inspection is insufficient.
2. Exercise the acceptance journey through actual interactions. Confirm state
   updates, navigation, validation, persistence after reload, and relevant
   loading/empty/error/permission states. Use real integration wiring where
   available; label any mocks and verification gaps.
3. Render at representative supported desktop and narrow/mobile viewports for
   affected layouts. Inspect screenshots for clipping, overflow, overlap, spacing,
   readability, assets, focus visibility, and responsive behavior. Check keyboard
   navigation and affected accessibility semantics. Compare with the established
   design or requested reference when present.
4. Inspect browser console, failed network requests, and server logs while using
   the feature. Record unexpected errors with their trigger. Use additional
   browsers or real touch devices when browser-specific behavior or mobile
   interactions make them relevant.
5. Run the production build and serve/preview the resulting artifact when
   supported. Smoke the changed journey to catch routing, asset, environment,
   hydration, or bundling differences that development mode can hide.

## Mobile applications

1. Identify affected supported platforms, app variant, OS/device targets, native
   modules, and available simulators/emulators or connected authorized devices.
   Build and **install/launch** the current app in a suitable iOS simulator,
   Android emulator, or physical device. A compiler pass is insufficient.
2. Interact with the feature; inspect rendered screens and device logs. Check
   relevant navigation/back actions, safe areas, keyboard/input, scrolling,
   rotation/screen sizes, permission states, background/foreground, and network
   loss/recovery. Verify persistence or process restart when state is involved.
3. Test both platforms when shared changes affect both supported platforms;
   record unavailable targets as blocked or explicitly user-waived. A responsive
   web preview does not verify native behavior. Use a development client/native build when required
   modules cannot run in a generic preview host.
4. Use a physical device when the feature depends on hardware or behavior the
   simulator cannot faithfully exercise: e.g. Bluetooth/NFC, camera capture,
   sensors, push delivery, biometrics, platform background restrictions, or
   representative performance. Determine this from the feature and environment.
   Use a connected authorized device if available; otherwise request the user's
   device/test session or give the precise human-verification protocol described
   in [verification.md](verification.md). Keep hardware checks blocked until
   validated human results arrive or the user explicitly authorizes proceeding
   without that device coverage.
5. Build the applicable release variant and smoke it when feasible. Record
   signing, provisioning, installation, and distribution limitations explicitly;
   do not claim store/release readiness from a simulator debug build alone.

## Desktop applications

1. Build and run the actual desktop development app on the affected supported
   OS. For a web-based desktop shell, launch the shell with its native bridge;
   a browser tab alone cannot verify native integration.
2. Exercise the changed workflow and inspect actual windows/screenshots and
   application logs. Check affected keyboard/menu/shortcut behavior, focus,
   resizing/minimum dimensions, display scaling, dialogs, filesystem permissions,
   tray behavior, deep links, and lifecycle/relaunch/persistence as applicable.
3. Run platform-specific checks on each affected supported OS using available
   local or remote test environments. Record unavailable OS checks as blocked
   or explicitly user-waived when the required device/host is unavailable;
   one host's result does not establish cross-platform correctness.
4. Produce the applicable production/package build, launch the packaged artifact,
   and smoke the feature where supported. Verify bundled resources, native bridge,
   paths, and configuration. Check installer, signing/notarization, update, and
   uninstall behavior only when affected or required for the requested release;
   record missing credentials/targets as release limitations or blockers.

## Services, APIs, and workers

Start the actual service/worker with its dependencies in an isolated environment.
Send real requests or messages through the changed entry point; assert response
contracts, authorization failures, persistence, and downstream effects. Inspect
logs and health/readiness. Exercise relevant retries, duplicate delivery,
timeouts, cancellation, and restart behavior. Build and smoke the production
binary/container when delivery is affected. A direct unit call does not verify
transport, middleware, migrations, or worker registration.

## CLI tools and libraries

Run the built CLI as a user would, including exit codes, stdout/stderr, files,
invalid input, and relevant piping/noninteractive behavior. Build/package a
library and use its public API from a representative consumer to catch exports,
types, dependency, or packaging problems. Verify compatibility where affected.
Pure non-UI changes do not require fabricated visual checks; justify that choice.

## Infrastructure and delivery configuration

Validate configuration and run the relevant plan/dry-run in the target tooling.
Use an isolated environment to apply and smoke changed behavior when authorized;
inspect access, networking, startup, persistence, and recovery as affected. Mark
applied versus planned results explicitly. Prepare migrations, deployment order,
smoke checks, and rollback/forward recovery before requesting a consequential
external action. A local feature request does not authorize a production apply.
