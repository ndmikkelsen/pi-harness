import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  OPENCODE_SKILL_NAME,
  buildOpenCodeSkillEntries,
  buildOpenCodeWorkflowEntries,
  defaultOpenCodeConfigRoot,
  defaultOpenCodeSkillsRoot,
  openCodeWorkflowInstallDir,
  openCodeSkillInstallDir
} from '../core/opencode-skill.js';
import type {
  InstallSkillCommandOptions,
  InstallSkillResult,
  OpenCodeSkillEntry,
  OpenCodeWorkflowEntry
} from '../core/types.js';

async function writeSkillEntry(installDir: string, entry: OpenCodeSkillEntry): Promise<'written' | 'unchanged'> {
  const outputPath = path.join(installDir, entry.path);
  const content = entry.content();

  try {
    const existingContent = await readFile(outputPath, 'utf8');
    if (existingContent === content) {
      return 'unchanged';
    }
  } catch {
    // continue
  }

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, content, 'utf8');
  return 'written';
}

async function writeWorkflowEntry(configRoot: string, entry: OpenCodeWorkflowEntry): Promise<'written' | 'unchanged'> {
  const outputPath = path.join(configRoot, entry.path);
  const content = entry.content();

  try {
    const existingContent = await readFile(outputPath, 'utf8');
    if (existingContent === content) {
      return 'unchanged';
    }
  } catch {
    // continue
  }

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, content, 'utf8');
  return 'written';
}

export async function runInstallSkill(options: InstallSkillCommandOptions): Promise<InstallSkillResult> {
  if (options.assistant !== 'opencode') {
    throw new Error('Global skill installation currently supports only the opencode assistant.');
  }

  const targetRoot = path.resolve(options.cwd, options.targetRoot ?? defaultOpenCodeSkillsRoot());
  const configRoot = path.resolve(options.cwd, options.configRoot ?? defaultOpenCodeConfigRoot());
  const installDir = openCodeSkillInstallDir(targetRoot);
  const workflowDir = openCodeWorkflowInstallDir(configRoot);
  const workflowFilePath = path.join(configRoot, 'get-shit-done', 'workflows', 'autonomous.md');
  const writtenPaths: string[] = [];
  const unchangedPaths: string[] = [];
  const writtenWorkflowPaths: string[] = [];
  const unchangedWorkflowPaths: string[] = [];

  await mkdir(installDir, { recursive: true });

  for (const entry of buildOpenCodeSkillEntries()) {
    const status = await writeSkillEntry(installDir, entry);
    if (status === 'written') {
      writtenPaths.push(entry.path);
      continue;
    }
    unchangedPaths.push(entry.path);
  }

  await mkdir(workflowDir, { recursive: true });

  for (const entry of buildOpenCodeWorkflowEntries()) {
    const status = await writeWorkflowEntry(configRoot, entry);
    if (status === 'written') {
      writtenWorkflowPaths.push(entry.path);
      continue;
    }
    unchangedWorkflowPaths.push(entry.path);
  }

  return {
    assistant: options.assistant,
    skillName: OPENCODE_SKILL_NAME,
    targetRoot,
    configRoot,
    installDir,
    workflowDir,
    workflowFilePath,
    writtenPaths,
    unchangedPaths,
    writtenWorkflowPaths,
    unchangedWorkflowPaths,
    notes: [
      'Restart OpenCode after installing or updating global skills.',
      'Make sure the `ai-harness` CLI is on your PATH before invoking the installed skill.',
      'The installed skill expects `ai-harness` to be available locally on your machine, typically via a checkout plus `pnpm install:local`.',
      `The install also refreshes the managed \/gsd-autonomous workflow at ${workflowFilePath}.`
    ]
  };
}

export function formatInstallSkillReport(result: InstallSkillResult): string {
  const lines = [
    `Installed ${result.skillName} (${result.assistant}) in ${result.installDir}`,
    `Skill files written: ${result.writtenPaths.length}`,
    `Skill files unchanged: ${result.unchangedPaths.length}`,
    `Workflow files written: ${result.writtenWorkflowPaths.length}`,
    `Workflow files unchanged: ${result.unchangedWorkflowPaths.length}`
  ];

  if (result.writtenPaths.length > 0) {
    lines.push('', 'Written skill files:');
    for (const entry of result.writtenPaths) {
      lines.push(`- ${entry}`);
    }
  }

  if (result.writtenWorkflowPaths.length > 0) {
    lines.push('', 'Written workflow files:');
    for (const entry of result.writtenWorkflowPaths) {
      lines.push(`- ${entry}`);
    }
  }

  if (result.notes.length > 0) {
    lines.push('', 'Notes:');
    for (const note of result.notes) {
      lines.push(`- ${note}`);
    }
  }

  return `${lines.join('\n')}\n`;
}
