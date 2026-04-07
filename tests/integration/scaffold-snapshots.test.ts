import { mkdtemp, readFile, readdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { runInit } from '../../src/commands/init.js';

async function collectFiles(rootDir: string, currentDir = rootDir): Promise<string[]> {
  const entries = await readdir(currentDir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const absolutePath = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(rootDir, absolutePath)));
      continue;
    }
    files.push(path.relative(rootDir, absolutePath));
  }

  return files.sort();
}

async function readProjectFile(rootDir: string, ...segments: string[]): Promise<string> {
  return readFile(path.join(rootDir, ...segments), 'utf8');
}

async function snapshotForProject(rootDir: string) {
  return {
    files: await collectFiles(rootDir),
    readme: await readProjectFile(rootDir, 'README.md'),
    agents: await readProjectFile(rootDir, 'AGENTS.md'),
    settings: await readProjectFile(rootDir, '.pi', 'settings.json'),
    system: await readProjectFile(rootDir, '.pi', 'SYSTEM.md'),
    leadAgent: await readProjectFile(rootDir, '.pi', 'agents', 'lead.md'),
    roleWorkflowExtension: await readProjectFile(rootDir, '.pi', 'extensions', 'role-workflow.ts'),
    workflowExtension: await readProjectFile(rootDir, '.pi', 'extensions', 'repo-workflows.ts'),
    beadsSkill: await readProjectFile(rootDir, '.pi', 'skills', 'beads', 'SKILL.md'),
    cogneeSkill: await readProjectFile(rootDir, '.pi', 'skills', 'cognee', 'SKILL.md'),
    redGreenRefactorSkill: await readProjectFile(rootDir, '.pi', 'skills', 'red-green-refactor', 'SKILL.md'),
    harnessSkill: await readProjectFile(rootDir, '.pi', 'skills', 'harness', 'SKILL.md'),
    parallelSkill: await readProjectFile(rootDir, '.pi', 'skills', 'parallel-wave-design', 'SKILL.md'),
    subagentWorkflowSkill: await readProjectFile(rootDir, '.pi', 'skills', 'subagent-workflow', 'SKILL.md'),
    bootstrapScript: await readProjectFile(rootDir, 'scripts', 'bootstrap-worktree.sh'),
    cogneeBridge: await readProjectFile(rootDir, 'scripts', 'cognee-bridge.sh'),
    cogneeBrief: await readProjectFile(rootDir, 'scripts', 'cognee-brief.sh'),
    syncArtifactsScript: await readProjectFile(rootDir, 'scripts', 'sync-artifacts-to-cognee.sh'),
    postCheckoutHook: await readProjectFile(rootDir, 'scripts', 'hooks', 'post-checkout'),
    landScript: await readProjectFile(rootDir, 'scripts', 'land.sh'),
    dockerfile: await readProjectFile(rootDir, '.docker', 'Dockerfile.cognee'),
    beadsConfig: await readProjectFile(rootDir, '.beads', 'config.yaml'),
  };
}

function expectNoLegacyRuntimeReferences(content: string): void {
  expect(content).not.toContain('.omp/');
  expect(content).not.toContain('.codex/');
  expect(content).not.toContain('.rules/');
  expect(content).not.toContain('--assistant');
  expect(content).not.toContain('AssistantTarget');
}

