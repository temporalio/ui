export type Candidate = { component: string; line: number; endLine: number };
export type ChangedFile = { path: string; patch: string; status: string };

const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function imports(
  source: string,
  prefix: string,
): { component: string; binding: string; start: number; end: number }[] {
  const result: {
    component: string;
    binding: string;
    start: number;
    end: number;
  }[] = [];
  const text = source.replace(
    /<!--[^]*?-->|\/\*[^]*?\*\/|\/\/[^\n]*/g,
    (match) => match.replace(/[^\n]/g, ' '),
  );
  const pattern = new RegExp(
    `\\bimport\\s+(?:type\\s+)?([^;]*?)\\s+from\\s*['"]${escapeRegex(prefix)}([^'"]+)['"]`,
    'g',
  );
  for (const match of text.matchAll(pattern)) {
    const clause = match[1].replace(/[{}]/g, '');
    for (const part of clause.split(',')) {
      const binding =
        part
          .trim()
          .replace(/^type\s+/, '')
          .split(/\s+as\s+/)
          .at(-1) ?? '';
      if (/^[A-Za-z_$][\w$]*$/.test(binding))
        result.push({
          component: match[2],
          binding,
          start: match.index,
          end: match.index + match[0].length,
        });
    }
  }
  return result;
}

export function findIoImports(source: string, importPrefix: string): string[] {
  return [
    ...new Set(imports(source, importPrefix).map(({ component }) => component)),
  ];
}

export function inScope(file: string): boolean {
  return (
    !file.split('/').some((part) => part === '..' || part === '.') &&
    !file.startsWith('/') &&
    /\.(svelte|ts)$/.test(file) &&
    !file.startsWith('src/lib/io/') &&
    !/\.(stories\.svelte|test\.ts|spec\.ts)$/.test(file)
  );
}

function patchLines(patch: string): {
  added: Set<number>;
  deleted: Set<number>;
} {
  const result = new Set<number>();
  const deleted = new Set<number>();
  let line = 0;
  for (const text of patch.split('\n')) {
    const hunk = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(text);
    if (hunk) line = Number(hunk[1]);
    else if (text.startsWith('+') && line > 0) result.add(line++);
    else if (text.startsWith('-') && line > 0) deleted.add(line);
    else if (text.startsWith(' ')) line++;
  }
  return { added: result, deleted };
}

export function changedLines(patch: string): Set<number> {
  return patchLines(patch).added;
}

export function findCandidates(
  source: string,
  patch: string,
  prefix: string,
  file: string,
): { candidates: Candidate[]; uncertain: boolean } {
  const { added: changed, deleted } = patchLines(patch);
  const candidates: Candidate[] = [];
  const bindings = imports(source, prefix);
  const lineAt = (offset: number): number =>
    source.slice(0, offset).split('\n').length;
  const add = (
    component: string,
    start: number,
    end: number,
    force = false,
  ): void => {
    const line = lineAt(start);
    const endLine = lineAt(end);
    if (
      (force ||
        [...changed].some((value) => value >= line && value <= endLine) ||
        [...deleted].some((value) => value > line && value <= endLine)) &&
      !candidates.some(
        (candidate) =>
          candidate.line === line && candidate.component === component,
      )
    )
      candidates.push({ component, line, endLine });
  };
  let uncertain = source.includes(prefix) && bindings.length === 0;
  const withoutComments = source.replace(
    /<!--[^]*?-->|\/\*[^]*?\*\/|\/\/[^\n]*/g,
    (match) => match.replace(/[^\n]/g, ' '),
  );
  for (const { component, binding, start, end } of bindings) {
    const importChanged = [...changed, ...deleted].some(
      (line) => line >= lineAt(start) && line <= lineAt(end),
    );
    if (file.endsWith('.svelte')) {
      for (const match of withoutComments.matchAll(
        new RegExp(`\\b${escapeRegex(binding)}\\b`, 'g'),
      )) {
        if (match.index >= start && match.index < end) continue;
        const scriptStart = withoutComments.lastIndexOf('<script', match.index);
        const scriptEnd = withoutComments.lastIndexOf('</script>', match.index);
        if (scriptStart > scriptEnd)
          add(
            component,
            match.index,
            match.index + binding.length,
            importChanged,
          );
      }
    }
    const pattern = file.endsWith('.svelte')
      ? new RegExp(`<${escapeRegex(binding)}(?=[\\s/>])`, 'g')
      : new RegExp(`\\b${escapeRegex(binding)}\\b`, 'g');
    for (const match of withoutComments.matchAll(pattern)) {
      if (match.index >= start && match.index < end) continue;
      if (!file.endsWith('.svelte')) {
        add(
          component,
          match.index,
          match.index + match[0].length,
          importChanged,
        );
        continue;
      }
      let depth = 0;
      let quote = '';
      let cursor = match.index + match[0].length;
      for (; cursor < source.length; cursor++) {
        const char = source[cursor];
        if (quote) {
          if (char === quote && source[cursor - 1] !== '\\') quote = '';
        } else if (char === '"' || char === "'" || char === '`') quote = char;
        else if (char === '{') depth++;
        else if (char === '}') depth--;
        else if (char === '>' && depth === 0) break;
      }
      if (cursor === source.length) uncertain = true;
      add(component, match.index, cursor, importChanged);
      if (source[cursor - 1] !== '/') {
        const close = source.indexOf(`</${binding}>`, cursor + 1);
        if (close !== -1)
          add(component, match.index, close + binding.length + 3);
        else uncertain = true;
      }
    }
  }
  if (bindings.length && file.endsWith('.svelte')) {
    const script = /<script\b[^>]*>[^]*?<\/script>/g;
    for (const match of source.matchAll(script)) {
      const startLine = lineAt(match.index);
      const endLine = lineAt(match.index + match[0].length);
      for (const line of changed) {
        const offset = source
          .split('\n')
          .slice(0, line - 1)
          .join('\n').length;
        if (
          line > startLine &&
          line < endLine &&
          !bindings.some(
            (binding) => offset >= binding.start - 1 && offset <= binding.end,
          )
        )
          uncertain = true;
      }
    }
    for (const line of changed) {
      const text = withoutComments.split('\n')[line - 1] ?? '';
      if (
        bindings.some(
          ({ binding, start, end }) =>
            new RegExp(`\\b${escapeRegex(binding)}\\b`).test(text) &&
            !(line >= lineAt(start) && line <= lineAt(end)),
        ) &&
        !candidates.some(
          (candidate) => line >= candidate.line && line <= candidate.endLine,
        )
      )
        uncertain = true;
    }
  }
  return { candidates, uncertain };
}
