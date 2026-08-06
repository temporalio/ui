import { verifyProjectWorkflowCatalog } from './project-artifacts';

try {
  await verifyProjectWorkflowCatalog();
  console.log(
    'Workflow catalog artifacts and static package boundaries verified.',
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
