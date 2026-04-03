import { access, readFile, stat } from 'node:fs/promises';
import fs from 'node:fs';
import path from 'node:path';
import { constants as fsConstants } from 'node:fs';

import type {
  AssistantTarget,
  DoctorCommandOptions,
  DoctorGroupResult,
  DoctorIssue,
  DoctorResult,
  ManagedFile,
  ScaffoldContext
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
    generatedOn: '1970-01-01'
  };
}

function fileEntriesForAssistant(targetDir: string, assistant: AssistantTarget): ManagedFile[] {
  return buildManagedEntries(createDoctorContext(targetDir, assistant)).filter(
    (entry): entry is ManagedFile => entry.kind === 'file'
  );
}

function inferAssistant(targetDir: string): AssistantTarget {
  if (fs.existsSync(path.join(targetDir, 'AGENTS.md'))) {
    const agentsGuide = fs.readFileSync(path.join(targetDir, 'AGENTS.md'), 'utf8');
    if (agentsGuide.includes('OpenCode Workflow')) {
      return 'opencode';
    }
  }

  return 'codex';
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
    deprecatedWarnings: DoctorIssue[];
    executableWarnings: DoctorIssue[];
    alignmentWarnings: DoctorIssue[];
    alignmentInvalid: DoctorIssue[];
  }
): string[] {
  const recommendations: string[] = [];

  if (warnings.rootWarnings.length > 0) {
    recommendations.push(
      `Preserved root files are missing scaffold hints. Rerun \`ai-harness --mode existing ${targetLabel} --assistant ${assistant} --merge-root-files --init-json\` or add the reported entries manually.`
    );
  }

  if (warnings.deprecatedWarnings.length > 0) {
    recommendations.push(
      `Deprecated curated artifacts are still present. Rerun \`ai-harness --mode existing ${targetLabel} --assistant ${assistant} --cleanup-manifest legacy-ai-frameworks-v1 --init-json\` and review the cleanup results.`
    );
  }

  if (warnings.executableWarnings.length > 0) {
    const executablePaths = warnings.executableWarnings.map((issue) => issue.path).join(' ');
    recommendations.push(`Restore execute bits with \`chmod +x ${executablePaths}\` from ${targetLabel}.`);
  }

  if (warnings.alignmentWarnings.length > 0 || warnings.alignmentInvalid.length > 0) {
    recommendations.push(
      `Refresh OMO alignment wiring in ${targetLabel}: restore canonical references to \`.rules/patterns/omo-agent-contract.md\`, keep worktree/bootstrap seams intact, and rerun \`ai-harness doctor ${targetLabel} --assistant ${assistant}\`.`
    );
  }

  return recommendations;
}

