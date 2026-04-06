import os from 'node:os';
import path from 'node:path';

import { mkdtemp, readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

import { runInit } from '../../src/commands/init.js';

function expectNoLegacyRuntimeReferences(content: string): void {
  expect(content).not.toContain('.omp/');
  expect(content).not.toContain('.codex/');
  expect(content).not.toContain('.rules/');
  expect(content).not.toContain('--assistant');
  expect(content).not.toContain('AssistantTarget');
}

describe('Beads integration', () => {
  it('documents native bd usage through Pi-native runtime surfaces', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-bd-native-'));

    const result = await runInit({
      cwd: workspace,
      projectArg: 'sample-bd-native',
      mode: 'auto',
      dryRun: false,
      force: false,
      skipGit: true,
      detectPorts: false,
    });

    const projectDir = path.join(workspace, 'sample-bd-native');
    const readme = await readFile(path.join(projectDir, 'README.md'), 'utf8');
    const agentsGuide = await readFile(path.join(projectDir, 'AGENTS.md'), 'utf8');
    const beadsSkill = await readFile(path.join(projectDir, '.pi', 'skills', 'beads', 'SKILL.md'), 'utf8');
    const harnessSkill = await readFile(path.join(projectDir, '.pi', 'skills', 'harness', 'SKILL.md'), 'utf8');
    const parallelSkill = await readFile(
      path.join(projectDir, '.pi', 'skills', 'parallel-wave-design', 'SKILL.md'),
      'utf8',
    );

    expect(result.createdPaths).toEqual(
      expect.arrayContaining([
        'README.md',
        'AGENTS.md',
        '.pi/skills/beads/SKILL.md',
        '.pi/skills/harness/SKILL.md',
        '.pi/skills/parallel-wave-design/SKILL.md',
      ]),
    );
    expect(
      result.createdPaths.some(
        (file) => file.startsWith('.codex/') || file.startsWith('.omp/') || file.startsWith('.rules/'),
      ),
    ).toBe(false);

    expect(readme).toContain('Run `bd init` once in the repository before using Beads.');
    expect(readme).toContain('Review `.pi/extensions/*`, `.pi/prompts/*`, and `.pi/skills/*` for native workflow guidance.');
    expect(readme).toContain('Use `.pi/skills/harness/SKILL.md` when adopting or bootstrapping another repository.');
    expect(agentsGuide).toContain('This project uses `bd` for issue tracking.');
    expect(agentsGuide).toContain('2. `bd update <id> --claim --json`');
    expect(agentsGuide).toContain(
      'Use `.pi/skills/harness/SKILL.md`, `.pi/skills/beads/SKILL.md`, and `.pi/skills/parallel-wave-design/SKILL.md` when the task matches.',
    );
    expect(beadsSkill).toContain('1. `bd ready --json`');
    expect(beadsSkill).toContain(
      '5. close the issue only after verification passes: `bd close <id> --reason "Verified: <evidence>" --json`',
    );
    expect(beadsSkill).toContain(
      '6. if the session is in an execution or autonomous landing lane, finish with `./scripts/land.sh`',
    );
    expect(harnessSkill).toContain('Beads state if `bd` or `.beads/` is available');
    expect(harnessSkill).toContain('Run `pi-harness doctor <target>` after setup.');
    expect(parallelSkill).toContain('Carry the active Beads issue ID through context when Beads is available.');
    expect(parallelSkill).toContain('Keep follow-up work in Beads or repo-local handoff notes, not ad hoc TODO files.');

    for (const content of [readme, agentsGuide, beadsSkill, harnessSkill, parallelSkill]) {
      expectNoLegacyRuntimeReferences(content);
    }
  });
});
