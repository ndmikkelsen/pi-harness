import { readFile } from 'node:fs/promises';
import path from 'node:path';

type CommandContext = {
  cwd: string;
  hasUI: boolean;
  ui: {
    notify(message: string, level?: 'info' | 'warning' | 'error'): void;
    select(title: string, options: string[]): Promise<string | null>;
    setStatus(id: string, value?: string): void;
    setWidget(id: string, value?: string[]): void;
  };
  sessionManager: {
    getEntries(): Array<{ type: string; customType?: string; data?: unknown }>;
  };
};

type ExtensionAPI = {
  on(
    event: 'before_agent_start' | 'session_start',
    handler: (event: any, ctx: CommandContext) => Promise<any> | any,
  ): void;
  registerCommand(
    name: string,
    options: {
      description?: string;
      handler: (args: string, ctx: CommandContext) => Promise<void> | void;
    },
  ): void;
  registerShortcut(
    shortcut: string,
    options: {
      description?: string;
      handler: (ctx: CommandContext) => Promise<void> | void;
    },
  ): void;
  getAllTools(): Array<{ name: string }>;
  setActiveTools(names: string[]): void;
  setThinkingLevel(level: 'off' | 'minimal' | 'low' | 'medium' | 'high' | 'xhigh'): void;
  appendEntry(customType: string, data?: unknown): void;
};

type ThinkingLevel = 'off' | 'minimal' | 'low' | 'medium' | 'high' | 'xhigh';

type CapabilityToolProfile = {
  tools?: string[];
  packages?: string[];
  purpose?: string;
};

type CapabilityModelProfile = {
  purpose?: string;
  runtimeSelection?: string;
};

type WorkflowSettings = {
  capabilityProfiles?: {
    toolProfiles?: Record<string, CapabilityToolProfile>;
    modelProfiles?: Record<string, CapabilityModelProfile>;
  };
};

type RoleConfig = {
  name: string;
  description: string;
  body: string;
  tools: string[];
  skills: string[];
  thinking?: ThinkingLevel;
  toolProfile?: string;
  modelProfile?: string;
};

const ROLE_ORDER = ['lead', 'explore', 'plan', 'build', 'review'] as const;
const ROLE_ALIASES: Record<string, string> = {
  sisyphus: 'lead',
  prometheus: 'plan',
  hephaestus: 'build',
  oracle: 'review',
};
const STATE_ENTRY = 'role-workflow-state';
const TLDR_GUIDANCE = `TLDR
- Put the main answer first.
- After the main answer, always include a section labeled \`Summary\`.
- After \`Summary\`, always include a section labeled \`TLDR\`.
- Keep \`TLDR\` shorter than \`Summary\`.
- Keep \`TLDR\` as the final section at the very bottom of the response.
- Prefer concise, direct responses by default.
- Expand only when the user asks for more detail or the risk warrants it.`;

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await readFile(targetPath, 'utf8');
    return true;
  } catch {
    return false;
  }
}

async function findPiRoot(startCwd: string): Promise<string | null> {
  let current = path.resolve(startCwd);

  while (true) {
    const candidate = path.join(current, '.pi');
    if (await pathExists(path.join(candidate, 'settings.json'))) {
      return candidate;
    }

    const parent = path.dirname(current);
    if (parent === current) {
      return null;
    }
    current = parent;
  }
}

function parseFrontmatter(markdown: string): { frontmatter: Record<string, string>; body: string } {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    return { frontmatter: {}, body: markdown.trim() };
  }

  const rawFrontmatter = match[1] ?? '';
  const body = (match[2] ?? '').trim();
  const frontmatter: Record<string, string> = {};

  for (const line of rawFrontmatter.split('\n')) {
    const frontmatterMatch = line.match(/^([\w-]+):\s*(.*)$/);
    if (!frontmatterMatch) {
      continue;
    }
    frontmatter[frontmatterMatch[1]!.trim()] = frontmatterMatch[2]!.trim();
  }

  return { frontmatter, body };
}

