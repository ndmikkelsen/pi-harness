import type { ManagedEntry } from '../core/types.js';
import { loadTemplate } from '../core/template-loader.js';

export function buildConfigEntries(): ManagedEntry[] {
  return [
    { kind: 'directory', path: '.kamal' },
    { kind: 'directory', path: 'config' },
    {
      kind: 'file',
      path: '.kamal/secrets.example',
      content: (context) =>
        loadTemplate('config/secrets.example', {
          APP_SLUG: context.appSlug
        })
    },
    {
      kind: 'file',
      path: 'config/deploy.yml',
      content: (context) =>
        loadTemplate('config/deploy.yml', {
          APP_SLUG: context.appSlug,
          COMPUTE_HOST: context.computeHost,
          REGISTRY_HOST: context.registryHost,
          COMPUTE_USER: context.computeUser,
          SSH_KEY_PATH: context.sshKeyPath
        })
    },
    {
      kind: 'file',
      path: 'config/deploy.cognee.yml',
      content: (context) =>
        loadTemplate('config/deploy.cognee.yml', {
          APP_SLUG: context.appSlug,
          COGNEE_DB_HOST: `${context.appSlug}-cognee-db`,
          REGISTRY_HOST: context.registryHost,
          COMPUTE_USER: context.computeUser,
          SSH_KEY_PATH: context.sshKeyPath,
          COMPUTE_HOST: context.computeHost,
          COGNEE_DB_PORT: String(context.cogneeDbPort)
        })
    }
  ];
}
