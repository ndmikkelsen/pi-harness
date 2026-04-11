import path from 'node:path';

type CommandContext = {
  cwd: string;
  hasUI: boolean;
  ui: {
    notify(message: string): void;
  };
};

type ExtensionAPI = {
  exec(command: string, args: string[]): Promise<unknown>;
  registerCommand(
    name: string,
    options: {
      description?: string;
      handler: (args: string, ctx: CommandContext) => Promise<void> | void;
    },
  ): void;
};

function parseCommandArgs(input: string): string[] {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return [];
  }

  const args: string[] = [];
  let current = '';
  let quote: 'single' | 'double' | null = null;
  let escaped = false;

  for (const char of trimmed) {
    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }

    if (char === '\\') {
      escaped = true;
      continue;
    }

    if (quote) {
      if ((quote === 'single' && char === "'") || (quote === 'double' && char === '"')) {
        quote = null;
      } else {
        current += char;
      }
      continue;
    }

    if (char === "'") {
      quote = 'single';
      continue;
    }

    if (char === '"') {
      quote = 'double';
      continue;
    }

    if (/\s/.test(char)) {
      if (current.length > 0) {
        args.push(current);
        current = '';
      }
      continue;
    }

    current += char;
  }

  if (escaped) {
    current += '\\';
  }

  if (quote) {
    throw new Error('Unclosed quote in /bake arguments.');
  }

  if (current.length > 0) {
    args.push(current);
  }

  return args;
}

async function runRepoScript(
  pi: ExtensionAPI,
  ctx: CommandContext,
  relativePath: string,
  args: string[] = [],
  successMessage?: string,
): Promise<void> {
  const scriptPath = path.join(ctx.cwd, relativePath);
  await pi.exec('bash', [scriptPath, ...args]);

  if (ctx.hasUI && successMessage) {
    ctx.ui.notify(successMessage);
  }
}

export default function registerRepoWorkflows(pi: ExtensionAPI): void {
  // Keep `/serve` and `/promote` prompt-native in `.pi/prompts/*.md`.
  // Expose repo-local utility commands here when native execution is better than
  // asking users to remember raw shell or CLI flags.
  pi.registerCommand('bake', {
    description: 'Auto-detect new vs existing targets and run scripts/bake.sh with Pi-native defaults',
    handler: async (args: string, ctx: CommandContext) => {
      const parsedArgs = parseCommandArgs(args);
      await runRepoScript(pi, ctx, 'scripts/bake.sh', parsedArgs, 'pi-harness /bake finished.');
    },
  });

  pi.registerCommand('bootstrap-worktree', {
    description: 'Run scripts/bootstrap-worktree.sh for the current checkout',
    handler: async (_args: string, ctx: CommandContext) => {
      await runRepoScript(pi, ctx, 'scripts/bootstrap-worktree.sh', [], 'Worktree bootstrap finished.');
    },
  });

  pi.registerCommand('cognee-brief', {
    description: 'Run scripts/cognee-brief.sh with a single query argument',
    handler: async (args: string, ctx: CommandContext) => {
      const query = args.trim();

      if (query.length === 0) {
        if (ctx.hasUI) {
          ctx.ui.notify('Usage: /cognee-brief <query>');
        }
        return;
      }

      await runRepoScript(pi, ctx, 'scripts/cognee-brief.sh', [query], 'Cognee brief finished.');
    },
  });
}
