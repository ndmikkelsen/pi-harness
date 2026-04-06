import type { ManagedEntry } from '../core/types.js';
import { loadTemplate } from '../core/template-loader.js';

function template(templatePath: string, values: Record<string, string> = {}): string {
  return loadTemplate(templatePath, values);
}

export function buildPiEntries(): ManagedEntry[] {
  return [
    { kind: 'directory', path: '.pi' },
    { kind: 'directory', path: '.pi/extensions' },
    { kind: 'directory', path: '.pi/prompts' },
    { kind: 'directory', path: '.pi/skills' },
    { kind: 'directory', path: '.pi/skills/beads' },
    { kind: 'directory', path: '.pi/skills/harness' },
    { kind: 'directory', path: '.pi/skills/harness/references' },
    { kind: 'directory', path: '.pi/skills/harness/assets' },
    { kind: 'directory', path: '.pi/skills/parallel-wave-design' },
    { kind: 'directory', path: 'docker' },
    { kind: 'file', path: 'AGENTS.md', content: () => template('pi/AGENTS.md') },
    { kind: 'file', path: '.pi/settings.json', content: () => template('pi/settings.json') },
    { kind: 'file', path: '.pi/SYSTEM.md', content: () => template('pi/SYSTEM.md') },
    {
      kind: 'file',
      path: '.pi/extensions/repo-workflows.ts',
      content: () => template('pi/extensions/repo-workflows.ts'),
    },
    { kind: 'file', path: '.pi/prompts/adopt.md', content: () => template('pi/prompts/adopt.md') },
    { kind: 'file', path: '.pi/prompts/land.md', content: () => template('pi/prompts/land.md') },
    { kind: 'file', path: '.pi/prompts/triage.md', content: () => template('pi/prompts/triage.md') },
    { kind: 'file', path: '.pi/skills/beads/SKILL.md', content: () => template('pi/skills/beads/SKILL.md') },
    { kind: 'file', path: '.pi/skills/harness/SKILL.md', content: () => template('pi/skills/harness/SKILL.md') },
    {
      kind: 'file',
      path: '.pi/skills/harness/references/pi-harness-command-matrix.md',
      content: () => template('pi/skills/harness/references/pi-harness-command-matrix.md'),
    },
    {
      kind: 'file',
      path: '.pi/skills/harness/references/existing-repo-context-checklist.md',
      content: () => template('pi/skills/harness/references/existing-repo-context-checklist.md'),
    },
    {
      kind: 'file',
      path: '.pi/skills/harness/references/scaffold-customization-map.md',
      content: () => template('pi/skills/harness/references/scaffold-customization-map.md'),
    },
    {
      kind: 'file',
      path: '.pi/skills/harness/references/manifest-discovery.md',
      content: () => template('pi/skills/harness/references/manifest-discovery.md'),
    },
    {
      kind: 'file',
      path: '.pi/skills/harness/assets/adoption-notes-template.md',
      content: () => template('pi/skills/harness/assets/adoption-notes-template.md'),
    },
    {
      kind: 'file',
      path: '.pi/skills/parallel-wave-design/SKILL.md',
      content: () => template('pi/skills/parallel-wave-design/SKILL.md'),
    },
    {
      kind: 'file',
      path: 'scripts/bootstrap-worktree.sh',
      content: () => template('pi/scripts/bootstrap-worktree.sh'),
      executable: true,
    },
    {
      kind: 'file',
      path: 'scripts/cognee-bridge.sh',
      content: (context) => template('pi/scripts/cognee-bridge.sh', { APP_SLUG: context.appSlug }),
      executable: true,
    },
    {
      kind: 'file',
      path: 'scripts/cognee-brief.sh',
      content: () => template('pi/scripts/cognee-brief.sh'),
      executable: true,
    },
    {
      kind: 'file',
      path: 'scripts/land.sh',
      content: () => template('pi/scripts/land.sh'),
      executable: true,
    },
    {
      kind: 'file',
      path: 'docker/Dockerfile.cognee',
      content: () => template('pi/docker/Dockerfile.cognee'),
    },
  ];
}
