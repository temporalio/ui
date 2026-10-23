import { existsSync } from 'fs';
import { mkdir, writeFile } from 'fs/promises';

import { requireWorkflowExample } from './catalog';
import {
  definitionPath,
  scenarioDirectory,
  SCENARIOS_DIR,
} from '../../src/lib/demo/definition';

const exampleEntries = (exampleIds: readonly string[], cwd: string) =>
  exampleIds.map((id) => {
    // Resolved now so a mistyped id fails while scaffolding, not at run time.
    const example = requireWorkflowExample(id, cwd);

    return {
      id: example.id,
      workflowId: `catalog-${example.id}`,
      role: example.title,
      note: example.description,
    };
  });

const exampleSource = (examples: ReturnType<typeof exampleEntries>) =>
  examples.length
    ? examples
        .map(
          (example) => `    {
      id: ${JSON.stringify(example.id)},
      workflowId: ${JSON.stringify(example.workflowId)},
      role: ${JSON.stringify(example.role)},
      note: ${JSON.stringify(example.note)},
    },`,
        )
        .join('\n')
    : `    // Run "pnpm catalog list" for the ids.
    { id: 'hello', role: 'TODO: what this one shows' },`;

const template = (
  name: string,
  examples: ReturnType<typeof exampleEntries>,
) => `import { defineScenario } from '../../definition';

export const definition = defineScenario({
  name: '${name}',
  title: 'TODO: what a reviewer sees when ${name} works',
  summary: 'TODO: what changes, and what it looked like before.',
  server: {
    source: 'auto',
    // A feature no release carries yet needs the commit that added it:
    // requires: { serverCommit: '...' },
    dynamicConfig: {},
    searchAttributes: {
      CustomKeywordField: 'Keyword',
      CustomIntField: 'Int',
    },
  },
  examples: [
${exampleSource(examples)}
  ],
  preview: {
    notes: ['TODO: the first thing a reviewer must check.'],
  },
});
`;

export const scaffoldDefinition = async (
  name: string,
  exampleIds: readonly string[] = [],
  cwd = process.cwd(),
): Promise<string> => {
  if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(name)) {
    throw new Error(
      `A scenario name must be kebab-case, for example system-nexus-signal-with-start (got "${name}").`,
    );
  }

  const path = definitionPath(name, cwd);

  if (existsSync(path)) {
    throw new Error(`${SCENARIOS_DIR}/${name}/definition.ts already exists.`);
  }

  const examples = exampleEntries(exampleIds, cwd);

  await mkdir(scenarioDirectory(name, cwd), { recursive: true });
  await writeFile(path, template(name, examples));

  return path;
};
