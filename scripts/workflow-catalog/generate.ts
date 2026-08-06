import { generateProjectWorkflowCatalog } from './project-artifacts';

try {
  await generateProjectWorkflowCatalog();
  console.log('Workflow catalog artifacts generated.');
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
