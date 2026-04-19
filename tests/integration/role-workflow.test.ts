import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { describe, expect, it } from 'vitest';

type RegisteredHandlers = {
  session_start?: (event: unknown, ctx: any) => Promise<unknown> | unknown;
  before_agent_start?: (event: unknown, ctx: any) => Promise<unknown> | unknown;
};

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

function createCommandContext(cwd = repoRoot) {
  return {
    cwd,
    hasUI: false,
    ui: {
      notify() {},
      select: async () => null,
      setStatus() {},
      setWidget() {},
    },
    sessionManager: {
      getEntries: () => [],
    },
  };
}

describe('role workflow extension', () => {
  it('activates GitHub MCP tools for lead', async () => {
    const { default: registerRoleWorkflow } = await import(
      pathToFileURL(path.join(repoRoot, '.pi', 'extensions', 'role-workflow.ts')).href
    );

    const handlers: RegisteredHandlers = {};
    const activeToolSets: string[][] = [];

    registerRoleWorkflow({
      on(event: keyof RegisteredHandlers, handler: NonNullable<RegisteredHandlers[keyof RegisteredHandlers]>) {
        handlers[event] = handler;
      },
      registerCommand() {},
      registerShortcut() {},
      getAllTools() {
        return [
          { name: 'read' },
          { name: 'grep' },
          { name: 'find' },
          { name: 'ls' },
          { name: 'bash' },
          { name: 'subagent' },
          { name: 'write' },
          { name: 'github_create_issue' },
          { name: 'github_merge_pull_request' },
          { name: 'web_search' },
        ];
      },
      setActiveTools(names: string[]) {
        activeToolSets.push(names);
      },
      setThinkingLevel() {},
      appendEntry() {},
    });

    await handlers.session_start?.({}, createCommandContext());

    expect(activeToolSets).toHaveLength(1);
    expect(activeToolSets[0]).toEqual(
      expect.arrayContaining([
        'read',
        'grep',
        'find',
        'ls',
        'bash',
        'subagent',
        'write',
        'github_create_issue',
        'github_merge_pull_request',
      ]),
    );
    expect(activeToolSets[0]).not.toContain('web_search');
  });
});
