const cell = (value) =>
  String(value ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\r?\n/g, '<br />');

const summary = (value) =>
  [value?.summary, value?.detail].filter((part) => part != null).join('\n');

/** Build the export from the same Markdown and resolved argtypes used by the docs. */
export function pageMarkdown(title, documentation, argTypes = {}) {
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
          summary(arg.table?.type) || arg.type?.name,
          summary(arg.table?.defaultValue) || '—',
          arg.type?.required ? 'Yes' : 'No',
        ]
          .map(cell)
          .join(' | '),
      )
      .map((row) => `| ${row} |`),
  ].join('\n');

  return `# ${title}\n\n${documentation.trim()}\n\n## API Reference\n\n${rows.length ? table : 'No props are documented for this component.'}\n`;
}
