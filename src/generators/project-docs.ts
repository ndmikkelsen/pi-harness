import type { ManagedEntry } from '../core/types.js';
import { isCodexCompatibleAssistant } from '../core/assistant.js';
import { loadTemplate } from '../core/template-loader.js';

function claudeWorkflowSection(): string {
  return loadTemplate('project-docs/claude-workflow-section.md');
}

export function buildProjectDocEntries(): ManagedEntry[] {
  return [
    {
      kind: 'file',
      path: 'CLAUDE.md',
      content: (context) =>
        loadTemplate('project-docs/CLAUDE.md', {
          APP_TITLE: context.appTitle,
          COMPATIBILITY_LINE:
            isCodexCompatibleAssistant(context.assistant)
              ? `${context.assistant === 'opencode' ? 'OpenCode' : 'Codex'} compatibility is also available through .codex/ and AGENTS.md, while the shared backend automation remains under .claude/scripts/.`
              : '',
          WORKFLOW_SECTION: claudeWorkflowSection().trim()
        }),
      merge: (existingContent) => {
        const section = claudeWorkflowSection();
        if (existingContent.includes('## AI Workflow Scaffold')) {
          return null;
        }

        const base = existingContent.endsWith('\n') ? existingContent : `${existingContent}\n`;
        return `${base}\n${section}`;
      }
    },
    {
      kind: 'file',
      path: 'CONSTITUTION.md',
      content: (context) =>
        loadTemplate('project-docs/CONSTITUTION.md', {
          APP_TITLE: context.appTitle
        })
    },
    {
      kind: 'file',
      path: 'VISION.md',
      content: (context) =>
        loadTemplate('project-docs/VISION.md', {
          APP_TITLE: context.appTitle
        })
    },
    {
      kind: 'file',
      path: 'STICKYNOTE.example.md',
      content: (context) =>
        loadTemplate('project-docs/STICKYNOTE.md', {
          APP_TITLE: context.appTitle,
          GENERATED_ON: context.generatedOn
        })
    },
    {
      kind: 'file',
      path: 'STICKYNOTE.md',
      content: (context) =>
        loadTemplate('project-docs/STICKYNOTE.md', {
          APP_TITLE: context.appTitle,
          GENERATED_ON: context.generatedOn
        })
    }
  ];
}
