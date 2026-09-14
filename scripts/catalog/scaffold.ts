import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const exampleIdPattern = /^[a-z][a-z0-9-]*[a-z0-9]$/;

export const validateExampleId = (
  exampleId: string,
  rootDirectory = process.cwd(),
): void => {
  if (!exampleIdPattern.test(exampleId) || exampleId.includes('--')) {
    throw new Error(
      `Catalog example IDs use lowercase words separated by single dashes, like "order-lifecycle"; received "${exampleId}"`,
    );
  }

  const sharedExamplesDirectory = join(
    rootDirectory,
    'src/lib/catalog/worker/examples',
  );
  if (
    existsSync(sharedExamplesDirectory) &&
    readdirSync(sharedExamplesDirectory, { withFileTypes: true }).some(
      (entry) => entry.isDirectory() && entry.name === exampleId,
    )
  ) {
    throw new Error(
      `Catalog example "${exampleId}" already exists in the shared catalog; pick another ID`,
    );
  }
};

export const workflowNameFor = (exampleId: string): string =>
  exampleId
    .split('-')
    .map((word, index) =>
      index === 0 ? word : `${word[0].toUpperCase()}${word.slice(1)}`,
    )
    .join('');

export const titleFor = (exampleId: string): string => {
  const words = exampleId.split('-').join(' ');
  return `${words[0].toUpperCase()}${words.slice(1)}`;
};

export const renderDirectoryCatalogScaffold = ({
  rootDirectory,
  exampleId,
}: {
  rootDirectory: string;
  exampleId: string;
}) => {
  validateExampleId(exampleId, rootDirectory);
  const workflowName = workflowNameFor(exampleId);
  return [
    {
      path: `catalog.local/examples/${exampleId}/workflow.ts`,
      content: `export async function ${workflowName}(message = 'ping'): Promise<string> {
  return message;
}
`,
    },
    {
      path: `catalog.local/examples/${exampleId}/example.ts`,
      content: `import { ${workflowName} } from './workflow.js';

export const catalogExample = {
  id: '${exampleId}',
  title: '${titleFor(exampleId)}',
  description: 'Runs a local workflow example.',
  capabilityTags: ['terminal-outcome'],
  expectedEvidence: ['A completed workflow result.'],
  // Optional. Markdown shown in a Setup card on the example page, for manual
  // steps the catalog cannot check for you. Uncomment to use it.
  // setupMarkdown: 'Create the \`orders\` namespace before running this example.',
  input: { defaultValue: ['ping'], schema: { type: 'array' } },
  startOptions: { defaultValue: {}, schema: { type: 'object' } },
  execution: {
    kind: 'workflow' as const,
    workflowType: '${workflowName}',
    workflow: ${workflowName},
    activities: {},
  },
};
`,
    },
  ];
};
