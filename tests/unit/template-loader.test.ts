import { describe, expect, it } from 'vitest';
import path from 'node:path';

import { applyTemplateTokens, loadTemplate, resolveTemplatePath } from '../../src/core/template-loader.js';

describe('template loader', () => {
  it('resolves template files from src/templates', () => {
    const resolved = resolveTemplatePath('template-loader.txt');
    expect(resolved).toContain(path.join('src', 'templates', 'template-loader.txt'));
  });

  it('applies {{TOKEN}} substitution and normalizes newlines', async () => {
    const content = await loadTemplate('template-loader.txt', {
      values: {
        NAME: 'World',
        APP: 'ai-scaffolding'
      }
    });

    expect(content).toBe('Hello World,\nWelcome to ai-scaffolding project!\n{{MISSING}} should stay.\n');
  });

  it('can opt out of trailing newline normalization', async () => {
    const content = await loadTemplate('no-newline.txt', {
      values: { VALUE: 'kept' },
      ensureTrailingNewline: false
    });

    expect(content).toBe('Keep kept');
  });

  it('supports value map with trailing-newline flag', async () => {
    const content = await loadTemplate('template-loader.txt', { VALUE: 'ignored' }, false);

    expect(content).toBe('Hello {{NAME}},\nWelcome to {{ APP }} project!\n{{MISSING}} should stay.');
  });

  it('supports no argument call with zero options', () => {
    const content = loadTemplate('template-loader.txt');

    expect(content).toContain('{{ APP }}');
  });

  it('rejects unsafe template path values', () => {
    expect(() => {
      loadTemplate('../templates/template-loader.txt');
    }).toThrowError('Invalid template path');
  });

  it('preserves unknown placeholders', () => {
    expect(applyTemplateTokens('A {{KNOWN}} B', { KNOWN: 'X' })).toBe('A X B');
  });
});
