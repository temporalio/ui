import type { PaletteSubject } from './types';

// Routes that show a stored history rather than a live workflow, such as an
// imported or archived history.
const HISTORY_ROUTES = ['/import/', '/archival/'];

// Derives what the page shows from its route, so routes do not need to
// register anything. Workflow routes use `workflow` and `run`.
export function subjectFromParams(
  params: Partial<Record<string, string>>,
  routeId?: string | null,
): PaletteSubject | undefined {
  const { namespace, workflow, run } = params;
  if (!namespace) return undefined;
  if (routeId && HISTORY_ROUTES.some((part) => routeId.includes(part))) {
    return undefined;
  }
  if (workflow) {
    return { kind: 'workflow', namespace, workflowId: workflow, runId: run };
  }
  return { kind: 'namespace', namespace };
}
