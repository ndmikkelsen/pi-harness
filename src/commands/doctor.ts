import { access, readFile, stat } from 'node:fs/promises';
import fs from 'node:fs';
import path from 'node:path';
import { constants as fsConstants } from 'node:fs';

import { isCodexCompatibleAssistant } from '../core/assistant.js';
import type {
  AssistantSelection,
  AssistantTarget,
  DoctorCommandOptions,
  DoctorGroupResult,
  DoctorIssue,
  DoctorResult,
  ManagedFile,
  ScaffoldContext
} from '../core/types.js';
import { DEFAULT_POLICY } from '../core/policy.js';
import { buildManagedEntries } from '../generators/index.js';

function createDoctorContext(targetDir: string, assistant: AssistantTarget): ScaffoldContext {
  return {
    appName: 'doctor-app',
    appSlug: 'doctor-app',
    appPrefix: 'doctor-app',
    appTitle: 'Doctor App',
    appVar: 'DOCTOR_APP',
    targetDir,
    mode: 'existing',
    assistant,
    doltPort: DEFAULT_POLICY.defaultDoltPort,
    cogneeDbPort: DEFAULT_POLICY.defaultCogneeDbPort,
    computeHost: DEFAULT_POLICY.computeHost,
    computeUser: DEFAULT_POLICY.computeUser,
    sshKeyPath: DEFAULT_POLICY.sshKeyPath,
    registryHost: DEFAULT_POLICY.registryHost,
    generatedOn: '1970-01-01'
  };
}

function fileEntriesForAssistant(targetDir: string, assistant: AssistantTarget): ManagedFile[] {
  return buildManagedEntries(createDoctorContext(targetDir, assistant)).filter(
    (entry): entry is ManagedFile => entry.kind === 'file'
  );
}

function inferAssistant(targetDir: string): AssistantTarget {
  if (fs.existsSync(path.join(targetDir, '.codex')) || fs.existsSync(path.join(targetDir, 'AGENTS.md'))) {
    return 'codex';
  }

  return 'claude';
}

async function fileExists(targetDir: string, relativePath: string): Promise<boolean> {
  try {
    await access(path.join(targetDir, relativePath));
    return true;
  } catch {
    return false;
  }
}

async function readFileIfPresent(targetDir: string, relativePath: string): Promise<string | null> {
  try {
    return await readFile(path.join(targetDir, relativePath), 'utf8');
  } catch {
    return null;
  }
}

async function isExecutable(targetDir: string, relativePath: string): Promise<boolean> {
  try {
    const fileStat = await stat(path.join(targetDir, relativePath));
    return (fileStat.mode & fsConstants.S_IXUSR) !== 0;
  } catch {
    return false;
  }
}

function buildGroupStatus(name: string, issues: { missing?: number; invalid?: number; warnings?: number }): DoctorGroupResult {
  if ((issues.missing ?? 0) > 0 || (issues.invalid ?? 0) > 0) {
    return { name, status: 'fail' };
  }
  if ((issues.warnings ?? 0) > 0) {
    return { name, status: 'warn' };
  }
  return { name, status: 'pass' };
}

