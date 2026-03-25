import type { ManagedEntry } from '../core/types.js';
import { loadTemplate } from '../core/template-loader.js';

function settings(): string {
  return loadTemplate('claude/settings.json');
}

function checkUpdateHook(): string {
  return loadTemplate('claude/hooks/gsd-check-update.js');
}

function statusLineHook(): string {
  return loadTemplate('claude/hooks/gsd-statusline.js');
}

function cogneeBridge(contextAppSlug: string): string {
  return loadTemplate('claude/scripts/cognee-bridge.sh', {
    APP_SLUG: contextAppSlug
  });
}

function cogneePlanningSync(contextAppSlug: string): string {
  return loadTemplate('claude/scripts/cognee-sync-planning.sh', {
    APP_SLUG: contextAppSlug
  });
}

function syncToCognee(contextAppSlug: string): string {
  return loadTemplate('claude/scripts/sync-to-cognee.sh', {
    APP_SLUG: contextAppSlug
  });
}

function beadsProxy(): string {
  return loadTemplate('claude/scripts/bd');
}

function claudeIndex(contextAppTitle: string, contextAppSlug: string): string {
  return loadTemplate('claude/INDEX.md', {
    APP_TITLE: contextAppTitle,
    APP_SLUG: contextAppSlug
  });
}

function worktreeHook(): string {
  return loadTemplate('claude/scripts/worktree-hook.sh');
}

function bootstrapWorktree(): string {
  return loadTemplate('claude/scripts/bootstrap-worktree.sh');
}

function readTemplate(templatePath: string): string {
  return loadTemplate(templatePath);
}

export function buildClaudeEntries(): ManagedEntry[] {
  return [
    { kind: 'directory', path: '.claude' },
    { kind: 'directory', path: '.claude/hooks' },
    { kind: 'directory', path: '.claude/scripts' },
    { kind: 'directory', path: '.claude/docker' },
    { kind: 'directory', path: '.claude/commands' },
    { kind: 'directory', path: '.claude/agents' },
    { kind: 'directory', path: '.agents' },
    { kind: 'directory', path: 'scripts/hooks' },
    { kind: 'file', path: '.claude/settings.json', content: () => settings() },
    {
      kind: 'file',
      path: '.claude/hooks/gsd-check-update.js',
      content: () => checkUpdateHook(),
      executable: true
    },
    {
      kind: 'file',
      path: '.claude/hooks/gsd-statusline.js',
      content: () => statusLineHook(),
      executable: true
    },
    {
      kind: 'file',
      path: '.claude/scripts/cognee-bridge.sh',
      content: (context) => cogneeBridge(context.appSlug),
      executable: true
    },
    {
      kind: 'file',
      path: '.claude/scripts/bd',
      content: () => beadsProxy(),
      executable: true
    },
    {
      kind: 'file',
      path: '.claude/scripts/cognee-sync-planning.sh',
      content: (context) => cogneePlanningSync(context.appSlug),
      executable: true
    },
    {
      kind: 'file',
      path: '.claude/scripts/sync-to-cognee.sh',
      content: (context) => syncToCognee(context.appSlug),
      executable: true
    },
    {
      kind: 'file',
      path: '.claude/scripts/bootstrap-worktree.sh',
      content: () => bootstrapWorktree(),
      executable: true
    },
    {
      kind: 'file',
      path: '.claude/docker/Dockerfile.cognee',
      content: () => loadTemplate('claude/docker/Dockerfile.cognee')
    },
    {
      kind: 'file',
      path: '.claude/commands/land.md',
      content: () => readTemplate('claude/commands/land.md')
    },
    {
      kind: 'file',
      path: '.claude/commands/polish.md',
      content: () => readTemplate('claude/commands/polish.md')
    },
    {
      kind: 'file',
      path: '.claude/commands/scrutinize.md',
      content: () => readTemplate('claude/commands/scrutinize.md')
    },
    {
      kind: 'file',
      path: '.claude/commands/review.md',
      content: () => readTemplate('claude/commands/review.md')
    },
    {
      kind: 'file',
      path: '.claude/commands/deploy.md',
      content: () => readTemplate('claude/commands/deploy.md')
    },
    {
      kind: 'file',
      path: '.claude/commands/query.md',
      content: () => readTemplate('claude/commands/query.md')
    },
    {
      kind: 'file',
      path: '.claude/commands/verify-stack.md',
      content: () => readTemplate('claude/commands/verify-stack.md')
    },
    {
      kind: 'file',
      path: '.claude/agents/README.md',
      content: () => readTemplate('claude/agents/README.md')
    },
    {
      kind: 'file',
      path: '.claude/agents/gsd-cognee-advisor.md',
      content: () => readTemplate('claude/agents/gsd-cognee-advisor.md')
    },
    {
      kind: 'file',
      path: '.claude/agents/reviewer.md',
      content: () => readTemplate('claude/agents/reviewer.md')
    },
    {
      kind: 'file',
      path: '.claude/INDEX.md',
      content: (context) => claudeIndex(context.appTitle, context.appSlug)
    },
    {
      kind: 'file',
      path: '.claude/agents/scaffold-developer.md',
      content: () => readTemplate('claude/agents/scaffold-developer.md')
    },
    {
      kind: 'file',
      path: '.agents/README.md',
      content: () => readTemplate('agents/README.md')
    },
    {
      kind: 'file',
      path: '.agents/scaffold-developer.md',
      content: () => readTemplate('agents/scaffold-developer.md')
    },
    {
      kind: 'file',
      path: '.agents/gsd-cognee-advisor.md',
      content: () => readTemplate('agents/gsd-cognee-advisor.md')
    },
    {
      kind: 'file',
      path: '.agents/reviewer.md',
      content: () => readTemplate('agents/reviewer.md')
    },
    { kind: 'file', path: 'scripts/hooks/post-checkout', content: () => worktreeHook(), executable: true }
  ];
}