function parseCsv(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

async function loadSkillBlocks(piRoot: string, skillNames: string[]): Promise<string[]> {
  const blocks: string[] = [];

  for (const skillName of skillNames) {
    const skillPath = path.join(piRoot, 'skills', skillName, 'SKILL.md');
    try {
      const content = await readFile(skillPath, 'utf8');
      const { body } = parseFrontmatter(content);
      blocks.push(`<skill name="${skillName}">\n${body}\n</skill>`);
    } catch {
      blocks.push(`<skill name="${skillName}">\nMissing skill file: ${skillPath}\n</skill>`);
    }
  }

  return blocks;
}

async function loadWorkflowSettings(piRoot: string): Promise<WorkflowSettings> {
  const settingsPath = path.join(piRoot, 'settings.json');

  try {
    const raw = await readFile(settingsPath, 'utf8');
    const parsed = JSON.parse(raw) as WorkflowSettings;
    return parsed ?? {};
  } catch {
    return {};
  }
}

async function loadRoles(piRoot: string): Promise<RoleConfig[]> {
  const roles: RoleConfig[] = [];

  for (const roleName of ROLE_ORDER) {
    const rolePath = path.join(piRoot, 'agents', `${roleName}.md`);
    const content = await readFile(rolePath, 'utf8');
    const { frontmatter, body } = parseFrontmatter(content);
    const thinking = frontmatter.thinking as ThinkingLevel | undefined;

    roles.push({
      name: frontmatter.name ?? roleName,
      description: frontmatter.description ?? roleName,
      body,
      tools: parseCsv(frontmatter.tools),
      skills: parseCsv(frontmatter.skill || frontmatter.skills),
      thinking,
      toolProfile: frontmatter.toolProfile,
      modelProfile: frontmatter.modelProfile,
    });
  }

  return roles;
}

function resolveRoleName(requested: string): string {
  const normalized = requested.trim();
  return ROLE_ALIASES[normalized] ?? normalized;
}

function unique(items: string[]): string[] {
  return [...new Set(items)];
}

export default function registerRoleWorkflow(pi: ExtensionAPI): void {
  let piRoot: string | null = null;
  let roles: RoleConfig[] = [];
  let activeRoleName = 'lead';
  let workflowSettings: WorkflowSettings = {};

  function currentRole(): RoleConfig | undefined {
    return roles.find((role) => role.name === activeRoleName);
  }

  function currentToolProfiles(): Record<string, CapabilityToolProfile> {
    return workflowSettings.capabilityProfiles?.toolProfiles ?? {};
  }

  function currentModelProfiles(): Record<string, CapabilityModelProfile> {
    return workflowSettings.capabilityProfiles?.modelProfiles ?? {};
  }

  function resolveToolProfile(role: RoleConfig | undefined): CapabilityToolProfile | undefined {
    if (!role?.toolProfile) {
      return undefined;
    }

    return currentToolProfiles()[role.toolProfile];
  }

  function resolveModelProfile(role: RoleConfig | undefined): CapabilityModelProfile | undefined {
    if (!role?.modelProfile) {
      return undefined;
    }

    return currentModelProfiles()[role.modelProfile];
  }

  function requestedTools(role: RoleConfig | undefined): string[] {
    if (!role) {
      return [];
    }

    const profileTools = normalizeStringArray(resolveToolProfile(role)?.tools);
    return unique([...profileTools, ...role.tools]);
  }

  function persistRole(): void {
    const role = currentRole();
    pi.appendEntry(STATE_ENTRY, {
      name: activeRoleName,
      toolProfile: role?.toolProfile,
      modelProfile: role?.modelProfile,
    });
  }

  function applyRoleState(ctx: CommandContext): void {
    const role = currentRole();
    const availableTools = new Set(pi.getAllTools().map((tool) => tool.name));
    const requested = requestedTools(role);
    const validTools = requested.filter((tool) => availableTools.has(tool));
    const missingTools = requested.filter((tool) => !availableTools.has(tool));

    if (validTools.length > 0) {
      pi.setActiveTools(validTools);
    }

    if (role?.thinking) {
      pi.setThinkingLevel(role.thinking);
    }

    if (ctx.hasUI) {
      const toolProfile = role?.toolProfile ?? 'explicit-tools';
      const modelProfile = role?.modelProfile ?? 'runtime-default';
      ctx.ui.setStatus('role-workflow', `role:${activeRoleName} | model:${modelProfile} | tools:${toolProfile}`);
      ctx.ui.setWidget('role-workflow');

      if (missingTools.length > 0) {
        ctx.ui.notify(
          `Role ${activeRoleName} is missing runtime tools for profile ${toolProfile}: ${missingTools.join(', ')}`,
          'warning',
        );
      }
    }
  }

  function cycleRole(step: number, ctx: CommandContext): void {
    if (roles.length === 0) {
      if (ctx.hasUI) {
        ctx.ui.notify('No project roles are available in .pi/agents/*.md', 'warning');
      }
      return;
    }

    const currentIndex = Math.max(
      0,
      roles.findIndex((role) => role.name === activeRoleName),
    );
    const nextIndex = (currentIndex + step + roles.length) % roles.length;
    activeRoleName = roles[nextIndex]!.name;
    applyRoleState(ctx);
    persistRole();

    if (ctx.hasUI) {
      ctx.ui.notify(`Active role: ${activeRoleName}`, 'info');
    }
  }

  async function selectRole(ctx: CommandContext): Promise<void> {
    if (!ctx.hasUI) {
      return;
    }

    const options = roles.map((role) => `${role.name}${role.name === activeRoleName ? ' (active)' : ''}`);
    const choice = await ctx.ui.select('Select workflow role', options);
    if (!choice) {
      return;
    }

    const selectedName = resolveRoleName(choice.replace(' (active)', '').trim());
    activeRoleName = selectedName;
    applyRoleState(ctx);
    persistRole();
    ctx.ui.notify(`Active role: ${activeRoleName}`, 'info');
  }

  function capabilityPrompt(role: RoleConfig): string {
    const toolProfile = resolveToolProfile(role);
    const modelProfile = resolveModelProfile(role);
    const resolvedTools = requestedTools(role);

    const lines = [
      'WORKFLOW CAPABILITY PROFILE',
      `- modelProfile: ${role.modelProfile ?? 'runtime-default'}`,
      `- toolProfile: ${role.toolProfile ?? 'explicit-tools'}`,
      `- resolvedTools: ${resolvedTools.length > 0 ? resolvedTools.join(', ') : 'default-runtime-tools'}`,
      '- model/provider binding must stay in Pi runtime configuration, not scaffold files.',
    ];

    if (modelProfile?.purpose) {
      lines.push(`- modelProfilePurpose: ${modelProfile.purpose}`);
    }
    if (modelProfile?.runtimeSelection) {
      lines.push(`- runtimeSelection: ${modelProfile.runtimeSelection}`);
    }
    if (toolProfile?.purpose) {
      lines.push(`- toolProfilePurpose: ${toolProfile.purpose}`);
    }
    if (toolProfile?.packages && toolProfile.packages.length > 0) {
      lines.push(`- toolProfilePackages: ${toolProfile.packages.join(', ')}`);
    }

    return lines.join('\n');
  }

  pi.registerCommand('role', {
    description: 'Show or switch the active Pi workflow role',
    handler: async (args: string, ctx: CommandContext) => {
      const rawRequested = args.trim();
      if (!rawRequested) {
        await selectRole(ctx);
        return;
      }

      const requested = resolveRoleName(rawRequested);
      const matchedRole = roles.find((role) => role.name === requested);
      if (!matchedRole) {
        if (ctx.hasUI) {
          ctx.ui.notify(`Unknown role: ${requested}. Available: ${roles.map((role) => role.name).join(', ')}`, 'warning');
        }
        return;
      }

      activeRoleName = matchedRole.name;
      applyRoleState(ctx);
      persistRole();
      if (ctx.hasUI) {
        ctx.ui.notify(`Active role: ${activeRoleName}`, 'info');
      }
    },
  });

  pi.registerCommand('next-role', {
    description: 'Cycle to the next workflow role',
    handler: async (_args: string, ctx: CommandContext) => {
      cycleRole(1, ctx);
    },
  });

  pi.registerCommand('prev-role', {
    description: 'Cycle to the previous workflow role',
    handler: async (_args: string, ctx: CommandContext) => {
      cycleRole(-1, ctx);
    },
  });

  pi.registerShortcut('ctrl+.', {
    description: 'Cycle to the next workflow role',
    handler: async (ctx: CommandContext) => {
      cycleRole(1, ctx);
    },
  });

  pi.registerShortcut('ctrl+,', {
    description: 'Cycle to the previous workflow role',
    handler: async (ctx: CommandContext) => {
      cycleRole(-1, ctx);
    },
  });

  pi.on('session_start', async (_event, ctx) => {
    piRoot = await findPiRoot(ctx.cwd);
    if (!piRoot) {
      return;
    }

    workflowSettings = await loadWorkflowSettings(piRoot);

    try {
      roles = await loadRoles(piRoot);
    } catch (error) {
      roles = [];
      if (ctx.hasUI) {
        const message = error instanceof Error ? error.message : String(error);
        ctx.ui.notify(`Role workflow unavailable: ${message}`, 'warning');
      }
      return;
    }

    const previousState = ctx.sessionManager
      .getEntries()
      .filter((entry) => entry.type === 'custom' && entry.customType === STATE_ENTRY)
      .pop() as { data?: { name?: string } } | undefined;

    const restoredRoleName = previousState?.data?.name ? resolveRoleName(previousState.data.name) : undefined;

    if (restoredRoleName && roles.some((role) => role.name === restoredRoleName)) {
      activeRoleName = restoredRoleName;
    } else if (roles.some((role) => role.name === 'lead')) {
      activeRoleName = 'lead';
    } else if (roles.length > 0) {
      activeRoleName = roles[0]!.name;
    }

    applyRoleState(ctx);
  });

  pi.on('before_agent_start', async (event) => {
    if (!piRoot) {
      return;
    }

    const role = currentRole();
    if (!role) {
      return;
    }

    const skillBlocks = await loadSkillBlocks(piRoot, role.skills);
    const capabilityBlock = capabilityPrompt(role);

    return {
      systemPrompt: `${event.systemPrompt}\n\nACTIVE WORKFLOW ROLE: ${role.name}\n${capabilityBlock}\n${skillBlocks.join('\n\n')}\n\n${role.body}\n\n${TLDR_GUIDANCE}`,
    };
  });
}
