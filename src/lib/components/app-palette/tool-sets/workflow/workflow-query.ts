export interface WorkflowQuery {
  workflowId: string;
  runId?: string;
  // Set when the query is a workflow URL.
  namespace?: string;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const WORKFLOW_PATH =
  /\/namespaces\/([^/?#]+)\/workflows\/([^/?#]+)(?:\/([^/?#]+))?/;
const MIN_ID_LENGTH = 6;

function decode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

// Reads a pasted workflow URL, an ID, or an ID and a run ID. A plain search
// word is not an ID, so a single token must be long and contain a digit.
export function parseWorkflowQuery(query: string): WorkflowQuery | undefined {
  const trimmed = query.trim();
  const path = WORKFLOW_PATH.exec(trimmed);
  if (path) {
    const [, namespace, workflowId, runId] = path;
    return {
      namespace: decode(namespace),
      workflowId: decode(workflowId),
      runId: runId && UUID.test(runId) ? runId : undefined,
    };
  }

  const tokens = trimmed.split(/\s+/);
  if (tokens.length === 2 && UUID.test(tokens[1])) {
    return { workflowId: tokens[0], runId: tokens[1] };
  }
  if (tokens.length !== 1) return undefined;

  const [token] = tokens;
  if (token.length < MIN_ID_LENGTH || !/\d/.test(token)) return undefined;
  return { workflowId: token };
}

// The `temporal` CLI command that describes the same workflow.
export function describeCommand(
  namespace: string,
  workflowId: string,
  runId?: string,
): string {
  const quote = (value: string) => `'${value.replaceAll("'", "'\\''")}'`;
  const parts = [
    'temporal workflow describe',
    `--namespace ${quote(namespace)}`,
    `--workflow-id ${quote(workflowId)}`,
  ];
  if (runId) parts.push(`--run-id ${quote(runId)}`);
  return parts.join(' ');
}

export interface WorkflowStatus {
  isRunning: boolean;
  isPaused: boolean;
}

// The workflow page's action menu offers cancel, terminate and signal on a
// running workflow, and on a paused one when the namespace can pause.
// Undefined while the workflow is loading.
export function acceptsWriteActions(
  workflow: WorkflowStatus | undefined,
  pauseEnabled: boolean,
): boolean | undefined {
  if (!workflow) return undefined;
  return workflow.isRunning || (workflow.isPaused && pauseEnabled);
}

export interface WriteActionFacts {
  // From the same check the workflow page uses for this action.
  allowed: boolean;
  // From acceptsWriteActions.
  accepts: boolean | undefined;
}

export type WriteActionBlock = 'not-allowed' | 'loading' | 'not-running';

// Why a cancel, terminate or signal cannot run here, or undefined when it can.
export function writeActionBlock({
  allowed,
  accepts,
}: WriteActionFacts): WriteActionBlock | undefined {
  if (!allowed) return 'not-allowed';
  if (accepts === undefined) return 'loading';
  if (!accepts) return 'not-running';
  return undefined;
}

// requestFromAPI throws a plain object with the server's message, not an
// Error, so String(error) would read "[object Object]".
export function requestErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message || fallback;
  if (typeof error !== 'object' || error === null) return fallback;
  if (
    'message' in error &&
    typeof error.message === 'string' &&
    error.message
  ) {
    return error.message;
  }
  if (
    'statusText' in error &&
    typeof error.statusText === 'string' &&
    error.statusText
  ) {
    return error.statusText;
  }
  return fallback;
}
