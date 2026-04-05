import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { formatDoctorReport, runDoctor } from '../../src/commands/doctor.js';
import { runInit } from '../../src/commands/init.js';

describe('runDoctor', () => {
  it('passes for a fresh Codex scaffold', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-doctor-'));

    await runInit({
      cwd: workspace,
      projectArg: 'doctor-codex-base',
      assistant: 'codex',
      mode: 'auto',
      dryRun: false,
      force: false,
      skipGit: true,
      detectPorts: false
    });

    const targetDir = path.join(workspace, 'doctor-codex-base');
    const result = await runDoctor({
      cwd: workspace,
      targetArg: targetDir,
      assistant: 'codex',
      json: false
    });

    expect(result.status).toBe('pass');
    expect(result.assistant).toBe('codex');
    expect(formatDoctorReport(result)).toContain('Status: pass');
    expect(result.groups).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'workflow-alignment', status: 'pass' })])
    );
  });

  it('validates the shared backend for the codex baseline', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-doctor-'));

    await runInit({
      cwd: workspace,
      projectArg: 'doctor-codex',
      assistant: 'codex',
      mode: 'auto',
      dryRun: false,
      force: false,
      skipGit: true,
      detectPorts: false
    });

    const targetDir = path.join(workspace, 'doctor-codex');
    const result = await runDoctor({
      cwd: workspace,
      targetArg: targetDir,
      assistant: 'codex',
      json: true
    });

    expect(result.assistant).toBe('codex');
    expect(result.status).toBe('pass');
  });

  it('fails when the canonical operator workflow reference is removed from AGENTS.md', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-doctor-'));

    await runInit({
      cwd: workspace,
      projectArg: 'doctor-alignment',
      assistant: 'codex',
      mode: 'auto',
      dryRun: false,
      force: false,
      skipGit: true,
      detectPorts: false
    });

    const targetDir = path.join(workspace, 'doctor-alignment');
    await writeFile(path.join(targetDir, 'AGENTS.md'), '# AGENTS\n\nRuntime only.\n', 'utf8');

    const result = await runDoctor({
      cwd: workspace,
      targetArg: targetDir,
      assistant: 'codex',
      json: false
    });

    expect(result.status).toBe('fail');
    expect(result.groups).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'workflow-alignment', status: 'fail' })])
    );
    expect(result.invalid).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'AGENTS.md', reason: 'missing canonical operator workflow reference' })
      ])
    );
  });

  it('fails when a stale OMO contract file is still present', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-doctor-'));

    await runInit({
      cwd: workspace,
      projectArg: 'doctor-stale-omo',
      assistant: 'codex',
      mode: 'auto',
      dryRun: false,
      force: false,
      skipGit: true,
      detectPorts: false
    });

    const targetDir = path.join(workspace, 'doctor-stale-omo');
    await mkdir(path.join(targetDir, '.rules', 'patterns'), { recursive: true });
    await writeFile(path.join(targetDir, '.rules', 'patterns', 'omo-agent-contract.md'), '# stale omo\n', 'utf8');

    const result = await runDoctor({
      cwd: workspace,
      targetArg: targetDir,
      assistant: 'codex',
      json: false
    });

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

  it('fails when the Beads post-checkout hook loses the worktree bootstrap fallback', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-doctor-'));

    await runInit({
      cwd: workspace,
      projectArg: 'doctor-hook-seam',
      assistant: 'codex',
      mode: 'auto',
      dryRun: false,
      force: false,
      skipGit: true,
      detectPorts: false
    });

    const targetDir = path.join(workspace, 'doctor-hook-seam');
    await writeFile(path.join(targetDir, '.beads', 'hooks', 'post-checkout'), '#!/bin/sh\nexit 0\n', 'utf8');

    const result = await runDoctor({
      cwd: workspace,
      targetArg: targetDir,
      assistant: 'codex',
      json: false
    });

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

  it('fails when autonomous workflow loses Beads work selection guidance', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-doctor-'));

    await runInit({
      cwd: workspace,
      projectArg: 'doctor-workflow-handoff',
      assistant: 'codex',
      mode: 'auto',
      dryRun: false,
      force: false,
      skipGit: true,
      detectPorts: false
    });

    const targetDir = path.join(workspace, 'doctor-workflow-handoff');
    const workflowPath = path.join(targetDir, '.codex', 'workflows', 'autonomous-execution.md');
    const workflow = await readFile(workflowPath, 'utf8');
    await writeFile(workflowPath, workflow.replaceAll('bd ready --json', 'bd-ready-json'), 'utf8');

    const result = await runDoctor({
      cwd: workspace,
      targetArg: targetDir,
      assistant: 'codex',
      json: false
    });

    expect(result.status).toBe('fail');
    expect(result.invalid).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: '.codex/workflows/autonomous-execution.md',
          reason: 'missing Beads work selection guidance'
        })
      ])
    );
  });

  it('fails when a stale GSD alignment artifact is still present', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-doctor-'));

    await runInit({
      cwd: workspace,
      projectArg: 'doctor-stale-gsd-file',
      assistant: 'codex',
      mode: 'auto',
      dryRun: false,
      force: false,
      skipGit: true,
      detectPorts: false
    });

    const targetDir = path.join(workspace, 'doctor-stale-gsd-file');
    await mkdir(path.join(targetDir, '.rules', 'patterns'), { recursive: true });
    await writeFile(path.join(targetDir, '.rules', 'patterns', 'gsd-workflow.md'), '# legacy gsd workflow\n', 'utf8');

    const result = await runDoctor({
      cwd: workspace,
      targetArg: targetDir,
      assistant: 'codex',
      json: false
    });

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

    await runInit({
      cwd: workspace,
      projectArg: 'doctor-stale-opencode',
      assistant: 'codex',
      mode: 'auto',
      dryRun: false,
      force: false,
      skipGit: true,
      detectPorts: false
    });

    const targetDir = path.join(workspace, 'doctor-stale-opencode');
    await mkdir(path.join(targetDir, '.opencode'), { recursive: true });
    await writeFile(path.join(targetDir, '.opencode', 'worktree.jsonc'), '{"$schema":"https://registry.kdco.dev/schemas/worktree.json"}\n', 'utf8');

    const result = await runDoctor({
      cwd: workspace,
      targetArg: targetDir,
      assistant: 'codex',
      json: false
    });

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

  it('fails when a managed workflow doc regresses to GSD command guidance', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-doctor-'));

    await runInit({
      cwd: workspace,
      projectArg: 'doctor-stale-gsd-token',
      assistant: 'codex',
      mode: 'auto',
      dryRun: false,
      force: false,
      skipGit: true,
      detectPorts: false
    });

    const targetDir = path.join(workspace, 'doctor-stale-gsd-token');
    const workflowPath = path.join(targetDir, '.rules', 'patterns', 'operator-workflow.md');
    const workflow = await readFile(workflowPath, 'utf8');
    await writeFile(workflowPath, `${workflow}\nLegacy command: /gsd-next\n`, 'utf8');

    const result = await runDoctor({
      cwd: workspace,
      targetArg: targetDir,
      assistant: 'codex',
      json: false
    });

    expect(result.status).toBe('fail');
    expect(result.invalid).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: '.rules/patterns/operator-workflow.md',
          reason: 'contains stale workflow reference: /gsd-'
        })
      ])
    );
  });

  it('fails when operator workflow regresses to the legacy ai-harness name', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-doctor-'));

    await runInit({
      cwd: workspace,
      projectArg: 'doctor-ai-harness-name',
      assistant: 'codex',
      mode: 'auto',
      dryRun: false,
      force: false,
      skipGit: true,
      detectPorts: false
    });

    const targetDir = path.join(workspace, 'doctor-ai-harness-name');
    const workflowPath = path.join(targetDir, '.rules', 'patterns', 'operator-workflow.md');
    const workflow = await readFile(workflowPath, 'utf8');
    await writeFile(
      workflowPath,
      workflow.replace('repositories scaffolded with `pi-harness`', 'repositories scaffolded with `ai-harness`'),
      'utf8',
    );

    const result = await runDoctor({
      cwd: workspace,
      targetArg: targetDir,
      assistant: 'codex',
      json: false
    });

    expect(result.status).toBe('fail');
    expect(result.invalid).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: '.rules/patterns/operator-workflow.md',
          reason: 'missing pi-harness scaffold reference'
        })
      ])
    );
  });


  it('fails when a Codex repo is missing a shared backend file', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-doctor-'));

    await runInit({
      cwd: workspace,
      projectArg: 'doctor-missing',
      assistant: 'codex',
      mode: 'auto',
      dryRun: false,
      force: false,
      skipGit: true,
      detectPorts: false
    });

    const targetDir = path.join(workspace, 'doctor-missing');
    await rm(path.join(targetDir, '.codex', 'scripts', 'cognee-bridge.sh'));

    const result = await runDoctor({
      cwd: workspace,
      targetArg: targetDir,
      assistant: 'codex',
      json: false
    });

    expect(result.status).toBe('fail');
    expect(result.missing).toContain('.codex/scripts/cognee-bridge.sh');
  });

  it('warns when an expected executable loses its execute bit', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-doctor-'));

    await runInit({
      cwd: workspace,
      projectArg: 'doctor-exec',
      assistant: 'codex',
      mode: 'auto',
      dryRun: false,
      force: false,
      skipGit: true,
      detectPorts: false
    });

    const targetDir = path.join(workspace, 'doctor-exec');
    await chmod(path.join(targetDir, '.codex', 'scripts', 'bootstrap-worktree.sh'), 0o644);

    const result = await runDoctor({
      cwd: workspace,
      targetArg: targetDir,
      assistant: 'codex',
      json: false
    });

    expect(result.status).toBe('warn');
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: '.codex/scripts/bootstrap-worktree.sh', reason: 'not executable' })
      ])
    );
  });

  it('does not fail adopted existing repos when preserved root files lack scaffold values', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-doctor-'));

    await runInit({
      cwd: workspace,
      projectArg: 'doctor-existing',
      assistant: 'codex',
      mode: 'auto',
      dryRun: false,
      force: false,
      skipGit: true,
      detectPorts: false
    });

    const targetDir = path.join(workspace, 'doctor-existing');
    await writeFile(path.join(targetDir, '.gitignore'), 'dist/\n', 'utf8');
    await writeFile(path.join(targetDir, '.env.example'), 'EXISTING_ONLY=true\n', 'utf8');

    const result = await runDoctor({
      cwd: workspace,
      targetArg: targetDir,
      assistant: 'codex',
      json: false
    });

    expect(result.status).toBe('warn');
    expect(result.invalid).toEqual([]);
    expect(result.groups).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'root-scaffold-hints', status: 'warn' })])
    );
    expect(result.groups.filter((group) => group.name === 'root-scaffold-hints')).toHaveLength(1);
    expect(
      result.warnings.filter((issue) => issue.reason === 'missing STICKYNOTE.md ignore rule')
    ).toHaveLength(1);
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: '.gitignore', reason: 'missing .kamal/secrets ignore rule' }),
        expect.objectContaining({ path: '.gitignore', reason: 'missing STICKYNOTE.md ignore rule' }),
        expect.objectContaining({ path: '.env.example', reason: 'missing LLM_API_KEY scaffold value' })
      ])
    );
    expect(result.recommendations).toEqual(
      expect.arrayContaining([
        expect.stringContaining('--merge-root-files --init-json')
      ])
    );
  });

  it('fails when deprecated planning-era artifacts are still present', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-doctor-'));

    await runInit({
      cwd: workspace,
      projectArg: 'doctor-deprecated',
      assistant: 'codex',
      mode: 'auto',
      dryRun: false,
      force: false,
      skipGit: true,
      detectPorts: false
    });

    const targetDir = path.join(workspace, 'doctor-deprecated');
    await mkdir(path.join(targetDir, '.planning'), { recursive: true });
    await mkdir(path.join(targetDir, '.sisyphus', 'runs'), { recursive: true });
    await mkdir(path.join(targetDir, '.codex', 'scripts'), { recursive: true });
    await writeFile(path.join(targetDir, '.planning', 'TRACEABILITY.md'), '# traceability\n', 'utf8');
    await writeFile(path.join(targetDir, '.sisyphus', 'runs', '2024-01-01.log'), 'archived\n', 'utf8');
    await writeFile(path.join(targetDir, '.codex', 'scripts', 'cognee-sync-planning.sh'), '#!/usr/bin/env bash\n', 'utf8');
    await writeFile(path.join(targetDir, '.codex', 'scripts', 'sync-planning-to-cognee.sh'), '#!/usr/bin/env bash\n', 'utf8');

    const result = await runDoctor({
      cwd: workspace,
      targetArg: targetDir,
      assistant: 'codex',
      json: false
    });

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
      expect.arrayContaining([
        expect.stringContaining('--cleanup-manifest legacy-ai-frameworks-v1 --init-json')
      ])
    );
  });
});
