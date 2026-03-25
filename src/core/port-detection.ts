import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';

import { DEFAULT_POLICY } from './policy.js';
import type { PortSettings } from './types.js';

function expandHome(value: string): string {
  return value.startsWith('~/') ? path.join(os.homedir(), value.slice(2)) : value;
}

function nextFreePort(start: number, usedPorts: Set<number>): number {
  let port = start;
  while (usedPorts.has(port)) {
    port += 1;
  }
  return port;
}

function validatePort(name: string, value?: number): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!Number.isInteger(value) || value < 1 || value > 65535) {
    throw new Error(`${name} must be an integer between 1 and 65535.`);
  }

  return value;
}

export function resolvePorts(options: {
  detectPorts: boolean;
  doltPort?: number;
  cogneeDbPort?: number;
  computeHost: string;
  computeUser: string;
  sshKeyPath: string;
}): PortSettings {
  const explicitDoltPort = validatePort('Dolt port', options.doltPort);
  const explicitCogneeDbPort = validatePort('Cognee DB port', options.cogneeDbPort);

  if (explicitDoltPort !== undefined && explicitCogneeDbPort !== undefined && explicitDoltPort === explicitCogneeDbPort) {
    throw new Error('Dolt port and Cognee DB port must be different values.');
  }

  const reservedPorts = new Set<number>();
  if (explicitDoltPort !== undefined) {
    reservedPorts.add(explicitDoltPort);
  }
  if (explicitCogneeDbPort !== undefined) {
    reservedPorts.add(explicitCogneeDbPort);
  }

  if (!options.detectPorts) {
    const usedPorts = new Set(reservedPorts);
    const doltPort = explicitDoltPort ?? nextFreePort(DEFAULT_POLICY.defaultDoltPort, usedPorts);
    usedPorts.add(doltPort);
    const cogneeDbPort = explicitCogneeDbPort ?? nextFreePort(DEFAULT_POLICY.defaultCogneeDbPort, usedPorts);

    return {
      doltPort,
      cogneeDbPort,
      notes: ['Using default service ports. Pass --detect-ports to probe the compute host before writing Kamal configs.']
    };
  }

  const command = 'ss -Htln 2>/dev/null | awk "{print $4}" | perl -nle "print $1 if /:(\\d+)$/" | sort -nu';
  const result = spawnSync(
    'ssh',
    [
      '-i',
      expandHome(options.sshKeyPath),
      '-o',
      'ConnectTimeout=5',
      '-o',
      'BatchMode=yes',
      '-o',
      'StrictHostKeyChecking=no',
      `${options.computeUser}@${options.computeHost}`,
      command
    ],
    {
      encoding: 'utf8'
    }
  );

  if (result.status !== 0) {
    const usedPorts = new Set(reservedPorts);
    const doltPort = explicitDoltPort ?? nextFreePort(DEFAULT_POLICY.defaultDoltPort, usedPorts);
    usedPorts.add(doltPort);
    const cogneeDbPort = explicitCogneeDbPort ?? nextFreePort(DEFAULT_POLICY.defaultCogneeDbPort, usedPorts);

    return {
      doltPort,
      cogneeDbPort,
      notes: ['Remote port detection failed. Using default service ports in generated configs.']
    };
  }

  const usedPorts = new Set<number>([
    ...reservedPorts,
    ...result.stdout
      .split(/\s+/)
      .map((value) => Number.parseInt(value, 10))
      .filter((value) => Number.isInteger(value))
  ]);

  const doltPort = explicitDoltPort ?? nextFreePort(DEFAULT_POLICY.defaultDoltPort, usedPorts);
  usedPorts.add(doltPort);
  const cogneeDbPort = explicitCogneeDbPort ?? nextFreePort(DEFAULT_POLICY.defaultCogneeDbPort, usedPorts);

  return {
    doltPort,
    cogneeDbPort,
    notes: [`Detected remote service ports from ${options.computeHost}.`]
  };
}
