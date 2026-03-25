#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  input += chunk;
});

process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const model = data.model?.display_name ?? 'Claude';
    const dir = data.workspace?.current_dir ?? process.cwd();
    const session = data.session_id ?? '';
    const remaining = data.context_window?.remaining_percentage;

    let ctx = '';
    if (typeof remaining === 'number') {
      const used = Math.max(0, Math.min(100, Math.round((100 - remaining) / 0.8)));
      ctx = ' ' + used + '%';
    }

    let task = '';
    const todosDir = path.join(os.homedir(), '.claude', 'todos');
    if (session && existsSync(todosDir)) {
      const file = readdirSync(todosDir)
        .filter((name) => name.startsWith(session) && name.endsWith('.json'))
        .map((name) => ({ name, mtime: statSync(path.join(todosDir, name)).mtimeMs }))
        .sort((left, right) => right.mtime - left.mtime)[0];

      if (file) {
        try {
          const todos = JSON.parse(readFileSync(path.join(todosDir, file.name), 'utf8'));
          const active = todos.find((todo) => todo.status === 'in_progress');
          task = active?.activeForm ?? '';
        } catch {}
      }
    }

    const parts = [model, task || path.basename(dir), ctx.trim()].filter(Boolean);
    process.stdout.write(parts.join(' | '));
  } catch {}
});
