import type { ManagedEntry } from '../core/types.js';
import { loadTemplate } from '../core/template-loader.js';

function orchestratorAgent(): string {
  return loadTemplate('omp/agents/orchestrator.md');
}

function parallelWaveDesignSkill(): string {
  return loadTemplate('omp/skills/parallel-wave-design/SKILL.md');
}

export function buildOmpEntries(): ManagedEntry[] {
  return [
    { kind: 'directory', path: '.omp' },
    { kind: 'directory', path: '.omp/agents' },
    { kind: 'directory', path: '.omp/skills' },
    { kind: 'directory', path: '.omp/skills/parallel-wave-design' },
    { kind: 'file', path: '.omp/agents/orchestrator.md', content: () => orchestratorAgent() },
    {
      kind: 'file',
      path: '.omp/skills/parallel-wave-design/SKILL.md',
      content: () => parallelWaveDesignSkill()
    }
  ];
}
