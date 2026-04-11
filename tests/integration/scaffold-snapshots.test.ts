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
    mcpConfig: await readProjectFile(rootDir, '.pi', 'mcp.json'),
    system: await readProjectFile(rootDir, '.pi', 'SYSTEM.md'),
    leadAgent: await readProjectFile(rootDir, '.pi', 'agents', 'lead.md'),
    roleWorkflowExtension: await readProjectFile(rootDir, '.pi', 'extensions', 'role-workflow.ts'),
    workflowExtension: await readProjectFile(rootDir, '.pi', 'extensions', 'repo-workflows.ts'),
    bakePrompt: await readProjectFile(rootDir, '.pi', 'prompts', 'bake.md'),
    servePrompt: await readProjectFile(rootDir, '.pi', 'prompts', 'serve.md'),
    promotePrompt: await readProjectFile(rootDir, '.pi', 'prompts', 'promote.md'),
    beadsSkill: await readProjectFile(rootDir, '.pi', 'skills', 'beads', 'SKILL.md'),
    cogneeSkill: await readProjectFile(rootDir, '.pi', 'skills', 'cognee', 'SKILL.md'),
    redGreenRefactorSkill: await readProjectFile(rootDir, '.pi', 'skills', 'red-green-refactor', 'SKILL.md'),
    bakeSkill: await readProjectFile(rootDir, '.pi', 'skills', 'bake', 'SKILL.md'),
    parallelSkill: await readProjectFile(rootDir, '.pi', 'skills', 'parallel-wave-design', 'SKILL.md'),
    subagentWorkflowSkill: await readProjectFile(rootDir, '.pi', 'skills', 'subagent-workflow', 'SKILL.md'),
    stickyNoteExample: await readProjectFile(rootDir, 'STICKYNOTE.example.md'),
    bootstrapScript: await readProjectFile(rootDir, 'scripts', 'bootstrap-worktree.sh'),
    cogneeBridge: await readProjectFile(rootDir, 'scripts', 'cognee-bridge.sh'),
    cogneeBrief: await readProjectFile(rootDir, 'scripts', 'cognee-brief.sh'),
    syncArtifactsScript: await readProjectFile(rootDir, 'scripts', 'sync-artifacts-to-cognee.sh'),
    postCheckoutHook: await readProjectFile(rootDir, 'scripts', 'hooks', 'post-checkout'),
    serveScript: await readProjectFile(rootDir, 'scripts', 'serve.sh'),
    promoteScript: await readProjectFile(rootDir, 'scripts', 'promote.sh'),
    dockerfile: await readProjectFile(rootDir, 'docker', 'Dockerfile.cognee'),
    beadsConfig: await readProjectFile(rootDir, '.beads', 'config.yaml'),
    envExample: await readProjectFile(rootDir, '.env.example'),
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
        '.pi/prompts/bake.md',
        '.pi/prompts/adopt.md',
        '.pi/prompts/serve.md',
        '.pi/prompts/promote.md',
        '.pi/prompts/triage.md',
        '.pi/prompts/plan-change.md',
        '.pi/prompts/ship-change.md',
        '.pi/prompts/parallel-wave.md',
        '.pi/prompts/review-change.md',
        '.pi/prompts/feat-change.md',
        '.pi/settings.json',
        '.pi/mcp.json',
        '.pi/skills/beads/SKILL.md',
        '.pi/skills/cognee/SKILL.md',
        '.pi/skills/red-green-refactor/SKILL.md',
        '.pi/skills/bake/SKILL.md',
        '.pi/skills/parallel-wave-design/SKILL.md',
        '.pi/skills/subagent-workflow/SKILL.md',
        'AGENTS.md',
        'README.md',
        'STICKYNOTE.example.md',
        'config/deploy.cognee.yml',
        'config/deploy.yml',
        'docker/Dockerfile.cognee',
        'scripts/bootstrap-worktree.sh',
        'scripts/cognee-bridge.sh',
        'scripts/cognee-brief.sh',
        'scripts/sync-artifacts-to-cognee.sh',
        'scripts/hooks/post-checkout',
        'scripts/serve.sh',
        'scripts/promote.sh',
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
    expect(result.readme).toContain('This scaffold also declares `npm:pi-mcp-adapter` in `.pi/settings.json` and preconfigures a project-local GitHub MCP server in `.pi/mcp.json`.');
    expect(result.readme).toContain('Use `Ctrl+.`, `Ctrl+,`, `/role <name>`, `/next-role`, or `/prev-role` to switch the active main-session workflow role.');
    expect(result.readme).toContain('Use `/agents`, `/run`, `/chain`, or `/parallel` once pi-subagents loads if the task benefits from delegation.');
    expect(result.readme).toContain('Use `/feat-change`, `/plan-change`, `/ship-change`, `/parallel-wave`, `/review-change`, or `/promote` for common role-based flows.');
    expect(result.readme).toContain('Use `/mcp` to inspect, reconnect, or toggle the project-local GitHub MCP server after Pi starts.');
    expect(result.readme).toContain('Use `.pi/skills/bake/SKILL.md` when adopting or bootstrapping another repository.');
    expect(result.readme).toContain('pnpm test:bdd');
    expect(result.agents).toContain('Workflow authority lives in this file, `.pi/*`, native Beads state, and repo-local handoff notes.');
    expect(result.agents).toContain('.pi/agents/*');
    expect(result.agents).toContain('/role <name>');
    expect(result.agents).toContain(
      'Use the commands and shortcuts registered by project-local `.pi/extensions/*` files when native slash-command execution is the cleanest path.',
    );
    expect(result.agents).toContain("Treat plain-language publish requests like `let's serve the dish`, `serve the pi`, `serve this branch`, `ship it`, or `publish the branch` as intent to use `/serve` or `./scripts/serve.sh` when the lane is allowed to publish.");
    expect(result.agents).toContain('This project uses `bd` for issue tracking.');
    expect(result.agents).toContain('Only execution or autonomous release lanes should run `./scripts/promote.sh`.');
    expect(JSON.parse(result.settings)).toEqual({
      packages: ['npm:pi-subagents', 'npm:pi-mcp-adapter'],
      extensions: ['.pi/extensions/repo-workflows.ts'],
    });
    expect(result.mcpConfig).toContain('@modelcontextprotocol/server-github');
    expect(result.mcpConfig).toContain('GITHUB_PERSONAL_ACCESS_TOKEN');
    expect(result.system).toContain('Use `AGENTS.md` as the primary project instruction file.');
    expect(result.system).toContain(
      'Prefer project-local `.pi/agents/*`, `.pi/extensions/*`, `.pi/prompts/*`, `.pi/skills/*`, and `scripts/*` before inventing ad hoc workflow glue.',
    );
    expect(result.system).toContain("Treat plain-language publish requests like `let's serve the dish`, `serve the pi`, `serve this branch`, `ship it`, or `publish the branch` as `/serve` intent when the current lane is allowed to publish.");
    expect(result.workflowExtension).toContain("pi.registerCommand('bootstrap-worktree'");
    expect(result.workflowExtension).toContain("pi.registerCommand('cognee-brief'");
    expect(result.workflowExtension).not.toContain("pi.registerCommand('serve'");
    expect(result.bakePrompt).toContain('canonical repo-local Pi setup surface');
    expect(result.bakePrompt).toContain('pi-harness --mode existing . --init-json');
    expect(result.bakePrompt).toContain('prefer `/bake` as the canonical Pi setup surface');
    expect(result.bakePrompt).toContain('Keep `/adopt` available as the compatibility path');
    expect(result.bakePrompt).toContain('pi-harness doctor <target>');
    expect(result.roleWorkflowExtension).toContain("registerCommand('role'");
    expect(result.roleWorkflowExtension).toContain("registerShortcut('ctrl+.'");
    expect(result.roleWorkflowExtension).toContain("registerShortcut('ctrl+,'");
    expect(result.roleWorkflowExtension).toContain('ROLE_ALIASES');
    expect(result.servePrompt).toContain('Fill in or refresh the local `STICKYNOTE.md` before serving; it must stay untracked');
    expect(result.servePrompt).toContain('Confirm the explicit PR description/body that serving will create or refresh from `STICKYNOTE.md`');
    expect(result.servePrompt).toContain('Serving refreshes the PR body for both new and existing PRs; do not rely on `gh pr create --fill` or a stale body.');
    expect(result.servePrompt).toContain('./scripts/promote.sh');
    expect(result.promotePrompt).toContain('/promote');
    expect(result.promotePrompt).toContain('PR to `main`');
    expect(result.beadsSkill).toContain('1. `bd ready --json`');
    expect(result.cogneeSkill).toContain('knowledge garden');
    expect(result.redGreenRefactorSkill).toContain('RED');
    expect(result.bakeSkill).toContain(
      'run `pi-harness --mode existing . --init-json` so you can distinguish `createdPaths` from `skippedPaths`',
    );
    expect(result.leadAgent).toContain('Primary workflow lead for the repository\'s Pi role system');
    expect(result.leadAgent).toContain('plan-change');
    expect(result.leadAgent).toContain('worktree: true');
    expect(result.parallelSkill).toContain('Each delegated task owns at most 3-5 files.');
    expect(result.subagentWorkflowSkill).toContain('`lead` owns workflow coordination, routing, and wave shaping.');
    expect(result.stickyNoteExample).toContain('Keep `STICKYNOTE.md` untracked, and expect linked worktrees to point back to the main worktree copy.');
    expect(result.stickyNoteExample).toContain('`/serve` will reuse `## Completed This Session` for the PR summary');
    expect(result.stickyNoteExample).toContain('- Checks still needed before serving:');
    expect(result.bootstrapScript).toContain('Bootstrapped worktree-local Pi workflow state.');
    expect(result.bootstrapScript).toContain('the relevant `.pi/*` runtime files before implementation');
    expect(result.cogneeBridge).toContain('snapshot-pi-native-cognee.apps.compute.lan');
    expect(result.cogneeBridge).toContain('snapshot-pi-native-knowledge');
    expect(result.cogneeBridge).toContain('snapshot-pi-native-patterns');
    expect(result.cogneeBrief).toContain('exec "$BRIDGE" brief "$@"');
    expect(result.syncArtifactsScript).toContain('context.md');
    expect(result.syncArtifactsScript).toContain('Cognee unavailable - skipping artifact sync');
    expect(result.postCheckoutHook).toContain('scripts/bootstrap-worktree.sh');
    expect(result.serveScript).toContain('run_cmd pnpm test:bdd');
    expect(result.serveScript).toContain('sync-artifacts-to-cognee.sh');
    expect(result.serveScript).toContain('validate_sticky_note');
    expect(result.serveScript).toContain('gh pr create --base dev --head "$branch" --title "$pr_title" --body-file "$PR_BODY_FILE"');
    expect(result.serveScript).toContain('gh pr edit "$existing_pr_number" --body-file "$PR_BODY_FILE"');
    expect(result.serveScript).toContain('Post-serve branch summary:');
    expect(result.promoteScript).toContain('--base main');
    expect(result.promoteScript).toContain('gh pr edit');
    expect(result.promoteScript).toContain('Post-promotion summary:');
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
      result.bakeSkill,
      result.parallelSkill,
      result.subagentWorkflowSkill,
    ]) {
      expectNoLegacyRuntimeReferences(content);
    }
  });
});
