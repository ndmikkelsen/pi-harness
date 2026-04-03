import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('OMO docs alignment', () => {
  it('keeps landing guidance lane-aware across repo-facing docs', async () => {
    const rootReadme = await readFile(path.join(process.cwd(), 'README.md'), 'utf8');
    const harnessUsage = await readFile(path.join(process.cwd(), 'docs', 'harness-usage.md'), 'utf8');
    const operatorWorkflow = await readFile(path.join(process.cwd(), '.rules', 'patterns', 'operator-workflow.md'), 'utf8');
    const agentsGuide = await readFile(path.join(process.cwd(), 'AGENTS.md'), 'utf8');
    const autonomousWorkflow = await readFile(
      path.join(process.cwd(), '.codex', 'workflows', 'autonomous-execution.md'),
      'utf8'
    );
    const cogneeGuide = await readFile(path.join(process.cwd(), '.rules', 'patterns', 'cognee-gsd-integration.md'), 'utf8');
    const omoContract = await readFile(path.join(process.cwd(), '.rules', 'patterns', 'omo-agent-contract.md'), 'utf8');
    const templateAgentsGuide = await readFile(path.join(process.cwd(), 'src', 'templates', 'codex', 'AGENTS.md'), 'utf8');
    const templateAutonomousWorkflow = await readFile(
      path.join(process.cwd(), 'src', 'templates', 'codex', 'workflows', 'autonomous-execution.md'),
      'utf8'
    );
    const templateCogneeGuide = await readFile(
      path.join(process.cwd(), 'src', 'templates', 'rules', 'patterns', 'cognee-gsd-integration.md'),
      'utf8'
    );
    const orchestratorGuide = await readFile(path.join(process.cwd(), '.codex', 'agents', 'orchestrator.md'), 'utf8');
    const templateOrchestratorGuide = await readFile(
      path.join(process.cwd(), 'src', 'templates', 'codex', 'agents', 'orchestrator.md'),
      'utf8'
    );
    const templateOmoContract = await readFile(
      path.join(process.cwd(), 'src', 'templates', 'rules', 'patterns', 'omo-agent-contract.md'),
      'utf8'
    );

    expect(rootReadme).toContain('execution/autonomous landing lane runs `./.codex/scripts/land.sh`');
    expect(rootReadme).not.toContain('\n./.codex/scripts/land.sh\n');
    expect(harnessUsage).toContain('execution/autonomous landing lane runs `./.codex/scripts/land.sh`');
    expect(harnessUsage).not.toContain('\n./.codex/scripts/land.sh\n');
    expect(harnessUsage).toContain('planning, research, and review lanes should hand off instead of publishing');
    expect(operatorWorkflow).toContain('If you are in an execution/autonomous landing lane, finish the branch with `./.codex/scripts/land.sh`');
    expect(operatorWorkflow).not.toContain('Finish the branch with `./.codex/scripts/land.sh`');
    expect(agentsGuide).toContain('When ending an execution/autonomous landing session');
    expect(agentsGuide).toContain('Planning, research, and review lanes must hand off instead of pushing or publishing.');
    expect(autonomousWorkflow).toContain('planning, research, or review lanes must stop with a handoff instead of publishing');
    expect(cogneeGuide).toContain('for a quick knowledge brief before planning or research');
    expect(cogneeGuide).not.toContain('for a quick knowledge brief before planning or implementation');
    expect(omoContract).toContain('never publish from planning, research, or review lanes');
    expect(templateAgentsGuide).toContain('Planning, research, and review lanes must hand off instead of publishing.');
    expect(templateAutonomousWorkflow).toContain('planning, research, or review lanes must stop with a handoff instead of publishing');
    expect(templateCogneeGuide).toContain('for a quick knowledge brief before planning or research');
    expect(templateCogneeGuide).not.toContain('for a quick knowledge brief before planning or implementation');
    expect(orchestratorGuide).toContain('Generate a Cognee brief before major planning or research, and consume the latest brief during execution when one exists');
    expect(orchestratorGuide).not.toContain('Generate a Cognee brief before major planning or execution');
    expect(templateOrchestratorGuide).toContain('Generate a Cognee brief before major planning or research, and consume the latest brief during execution when one exists');
    expect(templateOrchestratorGuide).not.toContain('Generate a Cognee brief before major planning or execution');
    expect(templateOmoContract).toContain('never publish from planning, research, or review lanes');
  });
});
