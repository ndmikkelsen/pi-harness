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

describe('workflow docs alignment', () => {
  it('keeps canonical workflow files identical across source, dogfood, and dist outputs', async () => {
    const literalWorkflowSurfaces = [
      {
        sourcePath: ['src', 'templates', 'rules', 'patterns', 'operator-workflow.md'],
        mirrorPaths: [
          ['.rules', 'patterns', 'operator-workflow.md'],
          ['dist', 'src', 'templates', 'rules', 'patterns', 'operator-workflow.md'],
          ['dist', 'templates', 'rules', 'patterns', 'operator-workflow.md'],
        ],
      },
      {
        sourcePath: ['src', 'templates', 'codex', 'workflows', 'autonomous-execution.md'],
        mirrorPaths: [
          ['.codex', 'workflows', 'autonomous-execution.md'],
          ['dist', 'src', 'templates', 'codex', 'workflows', 'autonomous-execution.md'],
          ['dist', 'templates', 'codex', 'workflows', 'autonomous-execution.md'],
        ],
      },
    ] as const;

    for (const surface of literalWorkflowSurfaces) {
      const sourceContent = normalizeDoc(await readRepoFile(...surface.sourcePath));

      for (const mirrorPath of surface.mirrorPaths) {
        const mirrorContent = normalizeDoc(await readRepoFile(...mirrorPath));
        expect(mirrorContent).toBe(sourceContent);
      }
    }

    const templateOperatorWorkflow = await readRepoFile(
      'src',
      'templates',
      'rules',
      'patterns',
      'operator-workflow.md',
    );
    expect(templateOperatorWorkflow).toContain('repositories scaffolded with `pi-harness`');
  });

  it('keeps repo-facing docs aligned to the codex-only baseline', async () => {
    const rootReadme = await readRepoFile('README.md');
    const harnessUsage = await readRepoFile('docs', 'harness-usage.md');
    const operatorWorkflow = await readRepoFile('.rules', 'patterns', 'operator-workflow.md');
    const agentsGuide = await readRepoFile('AGENTS.md');
    const codexReadme = await readRepoFile('.codex', 'README.md');
    const autonomousWorkflow = await readRepoFile('.codex', 'workflows', 'autonomous-execution.md');
    const templateAgentsGuide = await readRepoFile('src', 'templates', 'codex', 'AGENTS.md');
    const templateCodexReadme = await readRepoFile('src', 'templates', 'codex', 'README.md');
    const templateRootReadme = await readRepoFile('src', 'templates', 'root', 'README.md');
    const templateAutonomousWorkflow = await readRepoFile(
      'src',
      'templates',
      'codex',
      'workflows',
      'autonomous-execution.md',
    );
    const orchestratorGuide = await readRepoFile('.codex', 'agents', 'orchestrator.md');
    const templateOrchestratorGuide = await readRepoFile(
      'src',
      'templates',
      'codex',
      'agents',
      'orchestrator.md',
    );

    const migratedDocs = [
      rootReadme,
      harnessUsage,
      agentsGuide,
      codexReadme,
      templateAgentsGuide,
      templateCodexReadme,
      templateRootReadme,
      autonomousWorkflow,
      templateAutonomousWorkflow,
    ];

    for (const doc of migratedDocs) {
      expect(doc).not.toContain('/gsd-next');
      expect(doc).not.toContain('/gsd-discuss-phase');
      expect(doc).not.toContain('/gsd-plan-phase');
      expect(doc).not.toContain('/gsd-execute-phase');
      expect(doc).not.toContain('/gsd-verify-work');
      expect(doc).not.toContain('/gsd-autonomous');
      expect(doc).not.toContain('/gsd-resume-work');
      expect(doc).not.toContain('~/.gsd/defaults.json');
      expect(doc).not.toContain('.rules/patterns/omo-agent-contract.md');
      expect(doc).not.toContain('.opencode/worktree.jsonc');
      expect(doc).not.toContain('install-skill --assistant opencode');
      expect(doc).not.toContain('./.codex/scripts/cognee-sync-planning.sh');
      expect(doc).not.toContain('./.codex/scripts/sync-planning-to-cognee.sh');
    }

    expect(rootReadme).toContain('Pi-operated Codex workflow with Beads and Cognee');
    expect(rootReadme).toContain('Review AGENTS.md and .codex/README.md for runtime entrypoints and scaffold maintenance notes.');
    expect(harnessUsage).toContain('Pi-operated Codex workflow with Beads and Cognee');
    expect(harnessUsage).toContain('Use `.rules/patterns/operator-workflow.md` for the daily Beads + Cognee loop.');
    expect(harnessUsage).toContain('## Seeding Cognee datasets when briefs are empty');
    expect(agentsGuide).toContain('### Beads + Cognee Loop');
    expect(agentsGuide).toContain('Planning, research, and review lanes must hand off instead of publishing.');
    expect(codexReadme).toContain('should use them directly from Pi');
    expect(codexReadme).toContain('APP_SLUG=<app-slug>');
    expect(codexReadme).not.toContain('| Planning sync |');
    if (codexReadme.includes('.planning/')) {
      expect(codexReadme).toContain('planning-sync surfaces stay cleanup-only');
    }
    expect(operatorWorkflow).toContain('if you are in an execution/autonomous landing lane, finish the branch with `./.codex/scripts/land.sh`');
    expect(autonomousWorkflow).toContain('planning, research, or review lanes must stop with a handoff instead of publishing');
    expect(templateAgentsGuide).toContain('inside Pi');
    expect(templateCodexReadme).toContain('should use them directly from Pi');
    expect(templateCodexReadme).toContain('APP_SLUG=<app-slug>');
    expect(templateCodexReadme).not.toContain('| Planning sync |');
    if (templateCodexReadme.includes('.planning/')) {
      expect(templateCodexReadme).toContain('planning-sync surfaces stay cleanup-only');
    }
    expect(templateRootReadme).toContain('Pi-operated {{ASSISTANT_LABEL}} workflow with Beads and Cognee');
    expect(templateAutonomousWorkflow).toContain('continue only when the work remains locally verifiable');
    expect(orchestratorGuide).toContain('Generate a Cognee brief before major planning or research, and consume the latest brief during execution when one exists');
    expect(templateOrchestratorGuide).toContain('Generate a Cognee brief before major planning or research, and consume the latest brief during execution when one exists');
  });
});
