# Progress

## Work Item
untracked

## Status
Completed

## Test Strategy
Hybrid, prompt-led. Cognee skipped because the scope was narrow and local repo evidence was sufficient.

## Tasks
- [x] Removed the colliding `/serve` extension command from dogfood and scaffold repo-workflow extensions.
- [x] Updated the `/serve` prompt in dogfood and scaffold templates to make the prompt the canonical entrypoint and to drive `./scripts/serve.sh --commit-message "<message>"`.
- [x] Updated doctor and integration coverage so prompt-native `/serve` is expected and extension shadowing is flagged.
- [x] Re-ran narrow verification for init/scaffold/docs/doctor behavior.

## Files Changed
- `.pi/extensions/repo-workflows.ts` - removed the extension-backed `/serve` command so prompt routing can own `/serve`.
- `src/templates/pi/extensions/repo-workflows.ts` - kept scaffold parity with the prompt-native `/serve` design.
- `.pi/prompts/serve.md` - clarified that `/serve` is the canonical Pi-native entrypoint and should drive `scripts/serve.sh` with a commit message.
- `src/templates/pi/prompts/serve.md` - mirrored the prompt-native serving guidance in scaffold output.
- `src/commands/doctor.ts` - stopped requiring a `/serve` extension command and now flags extension shadowing of `/serve`.
- `tests/integration/init.test.ts` - updated scaffold assertions for prompt-native `/serve`.
- `tests/integration/scaffold-snapshots.test.ts` - updated snapshot assertions so repo workflow glue no longer owns `/serve`.
- `tests/integration/docs-alignment.test.ts` - aligned dogfood/template expectations with the prompt-native `/serve` contract.
- `tests/integration/doctor.test.ts` - updated runtime-glue coverage and added a regression test for extension shadowing of `/serve`.

## Verification Evidence
- RED: `pnpm test -- tests/integration/init.test.ts tests/integration/docs-alignment.test.ts` failed after updating expectations to require prompt-native `/serve` guidance and commit-message-driven serving.
- GREEN: `pnpm test -- tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/docs-alignment.test.ts tests/integration/doctor.test.ts` passed after removing the colliding extension command and updating prompt/doctor behavior.
- REFACTOR: `pnpm test -- tests/integration/cli-doctor.test.ts` passed after tightening doctor behavior around prompt-native `/serve`.

## Notes
- `bd ready --json` returned no ready issues, so this work remains `untracked`.
- Existing Pi sessions may need a restart after scaffold refresh so the prompt-only `/serve` behavior replaces any previously loaded extension command.
