# Maintenance TODO

This document captures a repo-wide maintenance audit for getting the app into a stable, well-guarded state before adding or reshaping features. The goal is not only to push coverage toward 100%, but to make correctness, regressions, dependencies, documentation, CI/CD, security, and architecture easier to reason about.

Each stage below is intended to be handled in its own PR.

## Audit Snapshot

- The app is a Create React App frontend with React 18, React Bootstrap, Lodash, Algebra.js, Jest/React Testing Library, and Playwright.
- There are strong initial testing layers: unit tests under `src/shared/__tests__`, integration tests under `src/integration`, and Playwright specs under `e2e`.
- Coverage thresholds are currently 100%, but only for `src/shared/**/*.js`; the largest calculation and UI files are outside the enforced coverage surface.
- There is no `.github` CI workflow in the repository.
- The heaviest business logic still lives inside React components, especially `src/components/Cou.js` at about 1,198 lines, plus several other account components between roughly 429 and 931 lines.
- Multiple source files and docs show mojibake in Spanish text, which suggests an encoding cleanup is needed.
- Production code contains many `console.log` and `alert` side effects across shared solvers and components.
- The app stores core state in `localStorage` through a small wrapper, but persisted data has no explicit schema version, validation, or migration layer.
- Generated directories such as `build`, `coverage`, and `test-results` are ignored by `.gitignore`, which is good, but local audit state should not be treated as source of truth.

## Stage 1: Baseline Quality Gates And CI

Goal: make every PR prove that the app still builds, tests, and meets agreed quality thresholds.

Why this matters:

- Current test scripts exist, but there is no CI workflow enforcing them.
- Coverage enforcement only targets shared helpers, while the highest-risk business behavior sits in large components.
- Dependency, formatting, linting, and build checks are not yet first-class PR gates.

Work items:

- Add a GitHub Actions workflow that runs install, lint, unit tests with coverage, integration tests, Playwright e2e tests, and production build.
- Add Node and package manager version pinning through `.nvmrc`, `engines`, Corepack, or an equivalent documented choice.
- Add explicit scripts for `lint`, `format:check`, `test:coverage`, and `validate`.
- Decide whether the canonical package manager is Yarn or npm, then align docs and commands.
- Add CI caching for dependencies and Playwright browsers.
- Upload test artifacts for failed Playwright runs.
- Upload coverage artifacts or reports from CI.
- Expand coverage collection beyond `src/shared/**/*.js` in steps, starting with extracted pure calculation modules and critical app flows.
- Add a coverage ratchet for files outside `src/shared` instead of immediately requiring global 100% across all React components.
- Add PR templates or contributor notes that define the expected checks for maintenance PRs.

Done when:

- A fresh checkout can run one documented `validate` command locally.
- CI blocks PRs on test, build, lint, and formatting failures.
- Coverage reports include the code that contains business rules, not only shared helpers.

## Stage 2: Test Strategy And Coverage Expansion

Goal: turn the existing broad test base into a deliberate safety net for domain behavior, persistence, and UI workflows.

Why this matters:

- The repo already has many tests, so the next improvement is prioritization and coverage shape, not just adding more files.
- Position-based table tests are useful, but they become brittle as tables evolve.
- The current coverage threshold can give a false sense of completeness because component logic is not counted.

Work items:

- Write a testing strategy document that defines unit, integration, e2e, accessibility, and regression responsibilities.
- Build a domain fixture matrix for each account module: COU, CuPro, CuGeI, CuADI, CUI, CuCa, and CuFi.
- Prefer semantic table helpers and domain labels over raw input indexes where practical.
- Add regression tests for localStorage corruption, missing keys, version mismatches, branch-count churn, and saved-item CRUD.
- Add tests around contradiction handling and iteration-limit behavior without relying only on browser `alert`.
- Add property-style or table-driven tests for equation helpers and generated equation sets.
- Add tests for empty-string, null, zero, negative, decimal, and invalid numeric input cases.
- Add Playwright coverage for the most important full-user flows: compute, retrieve from COU, save/load/delete, reload persistence, and branch changes.
- Consider adding an accessibility test pass with `@axe-core/playwright` or an equivalent tool.
- Track flaky tests explicitly, with retry only as a safety net and not as the main fix.

Done when:

- Each account module has a documented behavior matrix and tests covering the highest-risk equations.
- Test failures point to domain behavior, not only positional DOM changes.
- Coverage growth is measured against newly extracted calculation code and critical workflows.

## Stage 3: Domain Model, State, And Persistence Hardening

Goal: make stored data predictable and calculation inputs safe before deeper refactors.

Why this matters:

- `src/shared/db.js` directly parses JSON from localStorage and can throw on corrupted data.
- Components individually normalize or patch stored shapes, which spreads persistence rules across the UI.
- Empty values are represented inconsistently as `null` and empty strings.
- Some code mutates state objects directly before cloning or saving, which increases the risk of stale renders and hard-to-find bugs.

Work items:

