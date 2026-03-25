import type { ProjectMode } from './policy.js';

export type AssistantTarget = 'claude' | 'codex' | 'opencode';
export type AssistantSelection = AssistantTarget | 'auto';

export interface ResolveProjectInputOptions {
  cwd: string;
  projectArg?: string;
  targetArg?: string;
  mode: ProjectMode;
  prefix?: string;
}

export interface ResolvedProjectInput {
  appName: string;
  appSlug: string;
  appPrefix: string;
  appTitle: string;
  appVar: string;
  targetDir: string;
  mode: Exclude<ProjectMode, 'auto'>;
}

export interface PortSettings {
  doltPort: number;
  cogneeDbPort: number;
  notes: string[];
}

export interface InitCommandOptions {
  cwd: string;
  projectArg?: string;
  targetArg?: string;
  assistant: AssistantTarget;
  mode: ProjectMode;
  prefix?: string;
  dryRun: boolean;
  force: boolean;
  skipGit: boolean;
  detectPorts: boolean;
  doltPort?: number;
  cogneeDbPort?: number;
  computeHost?: string;
  computeUser?: string;
  sshKeyPath?: string;
}

export interface ScaffoldContext extends ResolvedProjectInput {
  assistant: AssistantTarget;
  doltPort: number;
  cogneeDbPort: number;
  computeHost: string;
  computeUser: string;
  sshKeyPath: string;
  registryHost: string;
  generatedOn: string;
}

export interface ManagedDirectory {
  kind: 'directory';
  path: string;
}

export interface ManagedFile {
  kind: 'file';
  path: string;
  executable?: boolean;
  content: (context: ScaffoldContext) => string;
  merge?: (existingContent: string, context: ScaffoldContext) => string | null;
}

export type ManagedEntry = ManagedDirectory | ManagedFile;

export interface ApplyManagedEntriesOptions {
  targetDir: string;
  force: boolean;
  dryRun: boolean;
}

export interface ApplyManagedEntriesResult {
  createdPaths: string[];
  skippedPaths: string[];
}

export interface InitResult extends ApplyManagedEntriesResult {
  assistant: AssistantTarget;
  mode: Exclude<ProjectMode, 'auto'>;
  targetDir: string;
  appName: string;
  notes: string[];
}

export interface DoctorCommandOptions {
  cwd: string;
  targetArg?: string;
  assistant: AssistantSelection;
  json: boolean;
}

export interface DoctorIssue {
  path: string;
  reason: string;
}

export interface DoctorGroupResult {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  details?: string;
}

export interface DoctorResult {
  targetDir: string;
  assistant: AssistantTarget;
  status: 'pass' | 'warn' | 'fail';
  summary: {
    passed: number;
    warnings: number;
    missing: number;
    invalid: number;
  };
  groups: DoctorGroupResult[];
  missing: string[];
  invalid: DoctorIssue[];
  warnings: DoctorIssue[];
}
