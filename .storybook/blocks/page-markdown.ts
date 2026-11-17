type TableValue = { summary?: unknown; detail?: unknown };

export type ApiArgType = {
  name?: string;
  description?: string;
  type?: { name?: string; required?: boolean };
  table?: {
    type?: TableValue;
    defaultValue?: TableValue;
    disable?: boolean;
  };
};

export type ApiArgTypes = Record<string, ApiArgType>;

const cell = (value: unknown) =>
  String(value ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\r?\n/g, '<br />');

const summary = (value: TableValue | undefined) =>
  [value?.summary, value?.detail].filter((part) => part != null).join('\n');

const codeSpan = (value: string) => {
  const longestRun = Math.max(
    0,
    ...(value.match(/`+/g) ?? []).map((run) => run.length),
  );
  const fence = '`'.repeat(longestRun + 1);
  const padding = longestRun ? ' ' : '';
  return `${fence}${padding}${value}${padding}${fence}`;
};

const code = (value: unknown) =>
  String(value ?? '')
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .map((line) => codeSpan(line.trim()))
    .join('\n');

/** Render the API Reference section from resolved argtypes. */
export function apiReference(argTypes: ApiArgTypes = {}): string {
  const rows = Object.entries(argTypes).filter(
    ([, arg]) => !arg.table?.disable,
  );
  const table = [
    '| Name | Description | Type | Default | Required |',
    '| --- | --- | --- | --- | --- |',
    ...rows
      .map(([key, arg]) =>
        [
          arg.name ?? key,
          arg.description,
          code(summary(arg.table?.type) || arg.type?.name),
          code(summary(arg.table?.defaultValue)) || '—',
          arg.type?.required ? 'Yes' : 'No',
        ]
          .map(cell)
          .join(' | '),
      )
      .map((row) => `| ${row} |`),
  ].join('\n');

  return `## API Reference\n\n${rows.length ? table : 'No props are documented for this component.'}`;
}

/** Build a component's Markdown page from its docs parameters and resolved argtypes. */
export function pageMarkdown({
  title,
  description,
  usage,
  argTypes = {},
}: {
  title: string;
  description?: string;
  usage?: string;
  argTypes?: ApiArgTypes;
}): string {
  const sections = [
    `# ${title}`,
    description?.trim(),
    usage?.trim(),
    apiReference(argTypes),
  ].filter(Boolean);

  return `${sections.join('\n\n')}\n`;
}
