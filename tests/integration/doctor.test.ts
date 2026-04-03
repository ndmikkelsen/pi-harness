import { chmod, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { formatDoctorReport, runDoctor } from '../../src/commands/doctor.js';
import { runInit } from '../../src/commands/init.js';

describe('runDoctor', () => {
  it('passes for a fresh Codex scaffold', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'ai-harness-doctor-'));

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
      expect.arrayContaining([expect.objectContaining({ name: 'omo-alignment', status: 'pass' })])
    );
  });

  it('auto-detects Codex and validates the shared backend', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'ai-harness-doctor-'));

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
      assistant: 'auto',
      json: true
    });

    expect(result.assistant).toBe('codex');
    expect(result.status).toBe('pass');
  });

  it('validates OpenCode against the Codex-compatible scaffold layout', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'ai-harness-doctor-'));

    await runInit({
      cwd: workspace,
      projectArg: 'doctor-opencode',
      assistant: 'opencode',
      mode: 'auto',
      dryRun: false,
      force: false,
      skipGit: true,
      detectPorts: false
    });

    const targetDir = path.join(workspace, 'doctor-opencode');
    const result = await runDoctor({
      cwd: workspace,
      targetArg: targetDir,
      assistant: 'opencode',
      json: false
    });

    expect(result.assistant).toBe('opencode');
    expect(result.status).toBe('pass');
    expect(result.groups).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'codex-runtime', status: 'pass' }),
        expect.objectContaining({ name: 'omo-alignment', status: 'pass' })
      ])
    );
  });

  it('fails when the canonical OMO contract reference is removed from AGENTS.md', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'ai-harness-doctor-'));

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
      expect.arrayContaining([expect.objectContaining({ name: 'omo-alignment', status: 'fail' })])
    );
    expect(result.invalid).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'AGENTS.md', reason: 'missing canonical OMO contract reference' })
      ])
    );
  });

  it('fails when the OMO contract loses a required handoff schema field', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'ai-harness-doctor-'));

    await runInit({
      cwd: workspace,
      projectArg: 'doctor-handoff',
      assistant: 'codex',
      mode: 'auto',
      dryRun: false,
      force: false,
      skipGit: true,
      detectPorts: false
    });

    const targetDir = path.join(workspace, 'doctor-handoff');
    const contractPath = path.join(targetDir, '.rules', 'patterns', 'omo-agent-contract.md');
    const contract = await readFile(contractPath, 'utf8');
    await writeFile(contractPath, contract.replaceAll('verify_command', 'verify_cmd'), 'utf8');

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
          reason: 'missing handoff schema field verify_command'
        })
      ])
    );
  });

  it('fails the OMO alignment group when the canonical contract file is deleted', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'ai-harness-doctor-'));

    await runInit({
      cwd: workspace,
      projectArg: 'doctor-missing-alignment',
      assistant: 'codex',
      mode: 'auto',
      dryRun: false,
      force: false,
      skipGit: true,
      detectPorts: false
    });

    const targetDir = path.join(workspace, 'doctor-missing-alignment');
    await rm(path.join(targetDir, '.rules', 'patterns', 'omo-agent-contract.md'));

    const result = await runDoctor({
      cwd: workspace,
      targetArg: targetDir,
      assistant: 'codex',
      json: false
    });

    expect(result.status).toBe('fail');
    expect(result.groups).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'omo-alignment', status: 'fail' })])
    );
    expect(result.invalid).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: '.rules/patterns/omo-agent-contract.md',
          reason: 'missing required OMO alignment artifact'
        })
      ])
    );
  });

  it('fails when the Beads post-checkout hook loses the worktree bootstrap fallback', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'ai-harness-doctor-'));

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

  it('fails when workflow handoff docs lose required schema fields', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'ai-harness-doctor-'));

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
    await writeFile(workflowPath, workflow.replaceAll('open_risks', 'residual_risks'), 'utf8');

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
          reason: 'missing handoff workflow field open_risks'
        })
      ])
    );
  });

  it('fails when a Codex repo is missing a shared backend file', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'ai-harness-doctor-'));

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
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'ai-harness-doctor-'));

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
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'ai-harness-doctor-'));

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

  it('warns when deprecated curated workflow artifacts are still present', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'ai-harness-doctor-'));

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
    await writeFile(path.join(targetDir, '.planning', 'TRACEABILITY.md'), '# traceability\n', 'utf8');
    await writeFile(path.join(targetDir, '.codex', 'scripts', 'sync-to-cognee.sh'), '#!/usr/bin/env bash\n', 'utf8');

    const result = await runDoctor({
      cwd: workspace,
      targetArg: targetDir,
      assistant: 'codex',
      json: false
    });

    expect(result.status).toBe('warn');
    expect(result.groups).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'deprecated-artifacts', status: 'warn' })])
    );
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: '.planning/TRACEABILITY.md',
          reason: expect.stringContaining('--cleanup-manifest legacy-ai-frameworks-v1')
        }),
        expect.objectContaining({
          path: '.codex/scripts/sync-to-cognee.sh',
          reason: expect.stringContaining('--cleanup-manifest legacy-ai-frameworks-v1')
        })
      ])
    );
    expect(formatDoctorReport(result)).toContain('deprecated-artifacts: warn');
    expect(result.recommendations).toEqual(
      expect.arrayContaining([
        expect.stringContaining('--cleanup-manifest legacy-ai-frameworks-v1 --init-json')
      ])
    );
  });
});