export async function runDoctor(options: DoctorCommandOptions): Promise<DoctorResult> {
  const targetDir = path.resolve(options.cwd, options.targetArg ?? '.');
  const assistant = options.assistant === 'auto' ? inferAssistant(targetDir) : options.assistant;
  const targetLabel = path.relative(options.cwd, targetDir) || '.';

  const selectedEntries = fileEntriesForAssistant(targetDir, assistant);
  const cleanupManifest = getCleanupManifest('legacy-ai-frameworks-v1');

  const missing: string[] = [];
  const invalid: DoctorIssue[] = [];
  const rootWarnings: DoctorIssue[] = [];
  const deprecatedWarnings: DoctorIssue[] = [];
  const executableWarnings: DoctorIssue[] = [];
  const alignmentInvalid: DoctorIssue[] = [];
  const alignmentWarnings: DoctorIssue[] = [];

  const omoContractPath = '.rules/patterns/omo-agent-contract.md';
  const requiredContractSections = [
    '## Source of Truth',
    '## OMO Agent Matrix',
    '## Handoff Schema',
    '## Integration Seam Inventory',
    '## Landing Authority'
  ];
  const requiredHandoffFields = [
    'source_lane',
    'target_lane',
    'scope_summary',
    'changed_paths',
    'verify_command',
    'evidence_path',
    'issue_ref',
    'planning_ref',
    'status',
    'open_risks'
  ];
  const alignmentManagedPaths = new Set([
    'AGENTS.md',
    '.codex/README.md',
    '.codex/workflows/autonomous-execution.md',
    '.rules/patterns/omo-agent-contract.md',
    '.rules/patterns/operator-workflow.md',
    '.rules/patterns/gsd-workflow.md',
    '.rules/patterns/cognee-gsd-integration.md',
    '.opencode/worktree.jsonc',
    '.beads/hooks/post-checkout',
    'scripts/hooks/post-checkout'
  ]);

  for (const entry of selectedEntries) {
    if (!(await fileExists(targetDir, entry.path))) {
      missing.push(entry.path);
      if (alignmentManagedPaths.has(entry.path)) {
        alignmentInvalid.push({
          path: entry.path,
          reason: 'missing required OMO alignment artifact',
          category: 'alignment',
          severity: 'fail'
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

    const mismatchSuffix =
      presentKind === entry.kind ? '' : `; expected ${entry.kind} but found ${presentKind}`;

    deprecatedWarnings.push({
      path: entry.path,
      reason: `deprecated curated artifact present; ${entry.reason}${mismatchSuffix}; review and remove with ai-harness --mode existing <path> --cleanup-manifest ${cleanupManifest.id} --init-json`,
      category: 'deprecated-artifact',
      severity: 'warn'
    });
  }

  const codexBrief = await readFileIfPresent(targetDir, '.codex/scripts/cognee-brief.sh');
  if (codexBrief !== null && !codexBrief.includes('.codex/scripts/cognee-bridge.sh')) {
    invalid.push({ path: '.codex/scripts/cognee-brief.sh', reason: 'missing runtime backend reference', category: 'runtime', severity: 'fail' });
  }

  const codexSync = await readFileIfPresent(targetDir, '.codex/scripts/sync-planning-to-cognee.sh');
  if (codexSync !== null && !codexSync.includes('.codex/scripts/cognee-sync-planning.sh')) {
    invalid.push({ path: '.codex/scripts/sync-planning-to-cognee.sh', reason: 'missing runtime backend reference', category: 'runtime', severity: 'fail' });
  }

  const codexReadme = await readFileIfPresent(targetDir, '.codex/README.md');
  if (codexReadme !== null && !codexReadme.includes('.codex/scripts/cognee-bridge.sh')) {
    invalid.push({ path: '.codex/README.md', reason: 'missing runtime backend guidance', category: 'runtime', severity: 'fail' });
  }
  if (codexReadme !== null && !codexReadme.includes(omoContractPath)) {
    alignmentInvalid.push({
      path: '.codex/README.md',
      reason: 'missing canonical OMO contract reference',
      category: 'alignment',
      severity: 'fail'
    });
  }

  const agentsGuide = await readFileIfPresent(targetDir, 'AGENTS.md');
  if (agentsGuide !== null && !agentsGuide.includes('.codex/scripts/')) {
    invalid.push({ path: 'AGENTS.md', reason: 'missing runtime backend guidance', category: 'runtime', severity: 'fail' });
  }
  if (agentsGuide !== null && !agentsGuide.includes(omoContractPath)) {
    alignmentInvalid.push({
      path: 'AGENTS.md',
      reason: 'missing canonical OMO contract reference',
      category: 'alignment',
      severity: 'fail'
    });
  }

  const omoContract = await readFileIfPresent(targetDir, omoContractPath);
  if (omoContract !== null) {
    for (const section of requiredContractSections) {
      if (!omoContract.includes(section)) {
        alignmentInvalid.push({
          path: omoContractPath,
          reason: `missing contract section ${section}`,
          category: 'alignment',
          severity: 'fail'
        });
      }
    }

    for (const field of requiredHandoffFields) {
      if (!omoContract.includes(field)) {
        alignmentInvalid.push({
          path: omoContractPath,
          reason: `missing handoff schema field ${field}`,
          category: 'alignment',
          severity: 'fail'
        });
      }
    }
  }

  const operatorWorkflow = await readFileIfPresent(targetDir, '.rules/patterns/operator-workflow.md');
  if (operatorWorkflow !== null && !operatorWorkflow.includes(omoContractPath)) {
    alignmentInvalid.push({
      path: '.rules/patterns/operator-workflow.md',
      reason: 'missing canonical OMO contract reference',
      category: 'alignment',
      severity: 'fail'
    });
  }

  const autonomousWorkflow = await readFileIfPresent(targetDir, '.codex/workflows/autonomous-execution.md');
  if (autonomousWorkflow !== null && !autonomousWorkflow.includes(omoContractPath)) {
    alignmentInvalid.push({
      path: '.codex/workflows/autonomous-execution.md',
      reason: 'missing canonical OMO contract reference',
      category: 'alignment',
      severity: 'fail'
    });
  }

  const worktreeConfig = await readFileIfPresent(targetDir, '.opencode/worktree.jsonc');
  if (worktreeConfig !== null && !worktreeConfig.includes('bootstrap-worktree.sh --quiet')) {
    alignmentInvalid.push({
      path: '.opencode/worktree.jsonc',
      reason: 'missing worktree bootstrap hook reference',
      category: 'alignment',
      severity: 'fail'
    });
  }

  const beadsPostCheckout = await readFileIfPresent(targetDir, '.beads/hooks/post-checkout');
  if (beadsPostCheckout !== null && !beadsPostCheckout.includes('bootstrap-worktree.sh')) {
    alignmentInvalid.push({
      path: '.beads/hooks/post-checkout',
      reason: 'missing worktree bootstrap fallback reference',
      category: 'alignment',
      severity: 'fail'
    });
  }

  const fallbackPostCheckout = await readFileIfPresent(targetDir, 'scripts/hooks/post-checkout');
  if (fallbackPostCheckout !== null && !fallbackPostCheckout.includes('bootstrap-worktree.sh')) {
    alignmentWarnings.push({
      path: 'scripts/hooks/post-checkout',
      reason: 'missing worktree bootstrap fallback reference',
      category: 'alignment',
      severity: 'warn'
    });
  }

  const handoffWorkflowDocs = [
    { path: '.rules/patterns/gsd-workflow.md', content: await readFileIfPresent(targetDir, '.rules/patterns/gsd-workflow.md') },
    {
      path: '.codex/workflows/autonomous-execution.md',
      content: await readFileIfPresent(targetDir, '.codex/workflows/autonomous-execution.md')
    }
  ];

  for (const doc of handoffWorkflowDocs) {
    if (doc.content === null) {
      continue;
    }

    for (const field of requiredHandoffFields) {
      if (!doc.content.includes(field)) {
        alignmentInvalid.push({
          path: doc.path,
          reason: `missing handoff workflow field ${field}`,
          category: 'alignment',
          severity: 'fail'
        });
      }
    }
  }

  for (const entry of selectedEntries.filter((candidate) => candidate.executable)) {
    if (await fileExists(targetDir, entry.path)) {
      if (!(await isExecutable(targetDir, entry.path))) {
        executableWarnings.push({ path: entry.path, reason: 'not executable', category: 'executable', severity: 'warn' });
      }
    }
  }

  invalid.push(...alignmentInvalid);

  const warnings = [...rootWarnings, ...deprecatedWarnings, ...executableWarnings, ...alignmentWarnings];

  const alignmentMissingCount = missing.filter((issuePath) => alignmentManagedPaths.has(issuePath)).length;
  const runtimeMissingCount = missing.length - alignmentMissingCount;
  const invalidCodexCount = invalid.filter(
    (issue) => issue.category === 'runtime' && (issue.path.startsWith('.codex/') || issue.path === 'AGENTS.md')
  ).length;
  const invalidAlignmentCount = invalid.filter((issue) => issue.category === 'alignment').length;

  const groups: DoctorGroupResult[] = [
    buildGroupStatus('codex-runtime', { missing: runtimeMissingCount, invalid: invalidCodexCount }),
    buildGroupStatus('omo-alignment', { missing: alignmentMissingCount, invalid: invalidAlignmentCount, warnings: alignmentWarnings.length }),
    buildGroupStatus('root-scaffold-hints', { warnings: rootWarnings.length }),
    buildGroupStatus('deprecated-artifacts', { warnings: deprecatedWarnings.length }),
    buildGroupStatus('executables', { warnings: executableWarnings.length })
  ];

  const status = missing.length > 0 || invalid.length > 0 ? 'fail' : warnings.length > 0 ? 'warn' : 'pass';
  const recommendations = buildRecommendations(targetLabel, assistant, {
    rootWarnings,
    deprecatedWarnings,
    executableWarnings,
    alignmentWarnings,
    alignmentInvalid
  });

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
    warnings,
    recommendations
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

  if (result.recommendations.length > 0) {
    lines.push('', 'Recommendations:');
    for (const recommendation of result.recommendations) {
      lines.push(`- ${recommendation}`);
    }
  }

  lines.push(
    '',
    'Guidance:',
    '- `ai-harness` is a local-use tool for scaffolding projects on your machine; the documented setup path is a checkout plus `pnpm build` and `pnpm install:local`, not a registry-published package.'
  );

  return `${lines.join('\n')}\n`;
}
