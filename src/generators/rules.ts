import type { ManagedEntry } from '../core/types.js';
import { loadTemplate } from '../core/template-loader.js';

function indexContent(contextAppTitle: string): string {
  return loadTemplate('rules/index.md', {
    APP_TITLE: contextAppTitle
  });
}

function gitWorkflow(): string {
  return loadTemplate('rules/patterns/git-workflow.md');
}

function operatorWorkflow(): string {
  return loadTemplate('rules/patterns/operator-workflow.md');
}

function beadsIntegration(): string {
  return loadTemplate('rules/patterns/beads-integration.md');
}


function envSecurity(): string {
  return loadTemplate('rules/patterns/env-security.md');
}

function deploymentPatterns(): string {
  return loadTemplate('rules/patterns/deployment.md');
}

function bddWorkflow(): string {
  return loadTemplate('rules/patterns/bdd-workflow.md');
}

export function buildRuleEntries(): ManagedEntry[] {
  return [
    { kind: 'directory', path: '.rules' },
    { kind: 'directory', path: '.rules/architecture' },
    { kind: 'directory', path: '.rules/patterns' },
    {
      kind: 'file',
      path: '.rules/index.md',
      content: (context) => indexContent(context.appTitle)
    },
    {
      kind: 'file',
      path: '.rules/patterns/operator-workflow.md',
      content: () => operatorWorkflow()
    },
    {
      kind: 'file',
      path: '.rules/patterns/git-workflow.md',
      content: () => gitWorkflow()
    },
    {
      kind: 'file',
      path: '.rules/patterns/env-security.md',
      content: () => envSecurity()
    },
    {
      kind: 'file',
      path: '.rules/patterns/deployment.md',
      content: () => deploymentPatterns()
    },
    {
      kind: 'file',
      path: '.rules/patterns/bdd-workflow.md',
      content: () => bddWorkflow()
    },
    {
      kind: 'file',
      path: '.rules/patterns/beads-integration.md',
      content: () => beadsIntegration()
    },
  ];
}
