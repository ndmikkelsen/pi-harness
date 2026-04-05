import type { ProjectMode } from './policy.js';

export type AssistantTarget = 'codex';

export interface ResolveProjectInputOptions {
  cwd: string;
  projectArg?: string;
  targetArg?: string;
  mode: ProjectMode;
}

export interface ResolvedProjectInput {
  appName: string;
  appSlug: string;
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
  dryRun: boolean;
  force: boolean;
  mergeRootFiles?: boolean;
  cleanupManifestId?: string;
  nonInteractive?: boolean;
  skipGit: boolean;
  detectPorts: boolean;
  doltPort?: number;
  cogneeDbPort?: number;
  computeHost?: string;
  computeUser?: string;
  sshKeyPath?: string;
  confirmCleanup?: CleanupConfirmer;
}

export type CleanupDisposition = 'safe-delete' | 'prompt-before-delete';
export type CleanupActionStatus = 'deleted' | 'skipped' | 'missing' | 'prompt-required' | 'declined' | 'planned';

export interface CleanupManifestEntry {
  id: string;
  path: string;
  kind: 'file' | 'directory';
  disposition: CleanupDisposition;
  reason: string;
}

export interface CleanupManifest {
  id: string;
  version: number;
  description: string;
  entries: CleanupManifestEntry[];
}

export interface CleanupAction {
  path: string;
  kind: 'file' | 'directory';
  disposition: CleanupDisposition;
  status: CleanupActionStatus;
  reason: string;
}

export interface CleanupResult {
  enabled: boolean;
  manifestId?: string;
  status: 'not-requested' | 'applied' | 'blocked' | 'dry-run';
  summary: {
    deleted: number;
    skipped: number;
    missing: number;
    promptRequired: number;
    declined: number;
    planned: number;
  };
  removedPaths: string[];
  actions: CleanupAction[];
}

export type CleanupConfirmer = (entry: CleanupManifestEntry) => Promise<boolean>;

export interface ScaffoldContext extends ResolvedProjectInput {
  assistant: AssistantTarget;
  harnessVersion?: string;
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
  mergeGroup?: 'root';
}

export type ManagedEntry = ManagedDirectory | ManagedFile;

export interface ApplyManagedEntriesOptions {
  targetDir: string;
  force: boolean;
  dryRun: boolean;
  mergeRootFiles?: boolean;
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
  cleanup: CleanupResult;
}


export interface DoctorCommandOptions {
  cwd: string;
  targetArg?: string;
  assistant: AssistantTarget;
  json: boolean;
}

export interface DoctorIssue {
  path: string;
  reason: string;
  category: 'runtime' | 'root-scaffold' | 'deprecated-artifact' | 'executable' | 'alignment';
  severity: 'warn' | 'fail';
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
  recommendations: string[];
}