- Define explicit schemas for app state, COU data, saved items, and each account module.
- Add schema versioning and migration functions for localStorage data.
- Make the storage wrapper defensive: catch JSON parse errors, validate shape, and return safe fallbacks.
- Normalize empty values to one representation, or document exactly where `null` versus `""` is required.
- Centralize branch-count normalization and saved-item CRUD behavior.
- Replace direct state mutation patterns with immutable updates or reducers.
- Add a domain-level persistence API so components no longer call `getItem` and `setItem` directly.
- Add import/export backup support for saved calculations before any breaking storage migration.
- Add tests for migration from existing stored shapes.

Done when:

- Corrupted or old localStorage data cannot crash initial render.
- Storage migrations are tested and documented.
- Components consume validated state and do not own persistence shape repair.

## Stage 4: Calculation Engine Extraction

Goal: move calculation behavior out of React components into pure, testable modules.

Why this matters:

- `Cou.js` contains UI rendering, persistence, table shape construction, equation generation, iterative solving, logging, and alerts in one file.
- The other account components repeat the same pattern with local variations.
- Existing TODO comments mention unifying COU with the equation library and fixing copied template sections.

Work items:

- Extract pure calculation modules per domain: COU, production account, income generation, income assignment/distribution, income usage, capital account, and financial account.
- Create shared primitives for equation tokens, equation solving, iteration guards, contradiction detection, and compute results.
- Return structured compute results such as `{ table, changedCells, warnings, errors, reachedIterationLimit }` instead of triggering `alert` inside solvers.
- Move table shape definitions and row/column metadata into data modules.
- Replace ad hoc equation construction with reusable equation builders where it reduces duplication.
- Add unit tests directly against extracted calculation modules before changing UI behavior.
- Keep the first extraction PR behavior-preserving, with no visual redesign.
- Consider moving heavy calculations away from the render path, and later evaluate a Web Worker if compute time becomes user-visible.

Done when:

- Core calculations can be tested without rendering React.
- Components mostly wire state, actions, and tables to already-tested domain functions.
- Iteration limits and contradictions are visible as structured results.

## Stage 5: Component Architecture And UI Robustness

Goal: make the UI easier to change without breaking the domain behavior.

Why this matters:

- Several components are long and combine table rendering, buttons, modals, persistence, and computation.
- Repeated account layouts could be rendered from metadata once domain shapes are explicit.
- Some controls are not as accessible or maintainable as they could be, for example a clickable `X` rendered as a `strong` element in saved-item deletion.

Work items:

- Introduce reusable account/table components driven by metadata.
- Split large components into container, toolbar, table, row, and modal wiring pieces.
- Replace `alert` UX with visible, testable error/warning components.
- Give table inputs stable accessible names where feasible, using row and column context.
- Replace delete `X` text controls with proper buttons and accessible labels.
- Review keyboard navigation through tables and modals.
- Fix the fixed footer if it overlaps content on small screens.
- Add responsive checks for wide tables and mobile viewports.
- Add loading or busy states if calculations become asynchronous.

Done when:

- Account UI changes can be made in small files.
- Important controls are keyboard accessible and screen-reader discoverable.
- User-facing errors are visible in the app and testable without mocking `window.alert`.

## Stage 6: Linting, Formatting, And Code Hygiene

Goal: enforce consistent code before large maintenance work accelerates.

Why this matters:

- The repo uses the CRA ESLint config, but there is no dedicated lint script.
- There is no visible Prettier or formatting check.
- Console logging is widely used in production paths.
- Some comments explicitly describe unfinished copy-customization work.

Work items:

- Add a dedicated `lint` script and run it in CI.
- Add Prettier or another formatting standard, plus `format` and `format:check` scripts.
- Add rules or checks for accidental `console.log`, with a deliberate logger/debug utility if runtime diagnostics are still needed.
- Add lint rules for React hooks, accessibility, unused imports, and import ordering if they are not already covered.
- Remove or convert TODO comments into tracked issues linked from this document.
- Consider TypeScript, JSDoc types, or PropTypes as a later staged improvement after domain extraction starts.
- Add editor config for line endings, final newline, and charset.

Done when:

- Formatting and linting are automatic PR gates.
- Production code has intentional logging behavior.
- The codebase has fewer hidden conventions.

## Stage 7: Dependency And Build Modernization

Goal: reduce dependency risk and keep the app maintainable over time.

Why this matters:

- The app depends on `react-scripts` and CRA-era tooling.
- The package manager is pinned to Yarn Classic for the baseline gates, but a Yarn Berry migration should be evaluated once CI is stable.
- Testing libraries and `gh-pages` are currently listed under `dependencies`, even though they appear to be development/deployment tools.
- Dependency updates and vulnerability scanning are not automated.

Work items:

