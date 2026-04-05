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
      {
        sourcePath: ['src', 'templates', 'codex', 'workflows', 'parallel-execution.md'],
        mirrorPaths: [
          ['.codex', 'workflows', 'parallel-execution.md'],
          ['dist', 'src', 'templates', 'codex', 'workflows', 'parallel-execution.md'],
          ['dist', 'templates', 'codex', 'workflows', 'parallel-execution.md'],
        ],
      },
      {
        sourcePath: ['src', 'templates', 'omp', 'agents', 'orchestrator.md'],
        mirrorPaths: [
          ['.omp', 'agents', 'orchestrator.md'],
          ['dist', 'src', 'templates', 'omp', 'agents', 'orchestrator.md'],
          ['dist', 'templates', 'omp', 'agents', 'orchestrator.md'],
        ],
      },
      {
        sourcePath: ['src', 'templates', 'omp', 'skills', 'parallel-wave-design', 'SKILL.md'],
        mirrorPaths: [
          ['.omp', 'skills', 'parallel-wave-design', 'SKILL.md'],
          ['dist', 'src', 'templates', 'omp', 'skills', 'parallel-wave-design', 'SKILL.md'],
          ['dist', 'templates', 'omp', 'skills', 'parallel-wave-design', 'SKILL.md'],
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
    const templateParallelWorkflow = await readRepoFile(
      'src',
      'templates',
      'codex',
      'workflows',
      'parallel-execution.md',
    );
    const templateOmpOrchestrator = await readRepoFile(
      'src',
      'templates',
      'omp',
      'agents',
      'orchestrator.md',
    );
    const templateOmpSkill = await readRepoFile(
      'src',
      'templates',
      'omp',
      'skills',
      'parallel-wave-design',
      'SKILL.md',
    );

    expect(templateOperatorWorkflow).toContain('repositories scaffolded with `pi-harness`');
    expect(templateParallelWorkflow).toContain('3-5 files');
    expect(templateOmpOrchestrator).toContain('name: orchestrator');
    expect(templateOmpSkill).toContain('name: parallel-wave-design');
  });

  it('keeps repo-facing docs aligned to the hybrid Pi-native baseline', async () => {
    const rootReadme = await readRepoFile('README.md');
    const harnessUsage = await readRepoFile('docs', 'harness-usage.md');
    const operatorWorkflow = await readRepoFile('.rules', 'patterns', 'operator-workflow.md');
    const agentsGuide = await readRepoFile('AGENTS.md');
    const codexReadme = await readRepoFile('.codex', 'README.md');
    const autonomousWorkflow = await readRepoFile('.codex', 'workflows', 'autonomous-execution.md');
    const parallelWorkflow = await readRepoFile('.codex', 'workflows', 'parallel-execution.md');
    const ompOrchestrator = await readRepoFile('.omp', 'agents', 'orchestrator.md');
    const ompSkill = await readRepoFile('.omp', 'skills', 'parallel-wave-design', 'SKILL.md');
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
    const templateParallelWorkflow = await readRepoFile(
      'src',
      'templates',
      'codex',
      'workflows',
      'parallel-execution.md',
    );
    const orchestratorGuide = await readRepoFile('.codex', 'agents', 'orchestrator.md');
    const templateOrchestratorGuide = await readRepoFile(
      'src',
      'templates',
      'codex',
      'agents',
      'orchestrator.md',
    );
    const templateOmpOrchestrator = await readRepoFile(
      'src',
      'templates',
      'omp',
      'agents',
      'orchestrator.md',
    );
    const templateOmpSkill = await readRepoFile(
      'src',
      'templates',
      'omp',
      'skills',
      'parallel-wave-design',
      'SKILL.md',
    );

    const migratedDocs = [
      rootReadme,
      harnessUsage,
      agentsGuide,
      codexReadme,
      autonomousWorkflow,
      parallelWorkflow,
      ompOrchestrator,
      ompSkill,
      templateAgentsGuide,
      templateCodexReadme,
      templateRootReadme,
      templateAutonomousWorkflow,
      templateParallelWorkflow,
      templateOrchestratorGuide,
      templateOmpOrchestrator,
      templateOmpSkill,
      orchestratorGuide,
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

    expect(rootReadme).toContain('Pi-operated Codex workflow with Beads, Cognee, and Pi-native orchestration assets');
    expect(rootReadme).toContain('Review AGENTS.md, `.omp/`, and `.codex/README.md` for workflow authority, Pi-native assets, and compatibility maintenance notes.');
    expect(harnessUsage).toContain('Pi-operated Codex workflow with Beads, Cognee, and Pi-native orchestration assets');
    expect(harnessUsage).toContain('.omp/agents/*.md');
    expect(harnessUsage).toContain('## Seeding Cognee datasets when briefs are empty');
    expect(agentsGuide).toContain('.omp/agents/*.md');
    expect(agentsGuide).toContain('Planning, research, and review lanes must hand off instead of publishing.');
    expect(codexReadme).toContain('should use them directly from Pi through this compatibility layer');
    expect(codexReadme).toContain('.omp/agents/orchestrator.md');
    expect(codexReadme).toContain('.omp/skills/parallel-wave-design/SKILL.md');
    expect(codexReadme).toContain('APP_SLUG=<app-slug>');
    expect(operatorWorkflow).toContain('if you are in an execution/autonomous landing lane, finish the branch with `./.codex/scripts/land.sh`');
    expect(autonomousWorkflow).toContain('planning, research, or review lanes must stop with a handoff instead of publishing');
    expect(parallelWorkflow).toContain('3-5 files');
    expect(parallelWorkflow).toContain('task `context`');
    expect(parallelWorkflow).toContain('isolated: true');
    expect(ompOrchestrator).toContain('name: orchestrator');
    expect(ompOrchestrator).toContain('skill://parallel-wave-design');
    expect(ompSkill).toContain('name: parallel-wave-design');
    expect(ompSkill).toContain('task `context`');
    expect(templateAgentsGuide).toContain('.omp/agents/*.md');
    expect(templateCodexReadme).toContain('.omp/agents/orchestrator.md');
    expect(templateCodexReadme).toContain('.omp/skills/parallel-wave-design/SKILL.md');
    expect(templateRootReadme).toContain('Pi-operated {{ASSISTANT_LABEL}} workflow with Beads, Cognee, and Pi-native orchestration assets');
    expect(templateAutonomousWorkflow).toContain('continue only when the work remains locally verifiable');
    expect(templateParallelWorkflow).toContain('3-5 files');
    expect(orchestratorGuide).toContain('.omp/agents/orchestrator.md');
    expect(orchestratorGuide).toContain('3-5 files');
    expect(templateOrchestratorGuide).toContain('.omp/agents/orchestrator.md');
    expect(templateOrchestratorGuide).toContain('3-5 files');
    expect(templateOmpOrchestrator).toContain('name: orchestrator');
    expect(templateOmpSkill).toContain('name: parallel-wave-design');
  });
});
