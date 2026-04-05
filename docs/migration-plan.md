# Pi baseline migration status

## Completed changes

- collapsed the supported scaffold target to `codex`
- removed the OpenCode global skill/install path from the runtime baseline
- removed the OMO contract from the generated scaffold baseline
- kept Beads as the canonical backlog system through native `bd`
- kept Cognee as the optional knowledge brief surface through `.codex/scripts/*`
- kept `.codex/` as the single generated runtime surface

## Current baseline

The supported local workflow is now:

```bash
pnpm install
pnpm build
pnpm install:local
pi-harness --mode existing <path> --assistant codex --init-json
pi-harness doctor <path> --assistant codex
```

## Follow-up areas

- decide whether a future Pi-native runtime surface needs its own generated files or whether Pi remains the operating environment around the Codex scaffold
- continue simplifying docs and tests around the codex-only baseline
- keep source templates, dogfooded outputs, and `dist/` aligned as further Pi work lands
