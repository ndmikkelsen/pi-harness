import { existsSync, cpSync, rmSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const source = 'src/templates';
const destinations = ['dist/src/templates', 'dist/templates'];

for (const destination of destinations) {
  if (existsSync(destination)) {
    rmSync(destination, { recursive: true, force: true });
  }

  mkdirSync(dirname(destination), { recursive: true });
  cpSync(source, destination, { recursive: true });
}
