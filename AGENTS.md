# Repository Guidelines

## Architecture & Key Modules
- Vite + React 18 + TypeScript live under `src/`. `main.tsx` mounts the class-based `App` component from `App.tsx`, which drives the entire experience (UI selection, OKAS forms, and streaming state).
- `App.tsx` coordinates the multi-step workflow defined in `Forms.tsx`, invokes REST helpers from `Endpoints.tsx`/`http.ts`, and spawns either `Window.tsx` (full USD Viewer controls) or `StreamOnlyWindow.tsx` (viewport only) once a stream is ready.
- `AppStream.tsx` is the sole integration point with `@nvidia/omniverse-webrtc-streaming-library`: it chooses between `local`, `stream`, and `gfn` modes using `stream.config.json`, registers AppStreamer events, and relays custom messages back to `Window.tsx`. Keep all low-level AppStreamer calls here.
- USD experience helpers live in `USDStage.tsx`, `USDAsset.tsx`, and related CSS files; image assets stay inside `readme-assets/`. Update `readme-assets/` only when documentation screenshots actually change.
- Static HTML lives in `index.html` (note the optional `gfn-client-sdk.js`), and build/tooling settings are centralized in `vite.config.ts`, `tailwind.config.js`, and `tsconfig*.json`. Do not scatter configuration across feature directories.

## Build, Dev, and Tooling Commands
- `npm run dev` starts Vite on port 5173; use it for iterative development against a live Kit stream.
- `npm run build` emits minified assets into `dist/`; pair with `npm run preview` for production-like smoke tests.
- `npm run lint` enforces the root `.eslintrc.cjs` rules (TypeScript strict mode, React hooks, Prettier compatibility). Treat warnings as failures before opening a PR.
- `npm run format` / `npm run format:check` apply the repository `.pretierrc` (4-space indent, single quotes, semicolons, single-attribute-per-line JSX). Never rely on editor defaults that conflict with this file.
- The project requires Node >=18 and npm >=10 (`package.json` engines). Validate with `node -v`/`npm -v` before installing dependencies.

## Configuration & Environment Expectations
- Connection defaults are defined in `stream.config.json`. `source` accepts `local`, `stream` (OKAS), or `gfn`. Keep optional values empty rather than deleting keys, and never hard-code production credentials. `AppStream.tsx` consumes these values at runtime.
- `.npmrc` pins the public registry plus the internal `@nvidia` Artifactory feed; authenticate before running `npm install` or adding dependencies.
- OKAS/GDN REST calls originate in `Endpoints.tsx`, which expects fully qualified `appServer` and `streamServer` URLs. When adjusting endpoints, update both the JSON defaults and the UI flow that collects overrides.
- `index.html` only needs `gfn-client-sdk.js` when `source: "gfn"`. Remove or guard the tag when building a local/OKAS-only variant to avoid unused downloads.
- Any change that adds new stream properties, new UI steps, or alternate transports must thread configuration through `App.tsx` -> `Forms.tsx` -> `AppStream.tsx` so the wizard and streamer stay in sync.

## Coding Standards & Conventions
- Keep components in PascalCase files (`StreamOnlyWindow.tsx`) and colocate their CSS modules (e.g., `AppStream.css`). Utility modules (`http.ts`, `Endpoints.tsx`) stay flat under `src/`.
- Favor TypeScript classes where existing files use them (most UI components still extend `Component`). Introduce hooks/function components only when self-contained to avoid mixing paradigms within the same module.
- All AppStreamer messaging must remain JSON-based (`{ event_type, payload }`). `Window.tsx` already centralizes send/receive handlers—extend those handlers rather than emitting ad hoc `AppStreamer.sendMessage` calls elsewhere.
- Respect strict TypeScript settings (`noUnusedLocals`, `noUnusedParameters`, etc.) from `tsconfig.json`; unused values should be removed instead of suppressed.
- Bootstrap styles load globally via `App.tsx`; any Tailwind usage must stay scoped to components and use the shared `tailwind.config.js`.

## Testing & Validation Expectations
- There is no automated test suite today. Every change must be exercised manually against the USD Viewer sample (default UI mode) plus any OKAS or GDN scenarios it touches. At minimum: (1) launch a local Kit stream and run through the UI wizard, loading an asset via `Window.tsx`; (2) for OKAS, walk the Applications → Versions → Profiles workflow and confirm session creation/polling/teardown through `_startStream`, `pollForSessionReady`, and `_resetStream`; (3) for GDN, confirm AppStreamer connects with the configured catalog/client IDs.
- Validate interactive controls: viewport focus/keyboard handling (`tabIndex` logic in `AppStream.tsx`/`USDStage.tsx`), USD asset loading feedback, and session shutdown (`destroyStreamingSession` + `AppStream.stop()`).
- When adding Vitest/RTL coverage in the future, place specs under `src/__tests__/` with the `<Component>.test.tsx` naming pattern and mock AppStreamer/REST modules so tests remain deterministic.

## Security & Operational Notes
- Treat everything under `stream.config.json` and any OKAS/GDN tokens as secrets—never hard-code production values or commit temporary overrides. Share them through environment variables or secure channels.
- Document required Chromium flags, firewall holes, or Kit branch alignments (e.g., Kit 1.5.x vs 1.6.x) inside your PR description so other agents can reproduce streams.
- Dependency updates must go through `package.json` + `package-lock.json` and should be accompanied by a note about the Kit version(s) exercised.
- When targeting only local/OKAS flows, remove the `gfn-client-sdk.js` reference and mention it explicitly in the PR so reviewers know the dependency footprint changed.
