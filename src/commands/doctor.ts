import { access, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { constants as fsConstants } from 'node:fs';

import type {
  DoctorCommandOptions,
  DoctorGroupResult,
  DoctorIssue,
  DoctorResult,
  ManagedFile,
  ScaffoldContext,
} from '../core/types.js';
import { getCleanupManifest } from '../core/cleanup-manifests.js';
import { DEFAULT_POLICY } from '../core/policy.js';
import { SCAFFOLD_BASELINE } from '../core/runtime.js';
import { buildManagedEntries } from '../generators/index.js';

function createDoctorContext(targetDir: string): ScaffoldContext {
  return {
    appName: 'doctor-app',
    appSlug: 'doctor-app',
    appTitle: 'Doctor App',
    appVar: 'DOCTOR_APP',
    inferenceNotes: [],
    targetDir,
    mode: 'existing',
    doltPort: DEFAULT_POLICY.defaultDoltPort,
    cogneeDbPort: DEFAULT_POLICY.defaultCogneeDbPort,
    computeHost: DEFAULT_POLICY.computeHost,
    computeUser: DEFAULT_POLICY.computeUser,
    sshKeyPath: DEFAULT_POLICY.sshKeyPath,
    registryHost: DEFAULT_POLICY.registryHost,
    generatedOn: '1970-01-01',
  };
}

const GLOBAL_ONLY_BAKE_PATHS = new Set(['.pi/prompts/bake.md', 'scripts/bake.sh']);

function managedFileEntries(targetDir: string): ManagedFile[] {
  return buildManagedEntries(createDoctorContext(targetDir)).filter(
    (entry): entry is ManagedFile => entry.kind === 'file' && !GLOBAL_ONLY_BAKE_PATHS.has(entry.path),
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
      `Preserved root files are missing scaffold hints. Rerun \`pi-harness --mode existing ${targetLabel} --merge-root-files --init-json\` or add the reported entries manually.`,
    );
  }

  if (warnings.deprecatedInvalid.length > 0 || warnings.deprecatedWarnings.length > 0) {
    recommendations.push(
      `Deprecated curated artifacts are still present. Rerun \`pi-harness --mode existing ${targetLabel} --cleanup-manifest legacy-ai-frameworks-v1 --init-json\` and review the cleanup results.`,
    );
  }

  if (warnings.executableWarnings.length > 0) {
    const executablePaths = warnings.executableWarnings.map((issue) => issue.path).join(' ');
    recommendations.push(`Restore execute bits with \`chmod +x ${executablePaths}\` from ${targetLabel}.`);
  }

  if (warnings.alignmentWarnings.length > 0 || warnings.alignmentInvalid.length > 0) {
    recommendations.push(
      `Refresh the scaffold workflow baseline in ${targetLabel}: rerun \`pi-harness doctor --fix ${targetLabel}\` for the shell-side self-heal path, or use \`pi-harness --mode existing ${targetLabel} --force --init-json\` to refresh managed assets directly, then rerun \`pi-harness doctor ${targetLabel}\`.`,
    );
  }

  return recommendations;
}

function pushAlignmentInvalid(invalid: DoctorIssue[], pathValue: string, reason: string): void {
  invalid.push({ path: pathValue, reason, category: 'alignment', severity: 'fail' });
}

function pushRuntimeInvalid(invalid: DoctorIssue[], pathValue: string, reason: string): void {
  invalid.push({ path: pathValue, reason, category: 'runtime', severity: 'fail' });
}

function hasWorktreeSafeBeadsInitializationGuard(content: string): boolean {
  if (!content.includes('bd hooks run post-checkout')) {
    return true;
  }

  if (content.includes('beads_initialized')) {
    return true;
  }

  return content.includes('BEADS_DIR') && content.includes('/dolt') && content.includes('/redirect');
}

function validateSkillFrontmatter(
  alignmentInvalid: DoctorIssue[],
  pathValue: string,
  content: string,
  expectedName: string,
): void {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n/);

  if (frontmatterMatch === null) {
    pushAlignmentInvalid(alignmentInvalid, pathValue, 'missing skill frontmatter');
    return;
  }

  const frontmatter = frontmatterMatch[1];

  if (!frontmatter.includes(`name: ${expectedName}`)) {
    pushAlignmentInvalid(alignmentInvalid, pathValue, `missing skill frontmatter name: ${expectedName}`);
  }

  const descriptionMatch = frontmatter.match(/^description:\s*(.+)$/m);
  if (descriptionMatch === null || descriptionMatch[1].trim().length === 0) {
    pushAlignmentInvalid(alignmentInvalid, pathValue, 'missing skill frontmatter description');
  }
}

