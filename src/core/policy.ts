export const DEFAULT_POLICY = {
  computeHost: '10.10.20.138',
  computeUser: 'compute',
  sshKeyPath: '~/.ssh/z3r0Layer-main',
  registryHost: 'harbor.compute.lan',
  defaultDoltPort: 3307,
  defaultCogneeDbPort: 5432
} as const;

export type ProjectMode = 'auto' | 'new' | 'existing';
