export function titleCaseFromSlug(value: string): string {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function envVarNameFromSlug(value: string): string {
  return value.replace(/-/g, '_').toUpperCase();
}

export function normalizeProjectName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function isValidProjectName(value: string): boolean {
  return /^[a-z][a-z0-9-]*$/.test(value);
}

export function dedent(content: string): string {
  const lines = content.replace(/^\n/, '').split('\n');
  const indent = lines
    .filter((line) => line.trim().length > 0)
    .reduce<number>((smallest, line) => {
      const match = line.match(/^\s*/);
      const size = match ? match[0].length : 0;
      return Math.min(smallest, size);
    }, Number.POSITIVE_INFINITY);

  return `${lines.map((line) => line.slice(Number.isFinite(indent) ? indent : 0)).join('\n').trimEnd()}\n`;
}
