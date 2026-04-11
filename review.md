# Review Verdict

## Work Item
untracked

## Summary
The scaffold/docs/template alignment around the new global-first `/bake` story looks mostly coherent: the repo now scaffolds a repo-local `.pi/prompts/bake.md`, keeps `/adopt` as a compatibility prompt, adds doctor/alignment coverage for the new managed prompt, and adds install coverage for the local launcher plus user-global extension.

I do **not** think this is fully safe to serve yet. Two last-minute workflow/correctness risks stand out:
1. the new user-global `/bake` extension registers `/bake` unconditionally everywhere, which may shadow the newly documented repo-local `.pi/prompts/bake.md` surface in already-baked repos; and
2. the `.envrc` change unconditionally exports `GITHUB_PERSONAL_ACCESS_TOKEN` from `_GITHUB_PERSONAL_ACCESS_TOKEN`, which can clear the token to an empty value when the underscore variable is unset.

## Test-First Trace
There is clear scoped TDD evidence for the repo-name repair slice (`src/core/project-input.ts` / `src/core/strings.ts`) via `progress.md`, plus matching unit and CLI integration coverage.

For the broader global `/bake` closeout, I can see added integration/BDD coverage (`tests/integration/global-bake-install.test.ts`, doctor/docs/init alignment checks, adoption BDD assertions), but I do **not** see the same explicit RED -> GREEN -> REFACTOR trace recorded for the global extension and `.envrc` slice. The handoff artifacts also still describe the narrower `pi-harness-bur.6` naming fix rather than the full current diff.

## Risks
- **Prompt/command precedence risk:** `src/local-launcher.ts` installs a global extension that calls `pi.registerCommand('bake', ...)` in all repos. The docs now say baked repos should prefer the repo-local `/bake` prompt, but there is no proof in this diff that the global command will not shadow that prompt-native surface.
- **Unsafe env export:** `.envrc` now does `export GITHUB_PERSONAL_ACCESS_TOKEN=$_GITHUB_PERSONAL_ACCESS_TOKEN`. If `_GITHUB_PERSONAL_ACCESS_TOKEN` is unset, direnv will export an empty `GITHUB_PERSONAL_ACCESS_TOKEN`, potentially breaking the preconfigured GitHub MCP setup.
- **Runtime discovery remains caller-side:** `tests/integration/global-bake-install.test.ts` proves files are written, not that Pi actually discovers and prioritizes the installed global extension the way the docs expect.
- **Workflow artifact drift:** `progress.md` / `wave.md` document a narrower Beads slice than the actual working-tree diff, so the closeout trail is incomplete.

## Gaps
- No doctor rule or test currently guards against `/bake` command shadowing in baked repos the way `/serve` shadowing is explicitly guarded.
- No explicit verification covers the real Pi behavior of global `/bake` in an untouched repo **and** repo-local `/bake` in an already-baked repo.
- The `.envrc` change has no matching documentation or verification note explaining the underscore-variable convention.
- If this diff is the final closeout batch, the repo-local handoff artifacts should be refreshed to describe the full scope rather than only `pi-harness-bur.6`.

## Suggested Verification
Manual check before serving:
1. Run `pnpm install:local`.
2. Open Pi in an untouched repo and in an already-baked repo.
3. Confirm `/bake` bootstraps through the global extension only in the untouched repo, and does **not** hide the repo-local `.pi/prompts/bake.md` workflow in the baked repo.
4. In a direnv-enabled shell with `_GITHUB_PERSONAL_ACCESS_TOKEN` unset, confirm `.envrc` does not blank `GITHUB_PERSONAL_ACCESS_TOKEN` unless that behavior is intentional.
