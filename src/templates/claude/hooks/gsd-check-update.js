#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { exec } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';

const homeDir = os.homedir();
const cwd = process.cwd();
const cacheDir = path.join(homeDir, '.claude', 'cache');
const cacheFile = path.join(cacheDir, 'gsd-update-check.json');
const localVersion = path.join(cwd, '.claude', 'get-shit-done', 'VERSION');
const globalVersion = path.join(homeDir, '.claude', 'get-shit-done', 'VERSION');

if (!existsSync(cacheDir)) {
  mkdirSync(cacheDir, { recursive: true });
}

let installed = '0.0.0';
try {
  if (existsSync(localVersion)) {
    installed = readFileSync(localVersion, 'utf8').trim();
  } else if (existsSync(globalVersion)) {
    installed = readFileSync(globalVersion, 'utf8').trim();
  }
} catch {}

const child = exec('npm view get-shit-done-cc version', { timeout: 10000 }, (error, stdout) => {
  const latest = error ? 'unknown' : stdout.trim() || 'unknown';
  writeFileSync(
    cacheFile,
    JSON.stringify({
      update_available: latest !== 'unknown' && latest !== installed,
      installed,
      latest,
      checked: Math.floor(Date.now() / 1000)
    })
  );
});

child.unref();