function validateAgentFrontmatter(
  alignmentInvalid: DoctorIssue[],
  pathValue: string,
  content: string,
  expectedName: string,
): void {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n/);

  if (frontmatterMatch === null) {
    pushAlignmentInvalid(alignmentInvalid, pathValue, 'missing agent frontmatter');
    return;
  }

  const frontmatter = frontmatterMatch[1];

  if (!frontmatter.includes(`name: ${expectedName}`)) {
    pushAlignmentInvalid(alignmentInvalid, pathValue, `missing agent frontmatter name: ${expectedName}`);
  }

  const descriptionMatch = frontmatter.match(/^description:\s*(.+)$/m);
  if (descriptionMatch === null || descriptionMatch[1].trim().length === 0) {
    pushAlignmentInvalid(alignmentInvalid, pathValue, 'missing agent frontmatter description');
  }
}

export async function runDoctor(options: DoctorCommandOptions): Promise<DoctorResult> {
  const targetDir = path.resolve(options.cwd, options.targetArg ?? '.');
  const targetLabel = path.relative(options.cwd, targetDir) || '.';

  const selectedEntries = managedFileEntries(targetDir);
  const cleanupManifest = getCleanupManifest('legacy-ai-frameworks-v1');

  const missing: string[] = [];
  const invalid: DoctorIssue[] = [];
  const rootWarnings: DoctorIssue[] = [];
  const deprecatedInvalid: DoctorIssue[] = [];
  const deprecatedWarnings: DoctorIssue[] = [];
  const executableWarnings: DoctorIssue[] = [];
  const alignmentInvalid: DoctorIssue[] = [];
  const alignmentWarnings: DoctorIssue[] = [];

  const failFastDeprecatedPaths = new Map<string, string>([
    ['.planning', 'legacy planning workspace present'],
    ['.omp', 'legacy OMP runtime directory present'],
    ['.codex', 'legacy Codex runtime directory present'],
    ['.rules', 'legacy rules runtime directory present'],
    ['.pi/taskplane.json', 'stale taskplane project marker present'],
    ['.pi/agents/sisyphus.md', 'stale legacy role file present'],
    ['.pi/agents/prometheus.md', 'stale legacy role file present'],
    ['.pi/agents/hephaestus.md', 'stale legacy role file present'],
    ['.pi/agents/oracle.md', 'stale legacy role file present'],
    ['.codex/scripts/cognee-sync-planning.sh', 'legacy planning sync script present'],
    ['.codex/scripts/sync-planning-to-cognee.sh', 'legacy planning sync script present'],
    ['.codex/templates/session-handoff.md', 'legacy planning handoff template present'],
  ]);
  const staleArtifactReasons = new Map<string, string>([
    ['.rules/patterns/gsd-workflow.md', 'stale GSD alignment artifact present'],
    ['.rules/patterns/cognee-gsd-integration.md', 'stale GSD alignment artifact present'],
    ['.rules/patterns/omo-agent-contract.md', 'stale OMO artifact present'],
    ['.opencode/worktree.jsonc', 'stale OpenCode artifact present'],
    ['.pi/prompts/land.md', 'stale landing prompt alias present; renamed to `.pi/prompts/serve.md`'],
    ['scripts/land.sh', 'stale landing script alias present; renamed to `scripts/serve.sh`'],
    ['.pi/skills/harness/SKILL.md', 'stale setup skill alias present; renamed to `.pi/skills/bake/SKILL.md`'],
  ]);
  const staleWorkflowMarkers = [
    '.codex/',
    '.omp/',
    '.rules/',
    '--assistant codex',
    'Pi-operated Codex',
    'Codex Compatibility Layer',
    'install-skill --assistant opencode',
    '.planning/STATE.md',
    '.codex/scripts/cognee-sync-planning.sh',
    '.codex/scripts/sync-planning-to-cognee.sh',
  ];
  const staleWorkflowScanPaths = [
    'AGENTS.md',
    'README.md',
    '.pi/settings.json',
    '.pi/SYSTEM.md',
    '.pi/agents/lead.md',
    '.pi/agents/explore.md',
    '.pi/agents/plan.md',
    '.pi/agents/build.md',
    '.pi/agents/review.md',
    '.pi/agents/plan-change.chain.md',
    '.pi/agents/ship-change.chain.md',
    '.pi/extensions/repo-workflows.ts',
    '.pi/extensions/role-workflow.ts',
    '.pi/prompts/adopt.md',
    '.pi/prompts/serve.md',
    '.pi/prompts/promote.md',
    '.pi/prompts/triage.md',
    '.pi/prompts/plan-change.md',
    '.pi/prompts/ship-change.md',
    '.pi/prompts/parallel-wave.md',
    '.pi/prompts/review-change.md',
    '.pi/prompts/feat-change.md',
    '.pi/skills/beads/SKILL.md',
    '.pi/skills/cognee/SKILL.md',
    '.pi/skills/red-green-refactor/SKILL.md',
    '.pi/skills/bake/SKILL.md',
    '.pi/skills/bake/references/pi-harness-command-matrix.md',
    '.pi/skills/bake/references/scaffold-customization-map.md',
    '.pi/skills/bake/references/existing-repo-context-checklist.md',
    '.pi/skills/parallel-wave-design/SKILL.md',
    '.pi/skills/subagent-workflow/SKILL.md',
    'scripts/bootstrap-worktree.sh',
    'scripts/cognee-brief.sh',
    'scripts/sync-artifacts-to-cognee.sh',
    'scripts/serve.sh',
    'scripts/promote.sh',
    'scripts/hooks/post-checkout',
    'config/deploy.cognee.yml',
  ];
  const alignmentManagedPaths = new Set([
    'AGENTS.md',
    '.pi/settings.json',
    '.pi/SYSTEM.md',
    '.pi/agents/lead.md',
    '.pi/agents/explore.md',
    '.pi/agents/plan.md',
    '.pi/agents/build.md',
    '.pi/agents/review.md',
    '.pi/agents/plan-change.chain.md',
    '.pi/agents/ship-change.chain.md',
    '.pi/extensions/repo-workflows.ts',
    '.pi/extensions/role-workflow.ts',
    '.pi/prompts/adopt.md',
    '.pi/prompts/serve.md',
    '.pi/prompts/promote.md',
    '.pi/prompts/triage.md',
    '.pi/prompts/plan-change.md',
    '.pi/prompts/ship-change.md',
    '.pi/prompts/parallel-wave.md',
    '.pi/prompts/review-change.md',
    '.pi/prompts/feat-change.md',
    '.pi/skills/beads/SKILL.md',
    '.pi/skills/cognee/SKILL.md',
    '.pi/skills/red-green-refactor/SKILL.md',
    '.pi/skills/bake/SKILL.md',
    '.pi/skills/bake/references/pi-harness-command-matrix.md',
    '.pi/skills/bake/references/scaffold-customization-map.md',
    '.pi/skills/bake/references/existing-repo-context-checklist.md',
    '.pi/skills/parallel-wave-design/SKILL.md',
    '.pi/skills/subagent-workflow/SKILL.md',
    'scripts/bootstrap-worktree.sh',
    'scripts/cognee-bridge.sh',
    'scripts/cognee-brief.sh',
    'scripts/sync-artifacts-to-cognee.sh',
    'scripts/serve.sh',
    'scripts/promote.sh',
    '.beads/hooks/post-checkout',
    'scripts/hooks/post-checkout',
    'docker/Dockerfile.cognee',
    'config/deploy.cognee.yml',
  ]);

  for (const entry of selectedEntries) {
    if (!(await fileExists(targetDir, entry.path))) {
      missing.push(entry.path);
      if (alignmentManagedPaths.has(entry.path)) {
        pushAlignmentInvalid(alignmentInvalid, entry.path, 'missing required workflow artifact');
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

  const beadsConfig = await readFileIfPresent(targetDir, '.beads/config.yaml');
  if (beadsConfig !== null && !beadsConfig.includes('backup:\n  enabled: false')) {
    pushAlignmentInvalid(alignmentInvalid, '.beads/config.yaml', 'Beads backups must be disabled by default');
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

  const settings = await readFileIfPresent(targetDir, '.pi/settings.json');
  if (settings !== null) {
    if (!settings.includes('repo-workflows.ts')) {
      pushRuntimeInvalid(invalid, '.pi/settings.json', 'missing extension registration for repo-workflows.ts');
    }
    if (!settings.includes('npm:pi-subagents')) {
      pushRuntimeInvalid(invalid, '.pi/settings.json', 'missing package registration for npm:pi-subagents');
    }
    if (!settings.includes('npm:pi-mcp-adapter')) {
      pushRuntimeInvalid(invalid, '.pi/settings.json', 'missing package registration for npm:pi-mcp-adapter');
    }
  }

  const mcpConfig = await readFileIfPresent(targetDir, '.pi/mcp.json');
  if (mcpConfig !== null) {
    if (!mcpConfig.includes('"github"')) {
      pushRuntimeInvalid(invalid, '.pi/mcp.json', 'missing GitHub MCP server entry');
    }
    if (!mcpConfig.includes('@modelcontextprotocol/server-github')) {
      pushRuntimeInvalid(invalid, '.pi/mcp.json', 'missing GitHub MCP server package');
    }
    if (!mcpConfig.includes('${GITHUB_PERSONAL_ACCESS_TOKEN}')) {
      pushRuntimeInvalid(invalid, '.pi/mcp.json', 'missing GitHub MCP token interpolation');
    }
  }

  const systemGuide = await readFileIfPresent(targetDir, '.pi/SYSTEM.md');
  if (systemGuide !== null) {
    if (!systemGuide.includes('AGENTS.md')) {
      pushAlignmentInvalid(alignmentInvalid, '.pi/SYSTEM.md', 'missing AGENTS.md runtime reference');
    }
    if (!systemGuide.includes('.pi/agents/*')) {
      pushAlignmentInvalid(alignmentInvalid, '.pi/SYSTEM.md', 'missing .pi/agents runtime reference');
    }
  }

  const leadAgent = await readFileIfPresent(targetDir, '.pi/agents/lead.md');
  if (leadAgent !== null) {
    validateAgentFrontmatter(alignmentInvalid, '.pi/agents/lead.md', leadAgent, 'lead');
    for (const token of ['plan-change', 'ship-change', 'worktree: true', 'bd ready --json', './scripts/cognee-brief.sh', 'BDD | TDD | Hybrid']) {
      if (!leadAgent.includes(token)) {
        pushAlignmentInvalid(alignmentInvalid, '.pi/agents/lead.md', `missing Pi role guidance: ${token}`);
      }
    }
  }

  const roleWorkflowExtension = await readFileIfPresent(targetDir, '.pi/extensions/role-workflow.ts');
  if (roleWorkflowExtension !== null) {
    for (const token of ["registerCommand('role'", "registerCommand('next-role'", "registerCommand('prev-role'", "registerShortcut('ctrl+.'", "registerShortcut('ctrl+,'", 'before_agent_start', 'ROLE_ORDER', 'ROLE_ALIASES']) {
      if (!roleWorkflowExtension.includes(token)) {
        pushRuntimeInvalid(invalid, '.pi/extensions/role-workflow.ts', `missing role workflow glue: ${token}`);
      }
    }
  }

  const extension = await readFileIfPresent(targetDir, '.pi/extensions/repo-workflows.ts');
  if (extension !== null) {
    for (const token of ["registerCommand('bootstrap-worktree'", "registerCommand('cognee-brief'", 'scripts/bootstrap-worktree.sh', 'scripts/cognee-brief.sh']) {
      if (!extension.includes(token)) {
        pushRuntimeInvalid(invalid, '.pi/extensions/repo-workflows.ts', `missing native workflow command glue: ${token}`);
      }
    }
    if (extension.includes("registerCommand('bake'")) {
      pushRuntimeInvalid(invalid, '.pi/extensions/repo-workflows.ts', 'shadowing `/bake` extension command present; keep `/bake` user-global');
    }
    if (extension.includes("registerCommand('serve'")) {
      pushRuntimeInvalid(invalid, '.pi/extensions/repo-workflows.ts', 'shadowing `/serve` extension command present; keep `/serve` prompt-native');
    }
  }

  const agentsGuide = await readFileIfPresent(targetDir, 'AGENTS.md');
  if (agentsGuide !== null) {
    for (const token of ['.pi/agents/*', '.pi/extensions/*', '.pi/prompts/*', '.pi/skills/*', '.pi/skills/cognee/SKILL.md', '.pi/skills/red-green-refactor/SKILL.md', 'Ctrl+.', '/role <name>', '/next-role', '/prev-role', '/feat-change', './scripts/bootstrap-worktree.sh', './scripts/cognee-brief.sh', './scripts/serve.sh', './scripts/promote.sh']) {
      if (!agentsGuide.includes(token)) {
        pushAlignmentInvalid(alignmentInvalid, 'AGENTS.md', `missing Pi-native workflow reference: ${token}`);
      }
    }
  }

  if (await fileExists(targetDir, '.pi/prompts/bake.md')) {
    pushAlignmentInvalid(
      alignmentInvalid,
      '.pi/prompts/bake.md',
      'shadowing repo-local `/bake` prompt present; keep `/bake` user-global and use `/skill:bake` for baked repos',
    );
  }

  if (await fileExists(targetDir, 'scripts/bake.sh')) {
    pushAlignmentInvalid(
      alignmentInvalid,
      'scripts/bake.sh',
      'stale repo-local bake backend present; keep `/bake` user-global and use `/skill:bake` for baked repos',
    );
  }

  const adoptPrompt = await readFileIfPresent(targetDir, '.pi/prompts/adopt.md');
  if (adoptPrompt !== null && !adoptPrompt.includes('pi-harness --mode existing . --init-json')) {
    pushAlignmentInvalid(alignmentInvalid, '.pi/prompts/adopt.md', 'missing existing-repo adoption command');
  }

  const servePrompt = await readFileIfPresent(targetDir, '.pi/prompts/serve.md');
  if (servePrompt !== null && !servePrompt.includes('scripts/serve.sh')) {
    pushAlignmentInvalid(alignmentInvalid, '.pi/prompts/serve.md', 'missing serve workflow script guidance');
  }
  if (servePrompt !== null && !servePrompt.includes('context.md')) {
    pushAlignmentInvalid(alignmentInvalid, '.pi/prompts/serve.md', 'missing Cognee artifact-sync guidance');
  }
  if (servePrompt !== null && !servePrompt.includes('STICKYNOTE.md')) {
    pushAlignmentInvalid(alignmentInvalid, '.pi/prompts/serve.md', 'missing local handoff note guidance');
  }
  if (servePrompt !== null && !servePrompt.includes('completed-work summary')) {
    pushAlignmentInvalid(alignmentInvalid, '.pi/prompts/serve.md', 'missing completed-work summary guidance');
  }
  if (servePrompt !== null && !servePrompt.includes('refreshes the PR body')) {
    pushAlignmentInvalid(alignmentInvalid, '.pi/prompts/serve.md', 'missing explicit PR body refresh guidance');
  }

  const promotePrompt = await readFileIfPresent(targetDir, '.pi/prompts/promote.md');
  if (promotePrompt !== null && !promotePrompt.includes('scripts/promote.sh')) {
    pushAlignmentInvalid(alignmentInvalid, '.pi/prompts/promote.md', 'missing promote workflow script guidance');
  }
  if (promotePrompt !== null && !promotePrompt.includes('`dev`')) {
    pushAlignmentInvalid(alignmentInvalid, '.pi/prompts/promote.md', 'missing dev-branch promotion guidance');
  }
  if (promotePrompt !== null && !promotePrompt.includes('PR to `main`')) {
    pushAlignmentInvalid(alignmentInvalid, '.pi/prompts/promote.md', 'missing main pull request guidance');
  }
  if (promotePrompt !== null && !promotePrompt.includes('refreshes the PR body')) {
    pushAlignmentInvalid(alignmentInvalid, '.pi/prompts/promote.md', 'missing explicit promotion PR refresh guidance');
  }

  const triagePrompt = await readFileIfPresent(targetDir, '.pi/prompts/triage.md');
  if (triagePrompt !== null && !triagePrompt.includes('bd ready --json')) {
    pushAlignmentInvalid(alignmentInvalid, '.pi/prompts/triage.md', 'missing Beads ready-work guidance');
  }
  if (triagePrompt !== null && !triagePrompt.includes('./scripts/cognee-brief.sh')) {
    pushAlignmentInvalid(alignmentInvalid, '.pi/prompts/triage.md', 'missing Cognee triage guidance');
  }

  const planChangePrompt = await readFileIfPresent(targetDir, '.pi/prompts/plan-change.md');
  if (planChangePrompt !== null && !planChangePrompt.includes('explore -> plan')) {
    pushAlignmentInvalid(alignmentInvalid, '.pi/prompts/plan-change.md', 'missing plan role handoff guidance');
  }
  if (planChangePrompt !== null && !planChangePrompt.includes('RED -> GREEN -> REFACTOR')) {
    pushAlignmentInvalid(alignmentInvalid, '.pi/prompts/plan-change.md', 'missing test-first planning guidance');
  }

  const shipChangePrompt = await readFileIfPresent(targetDir, '.pi/prompts/ship-change.md');
  if (shipChangePrompt !== null && !shipChangePrompt.includes('explore -> plan -> build -> review')) {
    pushAlignmentInvalid(alignmentInvalid, '.pi/prompts/ship-change.md', 'missing ship role handoff guidance');
  }
  if (shipChangePrompt !== null && !shipChangePrompt.includes('RED -> GREEN -> REFACTOR')) {
    pushAlignmentInvalid(alignmentInvalid, '.pi/prompts/ship-change.md', 'missing test-first execution guidance');
  }

  const parallelWavePrompt = await readFileIfPresent(targetDir, '.pi/prompts/parallel-wave.md');
  if (parallelWavePrompt !== null && !parallelWavePrompt.includes('worktree: true')) {
    pushAlignmentInvalid(alignmentInvalid, '.pi/prompts/parallel-wave.md', 'missing isolated parallel-wave guidance');
  }

  const reviewChangePrompt = await readFileIfPresent(targetDir, '.pi/prompts/review-change.md');
  if (reviewChangePrompt !== null && !reviewChangePrompt.includes('`review`')) {
    pushAlignmentInvalid(alignmentInvalid, '.pi/prompts/review-change.md', 'missing review role guidance');
  }

  const featChangePrompt = await readFileIfPresent(targetDir, '.pi/prompts/feat-change.md');
  if (featChangePrompt !== null) {
    for (const token of ['`lead`', 'plan-change', 'ship-change', 'parallel-wave', 'BDD, TDD, or hybrid', 'explicit RED command']) {
      if (!featChangePrompt.includes(token)) {
        pushAlignmentInvalid(alignmentInvalid, '.pi/prompts/feat-change.md', `missing feature-routing guidance: ${token}`);
      }
    }
  }

  const beadsSkill = await readFileIfPresent(targetDir, '.pi/skills/beads/SKILL.md');
  if (beadsSkill !== null) {
    validateSkillFrontmatter(alignmentInvalid, '.pi/skills/beads/SKILL.md', beadsSkill, 'beads');
    if (!beadsSkill.includes('bd ready --json')) {
      pushAlignmentInvalid(alignmentInvalid, '.pi/skills/beads/SKILL.md', 'missing Beads claim-first guidance');
    }
    if (!beadsSkill.includes('scripts/serve.sh')) {
      pushAlignmentInvalid(alignmentInvalid, '.pi/skills/beads/SKILL.md', 'missing serving script guidance');
    }
  }

  const bakeSkill = await readFileIfPresent(targetDir, '.pi/skills/bake/SKILL.md');
  if (bakeSkill !== null) {
    validateSkillFrontmatter(alignmentInvalid, '.pi/skills/bake/SKILL.md', bakeSkill, 'bake');
    if (!bakeSkill.includes('/skill:bake')) {
      pushAlignmentInvalid(alignmentInvalid, '.pi/skills/bake/SKILL.md', 'missing /skill:bake guidance');
    }
    if (!bakeSkill.includes('--cleanup-confirm-all')) {
      pushAlignmentInvalid(alignmentInvalid, '.pi/skills/bake/SKILL.md', 'missing existing-repo cleanup-confirm guidance');
    }
    if (!bakeSkill.includes('pi-harness doctor <target>')) {
      pushAlignmentInvalid(alignmentInvalid, '.pi/skills/bake/SKILL.md', 'missing doctor follow-up guidance');
    }
    if (!bakeSkill.includes('.pi/extensions/role-workflow.ts')) {
      pushAlignmentInvalid(alignmentInvalid, '.pi/skills/bake/SKILL.md', 'missing role workflow extension guidance');
    }
  }

  const cogneeSkill = await readFileIfPresent(targetDir, '.pi/skills/cognee/SKILL.md');
  if (cogneeSkill !== null) {
    validateSkillFrontmatter(alignmentInvalid, '.pi/skills/cognee/SKILL.md', cogneeSkill, 'cognee');
    for (const token of ['./scripts/cognee-brief.sh', 'knowledge garden', 'local repository evidence remains sufficient']) {
      if (!cogneeSkill.includes(token)) {
        pushAlignmentInvalid(alignmentInvalid, '.pi/skills/cognee/SKILL.md', `missing Cognee workflow guidance: ${token}`);
      }
    }
  }

  const redGreenRefactorSkill = await readFileIfPresent(targetDir, '.pi/skills/red-green-refactor/SKILL.md');
  if (redGreenRefactorSkill !== null) {
    validateSkillFrontmatter(alignmentInvalid, '.pi/skills/red-green-refactor/SKILL.md', redGreenRefactorSkill, 'red-green-refactor');
    for (const token of ['apps/cli/features/', 'pnpm test:bdd', 'RED', 'GREEN', 'REFACTOR']) {
      if (!redGreenRefactorSkill.includes(token)) {
        pushAlignmentInvalid(alignmentInvalid, '.pi/skills/red-green-refactor/SKILL.md', `missing red-green-refactor guidance: ${token}`);
      }
    }
  }

  const parallelWaveSkill = await readFileIfPresent(targetDir, '.pi/skills/parallel-wave-design/SKILL.md');
  if (parallelWaveSkill !== null) {
    validateSkillFrontmatter(
      alignmentInvalid,
      '.pi/skills/parallel-wave-design/SKILL.md',
      parallelWaveSkill,
      'parallel-wave-design',
    );
    for (const token of ['3-5 files', 'project-wide build, test, or lint', 'worktree: true']) {
      if (!parallelWaveSkill.includes(token)) {
        pushAlignmentInvalid(alignmentInvalid, '.pi/skills/parallel-wave-design/SKILL.md', `missing Pi subagent guidance: ${token}`);
      }
    }
  }

  const subagentWorkflowSkill = await readFileIfPresent(targetDir, '.pi/skills/subagent-workflow/SKILL.md');
  if (subagentWorkflowSkill !== null) {
    validateSkillFrontmatter(
      alignmentInvalid,
      '.pi/skills/subagent-workflow/SKILL.md',
      subagentWorkflowSkill,
      'subagent-workflow',
    );
    for (const token of ['lead', 'explore', 'plan', 'build', 'review', 'Cognee brief', 'RED -> GREEN -> REFACTOR']) {
      if (!subagentWorkflowSkill.includes(token)) {
        pushAlignmentInvalid(alignmentInvalid, '.pi/skills/subagent-workflow/SKILL.md', `missing role workflow guidance: ${token}`);
      }
    }
  }

  const cogneeBrief = await readFileIfPresent(targetDir, 'scripts/cognee-brief.sh');
  if (cogneeBrief !== null && !cogneeBrief.includes('scripts/cognee-bridge.sh')) {
    pushRuntimeInvalid(invalid, 'scripts/cognee-brief.sh', 'missing runtime backend reference');
  }

  const syncArtifactsScript = await readFileIfPresent(targetDir, 'scripts/sync-artifacts-to-cognee.sh');
  if (syncArtifactsScript !== null) {
    for (const token of ['scripts/cognee-bridge.sh', 'context.md', 'plan.md', 'progress.md', 'review.md', 'wave.md']) {
      if (!syncArtifactsScript.includes(token)) {
        pushRuntimeInvalid(invalid, 'scripts/sync-artifacts-to-cognee.sh', `missing runtime backend reference: ${token}`);
      }
    }
  }

  const bootstrapScript = await readFileIfPresent(targetDir, 'scripts/bootstrap-worktree.sh');
  if (bootstrapScript !== null) {
    if (!bootstrapScript.includes('bd ready --json')) {
      pushAlignmentInvalid(alignmentInvalid, 'scripts/bootstrap-worktree.sh', 'missing Beads ready-work guidance');
    }
    if (!bootstrapScript.includes('AGENTS.md')) {
      pushAlignmentInvalid(alignmentInvalid, 'scripts/bootstrap-worktree.sh', 'missing AGENTS guidance reference');
    }
  }

  const serveScript = await readFileIfPresent(targetDir, 'scripts/serve.sh');
  if (serveScript !== null) {
    if (!serveScript.includes('--base dev')) {
      pushAlignmentInvalid(alignmentInvalid, 'scripts/serve.sh', 'missing dev pull request target');
    }
    if (!serveScript.includes('main" || "$branch" == "dev')) {
      pushAlignmentInvalid(alignmentInvalid, 'scripts/serve.sh', 'missing protected branch guardrail');
    }
    if (!serveScript.includes('sync-artifacts-to-cognee.sh')) {
      pushAlignmentInvalid(alignmentInvalid, 'scripts/serve.sh', 'missing Pi artifact sync hook');
    }
    if (!serveScript.includes('validate_sticky_note')) {
      pushAlignmentInvalid(alignmentInvalid, 'scripts/serve.sh', 'missing STICKYNOTE validation guardrail');
    }
    if (!serveScript.includes('gh pr edit')) {
      pushAlignmentInvalid(alignmentInvalid, 'scripts/serve.sh', 'missing explicit PR refresh path');
    }
    if (!serveScript.includes('Post-serve branch summary:')) {
      pushAlignmentInvalid(alignmentInvalid, 'scripts/serve.sh', 'missing post-serve summary output');
    }
  }


  const promoteScript = await readFileIfPresent(targetDir, 'scripts/promote.sh');
  if (promoteScript !== null) {
    if (!promoteScript.includes('--base main')) {
      pushAlignmentInvalid(alignmentInvalid, 'scripts/promote.sh', 'missing main pull request target');
    }
    if (!promoteScript.includes('branch" != "dev"')) {
      pushAlignmentInvalid(alignmentInvalid, 'scripts/promote.sh', 'missing dev-branch guardrail');
    }
    if (!promoteScript.includes('gh pr edit')) {
      pushAlignmentInvalid(alignmentInvalid, 'scripts/promote.sh', 'missing explicit promotion PR refresh path');
    }
    if (!promoteScript.includes('clean working tree on dev')) {
      pushAlignmentInvalid(alignmentInvalid, 'scripts/promote.sh', 'missing clean-dev-worktree guardrail');
    }
    if (!promoteScript.includes('Post-promotion summary:')) {
      pushAlignmentInvalid(alignmentInvalid, 'scripts/promote.sh', 'missing post-promotion summary output');
    }
  }

  const cogneeDeployConfig = await readFileIfPresent(targetDir, 'config/deploy.cognee.yml');
  if (cogneeDeployConfig !== null && !cogneeDeployConfig.includes('docker/Dockerfile.cognee')) {
    pushAlignmentInvalid(alignmentInvalid, 'config/deploy.cognee.yml', 'missing plain dockerfile path');
  }

  for (const [artifactPath, reason] of staleArtifactReasons) {
    if (await fileExists(targetDir, artifactPath)) {
      pushAlignmentInvalid(alignmentInvalid, artifactPath, reason);
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

    pushAlignmentInvalid(alignmentInvalid, scanPath, `contains stale workflow reference: ${marker}`);
  }

  const beadsPostCheckout = await readFileIfPresent(targetDir, '.beads/hooks/post-checkout');
  if (beadsPostCheckout !== null && !beadsPostCheckout.includes('bootstrap-worktree.sh')) {
    pushAlignmentInvalid(alignmentInvalid, '.beads/hooks/post-checkout', 'missing worktree bootstrap fallback reference');
  }
  if (beadsPostCheckout !== null && !hasWorktreeSafeBeadsInitializationGuard(beadsPostCheckout)) {
    pushAlignmentInvalid(alignmentInvalid, '.beads/hooks/post-checkout', 'missing Beads initialization guard for worktree-safe hook execution');
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
    if (await fileExists(targetDir, entry.path) && !(await isExecutable(targetDir, entry.path))) {
      executableWarnings.push({ path: entry.path, reason: 'not executable', category: 'executable', severity: 'warn' });
    }
  }

  invalid.push(...deprecatedInvalid);
  invalid.push(...alignmentInvalid);

  const warnings = [...rootWarnings, ...deprecatedWarnings, ...executableWarnings, ...alignmentWarnings];
  const alignmentMissingCount = missing.filter((issuePath) => alignmentManagedPaths.has(issuePath)).length;
  const runtimeMissingCount = missing.length - alignmentMissingCount;
  const invalidRuntimeCount = invalid.filter((issue) => issue.category === 'runtime').length;
  const invalidAlignmentCount = invalid.filter((issue) => issue.category === 'alignment').length;
  const invalidDeprecatedCount = invalid.filter((issue) => issue.category === 'deprecated-artifact').length;

  const groups: DoctorGroupResult[] = [
    buildGroupStatus('runtime-baseline', { missing: runtimeMissingCount, invalid: invalidRuntimeCount }),
    buildGroupStatus('workflow-alignment', { missing: alignmentMissingCount, invalid: invalidAlignmentCount, warnings: alignmentWarnings.length }),
    buildGroupStatus('root-scaffold-hints', { warnings: rootWarnings.length }),
    buildGroupStatus('deprecated-artifacts', { invalid: invalidDeprecatedCount, warnings: deprecatedWarnings.length }),
    buildGroupStatus('executables', { warnings: executableWarnings.length }),
  ];

  const status = missing.length > 0 || invalid.length > 0 ? 'fail' : warnings.length > 0 ? 'warn' : 'pass';
  const recommendations = buildRecommendations(targetLabel, {
    rootWarnings,
    deprecatedInvalid,
    deprecatedWarnings,
    executableWarnings,
    alignmentWarnings,
    alignmentInvalid,
  });

  return {
    targetDir,
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
    `Scaffold doctor: ${SCAFFOLD_BASELINE}`,
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
