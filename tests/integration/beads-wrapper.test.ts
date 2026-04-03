import os from 'node:os';
import path from 'node:path';

import { mkdtemp, readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

import { runInit } from '../../src/commands/init.js';

describe('Beads integration', () => {
  it('documents native bd usage without generating a wrapper script', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'ai-harness-bd-native-'));

    const result = await runInit({
      cwd: workspace,
      projectArg: 'sample-bd-native',
      assistant: 'opencode',
      mode: 'auto',
      dryRun: false,
      force: false,
      skipGit: true,
      detectPorts: false
    });

    const projectDir = path.join(workspace, 'sample-bd-native');
    const readme = await readFile(path.join(projectDir, 'README.md'), 'utf8');
    const beadsGuide = await readFile(path.join(projectDir, '.rules', 'patterns', 'beads-integration.md'), 'utf8');
    const codexReadme = await readFile(path.join(projectDir, '.codex', 'README.md'), 'utf8');
    const agentsGuide = await readFile(path.join(projectDir, 'AGENTS.md'), 'utf8');

    expect(readme).toContain('Run `bd init` once in the repository before using Beads.');
    expect(readme).toContain('Review .rules/patterns/operator-workflow.md, AGENTS.md, and .codex/README.md.');
    expect(beadsGuide).toContain('Use native `bd` commands for Beads.');
    expect(beadsGuide).toContain('## Beads -> GSD -> Beads');
    expect(beadsGuide).toContain('`bd update <id> --claim --json`');
    expect(beadsGuide).toContain('`/gsd-next`');
    expect(codexReadme).toContain('Use native `bd` as the Beads task-tracking interface after `bd init`');
    expect(codexReadme).toContain('.rules/patterns/omo-agent-contract.md');
    expect(codexReadme).toContain('Close or update Beads issues only after verification passes');
    expect(codexReadme).toContain('.codex/scripts/cognee-bridge.sh');
    expect(agentsGuide).toContain('Use `.rules/patterns/operator-workflow.md` and `/gsd-next` as the default interactive work loop.');
    expect(agentsGuide).toContain('.rules/patterns/omo-agent-contract.md');
    expect(agentsGuide).toContain('### Beads + GSD Loop');
    expect(agentsGuide).toContain('.codex/workflows/autonomous-execution.md');
  });
});
