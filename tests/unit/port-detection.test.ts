import { describe, expect, it } from 'vitest';

import { resolvePorts } from '../../src/core/port-detection.js';

describe('resolvePorts', () => {
  it('rejects duplicate explicit port assignments', () => {
    expect(() =>
      resolvePorts({
        detectPorts: false,
        doltPort: 3306,
        cogneeDbPort: 3306,
        computeHost: 'host',
        computeUser: 'user',
        sshKeyPath: '~/.ssh/test'
      })
    ).toThrow('must be different');
  });

  it('rejects invalid explicit ports', () => {
    expect(() =>
      resolvePorts({
        detectPorts: false,
        doltPort: Number.NaN,
        computeHost: 'host',
        computeUser: 'user',
        sshKeyPath: '~/.ssh/test'
      })
    ).toThrow('Dolt port must be an integer');
  });

  it('keeps ports distinct when one explicit port is provided', () => {
    const result = resolvePorts({
      detectPorts: false,
      doltPort: 5432,
      computeHost: 'host',
      computeUser: 'user',
      sshKeyPath: '~/.ssh/test'
    });

    expect(result.doltPort).toBe(5432);
    expect(result.cogneeDbPort).not.toBe(5432);
  });
});
