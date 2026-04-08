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
