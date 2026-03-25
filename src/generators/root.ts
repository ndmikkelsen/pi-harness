import type { ManagedEntry, ScaffoldContext } from '../core/types.js';
import { assistantDisplayName, isCodexCompatibleAssistant } from '../core/assistant.js';
import { loadTemplate } from '../core/template-loader.js';

function mergeUniqueLines(existingContent: string, generatedContent: string): string | null {
  const existingLines = existingContent.split('\n');
  const generatedLines = generatedContent.split('\n').filter((line) => line.length > 0);
  const seen = new Set(existingLines.map((line) => line.trim()));
  const missingLines = generatedLines.filter((line) => !seen.has(line.trim()));

  if (missingLines.length === 0) {
    return null;
  }

  const base = existingContent.endsWith('\n') ? existingContent : `${existingContent}\n`;
  return `${base}${base.endsWith('\n\n') ? '' : '\n'}${missingLines.join('\n')}\n`;
}

function gitignore(): string {
  return loadTemplate('root/gitignore.md');
}

function gitleaks(context: ScaffoldContext): string {
  return loadTemplate('root/gitleaks.toml', {
    APP_NAME: context.appName
  });
}

function preCommit(): string {
  return loadTemplate('root/pre-commit.yaml');
}

function envExample(context: ScaffoldContext): string {
  return loadTemplate('root/env.example', {
    APP_TITLE: context.appTitle,
    APP_NAME: context.appName,
    APP_SLUG: context.appSlug
  });
}

const scaffoldMarker = '# AI workflow scaffold';

function envExampleMergeBlock(context: ScaffoldContext): string {
  return loadTemplate('root/env.example-append.md', {
    APP_NAME: context.appName,
    APP_SLUG: context.appSlug
  });
}

function envrc(context: ScaffoldContext): string {
  return loadTemplate('root/envrc', {
    APP_VAR: context.appVar
  });
}

function readme(context: ScaffoldContext): string {
  const assistantLabel = assistantDisplayName(context.assistant);
  const codexBullet =
    isCodexCompatibleAssistant(context.assistant)
      ? `- ${context.assistant === 'opencode' ? 'OpenCode' : 'Codex'} compatibility files in .codex/ and AGENTS.md`
      : '';

  return loadTemplate('root/README.md', {
    APP_TITLE: context.appTitle,
    ASSISTANT_LABEL: assistantLabel,
    CODEx_BULLET: codexBullet
  });
}

export function buildRootEntries(): ManagedEntry[] {
  return [
    {
      kind: 'file',
      path: '.gitignore',
      content: () => gitignore(),
      merge: (existingContent) => mergeUniqueLines(existingContent, gitignore())
    },
    { kind: 'file', path: '.gitleaks.toml', content: (context) => gitleaks(context) },
    { kind: 'file', path: '.pre-commit-config.yaml', content: () => preCommit() },
      {
        kind: 'file',
        path: '.env.example',
        content: (context) => envExample(context),
        merge: (existingContent, context) => {
          if (existingContent.includes(scaffoldMarker)) {
            return null;
          }

          const base = existingContent.endsWith('\n') ? existingContent : `${existingContent}\n`;
          return `${base}\n${envExampleMergeBlock(context)}`;
        }
      },
    { kind: 'file', path: '.envrc', content: (context) => envrc(context) },
    { kind: 'file', path: 'README.md', content: (context) => readme(context) }
  ];
}
