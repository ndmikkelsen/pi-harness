import type { ManagedEntry } from '../core/types.js';
import { loadTemplate } from '../core/template-loader.js';

function template(templatePath: string, values: Record<string, string> = {}): string {
  return loadTemplate(templatePath, values);
}

export function buildPiEntries(): ManagedEntry[] {
  return [
    { kind: 'directory', path: '.pi' },
    { kind: 'directory', path: '.pi/agents' },
    { kind: 'directory', path: '.pi/extensions' },
    { kind: 'directory', path: '.pi/prompts' },
    { kind: 'directory', path: '.pi/skills' },
    { kind: 'directory', path: '.pi/skills/beads' },
    { kind: 'directory', path: '.pi/skills/bake' },
    { kind: 'directory', path: '.pi/skills/bake/references' },
    { kind: 'directory', path: '.pi/skills/bake/assets' },
    { kind: 'directory', path: '.pi/skills/cognee' },
    { kind: 'directory', path: '.pi/skills/red-green-refactor' },
    { kind: 'directory', path: '.pi/skills/parallel-wave-design' },
    { kind: 'directory', path: '.pi/skills/subagent-workflow' },
    { kind: 'directory', path: 'docker' },
    { kind: 'file', path: 'AGENTS.md', content: () => template('pi/AGENTS.md') },
    { kind: 'file', path: '.pi/settings.json', content: () => template('pi/settings.json') },
    { kind: 'file', path: '.pi/mcp.json', content: () => template('pi/mcp.json') },
    { kind: 'file', path: '.pi/SYSTEM.md', content: () => template('pi/SYSTEM.md') },
    { kind: 'file', path: '.pi/agents/lead.md', content: () => template('pi/agents/lead.md') },
    { kind: 'file', path: '.pi/agents/explore.md', content: () => template('pi/agents/explore.md') },
    { kind: 'file', path: '.pi/agents/plan.md', content: () => template('pi/agents/plan.md') },
    { kind: 'file', path: '.pi/agents/build.md', content: () => template('pi/agents/build.md') },
    { kind: 'file', path: '.pi/agents/review.md', content: () => template('pi/agents/review.md') },
    { kind: 'file', path: '.pi/agents/plan-change.chain.md', content: () => template('pi/agents/plan-change.chain.md') },
    { kind: 'file', path: '.pi/agents/ship-change.chain.md', content: () => template('pi/agents/ship-change.chain.md') },
    {
      kind: 'file',
      path: '.pi/extensions/repo-workflows.ts',
      content: () => template('pi/extensions/repo-workflows.ts'),
    },
    {
      kind: 'file',
      path: '.pi/extensions/role-workflow.ts',
      content: () => template('pi/extensions/role-workflow.ts'),
    },
    { kind: 'file', path: '.pi/prompts/adopt.md', content: () => template('pi/prompts/adopt.md') },
    { kind: 'file', path: '.pi/prompts/serve.md', content: () => template('pi/prompts/serve.md') },
    { kind: 'file', path: '.pi/prompts/promote.md', content: () => template('pi/prompts/promote.md') },
    { kind: 'file', path: '.pi/prompts/triage.md', content: () => template('pi/prompts/triage.md') },
    { kind: 'file', path: '.pi/prompts/plan-change.md', content: () => template('pi/prompts/plan-change.md') },
    { kind: 'file', path: '.pi/prompts/ship-change.md', content: () => template('pi/prompts/ship-change.md') },
    { kind: 'file', path: '.pi/prompts/parallel-wave.md', content: () => template('pi/prompts/parallel-wave.md') },
    { kind: 'file', path: '.pi/prompts/review-change.md', content: () => template('pi/prompts/review-change.md') },
    { kind: 'file', path: '.pi/prompts/feat-change.md', content: () => template('pi/prompts/feat-change.md') },
    { kind: 'file', path: '.pi/skills/beads/SKILL.md', content: () => template('pi/skills/beads/SKILL.md') },
    { kind: 'file', path: '.pi/skills/cognee/SKILL.md', content: () => template('pi/skills/cognee/SKILL.md') },
    { kind: 'file', path: '.pi/skills/red-green-refactor/SKILL.md', content: () => template('pi/skills/red-green-refactor/SKILL.md') },
    { kind: 'file', path: '.pi/skills/bake/SKILL.md', content: () => template('pi/skills/bake/SKILL.md') },
    {
      kind: 'file',
      path: '.pi/skills/bake/references/pi-harness-command-matrix.md',
      content: () => template('pi/skills/bake/references/pi-harness-command-matrix.md'),
    },
    {
      kind: 'file',
      path: '.pi/skills/bake/references/existing-repo-context-checklist.md',
      content: () => template('pi/skills/bake/references/existing-repo-context-checklist.md'),
    },
    {
      kind: 'file',
      path: '.pi/skills/bake/references/scaffold-customization-map.md',
      content: () => template('pi/skills/bake/references/scaffold-customization-map.md'),
    },
    {
      kind: 'file',
      path: '.pi/skills/bake/references/manifest-discovery.md',
      content: () => template('pi/skills/bake/references/manifest-discovery.md'),
    },
    {
      kind: 'file',
      path: '.pi/skills/bake/assets/adoption-notes-template.md',
      content: () => template('pi/skills/bake/assets/adoption-notes-template.md'),
    },
    {
      kind: 'file',
      path: '.pi/skills/parallel-wave-design/SKILL.md',
      content: () => template('pi/skills/parallel-wave-design/SKILL.md'),
    },
    {
      kind: 'file',
      path: '.pi/skills/subagent-workflow/SKILL.md',
      content: () => template('pi/skills/subagent-workflow/SKILL.md'),
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
      path: 'scripts/sync-artifacts-to-cognee.sh',
      content: (context) => template('pi/scripts/sync-artifacts-to-cognee.sh', { APP_SLUG: context.appSlug }),
      executable: true,
    },
    {
      kind: 'file',
      path: 'scripts/serve.sh',
      content: () => template('pi/scripts/serve.sh'),
      executable: true,
    },
    {
      kind: 'file',
      path: 'scripts/promote.sh',
      content: () => template('pi/scripts/promote.sh'),
      executable: true,
    },
    {
      kind: 'file',
      path: 'docker/Dockerfile.cognee',
      content: () => template('pi/docker/Dockerfile.cognee'),
    },
  ];
}
