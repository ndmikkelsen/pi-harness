import type { ManagedEntry } from '../core/types.js';
import { loadTemplate } from '../core/template-loader.js';

export function buildPlanningEntries(): ManagedEntry[] {
  return [
    { kind: 'directory', path: '.planning' },
    { kind: 'directory', path: '.planning/phases' },
    { kind: 'directory', path: '.planning/research' },
    { kind: 'directory', path: '.planning/milestones' },
    { kind: 'directory', path: '.planning/codebase' },
    {
      kind: 'file',
      path: '.planning/TRACEABILITY.md',
      content: () => loadTemplate('planning/TRACEABILITY.md')
    },
    {
      kind: 'file',
      path: '.planning/phases/README.md',
      content: () => loadTemplate('planning/phases/README.md')
    },
    {
      kind: 'file',
      path: '.planning/milestones/README.md',
      content: () => loadTemplate('planning/milestones/README.md')
    },
    {
      kind: 'file',
      path: '.planning/research/README.md',
      content: () => loadTemplate('planning/research/README.md')
    },
    {
      kind: 'file',
      path: '.planning/codebase/README.md',
      content: () => loadTemplate('planning/codebase/README.md')
    },
    {
      kind: 'file',
      path: '.planning/config.json',
      content: () => loadTemplate('planning/config.json')
    },
    {
      kind: 'file',
      path: '.planning/PROJECT.md',
      content: (context) => loadTemplate('planning/PROJECT.md', { APP_TITLE: context.appTitle })
    },
    {
      kind: 'file',
      path: '.planning/STATE.md',
      content: (context) =>
        loadTemplate('planning/STATE.md', {
          GENERATED_ON: context.generatedOn
        })
    },
    {
      kind: 'file',
      path: '.planning/ROADMAP.md',
      content: (context) => loadTemplate('planning/ROADMAP.md', { APP_TITLE: context.appTitle })
    }
  ];
}