- Run a dependency audit and document vulnerabilities, outdated packages, and upgrade constraints.
- Move test-only and deploy-only packages to `devDependencies` where appropriate.
- Add Dependabot or Renovate for dependency updates.
- Add a policy for when to upgrade React, React Bootstrap, Playwright, and testing libraries.
- Evaluate migrating from Yarn Classic to Yarn Berry in its own focused PR with no app behavior changes.
- Start any Yarn Berry migration with `nodeLinker: node-modules` to preserve current `node_modules` behavior and minimize disruption.
- Treat Plug'n'Play as an explicit later decision only if CRA, Jest, ESLint, Playwright, GitHub Pages deployment, and `yarn validate` remain compatible.
- If Yarn Berry is adopted, update CI and docs to use the matching install command, such as `yarn install --immutable`.
- Evaluate whether to stay on CRA short term or migrate to Vite after tests and domain extraction make the move safe.
- Add bundle-size reporting if bundle growth becomes a concern.
- Document the deploy path for GitHub Pages, including required permissions and rollback steps.

Done when:

- Dependency drift is visible in PRs.
- Build tooling choices are documented.
- Any package-manager migration passes `yarn validate` locally and in CI without changing app behavior.
- A future CRA-to-Vite migration has a safe precondition list instead of being an all-at-once rewrite.

## Stage 8: Security, Privacy, And Deployment Hardening

Goal: make browser, storage, analytics, and deployment behavior intentional.

Why this matters:

- The public HTML loads Google Analytics directly for every build.
- There is no visible Content Security Policy or documented privacy choice.
- LocalStorage contains user-entered financial/accounting data and saved calculations.

Work items:

- Decide whether analytics should be enabled in all environments, production only, or optional.
- Move analytics configuration behind environment variables if it remains.
- Add a Content Security Policy appropriate for the static GitHub Pages deployment.
- Review third-party script loading, including whether Subresource Integrity is possible or whether the script should remain external.
- Document what data is stored locally and that it remains in the user's browser.
- Add a user-facing way to clear all local data.
- Add defensive limits for saved item names, saved item counts, and stored payload size.
- Review public metadata, manifest, icon setup, and HTML structure.

Done when:

- Security and privacy decisions are documented and reflected in code.
- Third-party scripts are intentional and environment-aware.
- Users have clear control over locally stored data.

## Stage 9: Documentation And Product Knowledge

Goal: make the project understandable without reading every component.

Why this matters:

- `README.md` has useful module screenshots and commands, but it does not explain architecture, data contracts, or maintenance workflow.
- `docs/react.md` is mostly the default Create React App guide.
- Spanish text appears with encoding damage in multiple files.

Work items:

- Fix text encoding across README, docs, HTML, manifest, and source strings.
- Add an architecture overview: modules, state flow, persistence, equation solving, and test layers.
- Add a data model document for app values, COU, saved items, and account modules.
- Add a testing guide that explains what belongs in unit, integration, and e2e tests.
- Add a release/deploy guide for GitHub Pages.
- Add a maintenance guide that maps this file's stages to future PRs.
- Add domain notes explaining accounting abbreviations and expected formulas.
- Replace default CRA docs with project-specific docs or move the generic CRA reference to a short appendix.

Done when:

- A new contributor can run, test, and understand the app's core architecture from docs.
- Domain formulas are not discoverable only by reading component code.
- Encoding is clean and consistent.

## Stage 10: Product Safety Before New Features

Goal: define the final readiness bar before feature work resumes.

Why this matters:

- Maintenance work can continue forever unless there is a clear stopping rule.
- The app needs a stable enough base, not theoretical perfection.

Work items:

- Define a "new feature readiness" checklist.
- Require CI green, documented coverage thresholds, storage migrations, and tested domain modules for areas being changed.
- Keep a known-risk register for deferred items.
- Add issue labels for `maintenance`, `testing`, `architecture`, `security`, `docs`, and `dependencies`.
- Decide which modules must reach near-100% domain coverage before feature work resumes and which can be ratcheted later.

Done when:

- The team can intentionally choose when the maintenance foundation is good enough.
- New feature PRs have clear guardrails.

## Suggested PR Order

1. Add CI, validate script, package manager/Node pinning, and artifact handling.
2. Add lint/format scripts and clean the lowest-risk lint issues.
3. Document test strategy and expand coverage reporting beyond shared helpers.
4. Harden localStorage parsing, schema defaults, and migration tests.
5. Extract the first pure calculation module from one smaller account component.
6. Extract COU calculation logic behind tests.
7. Replace alert/log side effects with structured compute results and visible UI messages.
8. Introduce reusable table/account rendering metadata.
9. Add dependency automation and audit fixes.
10. Harden analytics, CSP, privacy documentation, and deployment docs.
11. Fix encoding and replace default CRA docs with project-specific documentation.
12. Reassess the readiness checklist and decide which feature work can restart.

## Open Decisions

- Should the project target 100% coverage globally, or 100% for pure domain modules plus a practical threshold for UI components?
- Should the app stay on Create React App until after domain extraction, or should build-tool migration be prioritized earlier?
- Should stored calculations support explicit export/import before localStorage migrations begin?
- Should alerts remain as a compatibility layer while visible in-app messages are introduced?
- Should Spanish remain the only UI language, or should strings be centralized to prepare for localization?