describe('scaffold snapshots', () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-30T00:00:00Z'));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it('matches the vanilla Pi scaffold surfaces', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-snapshot-'));

    await runInit({
      cwd: workspace,
      projectArg: 'snapshot-pi-native',
      mode: 'auto',
      dryRun: false,
      force: false,
      skipGit: true,
      detectPorts: false,
    });

    const projectDir = path.join(workspace, 'snapshot-pi-native');
    const result = await snapshotForProject(projectDir);
    const envrc = await readProjectFile(projectDir, '.envrc');

    expect(envrc).not.toContain('metadata.json');
    expect(envrc).not.toContain('$_DOLT_');
    expect(result.files).toEqual(
      expect.arrayContaining([
        '.beads/config.yaml',
        '.beads/hooks/post-checkout',
        '.pi/SYSTEM.md',
        '.pi/agents/lead.md',
        '.pi/agents/explore.md',
        '.pi/agents/plan.md',
        '.pi/agents/build.md',
        '.pi/agents/review.md',
        '.pi/agents/plan-change.chain.md',
        '.pi/agents/ship-change.chain.md',
        '.pi/extensions/repo-workflows.ts',
        '.pi/extensions/role-workflow.ts',
        '.pi/prompts/adopt.md',
        '.pi/prompts/land.md',
        '.pi/prompts/triage.md',
        '.pi/prompts/plan-change.md',
        '.pi/prompts/ship-change.md',
        '.pi/prompts/parallel-wave.md',
        '.pi/prompts/review-change.md',
        '.pi/prompts/feat-change.md',
        '.pi/settings.json',
        '.pi/skills/beads/SKILL.md',
        '.pi/skills/cognee/SKILL.md',
        '.pi/skills/red-green-refactor/SKILL.md',
        '.pi/skills/harness/SKILL.md',
        '.pi/skills/parallel-wave-design/SKILL.md',
        '.pi/skills/subagent-workflow/SKILL.md',
        'AGENTS.md',
        'README.md',
        'STICKYNOTE.example.md',
        '.config/deploy.cognee.yml',
        '.config/deploy.yml',
        '.docker/Dockerfile.cognee',
        'scripts/bootstrap-worktree.sh',
        'scripts/cognee-bridge.sh',
        'scripts/cognee-brief.sh',
        'scripts/sync-artifacts-to-cognee.sh',
        'scripts/hooks/post-checkout',
        'scripts/land.sh',
      ]),
    );
    expect(
      result.files.some(
        (file) => file.startsWith('.codex/') || file.startsWith('.omp/') || file.startsWith('.rules/'),
      ),
    ).toBe(false);
    expect(result.files).not.toContain('.planning/TRACEABILITY.md');
    expect(result.files).not.toContain('CONSTITUTION.md');
    expect(result.files).not.toContain('VISION.md');
    expect(result.files).not.toContain('STICKYNOTE.md');
    expect(result.files).not.toContain('.opencode/worktree.jsonc');

    expect(result.readme).toMatch(/Scaffolded with `pi-harness` v[^ ]+ on 2026-03-30\./);
    expect(result.readme).toContain('This project is scaffolded for vanilla Pi with Beads, Cognee, and plain repo scripts.');
    expect(result.readme).toContain(
      'This scaffold assumes `pi-harness` is used locally to set up and refresh repos, not consumed as a registry-published package.',
    );
    expect(result.readme).toContain('Run `bd init` once in the repository before using Beads.');
    expect(result.readme).toContain('Shared subagent support comes from the `pi-subagents` Pi package declared in `.pi/settings.json`, while project-local role switching comes from `.pi/extensions/role-workflow.ts`.');
    expect(result.readme).toContain('Use `Ctrl+.`, `Ctrl+,`, `/role <name>`, `/next-role`, or `/prev-role` to switch the active main-session workflow role.');
    expect(result.readme).toContain('Use `/agents`, `/run`, `/chain`, or `/parallel` once pi-subagents loads if the task benefits from delegation.');
    expect(result.readme).toContain('Use `/feat-change`, `/plan-change`, `/ship-change`, `/parallel-wave`, or `/review-change` for common role-based flows.');
    expect(result.readme).toContain('Use `.pi/skills/harness/SKILL.md` when adopting or bootstrapping another repository.');
    expect(result.readme).toContain('pnpm test:bdd');
    expect(result.agents).toContain('Workflow authority lives in this file, `.pi/*`, native Beads state, and repo-local handoff notes.');
    expect(result.agents).toContain('.pi/agents/*');
    expect(result.agents).toContain('/role <name>');
    expect(result.agents).toContain(
      'Use the commands and shortcuts registered by project-local `.pi/extensions/*` files when native slash-command execution is the cleanest path.',
    );
    expect(result.agents).toContain('This project uses `bd` for issue tracking.');
    expect(JSON.parse(result.settings)).toEqual({
      packages: ['npm:pi-subagents'],
      extensions: ['.pi/extensions/repo-workflows.ts'],
    });
    expect(result.system).toContain('Use `AGENTS.md` as the primary project instruction file.');
    expect(result.system).toContain(
      'Prefer project-local `.pi/agents/*`, `.pi/extensions/*`, `.pi/prompts/*`, `.pi/skills/*`, and `scripts/*` before inventing ad hoc workflow glue.',
    );
    expect(result.workflowExtension).toContain("pi.registerCommand('bootstrap-worktree'");
    expect(result.workflowExtension).toContain("pi.registerCommand('cognee-brief'");
    expect(result.workflowExtension).toContain("pi.registerCommand('land'");
    expect(result.roleWorkflowExtension).toContain("registerCommand('role'");
    expect(result.roleWorkflowExtension).toContain("registerShortcut('ctrl+.'");
    expect(result.roleWorkflowExtension).toContain("registerShortcut('ctrl+,'");
    expect(result.roleWorkflowExtension).toContain('ROLE_ALIASES');
    expect(result.beadsSkill).toContain('1. `bd ready --json`');
    expect(result.cogneeSkill).toContain('knowledge garden');
    expect(result.redGreenRefactorSkill).toContain('RED');
    expect(result.harnessSkill).toContain(
      'run `pi-harness --mode existing . --init-json` so you can distinguish `createdPaths` from `skippedPaths`',
    );
    expect(result.leadAgent).toContain('Primary workflow lead for the repository\'s Pi role system');
    expect(result.leadAgent).toContain('plan-change');
    expect(result.leadAgent).toContain('worktree: true');
    expect(result.parallelSkill).toContain('Each delegated task owns at most 3-5 files.');
    expect(result.subagentWorkflowSkill).toContain('`lead` owns workflow coordination, routing, and wave shaping.');
    expect(result.bootstrapScript).toContain('Bootstrapped worktree-local Pi workflow state.');
    expect(result.bootstrapScript).toContain('the relevant `.pi/*` runtime files before implementation');
    expect(result.cogneeBridge).toContain('snapshot-pi-native-cognee.apps.compute.lan');
    expect(result.cogneeBridge).toContain('snapshot-pi-native-knowledge');
    expect(result.cogneeBridge).toContain('snapshot-pi-native-patterns');
    expect(result.cogneeBrief).toContain('exec "$BRIDGE" brief "$@"');
    expect(result.syncArtifactsScript).toContain('context.md');
    expect(result.syncArtifactsScript).toContain('Cognee unavailable - skipping artifact sync');
    expect(result.postCheckoutHook).toContain('scripts/bootstrap-worktree.sh');
    expect(result.landScript).toContain('run_cmd pnpm test:bdd');
    expect(result.landScript).toContain('sync-artifacts-to-cognee.sh');
    expect(result.landScript).toContain('gh pr create --base dev --head "$branch" --fill');
    expect(result.dockerfile).toContain('FROM cognee/cognee:latest@sha256:');
    expect(result.beadsConfig.trim()).toBe('backup:\n  enabled: false');

    for (const content of [
      result.readme,
      result.agents,
      result.system,
      result.leadAgent,
      result.roleWorkflowExtension,
      result.beadsSkill,
      result.cogneeSkill,
      result.redGreenRefactorSkill,
      result.harnessSkill,
      result.parallelSkill,
      result.subagentWorkflowSkill,
    ]) {
      expectNoLegacyRuntimeReferences(content);
    }
  });
});
