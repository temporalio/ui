import { getProjectRoot } from '../get-project-root';
import { generateProjectWorkflowCatalog } from './project-artifacts';
import { scaffoldLocalWorkflowCatalog } from './scaffold';

const exampleId = process.argv[2];

try {
  if (!exampleId) {
    throw new Error('Usage: pnpm workflow-catalog:new <example-id>');
  }

  await scaffoldLocalWorkflowCatalog({
    rootDirectory: getProjectRoot(),
    exampleId,
  });
  await generateProjectWorkflowCatalog();

  const namespace = process.env.TEMPORAL_NAMESPACE || 'default';
  console.log(
    [
      `Created workflow-catalog.local example "${exampleId}".`,
      'Edit workflow-catalog.local/workflows.ts and registration.ts to shape it.',
      'Run "pnpm dev:catalog" (or "pnpm dev" plus "pnpm dev:workflow-catalog-worker"), then open:',
      `  http://localhost:3000/namespaces/${namespace}/workflow-catalog/${exampleId}`,
    ].join('\n'),
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
