import { existsSync, readdirSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import {
  assertLocalWorkflowCatalogAssembliesWritable,
  writeLocalWorkflowCatalogAssemblies,
} from './local-assemblies.js';

const exampleIdPattern = /^[a-z][a-z0-9-]*[a-z0-9]$/;

export const validateExampleId = (
  exampleId: string,
  rootDirectory = process.cwd(),
): void => {
  if (!exampleIdPattern.test(exampleId) || exampleId.includes('--')) {
    throw new Error(
      `Workflow catalog example IDs use lowercase words separated by single dashes, like "order-lifecycle"; received "${exampleId}"`,
    );
  }

  const sharedExamplesDirectory = join(
    rootDirectory,
    'src/lib/workflow-catalog/worker/examples',
  );
  if (
    existsSync(sharedExamplesDirectory) &&
    readdirSync(sharedExamplesDirectory, { withFileTypes: true }).some(
      (entry) => entry.isDirectory() && entry.name === exampleId,
    )
  ) {
    throw new Error(
      `Workflow catalog example "${exampleId}" already exists in the shared catalog; pick another ID`,
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

export const scaffoldWorkflowsModule = (exampleId: string): string => {
  const workflowName = workflowNameFor(exampleId);

  return `import { proxyActivities } from '@temporalio/workflow';

const { stampMessage } = proxyActivities<{
  stampMessage(message: string): Promise<string>;
}>({
  startToCloseTimeout: '30 seconds',
});

export async function ${workflowName}(message = 'ping'): Promise<string> {
  return stampMessage(message);
}
`;
};

export const scaffoldRegistrationModule = (exampleId: string): string => {
  const workflowName = workflowNameFor(exampleId);

  return `import { ${workflowName} } from './workflows.js';
import type { WorkflowCatalogRegistrationSource } from '../src/lib/workflow-catalog/worker/registration-source';

const stampMessage = async (message: string): Promise<string> =>
  \`local worker echoed "\${message}"\`;

export const workflowCatalogRegistrationSource: WorkflowCatalogRegistrationSource =
  {
    source: { id: 'local', label: 'Local' },
    sourceFiles: [
      'workflow-catalog.local/registration.ts',
      'workflow-catalog.local/workflows.ts',
    ],
    register: (registry) => {
      registry.registerTarget({
        id: 'local-workflows',
        namespace: 'default',
        taskQueue: 'ui-workflow-catalog-local',
        workflowsPath: new URL('./workflows.ts', import.meta.url).href,
        workflowExports: { ${workflowName} },
      });
      registry.registerExample({
        id: '${exampleId}',
        title: '${titleFor(exampleId)}',
        description:
          'Runs a locally registered activity and echoes the message back.',
        targetId: 'local-workflows',
        capabilityTags: ['activities', 'terminal-outcome'],
        expectedEvidence: [
          'One completed activity and a completed workflow result.',
        ],
        input: {
          defaultValue: ['ping'],
          schema: {
            type: 'array',
            prefixItems: [{ title: 'Message', type: 'string', minLength: 1 }],
            items: false,
            maxItems: 1,
          },
        },
        startOptions: {
          defaultValue: {},
          schema: {
            type: 'object',
            properties: { workflowId: { type: 'string', minLength: 1 } },
          },
        },
        execution: {
          kind: 'workflow',
          workflowType: '${workflowName}',
          workflow: ${workflowName},
          activities: { stampMessage },
        },
      });
    },
  };
`;
};

export const scaffoldLocalWorkflowCatalog = async ({
  rootDirectory,
  exampleId,
}: {
  rootDirectory: string;
  exampleId: string;
}): Promise<{ registrationPath: string; workflowsPath: string }> => {
  validateExampleId(exampleId, rootDirectory);

  const workspace = join(rootDirectory, 'workflow-catalog.local');
  const registrationPath = join(workspace, 'registration.ts');
  const workflowsPath = join(workspace, 'workflows.ts');

  if (existsSync(registrationPath)) {
    throw new Error(
      'workflow-catalog.local/registration.ts already exists; add the example to that file and to workflows.ts, then run "pnpm workflow-catalog:generate"',
    );
  }

  await mkdir(workspace, { recursive: true });
  await writeFile(workflowsPath, scaffoldWorkflowsModule(exampleId));
  await writeFile(registrationPath, scaffoldRegistrationModule(exampleId));

  return { registrationPath, workflowsPath };
};

export const scaffoldDirectoryWorkflowCatalog = async ({
  rootDirectory,
  exampleId,
}: {
  rootDirectory: string;
  exampleId: string;
}) => {
  const artifacts = renderDirectoryWorkflowCatalogScaffold({
    exampleId,
    rootDirectory,
  });
  const exampleDirectory = join(
    rootDirectory,
    'workflow-catalog.local/examples',
    exampleId,
  );

  if (existsSync(exampleDirectory)) {
    throw new Error(
      `Local workflow catalog example already exists: ${exampleId}`,
    );
  }

  await assertLocalWorkflowCatalogAssembliesWritable(rootDirectory);
  await mkdir(exampleDirectory, { recursive: true });
  await Promise.all(
    artifacts.map((artifact) =>
      writeFile(join(rootDirectory, artifact.path), artifact.content),
    ),
  );
  await writeLocalWorkflowCatalogAssemblies(rootDirectory);
};

export const renderDirectoryWorkflowCatalogScaffold = ({
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
      path: `workflow-catalog.local/examples/${exampleId}/workflow.ts`,
      content: `export async function ${workflowName}(message = 'ping'): Promise<string> {
  return message;
}
`,
    },
    {
      path: `workflow-catalog.local/examples/${exampleId}/example.ts`,
      content: `import { ${workflowName} } from './workflow.js';

export const workflowCatalogExample = {
  id: '${exampleId}',
  title: '${titleFor(exampleId)}',
  description: 'Runs a local workflow example.',
  capabilityTags: ['terminal-outcome'],
  expectedEvidence: ['A completed workflow result.'],
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
