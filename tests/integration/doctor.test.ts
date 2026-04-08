import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { formatDoctorReport, runDoctor } from '../../src/commands/doctor.js';
import { runInit } from '../../src/commands/init.js';

async function scaffoldProject(workspace: string, projectArg: string): Promise<string> {
  await runInit({
    cwd: workspace,
    projectArg,
    mode: 'auto',
    dryRun: false,
    force: false,
    skipGit: true,
    detectPorts: false
  });

  return path.join(workspace, projectArg);
}

async function auditProject(workspace: string, targetDir: string, json = false) {
  return runDoctor({
    cwd: workspace,
    targetArg: targetDir,
    json
  });
}

describe('runDoctor', () => {
  it('passes for a fresh pi-native scaffold', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-doctor-'));
    const targetDir = await scaffoldProject(workspace, 'doctor-pi-native-base');

    const result = await auditProject(workspace, targetDir);
    const report = formatDoctorReport(result);

    expect(result).not.toHaveProperty('assistant');
    expect(result.status).toBe('pass');
    expect(report).toContain('Scaffold doctor: pi-native');
    expect(report).toContain('Status: pass');
    expect(result.groups).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'runtime-baseline', status: 'pass' }),
        expect.objectContaining({ name: 'workflow-alignment', status: 'pass' })
      ])
    );
  });

  it('validates the pi-native baseline in json mode', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-doctor-'));
    const targetDir = await scaffoldProject(workspace, 'doctor-pi-native-json');

    const result = await auditProject(workspace, targetDir, true);

    expect(result).not.toHaveProperty('assistant');
    expect(result.status).toBe('pass');
    expect(result.summary).toEqual({ passed: 5, warnings: 0, missing: 0, invalid: 0 });
    expect(result.groups).toEqual([
      { name: 'runtime-baseline', status: 'pass' },
      { name: 'workflow-alignment', status: 'pass' },
      { name: 'root-scaffold-hints', status: 'pass' },
      { name: 'deprecated-artifacts', status: 'pass' },
      { name: 'executables', status: 'pass' }
    ]);
  });

  it('fails when Beads backups are enabled in the scaffold config', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-doctor-'));
    const targetDir = await scaffoldProject(workspace, 'doctor-beads-backup');

    await writeFile(path.join(targetDir, '.beads', 'config.yaml'), 'backup:\n  enabled: true\n', 'utf8');

    const result = await auditProject(workspace, targetDir);

    expect(result.status).toBe('fail');
    expect(result.groups).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'workflow-alignment', status: 'fail' })])
    );
    expect(result.invalid).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: '.beads/config.yaml',
          reason: 'Beads backups must be disabled by default'
        })
      ])
    );
  });

  it('fails when AGENTS.md loses Pi-native workflow references', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-doctor-'));
    const targetDir = await scaffoldProject(workspace, 'doctor-alignment');

    await writeFile(path.join(targetDir, 'AGENTS.md'), '# AGENTS\n\nRuntime only.\n', 'utf8');

    const result = await auditProject(workspace, targetDir);

    expect(result.status).toBe('fail');
    expect(result.groups).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'workflow-alignment', status: 'fail' })])
    );
    expect(result.invalid).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: 'AGENTS.md',
          reason: 'missing Pi-native workflow reference: .pi/extensions/*'
        }),
        expect.objectContaining({
          path: 'AGENTS.md',
          reason: 'missing Pi-native workflow reference: ./scripts/bootstrap-worktree.sh'
        })
      ])
    );
  });

  it('fails when a stale OMO contract file is still present', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-doctor-'));
    const targetDir = await scaffoldProject(workspace, 'doctor-stale-omo');

    await mkdir(path.join(targetDir, '.rules', 'patterns'), { recursive: true });
    await writeFile(path.join(targetDir, '.rules', 'patterns', 'omo-agent-contract.md'), '# stale omo\n', 'utf8');

    const result = await auditProject(workspace, targetDir);

    expect(result.status).toBe('fail');
    expect(result.invalid).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: '.rules/patterns/omo-agent-contract.md',
          reason: 'stale OMO artifact present'
        })
      ])
    );
  });

  it('fails when the old /land prompt alias is still present', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-doctor-'));
    const targetDir = await scaffoldProject(workspace, 'doctor-stale-serve-alias');

    await mkdir(path.join(targetDir, '.pi', 'prompts'), { recursive: true });
    await writeFile(path.join(targetDir, '.pi', 'prompts', 'land.md'), '# stale alias\n', 'utf8');

    const result = await auditProject(workspace, targetDir);

    expect(result.status).toBe('fail');
    expect(result.invalid).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: '.pi/prompts/land.md',
          reason: 'stale landing prompt alias present; renamed to `.pi/prompts/serve.md`'
        })
      ])
    );
  });

  it('fails when the old landing script alias is still present', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-doctor-'));
    const targetDir = await scaffoldProject(workspace, 'doctor-stale-serve-script-alias');

    await mkdir(path.join(targetDir, 'scripts'), { recursive: true });
    await writeFile(path.join(targetDir, 'scripts', 'land.sh'), '# stale alias\n', 'utf8');

    const result = await auditProject(workspace, targetDir);

    expect(result.status).toBe('fail');
    expect(result.invalid).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: 'scripts/land.sh',
          reason: 'stale landing script alias present; renamed to `scripts/serve.sh`'
        })
      ])
    );
  });

  it('fails when the old /harness setup skill alias is still present', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-doctor-'));
    const targetDir = await scaffoldProject(workspace, 'doctor-stale-bake-alias');

    await mkdir(path.join(targetDir, '.pi', 'skills', 'harness'), { recursive: true });
    await writeFile(path.join(targetDir, '.pi', 'skills', 'harness', 'SKILL.md'), '# stale alias\n', 'utf8');

    const result = await auditProject(workspace, targetDir);

    expect(result.status).toBe('fail');
    expect(result.invalid).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: '.pi/skills/harness/SKILL.md',
          reason: 'stale setup skill alias present; renamed to `.pi/skills/bake/SKILL.md`'
        })
      ])
    );
  });

  it('fails when the Beads post-checkout hook loses the worktree bootstrap fallback', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-doctor-'));
    const targetDir = await scaffoldProject(workspace, 'doctor-hook-seam');

    await writeFile(path.join(targetDir, '.beads', 'hooks', 'post-checkout'), '#!/bin/sh\nexit 0\n', 'utf8');

    const result = await auditProject(workspace, targetDir);

    expect(result.status).toBe('fail');
    expect(result.invalid).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: '.beads/hooks/post-checkout',
          reason: 'missing worktree bootstrap fallback reference'
        })
      ])
    );
  });

  it('fails when the triage prompt loses Beads ready-work guidance', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-doctor-'));
    const targetDir = await scaffoldProject(workspace, 'doctor-triage-guidance');

    const triagePath = path.join(targetDir, '.pi', 'prompts', 'triage.md');
    const triage = await readFile(triagePath, 'utf8');
    await writeFile(triagePath, triage.replace('bd ready --json', 'bd-ready-json'), 'utf8');

    const result = await auditProject(workspace, targetDir);

    expect(result.status).toBe('fail');
    expect(result.invalid).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: '.pi/prompts/triage.md',
          reason: 'missing Beads ready-work guidance'
        })
      ])
    );
  });

  it('fails when the triage prompt loses Cognee guidance', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-doctor-'));
    const targetDir = await scaffoldProject(workspace, 'doctor-triage-cognee');

    const triagePath = path.join(targetDir, '.pi', 'prompts', 'triage.md');
    const triage = await readFile(triagePath, 'utf8');
    await writeFile(triagePath, triage.replace('./scripts/cognee-brief.sh', './scripts/cognee-brief'), 'utf8');

    const result = await auditProject(workspace, targetDir);

    expect(result.status).toBe('fail');
    expect(result.invalid).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: '.pi/prompts/triage.md',
          reason: 'missing Cognee triage guidance'
        })
      ])
    );
  });

  it('fails when the feat-change prompt loses feature-routing guidance', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-doctor-'));
    const targetDir = await scaffoldProject(workspace, 'doctor-feat-change-guidance');

    const promptPath = path.join(targetDir, '.pi', 'prompts', 'feat-change.md');
    const prompt = await readFile(promptPath, 'utf8');
    await writeFile(promptPath, prompt.replace('explicit RED command', 'explicit red command'), 'utf8');

    const result = await auditProject(workspace, targetDir);

    expect(result.status).toBe('fail');
    expect(result.invalid).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: '.pi/prompts/feat-change.md',
          reason: 'missing feature-routing guidance: explicit RED command'
        })
      ])
    );
  });

  it('fails when a skill loses required frontmatter description metadata', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-doctor-'));
    const targetDir = await scaffoldProject(workspace, 'doctor-skill-frontmatter');

    const skillPath = path.join(targetDir, '.pi', 'skills', 'beads', 'SKILL.md');
    const skill = await readFile(skillPath, 'utf8');
    await writeFile(
      skillPath,
      skill.replace(
        'description: Use this skill when the repository tracks work in Beads and you need the project-local operating loop.\n',
        '',
      ),
      'utf8',
    );

    const result = await auditProject(workspace, targetDir);

    expect(result.status).toBe('fail');
    expect(result.invalid).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: '.pi/skills/beads/SKILL.md',
          reason: 'missing skill frontmatter description'
        })
      ])
    );
  });

  it('fails when the parallel-wave skill loses worktree guidance', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-doctor-'));
    const targetDir = await scaffoldProject(workspace, 'doctor-parallel-guidance');

    const skillPath = path.join(targetDir, '.pi', 'skills', 'parallel-wave-design', 'SKILL.md');
    const skill = await readFile(skillPath, 'utf8');
    await writeFile(skillPath, skill.replace('worktree: true', 'worktree true'), 'utf8');

    const result = await auditProject(workspace, targetDir);

    expect(result.status).toBe('fail');
    expect(result.invalid).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: '.pi/skills/parallel-wave-design/SKILL.md',
          reason: 'missing Pi subagent guidance: worktree: true'
        })
      ])
    );
  });

  it('fails when the red-green-refactor skill loses BDD guidance', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-doctor-'));
    const targetDir = await scaffoldProject(workspace, 'doctor-red-green-guidance');

    const skillPath = path.join(targetDir, '.pi', 'skills', 'red-green-refactor', 'SKILL.md');
    const skill = await readFile(skillPath, 'utf8');
    await writeFile(skillPath, skill.replace('pnpm test:bdd', 'pnpm test-bdd'), 'utf8');

    const result = await auditProject(workspace, targetDir);

    expect(result.status).toBe('fail');
    expect(result.invalid).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: '.pi/skills/red-green-refactor/SKILL.md',
          reason: 'missing red-green-refactor guidance: pnpm test:bdd'
        })
      ])
    );
  });

  it('fails when project settings lose pi-subagents package registration', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-doctor-'));
    const targetDir = await scaffoldProject(workspace, 'doctor-subagents-package');

    const settingsPath = path.join(targetDir, '.pi', 'settings.json');
    const settings = await readFile(settingsPath, 'utf8');
    await writeFile(settingsPath, settings.replace('"npm:pi-subagents"', '"npm:missing-package"'), 'utf8');

    const result = await auditProject(workspace, targetDir);

    expect(result.status).toBe('fail');
    expect(result.invalid).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: '.pi/settings.json',
          reason: 'missing package registration for npm:pi-subagents'
        })
      ])
    );
  });

  it('fails when the role workflow extension loses role cycling shortcuts', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-doctor-'));
    const targetDir = await scaffoldProject(workspace, 'doctor-role-workflow');

    const extensionPath = path.join(targetDir, '.pi', 'extensions', 'role-workflow.ts');
    const extension = await readFile(extensionPath, 'utf8');
    await writeFile(extensionPath, extension.replace("registerShortcut('ctrl+.'", "registerShortcut('alt+/'"), 'utf8');

    const result = await auditProject(workspace, targetDir);

    expect(result.status).toBe('fail');
    expect(result.invalid).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: '.pi/extensions/role-workflow.ts',
          reason: "missing role workflow glue: registerShortcut('ctrl+.'"
        })
      ])
    );
  });

  it('fails when a stale taskplane marker is still present', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-doctor-'));
    const targetDir = await scaffoldProject(workspace, 'doctor-taskplane-marker');

    await writeFile(path.join(targetDir, '.pi', 'taskplane.json'), '{"migrations":{"applied":{}}}\n', 'utf8');

    const result = await auditProject(workspace, targetDir);

    expect(result.status).toBe('fail');
    expect(result.invalid).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: '.pi/taskplane.json',
          reason: expect.stringContaining('--cleanup-manifest legacy-ai-frameworks-v1 --init-json')
        })
      ])
    );
  });

  it('fails when a stale mythic role file is still present', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-doctor-'));
    const targetDir = await scaffoldProject(workspace, 'doctor-legacy-role-file');

    await writeFile(path.join(targetDir, '.pi', 'agents', 'sisyphus.md'), '---\nname: sisyphus\n---\nlegacy\n', 'utf8');

    const result = await auditProject(workspace, targetDir);

    expect(result.status).toBe('fail');
    expect(result.invalid).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: '.pi/agents/sisyphus.md',
          reason: expect.stringContaining('stale legacy role file present')
        })
      ])
    );
  });

  it('fails when the Pi-native extension loses cognee-brief workflow command glue', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-doctor-'));
    const targetDir = await scaffoldProject(workspace, 'doctor-runtime-glue');

    const extensionPath = path.join(targetDir, '.pi', 'extensions', 'repo-workflows.ts');
    const extension = await readFile(extensionPath, 'utf8');
    await writeFile(extensionPath, extension.replaceAll('scripts/cognee-brief.sh', 'scripts/cognee-brief'), 'utf8');

    const result = await auditProject(workspace, targetDir);

    expect(result.status).toBe('fail');
    expect(result.groups).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'runtime-baseline', status: 'fail' })])
    );
    expect(result.invalid).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: '.pi/extensions/repo-workflows.ts',
          reason: 'missing native workflow command glue: scripts/cognee-brief.sh'
        })
      ])
    );
  });

  it('fails when the repo workflow extension shadows the prompt-native /serve flow', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-doctor-'));
    const targetDir = await scaffoldProject(workspace, 'doctor-serve-shadow');

    const extensionPath = path.join(targetDir, '.pi', 'extensions', 'repo-workflows.ts');
    const extension = await readFile(extensionPath, 'utf8');
    const shadow = `
  pi.registerCommand('serve', {
    description: 'shadow',
    handler: async (_args: string, ctx: CommandContext) => {
      ctx.ui.notify('shadow');
    },
  });
`;
    await writeFile(extensionPath, extension.replace('\n}\n', `${shadow}}\n`), 'utf8');

    const result = await auditProject(workspace, targetDir);

    expect(result.status).toBe('fail');
    expect(result.invalid).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: '.pi/extensions/repo-workflows.ts',
          reason: 'shadowing `/serve` extension command present; keep `/serve` prompt-native'
        })
      ])
    );
  });

  it('fails when serve.sh loses the Pi artifact sync hook', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-doctor-'));
    const targetDir = await scaffoldProject(workspace, 'doctor-land-sync-hook');

    const servePath = path.join(targetDir, 'scripts', 'serve.sh');
    const serveScript = await readFile(servePath, 'utf8');
    await writeFile(servePath, serveScript.replace('sync-artifacts-to-cognee.sh', 'sync-artifacts'), 'utf8');

    const result = await auditProject(workspace, targetDir);

    expect(result.status).toBe('fail');
    expect(result.invalid).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: 'scripts/serve.sh',
          reason: 'missing Pi artifact sync hook'
        })
      ])
    );
  });

  it('fails when a stale GSD alignment artifact is still present', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-doctor-'));
    const targetDir = await scaffoldProject(workspace, 'doctor-stale-gsd-file');

    await mkdir(path.join(targetDir, '.rules', 'patterns'), { recursive: true });
    await writeFile(path.join(targetDir, '.rules', 'patterns', 'gsd-workflow.md'), '# legacy gsd workflow\n', 'utf8');

    const result = await auditProject(workspace, targetDir);

    expect(result.status).toBe('fail');
    expect(result.invalid).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: '.rules/patterns/gsd-workflow.md',
          reason: 'stale GSD alignment artifact present'
        })
      ])
    );
  });

  it('fails when a stale OpenCode worktree config is still present', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-doctor-'));
    const targetDir = await scaffoldProject(workspace, 'doctor-stale-opencode');

    await mkdir(path.join(targetDir, '.opencode'), { recursive: true });
    await writeFile(path.join(targetDir, '.opencode', 'worktree.jsonc'), '{"$schema":"https://registry.kdco.dev/schemas/worktree.json"}\n', 'utf8');

    const result = await auditProject(workspace, targetDir);

    expect(result.status).toBe('fail');
    expect(result.invalid).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: '.opencode/worktree.jsonc',
          reason: 'stale OpenCode artifact present'
        })
      ])
    );
  });

  it('fails when a managed workflow asset regresses to assistant-based guidance', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-doctor-'));
    const targetDir = await scaffoldProject(workspace, 'doctor-stale-assistant-guidance');

    const skillPath = path.join(targetDir, '.pi', 'skills', 'bake', 'SKILL.md');
    const skill = await readFile(skillPath, 'utf8');
    await writeFile(skillPath, `${skill}\nLegacy command: pi-harness --assistant codex\n`, 'utf8');

    const result = await auditProject(workspace, targetDir);

    expect(result.status).toBe('fail');
    expect(result.invalid).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: '.pi/skills/bake/SKILL.md',
          reason: 'contains stale workflow reference: --assistant codex'
        })
      ])
    );
  });

  it('fails when deploy config regresses to the legacy Codex docker path', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-doctor-'));
    const targetDir = await scaffoldProject(workspace, 'doctor-legacy-docker-path');

    const deployPath = path.join(targetDir, 'config', 'deploy.cognee.yml');
    const deployConfig = await readFile(deployPath, 'utf8');
    await writeFile(deployPath, deployConfig.replace('docker/Dockerfile.cognee', '.codex/Dockerfile.cognee'), 'utf8');

    const result = await auditProject(workspace, targetDir);

    expect(result.status).toBe('fail');
    expect(result.invalid).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: 'config/deploy.cognee.yml',
          reason: 'missing plain dockerfile path'
        })
      ])
    );
  });

  it('fails when a Pi-native repo is missing a shared backend file', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-doctor-'));
    const targetDir = await scaffoldProject(workspace, 'doctor-missing');

    await rm(path.join(targetDir, 'scripts', 'cognee-bridge.sh'));

    const result = await auditProject(workspace, targetDir);

    expect(result.status).toBe('fail');
    expect(result.missing).toContain('scripts/cognee-bridge.sh');
  });

  it('warns when an expected executable loses its execute bit', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-doctor-'));
    const targetDir = await scaffoldProject(workspace, 'doctor-exec');

    await chmod(path.join(targetDir, 'scripts', 'bootstrap-worktree.sh'), 0o644);

    const result = await auditProject(workspace, targetDir);

    expect(result.status).toBe('warn');
    expect(result.groups).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'executables', status: 'warn' })])
    );
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'scripts/bootstrap-worktree.sh', reason: 'not executable' })
      ])
    );
  });

  it('does not fail adopted existing repos when preserved root files lack scaffold values', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-doctor-'));
    const targetDir = await scaffoldProject(workspace, 'doctor-existing');

    await writeFile(path.join(targetDir, '.gitignore'), 'dist/\n', 'utf8');
    await writeFile(path.join(targetDir, '.env.example'), 'EXISTING_ONLY=true\n', 'utf8');

    const result = await auditProject(workspace, targetDir);

    expect(result.status).toBe('warn');
    expect(result.invalid).toEqual([]);
    expect(result.groups).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'root-scaffold-hints', status: 'warn' })])
    );
    expect(result.groups.filter((group) => group.name === 'root-scaffold-hints')).toHaveLength(1);
    expect(result.warnings.filter((issue) => issue.reason === 'missing STICKYNOTE.md ignore rule')).toHaveLength(1);
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: '.gitignore', reason: 'missing .kamal/secrets ignore rule' }),
        expect.objectContaining({ path: '.gitignore', reason: 'missing STICKYNOTE.md ignore rule' }),
        expect.objectContaining({ path: '.env.example', reason: 'missing LLM_API_KEY scaffold value' })
      ])
    );
    expect(result.recommendations).toEqual(
      expect.arrayContaining([expect.stringContaining('--merge-root-files --init-json')])
    );
  });

  it('fails when deprecated planning-era artifacts are still present', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-doctor-'));
    const targetDir = await scaffoldProject(workspace, 'doctor-deprecated');

    await mkdir(path.join(targetDir, '.planning'), { recursive: true });
    await mkdir(path.join(targetDir, '.sisyphus', 'runs'), { recursive: true });
    await mkdir(path.join(targetDir, '.codex', 'scripts'), { recursive: true });
    await writeFile(path.join(targetDir, '.planning', 'TRACEABILITY.md'), '# traceability\n', 'utf8');
    await writeFile(path.join(targetDir, '.sisyphus', 'runs', '2024-01-01.log'), 'archived\n', 'utf8');
    await writeFile(path.join(targetDir, '.codex', 'scripts', 'cognee-sync-planning.sh'), '#!/usr/bin/env bash\n', 'utf8');
    await writeFile(path.join(targetDir, '.codex', 'scripts', 'sync-planning-to-cognee.sh'), '#!/usr/bin/env bash\n', 'utf8');

    const result = await auditProject(workspace, targetDir);

    expect(result.status).toBe('fail');
    expect(result.groups).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'deprecated-artifacts', status: 'fail' })])
    );
    expect(result.invalid).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: '.planning',
          reason: expect.stringContaining('--cleanup-manifest legacy-ai-frameworks-v1 --init-json')
        }),
        expect.objectContaining({
          path: '.codex/scripts/cognee-sync-planning.sh',
          reason: expect.stringContaining('--cleanup-manifest legacy-ai-frameworks-v1 --init-json')
        }),
        expect.objectContaining({
          path: '.codex/scripts/sync-planning-to-cognee.sh',
          reason: expect.stringContaining('--cleanup-manifest legacy-ai-frameworks-v1 --init-json')
        })
      ])
    );
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: '.sisyphus',
          reason: expect.stringContaining('--cleanup-manifest legacy-ai-frameworks-v1 --init-json')
        })
      ])
    );
    expect(formatDoctorReport(result)).toContain('deprecated-artifacts: fail');
    expect(result.recommendations).toEqual(
      expect.arrayContaining([expect.stringContaining('--cleanup-manifest legacy-ai-frameworks-v1 --init-json')])
    );
  });
});
