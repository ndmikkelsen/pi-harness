# Pi baseline migration status

## Completed changes

- collapsed the scaffold contract to vanilla Pi instead of an assistant-specific target
- introduced `AGENTS.md`, `.pi/*`, and `scripts/*` as the supported runtime baseline
- kept Beads as the canonical backlog system through native `bd`
- kept Cognee as the optional knowledge brief surface through plain repo scripts
- moved bootstrap, landing, and Cognee helpers to `scripts/*`
- updated cleanup and doctor logic toward the Pi-native baseline

## Current baseline

The supported local workflow is now:

```bash
pnpm install
pnpm build
pnpm install:local
pi-harness --mode existing <path> --init-json
pi-harness doctor <path>
```

## Follow-up areas

- keep source templates, dogfooded outputs, and `dist/` aligned as the cutover finishes
- continue simplifying docs and tests around the Pi-native baseline
- add more Pi extensions only when prompts, skills, and scripts are no longer enough
