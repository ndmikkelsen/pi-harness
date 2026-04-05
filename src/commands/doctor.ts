import { access, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { constants as fsConstants } from 'node:fs';

import type {
  AssistantTarget,
  DoctorCommandOptions,
  DoctorGroupResult,
  DoctorIssue,
  DoctorResult,
  ManagedFile,
  ScaffoldContext,
} from '../core/types.js';
import { getCleanupManifest } from '../core/cleanup-manifests.js';
import { DEFAULT_POLICY } from '../core/policy.js';
import { buildManagedEntries } from '../generators/index.js';

function createDoctorContext(targetDir: string, assistant: AssistantTarget): ScaffoldContext {
  return {
    appName: 'doctor-app',
    appSlug: 'doctor-app',
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
    generatedOn: '1970-01-01',
  };
}

function fileEntriesForAssistant(targetDir: string, assistant: AssistantTarget): ManagedFile[] {
  return buildManagedEntries(createDoctorContext(targetDir, assistant)).filter(
    (entry): entry is ManagedFile => entry.kind === 'file',
  );
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

async function pathKind(targetDir: string, relativePath: string): Promise<'file' | 'directory' | 'missing'> {
  try {
    const fileStat = await stat(path.join(targetDir, relativePath));
    return fileStat.isDirectory() ? 'directory' : 'file';
  } catch {
    return 'missing';
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

function buildRecommendations(
  targetLabel: string,
  assistant: AssistantTarget,
  warnings: {
    rootWarnings: DoctorIssue[];
    deprecatedInvalid: DoctorIssue[];
    deprecatedWarnings: DoctorIssue[];
    executableWarnings: DoctorIssue[];
    alignmentWarnings: DoctorIssue[];
    alignmentInvalid: DoctorIssue[];
  },
): string[] {
  const recommendations: string[] = [];

  if (warnings.rootWarnings.length > 0) {
    recommendations.push(
      `Preserved root files are missing scaffold hints. Rerun \`pi-harness --mode existing ${targetLabel} --assistant ${assistant} --merge-root-files --init-json\` or add the reported entries manually.`,
    );
  }

  if (warnings.deprecatedInvalid.length > 0 || warnings.deprecatedWarnings.length > 0) {
    recommendations.push(
      `Deprecated curated artifacts are still present. Rerun \`pi-harness --mode existing ${targetLabel} --assistant ${assistant} --cleanup-manifest legacy-ai-frameworks-v1 --init-json\` and review the cleanup results.`,
    );
  }

  if (warnings.executableWarnings.length > 0) {
    const executablePaths = warnings.executableWarnings.map((issue) => issue.path).join(' ');
    recommendations.push(`Restore execute bits with \`chmod +x ${executablePaths}\` from ${targetLabel}.`);
  }

  if (warnings.alignmentWarnings.length > 0 || warnings.alignmentInvalid.length > 0) {
    recommendations.push(
      `Refresh the scaffold workflow baseline in ${targetLabel}: rerun \`pi-harness --mode existing ${targetLabel} --assistant ${assistant} --force --init-json\`, restore the expected .omp/.codex workflow assets, remove stale legacy assistant artifacts, and rerun \`pi-harness doctor ${targetLabel} --assistant ${assistant}\`.`,
    );
  }

  return recommendations;
}


export async function runDoctor(options: DoctorCommandOptions): Promise<DoctorResult> {
  const targetDir = path.resolve(options.cwd, options.targetArg ?? '.');
  const assistant = options.assistant;
  const targetLabel = path.relative(options.cwd, targetDir) || '.';

  const selectedEntries = fileEntriesForAssistant(targetDir, assistant);
  const cleanupManifest = getCleanupManifest('legacy-ai-frameworks-v1');

  const missing: string[] = [];
  const invalid: DoctorIssue[] = [];
  const rootWarnings: DoctorIssue[] = [];
  const deprecatedInvalid: DoctorIssue[] = [];
  const deprecatedWarnings: DoctorIssue[] = [];
  const executableWarnings: DoctorIssue[] = [];
  const alignmentInvalid: DoctorIssue[] = [];
  const alignmentWarnings: DoctorIssue[] = [];

  const staleArtifactReasons = new Map<string, string>([
    ['.rules/patterns/gsd-workflow.md', 'stale GSD alignment artifact present'],
    ['.rules/patterns/cognee-gsd-integration.md', 'stale GSD alignment artifact present'],
    ['.rules/patterns/omo-agent-contract.md', 'stale OMO artifact present'],
    ['.opencode/worktree.jsonc', 'stale OpenCode artifact present'],
  ]);
  const failFastDeprecatedPaths = new Map<string, string>([
    ['.planning', 'legacy planning workspace present'],
    ['.codex/scripts/cognee-sync-planning.sh', 'legacy planning sync script present'],
    ['.codex/scripts/sync-planning-to-cognee.sh', 'legacy planning sync script present'],
    ['.codex/templates/session-handoff.md', 'legacy planning handoff template present'],
  ]);
  const staleWorkflowMarkers = [
    '/gsd-',
    '~/.gsd/defaults.json',
    '.rules/patterns/omo-agent-contract.md',
    '.opencode/worktree.jsonc',
    'install-skill --assistant opencode',
    'oh-my-opencode',
    '.planning/STATE.md',
    '.codex/scripts/cognee-sync-planning.sh',
    '.codex/scripts/sync-planning-to-cognee.sh',
  ];
  const staleWorkflowScanPaths = [
    'AGENTS.md',
    'README.md',
    '.codex/README.md',
    '.codex/agents/orchestrator.md',
    '.codex/skills/harness/SKILL.md',
    '.codex/skills/harness/references/pi-harness-command-matrix.md',
    '.codex/skills/harness/references/scaffold-customization-map.md',
    '.codex/skills/harness/references/existing-repo-context-checklist.md',
    '.codex/scripts/bootstrap-worktree.sh',
    '.codex/workflows/autonomous-execution.md',
    '.codex/workflows/parallel-execution.md',
    '.omp/agents/orchestrator.md',
    '.omp/skills/parallel-wave-design/SKILL.md',
    '.rules/index.md',
    '.rules/patterns/beads-integration.md',
    '.rules/patterns/git-workflow.md',
    '.rules/patterns/operator-workflow.md',
  ];
  const alignmentManagedPaths = new Set([
    'AGENTS.md',
    '.codex/README.md',
    '.codex/agents/orchestrator.md',
    '.codex/workflows/autonomous-execution.md',
    '.codex/workflows/parallel-execution.md',
    '.omp/agents/orchestrator.md',
    '.omp/skills/parallel-wave-design/SKILL.md',
    '.rules/patterns/operator-workflow.md',
    '.beads/hooks/post-checkout',
    'scripts/hooks/post-checkout',
  ]);

  for (const entry of selectedEntries) {
    if (!(await fileExists(targetDir, entry.path))) {
      missing.push(entry.path);
      if (alignmentManagedPaths.has(entry.path)) {
        alignmentInvalid.push({
          path: entry.path,
          reason: 'missing required workflow artifact',
          category: 'alignment',
          severity: 'fail',
        });
      }
    }
  }

  const gitignore = await readFileIfPresent(targetDir, '.gitignore');
  if (gitignore !== null) {
    if (!gitignore.includes('.kamal/secrets')) {
      rootWarnings.push({ path: '.gitignore', reason: 'missing .kamal/secrets ignore rule', category: 'root-scaffold', severity: 'warn' });
    }
    if (!gitignore.includes('STICKYNOTE.md')) {
      rootWarnings.push({ path: '.gitignore', reason: 'missing STICKYNOTE.md ignore rule', category: 'root-scaffold', severity: 'warn' });
    }
  }

  const envExample = await readFileIfPresent(targetDir, '.env.example');
  if (envExample !== null) {
    for (const token of ['LLM_API_KEY', 'COGNEE_URL']) {
      if (!envExample.includes(token)) {
        rootWarnings.push({ path: '.env.example', reason: `missing ${token} scaffold value`, category: 'root-scaffold', severity: 'warn' });
      }
    }
  }

  for (const entry of cleanupManifest.entries) {
    const presentKind = await pathKind(targetDir, entry.path);
    if (presentKind === 'missing') {
      continue;
    }

    const mismatchSuffix = presentKind === entry.kind ? '' : `; expected ${entry.kind} but found ${presentKind}`;
    const cleanupCommand = `pi-harness --mode existing <path> --cleanup-manifest ${cleanupManifest.id} --init-json`;
    const failFastReason = failFastDeprecatedPaths.get(entry.path);

    if (failFastReason) {
      deprecatedInvalid.push({
        path: entry.path,
        reason: `${failFastReason}; ${entry.reason}${mismatchSuffix}; remove with ${cleanupCommand}`,
        category: 'deprecated-artifact',
        severity: 'fail',
      });
      continue;
    }

    deprecatedWarnings.push({
      path: entry.path,
      reason: `deprecated curated artifact present; ${entry.reason}${mismatchSuffix}; review and remove with ${cleanupCommand}`,
      category: 'deprecated-artifact',
      severity: 'warn',
    });
  }

  const codexBrief = await readFileIfPresent(targetDir, '.codex/scripts/cognee-brief.sh');
  if (codexBrief !== null && !codexBrief.includes('.codex/scripts/cognee-bridge.sh')) {
    invalid.push({ path: '.codex/scripts/cognee-brief.sh', reason: 'missing runtime backend reference', category: 'runtime', severity: 'fail' });
  }


  const codexReadme = await readFileIfPresent(targetDir, '.codex/README.md');
  if (codexReadme !== null && !codexReadme.includes('.codex/scripts/cognee-bridge.sh')) {
    invalid.push({ path: '.codex/README.md', reason: 'missing runtime backend guidance', category: 'runtime', severity: 'fail' });
  }
  if (codexReadme !== null && !codexReadme.includes('.rules/patterns/operator-workflow.md')) {
    alignmentInvalid.push({
      path: '.codex/README.md',
      reason: 'missing canonical operator workflow reference',
      category: 'alignment',
      severity: 'fail',
    });
  }
  if (codexReadme !== null && !codexReadme.includes('.omp/agents/orchestrator.md')) {
    alignmentInvalid.push({
      path: '.codex/README.md',
      reason: 'missing Pi-native orchestrator mapping',
      category: 'alignment',
      severity: 'fail',
    });
  }
  if (codexReadme !== null && !codexReadme.includes('.omp/skills/parallel-wave-design/SKILL.md')) {
    alignmentInvalid.push({
      path: '.codex/README.md',
      reason: 'missing Pi-native skill mapping',
      category: 'alignment',
      severity: 'fail',
    });
  }

  const agentsGuide = await readFileIfPresent(targetDir, 'AGENTS.md');
  if (agentsGuide !== null && !agentsGuide.includes('.codex/scripts/')) {
    invalid.push({ path: 'AGENTS.md', reason: 'missing runtime backend guidance', category: 'runtime', severity: 'fail' });
  }
  if (agentsGuide !== null && !agentsGuide.includes('.rules/patterns/operator-workflow.md')) {
    alignmentInvalid.push({
      path: 'AGENTS.md',
      reason: 'missing canonical operator workflow reference',
      category: 'alignment',
      severity: 'fail',
    });
  }
  if (agentsGuide !== null && !agentsGuide.includes('.omp/agents/*.md')) {
    alignmentInvalid.push({
      path: 'AGENTS.md',
      reason: 'missing Pi-native orchestration guidance',
      category: 'alignment',
      severity: 'fail',
    });
  }

  const operatorWorkflow = await readFileIfPresent(targetDir, '.rules/patterns/operator-workflow.md');
  if (operatorWorkflow !== null && !operatorWorkflow.includes('repositories scaffolded with `pi-harness`')) {
    alignmentInvalid.push({
      path: '.rules/patterns/operator-workflow.md',
      reason: 'missing pi-harness scaffold reference',
      category: 'alignment',
      severity: 'fail',
    });
  }
  if (operatorWorkflow !== null && !operatorWorkflow.includes('bd ready --json')) {
    alignmentInvalid.push({
      path: '.rules/patterns/operator-workflow.md',
      reason: 'missing Beads claim-first guidance',
      category: 'alignment',
      severity: 'fail',
    });
  }
  if (operatorWorkflow !== null && !operatorWorkflow.includes('./.codex/scripts/cognee-brief.sh')) {
    alignmentInvalid.push({
      path: '.rules/patterns/operator-workflow.md',
      reason: 'missing Cognee brief guidance',
      category: 'alignment',
      severity: 'fail',
    });
  }
  if (operatorWorkflow !== null && !operatorWorkflow.includes('./.codex/scripts/land.sh')) {
    alignmentInvalid.push({
      path: '.rules/patterns/operator-workflow.md',
      reason: 'missing landing script guidance',
      category: 'alignment',
      severity: 'fail',
    });
  }

  const autonomousWorkflow = await readFileIfPresent(targetDir, '.codex/workflows/autonomous-execution.md');
  if (autonomousWorkflow !== null && !autonomousWorkflow.includes('bd ready --json')) {
    alignmentInvalid.push({
      path: '.codex/workflows/autonomous-execution.md',
      reason: 'missing Beads work selection guidance',
      category: 'alignment',
      severity: 'fail',
    });
  }
  if (autonomousWorkflow !== null && !autonomousWorkflow.includes('COGNEE_AVAILABLE')) {
    alignmentInvalid.push({
      path: '.codex/workflows/autonomous-execution.md',
      reason: 'missing Cognee availability fallback guidance',
      category: 'alignment',
      severity: 'fail',
    });
  }

  const parallelWorkflow = await readFileIfPresent(targetDir, '.codex/workflows/parallel-execution.md');
  if (parallelWorkflow !== null && !parallelWorkflow.includes('3-5 files')) {
    alignmentInvalid.push({
      path: '.codex/workflows/parallel-execution.md',
      reason: 'missing Pi task scope guidance',
      category: 'alignment',
      severity: 'fail',
    });
  }
  if (parallelWorkflow !== null && !parallelWorkflow.includes('task `context`')) {
    alignmentInvalid.push({
      path: '.codex/workflows/parallel-execution.md',
      reason: 'missing shared task context guidance',
      category: 'alignment',
      severity: 'fail',
    });
  }
  if (parallelWorkflow !== null && !parallelWorkflow.includes('isolated: true')) {
    alignmentInvalid.push({
      path: '.codex/workflows/parallel-execution.md',
      reason: 'missing isolated task guidance',
      category: 'alignment',
      severity: 'fail',
    });
  }

  const codexOrchestrator = await readFileIfPresent(targetDir, '.codex/agents/orchestrator.md');
  if (codexOrchestrator !== null && !codexOrchestrator.includes('.omp/agents/orchestrator.md')) {
    alignmentInvalid.push({
      path: '.codex/agents/orchestrator.md',
      reason: 'missing Pi-native orchestrator handoff',
      category: 'alignment',
      severity: 'fail',
    });
  }
  if (codexOrchestrator !== null && !codexOrchestrator.includes('3-5 files')) {
    alignmentInvalid.push({
      path: '.codex/agents/orchestrator.md',
      reason: 'missing Pi task scope guidance',
      category: 'alignment',
      severity: 'fail',
    });
  }

  const ompOrchestrator = await readFileIfPresent(targetDir, '.omp/agents/orchestrator.md');
  if (ompOrchestrator !== null && !ompOrchestrator.includes('name: orchestrator')) {
    alignmentInvalid.push({
      path: '.omp/agents/orchestrator.md',
      reason: 'missing orchestrator frontmatter name',
      category: 'alignment',
      severity: 'fail',
    });
  }
  if (ompOrchestrator !== null && !ompOrchestrator.includes('skill://parallel-wave-design')) {
    alignmentInvalid.push({
      path: '.omp/agents/orchestrator.md',
      reason: 'missing parallel-wave skill reference',
      category: 'alignment',
      severity: 'fail',
    });
  }
  if (ompOrchestrator !== null && !ompOrchestrator.includes('3-5 files')) {
    alignmentInvalid.push({
      path: '.omp/agents/orchestrator.md',
      reason: 'missing Pi task scope guidance',
      category: 'alignment',
      severity: 'fail',
    });
  }

  const ompParallelWaveSkill = await readFileIfPresent(targetDir, '.omp/skills/parallel-wave-design/SKILL.md');
  if (ompParallelWaveSkill !== null && !ompParallelWaveSkill.includes('name: parallel-wave-design')) {
    alignmentInvalid.push({
      path: '.omp/skills/parallel-wave-design/SKILL.md',
      reason: 'missing parallel-wave skill frontmatter name',
      category: 'alignment',
      severity: 'fail',
    });
  }
  if (ompParallelWaveSkill !== null && !ompParallelWaveSkill.includes('3-5 files')) {
    alignmentInvalid.push({
      path: '.omp/skills/parallel-wave-design/SKILL.md',
      reason: 'missing Pi task scope guidance',
      category: 'alignment',
      severity: 'fail',
    });
  }
  if (ompParallelWaveSkill !== null && !ompParallelWaveSkill.includes('task `context`')) {
    alignmentInvalid.push({
      path: '.omp/skills/parallel-wave-design/SKILL.md',
      reason: 'missing shared task context guidance',
      category: 'alignment',
      severity: 'fail',
    });
  }

  for (const [artifactPath, reason] of staleArtifactReasons) {
    if (await fileExists(targetDir, artifactPath)) {
      alignmentInvalid.push({
        path: artifactPath,
        reason,
        category: 'alignment',
        severity: 'fail',
      });
    }
  }

  for (const scanPath of staleWorkflowScanPaths) {
    const content = await readFileIfPresent(targetDir, scanPath);
    if (content === null) {
      continue;
    }

    const marker = staleWorkflowMarkers.find((candidate) => content.includes(candidate));
    if (!marker) {
      continue;
    }

    alignmentInvalid.push({
      path: scanPath,
      reason: `contains stale workflow reference: ${marker}`,
      category: 'alignment',
      severity: 'fail',
    });
  }

  const beadsPostCheckout = await readFileIfPresent(targetDir, '.beads/hooks/post-checkout');
  if (beadsPostCheckout !== null && !beadsPostCheckout.includes('bootstrap-worktree.sh')) {
    alignmentInvalid.push({
      path: '.beads/hooks/post-checkout',
      reason: 'missing worktree bootstrap fallback reference',
      category: 'alignment',
      severity: 'fail',
    });
  }

  const fallbackPostCheckout = await readFileIfPresent(targetDir, 'scripts/hooks/post-checkout');
  if (fallbackPostCheckout !== null && !fallbackPostCheckout.includes('bootstrap-worktree.sh')) {
    alignmentWarnings.push({
      path: 'scripts/hooks/post-checkout',
      reason: 'missing worktree bootstrap fallback reference',
      category: 'alignment',
      severity: 'warn',
    });
  }

  for (const entry of selectedEntries.filter((candidate) => candidate.executable)) {
    if (await fileExists(targetDir, entry.path)) {
      if (!(await isExecutable(targetDir, entry.path))) {
        executableWarnings.push({ path: entry.path, reason: 'not executable', category: 'executable', severity: 'warn' });
      }
    }
  }

  invalid.push(...deprecatedInvalid);
  invalid.push(...alignmentInvalid);

  const warnings = [...rootWarnings, ...deprecatedWarnings, ...executableWarnings, ...alignmentWarnings];
  const alignmentMissingCount = missing.filter((issuePath) => alignmentManagedPaths.has(issuePath)).length;
  const runtimeMissingCount = missing.length - alignmentMissingCount;
  const invalidCodexCount = invalid.filter(
    (issue) => issue.category === 'runtime' && (issue.path.startsWith('.codex/') || issue.path === 'AGENTS.md'),
  ).length;
  const invalidAlignmentCount = invalid.filter((issue) => issue.category === 'alignment').length;
  const invalidDeprecatedCount = invalid.filter((issue) => issue.category === 'deprecated-artifact').length;

  const groups: DoctorGroupResult[] = [
    buildGroupStatus('codex-runtime', { missing: runtimeMissingCount, invalid: invalidCodexCount }),
    buildGroupStatus('workflow-alignment', { missing: alignmentMissingCount, invalid: invalidAlignmentCount, warnings: alignmentWarnings.length }),
    buildGroupStatus('root-scaffold-hints', { warnings: rootWarnings.length }),
    buildGroupStatus('deprecated-artifacts', { invalid: invalidDeprecatedCount, warnings: deprecatedWarnings.length }),
    buildGroupStatus('executables', { warnings: executableWarnings.length }),
  ];

  const status = missing.length > 0 || invalid.length > 0 ? 'fail' : warnings.length > 0 ? 'warn' : 'pass';
  const recommendations = buildRecommendations(targetLabel, assistant, {
    rootWarnings,
    deprecatedInvalid,
    deprecatedWarnings,
    executableWarnings,
    alignmentWarnings,
    alignmentInvalid,
  });

  return {
    targetDir,
    assistant,
    status,
    summary: {
      passed: groups.filter((group) => group.status === 'pass').length,
      warnings: warnings.length,
      missing: missing.length,
      invalid: invalid.length,
    },
    groups,
    missing,
    invalid,
    warnings,
    recommendations,
  };
}

export function formatDoctorReport(result: DoctorResult): string {
  const targetLabel = path.relative(process.cwd(), result.targetDir) || '.';
  const lines = [
    `Scaffold doctor: ${result.assistant}`,
    `Target: ${targetLabel}`,
    `Status: ${result.status}`,
    '',
    'Checks:',
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

  if (result.recommendations.length > 0) {
    lines.push('', 'Recommendations:');
    for (const recommendation of result.recommendations) {
      lines.push(`- ${recommendation}`);
    }
  }

  lines.push(
    '',
    'Guidance:',
    '- `pi-harness` is a local-use tool for scaffolding projects on your machine; the documented setup path is a checkout plus `pnpm build` and `pnpm install:local`, not a registry-published package.',
  );

  return `${lines.join('\n')}\n`;
}
