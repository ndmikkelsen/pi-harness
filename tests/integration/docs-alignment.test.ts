import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('workflow docs alignment', () => {
  it('keeps repo-facing docs aligned to the codex-only baseline', async () => {
    const rootReadme = await readFile(path.join(process.cwd(), 'README.md'), 'utf8');
    const harnessUsage = await readFile(path.join(process.cwd(), 'docs', 'harness-usage.md'), 'utf8');
    const operatorWorkflow = await readFile(path.join(process.cwd(), '.rules', 'patterns', 'operator-workflow.md'), 'utf8');
    const agentsGuide = await readFile(path.join(process.cwd(), 'AGENTS.md'), 'utf8');
    const codexReadme = await readFile(path.join(process.cwd(), '.codex', 'README.md'), 'utf8');
    const autonomousWorkflow = await readFile(
      path.join(process.cwd(), '.codex', 'workflows', 'autonomous-execution.md'),
      'utf8',
    );
    const templateAgentsGuide = await readFile(path.join(process.cwd(), 'src', 'templates', 'codex', 'AGENTS.md'), 'utf8');
    const templateCodexReadme = await readFile(path.join(process.cwd(), 'src', 'templates', 'codex', 'README.md'), 'utf8');
    const templateRootReadme = await readFile(path.join(process.cwd(), 'src', 'templates', 'root', 'README.md'), 'utf8');
    const templateAutonomousWorkflow = await readFile(
      path.join(process.cwd(), 'src', 'templates', 'codex', 'workflows', 'autonomous-execution.md'),
      'utf8',
    );
    const orchestratorGuide = await readFile(path.join(process.cwd(), '.codex', 'agents', 'orchestrator.md'), 'utf8');
    const templateOrchestratorGuide = await readFile(
      path.join(process.cwd(), 'src', 'templates', 'codex', 'agents', 'orchestrator.md'),
      'utf8',
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
    expect(rootReadme).toContain('Review .rules/patterns/operator-workflow.md, AGENTS.md, and .codex/README.md.');
    expect(harnessUsage).toContain('Pi-operated Codex workflow with Beads and Cognee');
    expect(harnessUsage).toContain('Use the daily Beads + Cognee loop from `.rules/patterns/operator-workflow.md`.');
    expect(agentsGuide).toContain('### Beads + Cognee Loop');
    expect(agentsGuide).toContain('Planning, research, and review lanes must hand off instead of publishing.');
    expect(codexReadme).toContain('should use them directly from Pi');
    expect(codexReadme).not.toContain('| Planning sync |');
    if (codexReadme.includes('.planning/')) {
      expect(codexReadme).toContain('planning-sync surfaces stay cleanup-only');
    }
    expect(operatorWorkflow).toContain('if you are in an execution/autonomous landing lane, finish the branch with `./.codex/scripts/land.sh`');
    expect(autonomousWorkflow).toContain('planning, research, or review lanes must stop with a handoff instead of publishing');
    expect(templateAgentsGuide).toContain('inside Pi');
    expect(templateCodexReadme).toContain('should use them directly from Pi');
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
