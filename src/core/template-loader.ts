import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_ROOTS = [
  path.join(ROOT_DIR, '..', 'templates'),
  path.join(ROOT_DIR, '..', '..', 'src', 'templates'),
  path.join(process.cwd(), 'src', 'templates'),
  path.join(process.cwd(), 'dist', 'templates')
];

function resolveTemplatePath(templatePath: string): string {
  const normalizedTemplatePath = path.normalize(templatePath);

  if (
    path.isAbsolute(normalizedTemplatePath) ||
    normalizedTemplatePath === '..' ||
    normalizedTemplatePath.split(path.sep).includes('..')
  ) {
    throw new Error(`Invalid template path: ${templatePath}`);
  }

  for (const root of TEMPLATE_ROOTS) {
    const candidate = path.join(root, normalizedTemplatePath);
    try {
      readFileSync(candidate, 'utf8');
      return candidate;
    } catch {
      // continue
    }
  }

  throw new Error(`Template not found: ${templatePath}`);
}

export { resolveTemplatePath };

type LoadTemplateOptions = {
  values?: Record<string, string>;
  ensureTrailingNewline?: boolean;
};

export function applyTemplateTokens(content: string, values: Record<string, string> = {}): string {
  return content.replace(/\{\{\s*([^}\s]+)\s*\}\}/g, (match, key: string) => {
    return Object.prototype.hasOwnProperty.call(values, key) ? values[key] : match;
  });
}

type ResolvedTemplateOptions = {
  values: Record<string, string>;
  ensureTrailingNewline: boolean;
};

function asLoadTemplateOptions(valuesOrOptions: Record<string, string> | LoadTemplateOptions): ResolvedTemplateOptions {
  const options = valuesOrOptions;

  if (
    (Object.prototype.hasOwnProperty.call(options, 'values') &&
      typeof (options as LoadTemplateOptions).values === 'object' &&
      options.values !== null) ||
    (Object.prototype.hasOwnProperty.call(options, 'ensureTrailingNewline') &&
      typeof (options as LoadTemplateOptions).ensureTrailingNewline === 'boolean')
  ) {
    const typed = options as LoadTemplateOptions;
    return {
      values: typed.values ?? {},
      ensureTrailingNewline: typed.ensureTrailingNewline ?? true
    };
  }

  return {
    values: options as Record<string, string>,
    ensureTrailingNewline: true
  };
}

export function loadTemplate(
  templatePath: string
): string;
export function loadTemplate(
  templatePath: string,
  values: Record<string, string>,
  ensureTrailingNewline?: boolean
): string;
export function loadTemplate(
  templatePath: string,
  options: LoadTemplateOptions
): string;
export function loadTemplate(
  templatePath: string,
  options?: Record<string, string> | LoadTemplateOptions,
  ensureTrailingNewline = true
): string {
  const providedOptions = options ?? {};

  const normalizedOptions =
    Object.prototype.hasOwnProperty.call(providedOptions, 'values') ||
    Object.prototype.hasOwnProperty.call(providedOptions, 'ensureTrailingNewline')
      ? asLoadTemplateOptions(providedOptions as LoadTemplateOptions)
      : {
          values: providedOptions as Record<string, string>,
          ensureTrailingNewline
        };

  const resolvedPath = resolveTemplatePath(templatePath);
  const raw = readFileSync(resolvedPath, 'utf8').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const rendered = applyTemplateTokens(raw, normalizedOptions.values);

  if (!normalizedOptions.ensureTrailingNewline) {
    return rendered;
  }

  return rendered.endsWith('\n') ? rendered : `${rendered}\n`;
}
