import type { PaletteSubject } from './types';

// Derives what the page shows from its route params, so routes do not need
// to register anything. Workflow routes use `workflow` and `run`.
export function subjectFromParams(
  params: Partial<Record<string, string>>,
): PaletteSubject | undefined {
  const { namespace, workflow, run } = params;
  if (!namespace) return undefined;
  if (workflow) {
    return { kind: 'workflow', namespace, workflowId: workflow, runId: run };
  }
  return { kind: 'namespace', namespace };
}