export async function runDoctor(options: DoctorCommandOptions): Promise<DoctorResult> {
  const targetDir = path.resolve(options.cwd, options.targetArg ?? '.');
  const assistant = options.assistant === 'auto' ? inferAssistant(targetDir) : options.assistant;

  const sharedEntries = fileEntriesForAssistant(targetDir, 'claude');
  const selectedEntries = fileEntriesForAssistant(targetDir, assistant);
  const sharedPaths = new Set(sharedEntries.map((entry) => entry.path));
  const selectedPaths = new Set(selectedEntries.map((entry) => entry.path));
  const codexPaths = [...selectedPaths].filter((entryPath) => !sharedPaths.has(entryPath));

  const missing: string[] = [];
  const invalid: DoctorIssue[] = [];
  const warnings: DoctorIssue[] = [];

  for (const entry of sharedEntries) {
    if (!(await fileExists(targetDir, entry.path))) {
      missing.push(entry.path);
    }
  }

  if (isCodexCompatibleAssistant(assistant)) {
    for (const entryPath of codexPaths) {
      if (!(await fileExists(targetDir, entryPath))) {
        missing.push(entryPath);
      }
    }
  }

  const gitignore = await readFileIfPresent(targetDir, '.gitignore');
  if (gitignore !== null) {
    if (!gitignore.includes('.kamal/secrets')) {
      invalid.push({ path: '.gitignore', reason: 'missing .kamal/secrets ignore rule' });
    }
    if (!gitignore.includes('.claude/settings.local.json')) {
      invalid.push({ path: '.gitignore', reason: 'missing .claude/settings.local.json ignore rule' });
    }
  }

  const envExample = await readFileIfPresent(targetDir, '.env.example');
  if (envExample !== null) {
    for (const token of ['LLM_API_KEY', 'COGNEE_URL', 'BEADS_DOLT_PASSWORD']) {
      if (!envExample.includes(token)) {
        invalid.push({ path: '.env.example', reason: `missing ${token} scaffold value` });
      }
    }
  }

  const claudeGuide = await readFileIfPresent(targetDir, 'CLAUDE.md');
  if (claudeGuide !== null && !claudeGuide.includes('AI Workflow Scaffold') && !claudeGuide.includes('.rules/patterns/git-workflow.md')) {
    invalid.push({ path: 'CLAUDE.md', reason: 'missing scaffold workflow guidance' });
  }

  if (isCodexCompatibleAssistant(assistant)) {
    const codexBrief = await readFileIfPresent(targetDir, '.codex/scripts/cognee-brief.sh');
    if (codexBrief !== null && !codexBrief.includes('.claude/scripts/cognee-bridge.sh')) {
      invalid.push({ path: '.codex/scripts/cognee-brief.sh', reason: 'missing shared backend reference' });
    }

    const codexSync = await readFileIfPresent(targetDir, '.codex/scripts/sync-planning-to-cognee.sh');
    if (codexSync !== null && !codexSync.includes('.claude/scripts/cognee-sync-planning.sh')) {
      invalid.push({ path: '.codex/scripts/sync-planning-to-cognee.sh', reason: 'missing shared backend reference' });
    }

    const agentsGuide = await readFileIfPresent(targetDir, 'AGENTS.md');
    if (agentsGuide !== null && !agentsGuide.includes('.claude/scripts/')) {
      invalid.push({ path: 'AGENTS.md', reason: 'missing shared backend guidance' });
    }
  }

  for (const entry of selectedEntries.filter((candidate) => candidate.executable)) {
    if (await fileExists(targetDir, entry.path)) {
      if (!(await isExecutable(targetDir, entry.path))) {
        warnings.push({ path: entry.path, reason: 'not executable' });
      }
    }
  }

  const sharedMissingCount = missing.filter((entryPath) => sharedPaths.has(entryPath)).length;
  const codexMissingCount = isCodexCompatibleAssistant(assistant)
    ? missing.filter((entryPath) => codexPaths.includes(entryPath)).length
    : 0;
  const invalidRootCount = invalid.filter((issue) => ['.gitignore', '.env.example', 'CLAUDE.md'].includes(issue.path)).length;
  const invalidCodexCount = invalid.filter((issue) => issue.path.startsWith('.codex/') || issue.path === 'AGENTS.md').length;
  const executableWarningCount = warnings.length;

  const groups: DoctorGroupResult[] = [
    buildGroupStatus('shared-backend', { missing: sharedMissingCount }),
    ...(isCodexCompatibleAssistant(assistant)
      ? [buildGroupStatus('codex-overlay', { missing: codexMissingCount, invalid: invalidCodexCount })]
      : []),
    buildGroupStatus('root-merged-files', { invalid: invalidRootCount }),
    buildGroupStatus('executables', { warnings: executableWarningCount })
  ];

  const status = missing.length > 0 || invalid.length > 0 ? 'fail' : warnings.length > 0 ? 'warn' : 'pass';

  return {
    targetDir,
    assistant,
    status,
    summary: {
      passed: groups.filter((group) => group.status === 'pass').length,
      warnings: warnings.length,
      missing: missing.length,
      invalid: invalid.length
    },
    groups,
    missing,
    invalid,
    warnings
  };
}

export function formatDoctorReport(result: DoctorResult): string {
  const targetLabel = path.relative(process.cwd(), result.targetDir) || '.';
  const lines = [
    `Scaffold doctor: ${result.assistant}`,
    `Target: ${targetLabel}`,
    `Status: ${result.status}`,
    '',
    'Checks:'
  ];

  for (const group of result.groups) {
    lines.push(`- ${group.name}: ${group.status}`);
  }

  if (result.missing.length > 0) {
    lines.push('', 'Missing:');
    for (const entry of result.missing) {
      lines.push(`- ${entry}`);
    }
  }

  if (result.invalid.length > 0) {
    lines.push('', 'Invalid:');
    for (const issue of result.invalid) {
      lines.push(`- ${issue.path} (${issue.reason})`);
    }
  }

  if (result.warnings.length > 0) {
    lines.push('', 'Warnings:');
    for (const issue of result.warnings) {
      lines.push(`- ${issue.path} (${issue.reason})`);
    }
  }

  return `${lines.join('\n')}\n`;
}
