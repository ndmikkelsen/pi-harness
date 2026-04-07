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
      { sourcePath: ['src', 'templates', 'pi', 'prompts', 'land.md'], targetPath: ['.pi', 'prompts', 'land.md'] },
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
        sourcePath: ['src', 'templates', 'pi', 'skills', 'harness', 'SKILL.md'],
        targetPath: ['.pi', 'skills', 'harness', 'SKILL.md'],
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
      { sourcePath: ['src', 'templates', 'pi', 'scripts', 'land.sh'], targetPath: ['scripts', 'land.sh'] },
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

    expect(dogfoodCogneeBridge).toBe(renderedCogneeBridge);
  });

  it('keeps repo-facing docs aligned to the Pi-native baseline', async () => {
    const rootReadme = normalizeDoc(await readRepoFile('README.md'));
    const templateRootReadme = normalizeDoc(await readRepoFile('src', 'templates', 'root', 'README.md'));
    const harnessUsage = normalizeDoc(await readRepoFile('docs', 'harness-usage.md'));
    const agentsGuide = normalizeDoc(await readRepoFile('AGENTS.md'));
    const piSystem = normalizeDoc(await readRepoFile('.pi', 'SYSTEM.md'));
    const leadAgent = normalizeDoc(await readRepoFile('.pi', 'agents', 'lead.md'));
    const roleWorkflowExtension = normalizeDoc(await readRepoFile('.pi', 'extensions', 'role-workflow.ts'));
    const adoptPrompt = normalizeDoc(await readRepoFile('.pi', 'prompts', 'adopt.md'));
    const landPrompt = normalizeDoc(await readRepoFile('.pi', 'prompts', 'land.md'));
    const triagePrompt = normalizeDoc(await readRepoFile('.pi', 'prompts', 'triage.md'));
    const beadsSkill = normalizeDoc(await readRepoFile('.pi', 'skills', 'beads', 'SKILL.md'));
    const cogneeSkill = normalizeDoc(await readRepoFile('.pi', 'skills', 'cognee', 'SKILL.md'));
    const redGreenRefactorSkill = normalizeDoc(await readRepoFile('.pi', 'skills', 'red-green-refactor', 'SKILL.md'));
    const harnessSkill = normalizeDoc(await readRepoFile('.pi', 'skills', 'harness', 'SKILL.md'));
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
      harnessUsage,
      agentsGuide,
      piSystem,
      leadAgent,
      roleWorkflowExtension,
      adoptPrompt,
      landPrompt,
      triagePrompt,
      beadsSkill,
      cogneeSkill,
      redGreenRefactorSkill,
      harnessSkill,
      parallelSkill,
      subagentWorkflowSkill,
    ];

    for (const doc of migratedDocs) {
      expectNoLegacyRuntimeReferences(doc);
    }

    expect(templateRootReadme).toContain('This project is scaffolded for vanilla Pi with Beads, Cognee, and plain repo scripts.');
    expect(templateRootReadme).toContain('native `bd` with `.beads/**`');
    expect(rootReadme).toContain('Shared subagent support comes from the `pi-subagents` Pi package declared in `.pi/settings.json`, while project-local role switching comes from `.pi/extensions/role-workflow.ts`.');
    expect(rootReadme).toContain('Run `bd init` once in the repository before using Beads.');
    expect(rootReadme).toContain('Use `.pi/skills/harness/SKILL.md` when adopting or bootstrapping another repository.');
    expect(rootReadme).toContain('pnpm test:bdd');
    expect(rootReadme).toContain('Use `Ctrl+.`, `Ctrl+,`, `/role <name>`, `/next-role`, or `/prev-role` to switch the active main-session workflow role.');
    expect(rootReadme).toContain('Use `/feat-change`, `/plan-change`, `/ship-change`, `/parallel-wave`, or `/review-change` for common role-based flows.');
    expect(harnessUsage).toContain(
      'The supported runtime is provider-agnostic and built around `AGENTS.md`, `.pi/*`, plain repo scripts, Beads, and optional Cognee acceleration.',
    );
    expect(harnessUsage).toContain('What gets created:');
    expect(harnessUsage).toContain('- `AGENTS.md`');
    expect(harnessUsage).toContain('- `.pi/*`');
    expect(harnessUsage).toContain('- `scripts/*`');
    expect(agentsGuide).toContain('Workflow authority lives in this file, `.pi/*`, native Beads state, and repo-local handoff notes.');
    expect(agentsGuide).toContain('.pi/agents/*');
    expect(agentsGuide).toContain('/role <name>');
    expect(agentsGuide).toContain(
      'Use `.pi/skills/harness/SKILL.md`, `.pi/skills/beads/SKILL.md`, `.pi/skills/cognee/SKILL.md`, `.pi/skills/red-green-refactor/SKILL.md`, `.pi/skills/parallel-wave-design/SKILL.md`, and `.pi/skills/subagent-workflow/SKILL.md` when the task matches.',
    );
    expect(agentsGuide).toContain('Only execution or autonomous landing lanes should run `./scripts/land.sh`.');
    expect(piSystem).toContain('Use `AGENTS.md` as the primary project instruction file.');
    expect(piSystem).toContain(
      'Prefer project-local `.pi/agents/*`, `.pi/extensions/*`, `.pi/prompts/*`, `.pi/skills/*`, and `scripts/*` before inventing ad hoc workflow glue.',
    );
    expect(adoptPrompt).toContain('existing `AGENTS.md` or `.pi/*` runtime files');
    expect(landPrompt).toContain('Use `/land` or run `./scripts/land.sh`.');
    expect(landPrompt).toContain('`scripts/land.sh` must never merge into or push directly to `main`.');
    expect(triagePrompt).toContain('Start from `bd ready --json` when Beads is available.');
    expect(beadsSkill).toContain('1. `bd ready --json`');
    expect(cogneeSkill).toContain('knowledge garden');
    expect(redGreenRefactorSkill).toContain('pnpm test:bdd');
    expect(beadsSkill).toContain(
      '5. close the issue only after verification passes: `bd close <id> --reason "Verified: <evidence>" --json`',
    );
    expect(harnessSkill).toContain(
      'run `pi-harness --mode existing . --init-json` so you can distinguish `createdPaths` from `skippedPaths`',
    );
    expect(harnessSkill).toContain('3. `.pi/extensions/role-workflow.ts`');
    expect(harnessSkill).toContain('Cognee brief if `scripts/cognee-brief.sh` already exists');
    expect(harnessSkill).toContain('5. `.pi/agents/*.chain.md`');
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
