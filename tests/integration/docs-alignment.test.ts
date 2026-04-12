import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

async function readRepoFile(...segments: string[]): Promise<string> {
  return readFile(path.join(repoRoot, ...segments), 'utf8');
}

function normalizeDoc(content: string): string {
  return content.replace(/\r\n/g, '\n');
}

function renderTemplate(content: string, values: Record<string, string>): string {
  return Object.entries(values).reduce(
    (rendered, [key, value]) => rendered.replaceAll(`{{${key}}}`, value),
    content,
  );
}

function slugifyTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function expectNoLegacyRuntimeReferences(content: string): void {
  expect(content).not.toContain('.omp/');
  expect(content).not.toContain('.codex/');
  expect(content).not.toContain('.rules/');
  expect(content).not.toContain('--assistant');
  expect(content).not.toContain('AssistantTarget');
  expect(content).not.toContain('.opencode/worktree.jsonc');
  expect(content).not.toContain('.rules/patterns/omo-agent-contract.md');
  expect(content).not.toContain('/gsd-');
}

describe('workflow docs alignment', () => {
  it('keeps Pi runtime template surfaces aligned with dogfooded root files', async () => {
    const literalRuntimeSurfaces = [
      { sourcePath: ['src', 'templates', 'pi', 'AGENTS.md'], targetPath: ['AGENTS.md'] },
      { sourcePath: ['src', 'templates', 'pi', 'settings.json'], targetPath: ['.pi', 'settings.json'] },
      { sourcePath: ['src', 'templates', 'pi', 'mcp.json'], targetPath: ['.pi', 'mcp.json'] },
      { sourcePath: ['src', 'templates', 'pi', 'SYSTEM.md'], targetPath: ['.pi', 'SYSTEM.md'] },
      {
        sourcePath: ['src', 'templates', 'pi', 'agents', 'lead.md'],
        targetPath: ['.pi', 'agents', 'lead.md'],
      },
      {
        sourcePath: ['src', 'templates', 'pi', 'agents', 'explore.md'],
        targetPath: ['.pi', 'agents', 'explore.md'],
      },
      {
        sourcePath: ['src', 'templates', 'pi', 'agents', 'plan.md'],
        targetPath: ['.pi', 'agents', 'plan.md'],
      },
      {
        sourcePath: ['src', 'templates', 'pi', 'agents', 'build.md'],
        targetPath: ['.pi', 'agents', 'build.md'],
      },
      {
        sourcePath: ['src', 'templates', 'pi', 'agents', 'review.md'],
        targetPath: ['.pi', 'agents', 'review.md'],
      },
      {
        sourcePath: ['src', 'templates', 'pi', 'agents', 'plan-change.chain.md'],
        targetPath: ['.pi', 'agents', 'plan-change.chain.md'],
      },
      {
        sourcePath: ['src', 'templates', 'pi', 'agents', 'ship-change.chain.md'],
        targetPath: ['.pi', 'agents', 'ship-change.chain.md'],
      },
      {
        sourcePath: ['src', 'templates', 'pi', 'extensions', 'repo-workflows.ts'],
        targetPath: ['.pi', 'extensions', 'repo-workflows.ts'],
      },
      {
        sourcePath: ['src', 'templates', 'pi', 'extensions', 'role-workflow.ts'],
        targetPath: ['.pi', 'extensions', 'role-workflow.ts'],
      },
      { sourcePath: ['src', 'templates', 'pi', 'prompts', 'adopt.md'], targetPath: ['.pi', 'prompts', 'adopt.md'] },
      { sourcePath: ['src', 'templates', 'pi', 'prompts', 'serve.md'], targetPath: ['.pi', 'prompts', 'serve.md'] },
      { sourcePath: ['src', 'templates', 'pi', 'prompts', 'promote.md'], targetPath: ['.pi', 'prompts', 'promote.md'] },
      { sourcePath: ['src', 'templates', 'pi', 'prompts', 'triage.md'], targetPath: ['.pi', 'prompts', 'triage.md'] },
      { sourcePath: ['src', 'templates', 'pi', 'prompts', 'plan-change.md'], targetPath: ['.pi', 'prompts', 'plan-change.md'] },
      { sourcePath: ['src', 'templates', 'pi', 'prompts', 'ship-change.md'], targetPath: ['.pi', 'prompts', 'ship-change.md'] },
      { sourcePath: ['src', 'templates', 'pi', 'prompts', 'parallel-wave.md'], targetPath: ['.pi', 'prompts', 'parallel-wave.md'] },
      { sourcePath: ['src', 'templates', 'pi', 'prompts', 'review-change.md'], targetPath: ['.pi', 'prompts', 'review-change.md'] },
      { sourcePath: ['src', 'templates', 'pi', 'prompts', 'feat-change.md'], targetPath: ['.pi', 'prompts', 'feat-change.md'] },
      {
        sourcePath: ['src', 'templates', 'pi', 'skills', 'beads', 'SKILL.md'],
        targetPath: ['.pi', 'skills', 'beads', 'SKILL.md'],
      },
      {
        sourcePath: ['src', 'templates', 'pi', 'skills', 'cognee', 'SKILL.md'],
        targetPath: ['.pi', 'skills', 'cognee', 'SKILL.md'],
      },
      {
        sourcePath: ['src', 'templates', 'pi', 'skills', 'red-green-refactor', 'SKILL.md'],
        targetPath: ['.pi', 'skills', 'red-green-refactor', 'SKILL.md'],
      },
      {
        sourcePath: ['src', 'templates', 'pi', 'skills', 'bake', 'SKILL.md'],
        targetPath: ['.pi', 'skills', 'bake', 'SKILL.md'],
      },
      {
        sourcePath: ['src', 'templates', 'pi', 'skills', 'parallel-wave-design', 'SKILL.md'],
        targetPath: ['.pi', 'skills', 'parallel-wave-design', 'SKILL.md'],
      },
      {
        sourcePath: ['src', 'templates', 'pi', 'skills', 'subagent-workflow', 'SKILL.md'],
        targetPath: ['.pi', 'skills', 'subagent-workflow', 'SKILL.md'],
      },
      {
        sourcePath: ['src', 'templates', 'pi', 'scripts', 'bootstrap-worktree.sh'],
        targetPath: ['scripts', 'bootstrap-worktree.sh'],
      },
      { sourcePath: ['src', 'templates', 'pi', 'scripts', 'cognee-brief.sh'], targetPath: ['scripts', 'cognee-brief.sh'] },
      { sourcePath: ['src', 'templates', 'pi', 'scripts', 'serve.sh'], targetPath: ['scripts', 'serve.sh'] },
      { sourcePath: ['src', 'templates', 'pi', 'scripts', 'promote.sh'], targetPath: ['scripts', 'promote.sh'] },
      { sourcePath: ['src', 'templates', 'root', 'pre-commit.yaml'], targetPath: ['.pre-commit-config.yaml'] },
      { sourcePath: ['src', 'templates', 'pi', 'docker', 'Dockerfile.cognee'], targetPath: ['docker', 'Dockerfile.cognee'] },
    ] as const;

    for (const surface of literalRuntimeSurfaces) {
      const sourceContent = normalizeDoc(await readRepoFile(...surface.sourcePath));
      const targetContent = normalizeDoc(await readRepoFile(...surface.targetPath));
      expect(targetContent).toBe(sourceContent);
    }

    const rootReadme = normalizeDoc(await readRepoFile('README.md'));
    const rootTitleMatch = rootReadme.match(/^# (.+)$/m);
    expect(rootTitleMatch).toBeTruthy();

    const renderedCogneeBridge = renderTemplate(
      normalizeDoc(await readRepoFile('src', 'templates', 'pi', 'scripts', 'cognee-bridge.sh')),
      { APP_SLUG: slugifyTitle(rootTitleMatch![1]) },
    );
    const dogfoodCogneeBridge = normalizeDoc(await readRepoFile('scripts', 'cognee-bridge.sh'));
    const renderedSyncArtifactsScript = renderTemplate(
      normalizeDoc(await readRepoFile('src', 'templates', 'pi', 'scripts', 'sync-artifacts-to-cognee.sh')),
      { APP_SLUG: slugifyTitle(rootTitleMatch![1]) },
    );
    const dogfoodSyncArtifactsScript = normalizeDoc(await readRepoFile('scripts', 'sync-artifacts-to-cognee.sh'));

    expect(dogfoodCogneeBridge).toBe(renderedCogneeBridge);
    expect(dogfoodSyncArtifactsScript).toBe(renderedSyncArtifactsScript);
  });

  it('keeps repo-facing docs aligned to the Pi-native baseline', async () => {
    const rootReadme = normalizeDoc(await readRepoFile('README.md'));
    const templateRootReadme = normalizeDoc(await readRepoFile('src', 'templates', 'root', 'README.md'));
    const bakeUsage = normalizeDoc(await readRepoFile('docs', 'bake-usage.md'));
    const agentsGuide = normalizeDoc(await readRepoFile('AGENTS.md'));
    const piSystem = normalizeDoc(await readRepoFile('.pi', 'SYSTEM.md'));
    const leadAgent = normalizeDoc(await readRepoFile('.pi', 'agents', 'lead.md'));
    const workflowExtension = normalizeDoc(await readRepoFile('.pi', 'extensions', 'repo-workflows.ts'));
    const roleWorkflowExtension = normalizeDoc(await readRepoFile('.pi', 'extensions', 'role-workflow.ts'));
    const adoptPrompt = normalizeDoc(await readRepoFile('.pi', 'prompts', 'adopt.md'));
    const servePrompt = normalizeDoc(await readRepoFile('.pi', 'prompts', 'serve.md'));
    const promotePrompt = normalizeDoc(await readRepoFile('.pi', 'prompts', 'promote.md'));
    const triagePrompt = normalizeDoc(await readRepoFile('.pi', 'prompts', 'triage.md'));
    const beadsSkill = normalizeDoc(await readRepoFile('.pi', 'skills', 'beads', 'SKILL.md'));
    const cogneeSkill = normalizeDoc(await readRepoFile('.pi', 'skills', 'cognee', 'SKILL.md'));
    const redGreenRefactorSkill = normalizeDoc(await readRepoFile('.pi', 'skills', 'red-green-refactor', 'SKILL.md'));
    const bakeSkill = normalizeDoc(await readRepoFile('.pi', 'skills', 'bake', 'SKILL.md'));
    const parallelSkill = normalizeDoc(await readRepoFile('.pi', 'skills', 'parallel-wave-design', 'SKILL.md'));
    const subagentWorkflowSkill = normalizeDoc(await readRepoFile('.pi', 'skills', 'subagent-workflow', 'SKILL.md'));

    const rootTitleMatch = rootReadme.match(/^# (.+)$/m);
    const scaffoldLineMatch = rootReadme.match(/Scaffolded with `pi-harness` v([^ ]+) on ([0-9-]+)\./);
    expect(rootTitleMatch).toBeTruthy();
    expect(scaffoldLineMatch).toBeTruthy();

    const renderedRootReadme = renderTemplate(templateRootReadme, {
      APP_TITLE: rootTitleMatch![1],
      HARNESS_VERSION: scaffoldLineMatch![1],
      GENERATED_ON: scaffoldLineMatch![2],
    });

    expect(rootReadme).toBe(renderedRootReadme);

    const migratedDocs = [
      rootReadme,
      templateRootReadme,
      bakeUsage,
      agentsGuide,
      piSystem,
      leadAgent,
      workflowExtension,
      roleWorkflowExtension,
      adoptPrompt,
      servePrompt,
      promotePrompt,
      triagePrompt,
      beadsSkill,
      cogneeSkill,
      redGreenRefactorSkill,
      bakeSkill,
      parallelSkill,
      subagentWorkflowSkill,
    ];

    for (const doc of migratedDocs) {
      expectNoLegacyRuntimeReferences(doc);
    }

    expect(templateRootReadme).toContain('This project is scaffolded for vanilla Pi with Beads, Cognee, and plain repo scripts.');
    expect(templateRootReadme).toContain('native `bd` with `.beads/**`');
    expect(rootReadme).toContain('Shared subagent support comes from the `pi-subagents` Pi package declared in `.pi/settings.json`, while project-local role switching comes from `.pi/extensions/role-workflow.ts`.');
    expect(rootReadme).toContain('This scaffold also declares `npm:pi-mcp-adapter` in `.pi/settings.json` and preconfigures a project-local GitHub MCP server in `.pi/mcp.json`.');
    expect(rootReadme).toContain('`pnpm install:local` installs the `pi-harness` launcher in `~/.local/bin` and a thin user-global Pi `/bake` extension in `~/.pi/agent/extensions/pi-harness-bake/`.');
    expect(rootReadme).toContain('That user-global `/bake` surface is the setup and refresh entrypoint for repos at every stage: it auto-detects `new` vs `existing`, delegates into `pi-harness`, and refreshes existing repos with curated legacy AI-scaffolding cleanup.');
    expect(rootReadme).toContain('After a repo is baked, repo-local authority lives in `AGENTS.md`, `.pi/*`, `scripts/*`, and native Beads state. Keep using the user-global `/bake` surface when you want Pi to run setup or refresh flows, use `/skill:bake` when you want the same contract explained from inside the repo, do not expect any scaffolded local prompt or shell fallback for bake, and keep `/adopt` only as the conservative compatibility path.');
    expect(rootReadme).not.toContain('repo-local `/bake` command');
    expect(rootReadme).not.toContain('scripts/bake.sh');
    expect(rootReadme).toContain('Run `bd init` once in the repository before using Beads.');
    expect(rootReadme).toContain('Use the user-global `/bake` surface for native setup and refreshes, and use `.pi/skills/bake/SKILL.md` or `/skill:bake` when you want the same contract explained before execution.');
    expect(rootReadme).toContain('./scripts/promote.sh');
    expect(rootReadme).toContain('/mcp');
    expect(rootReadme).toContain('pnpm test:bdd');
    expect(bakeUsage).toContain('1. **User-global execution.** Install `pi-harness` from a local checkout on your machine so any repo can use `/bake` before or after repo-local `.pi/*` files exist.');
    expect(bakeUsage).toContain('2. **Repo-local explanation after bake.** Once a repo is scaffolded, the generated `AGENTS.md`, `.pi/*`, `scripts/*`, and native Beads state become the canonical workflow authority for that repository, while `/skill:bake` explains how that repo expects setup and refresh work to happen.');
    expect(bakeUsage).toContain('The user-global layer should stay thin. It exists to route `/bake` into the right `pi-harness` flow for the target repository');
    expect(bakeUsage).toContain('`.pi/skills/bake/SKILL.md` explains the repo-local setup/refresh contract and points users back to the user-global `/bake` surface when they want execution');
    expect(bakeUsage).not.toContain('repo-local `/bake` command');
    expect(bakeUsage).not.toContain('scripts/bake.sh');
    expect(agentsGuide).toContain('Workflow authority lives in this file, `.pi/*`, native Beads state, and repo-local handoff notes.');
    expect(agentsGuide).toContain('.pi/agents/*');
    expect(agentsGuide).toContain('/role <name>');
    expect(agentsGuide).toContain(
      'Use `.pi/skills/bake/SKILL.md`, `.pi/skills/beads/SKILL.md`, `.pi/skills/cognee/SKILL.md`, `.pi/skills/red-green-refactor/SKILL.md`, `.pi/skills/parallel-wave-design/SKILL.md`, and `.pi/skills/subagent-workflow/SKILL.md` when the task matches.',
    );
    expect(agentsGuide).toContain('Only execution or autonomous serving lanes should run `./scripts/serve.sh`.');
    expect(agentsGuide).toContain('Only execution or autonomous release lanes should run `./scripts/promote.sh`.');
    expect(agentsGuide).toContain("Treat plain-language publish requests like `let's serve the dish`, `serve the pi`, `serve this branch`, `ship it`, or `publish the branch` as intent to use `/serve` or `./scripts/serve.sh` when the lane is allowed to publish.");
    expect(piSystem).toContain('Use `AGENTS.md` as the primary project instruction file.');
    expect(piSystem).toContain(
      'Prefer project-local `.pi/agents/*`, `.pi/extensions/*`, `.pi/prompts/*`, `.pi/skills/*`, and `scripts/*` before inventing ad hoc workflow glue.',
    );
    expect(piSystem).toContain("Treat plain-language publish requests like `let's serve the dish`, `serve the pi`, `serve this branch`, `ship it`, or `publish the branch` as `/serve` intent when the current lane is allowed to publish.");
    expect(workflowExtension).toContain('Keep `/bake`, `/serve`, and `/promote` out of repo-local extensions.');
    expect(workflowExtension).not.toContain("registerCommand('bake'");
    expect(workflowExtension).not.toContain('scripts/bake.sh');
    expect(adoptPrompt).toContain('Use this prompt when you need the conservative existing-repo refresh path or a compatibility alias for older baked-repo notes.');
    expect(adoptPrompt).toContain('For baked repos, prefer the user-global `/bake` command for execution and `/skill:bake` when you want the contract explained first.');
    expect(adoptPrompt).toContain('Preserve existing-repo conservatism: customize only `createdPaths` by default and do not rewrite preserved scaffold files unless the user explicitly asks.');
    expect(servePrompt).toContain('Fill in or refresh the local `STICKYNOTE.md` before serving; it must stay untracked, differ from `STICKYNOTE.example.md`, and include a completed-work summary under `## Completed This Session`.');
    expect(servePrompt).toContain('Use `/serve` as the canonical Pi-native entrypoint and let it drive `./scripts/serve.sh --commit-message "<message>"` when publish is allowed.');
    expect(servePrompt).toContain('Confirm the explicit PR description/body that serving will create or refresh from `STICKYNOTE.md`, and make sure it includes the completed-work summary you want reviewers to see.');
    expect(servePrompt).toContain("Treat plain-language requests like `let's serve the dish`, `serve the pi`, `serve this branch`, `ship it`, or `publish the branch` as intent to run the same `/serve` workflow when publishing is allowed in the current lane.");
    expect(servePrompt).toContain('Keep `/serve` prompt-native; do not shadow it with a project-local extension command.');
    expect(servePrompt).toContain('Serving refreshes the PR body for both new and existing PRs; do not rely on `gh pr create --fill` or a stale body.');
    expect(servePrompt).toContain('`scripts/serve.sh` must never merge into or push directly to `main`.');
    expect(servePrompt).toContain('./scripts/promote.sh');
    expect(promotePrompt).toContain('Use `/promote` as the canonical Pi-native entrypoint');
    expect(promotePrompt).toContain('PR to `main`');
    expect(promotePrompt).toContain('refreshes the PR body');
    expect(triagePrompt).toContain('Start from `bd ready --json` when Beads is available.');
    expect(beadsSkill).toContain('1. `bd ready --json`');
    expect(cogneeSkill).toContain('knowledge garden');
    expect(redGreenRefactorSkill).toContain('pnpm test:bdd');
    expect(beadsSkill).toContain(
      '5. close the issue only after verification passes: `bd close <id> --reason "Verified: <evidence>" --json`',
    );
    expect(bakeSkill).toContain('user-global `/bake` command or repo-local `/skill:bake` guidance');
    expect(bakeSkill).toContain('--cleanup-confirm-all');
    expect(bakeSkill).toContain(
      'pi-harness --mode existing --force --cleanup-manifest legacy-ai-frameworks-v1 --cleanup-confirm-all --init-json',
    );
    expect(bakeSkill).toContain('3. `.pi/mcp.json`');
    expect(bakeSkill).toContain('4. `.pi/extensions/role-workflow.ts`');
    expect(bakeSkill).toContain('Cognee brief if `scripts/cognee-brief.sh` already exists');
    expect(bakeSkill).toContain('6. `.pi/agents/*.chain.md`');
    expect(bakeSkill).toContain('8. `.pi/prompts/adopt.md`');
    expect(bakeSkill).toContain('Do not add a repo-local `.pi/prompts/bake.md`; keep `/bake` global-only and `/skill:bake` as the repo-local explain-first surface.');
    expect(leadAgent).toContain('Primary workflow lead for the repository\'s Pi role system');
    expect(leadAgent).toContain('Builtin agents like `scout`, `planner`, `worker`, and `reviewer` are acceptable fallbacks');
    expect(roleWorkflowExtension).toContain("registerShortcut('ctrl+.'");
    expect(roleWorkflowExtension).toContain("registerShortcut('ctrl+,'");
    expect(roleWorkflowExtension).toContain("registerCommand('role'");
    expect(roleWorkflowExtension).toContain('ROLE_ALIASES');
    expect(parallelSkill).toContain('`AGENTS.md` stays the canonical runtime instruction file.');
    expect(parallelSkill).toContain('worktree: true');
    expect(parallelSkill).toContain('- Active Beads issue: bd-...');
    expect(subagentWorkflowSkill).toContain('`lead` owns workflow coordination, routing, and wave shaping.');
  });
});
