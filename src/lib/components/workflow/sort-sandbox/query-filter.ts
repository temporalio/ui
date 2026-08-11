/**
 * POC only. A tiny matcher for the subset of the visibility query language the
 * filter bar actually produces, so the sandbox snapshot is genuinely scoped to
 * the user's filter rather than pretending to be.
 *
 * Anything it doesn't understand is treated as match-all and reported through
 * `unsupportedTerms`, so the UI can say so instead of quietly returning a
 * snapshot that doesn't match what the list is showing.
 */

import type { SandboxWorkflow } from './mock-workflows';

type Predicate = {
  field: string;
  operator: '=' | '!=';
  value: string;
};

const FIELD_ACCESSORS: Record<string, (workflow: SandboxWorkflow) => string> = {
  ExecutionStatus: (workflow) => workflow.status,
  WorkflowType: (workflow) => workflow.type,
  TaskQueue: (workflow) => workflow.taskQueue,
  WorkflowId: (workflow) => workflow.workflowId,
  RunId: (workflow) => workflow.runId,
};

const TERM = /(\w+)\s*(!?=)\s*"([^"]*)"/g;

export type ParsedQuery = {
  predicates: Predicate[];
  unsupportedTerms: string[];
};

export const parseQuery = (query: string): ParsedQuery => {
  const predicates: Predicate[] = [];
  const unsupportedTerms: string[] = [];

  if (!query.trim()) return { predicates, unsupportedTerms };

  // Split on AND only. OR would need real precedence handling, so it is
  // reported as unsupported rather than silently mis-evaluated.
  const clauses = query.split(/\s+AND\s+/i);

  for (const clause of clauses) {
    if (/\bOR\b/i.test(clause)) {
      unsupportedTerms.push(clause.trim());
      continue;
    }

    TERM.lastIndex = 0;
    const match = TERM.exec(clause);
    if (!match) {
      unsupportedTerms.push(clause.trim());
      continue;
    }

    const [, field, operator, value] = match;
    if (!FIELD_ACCESSORS[field]) {
      unsupportedTerms.push(clause.trim());
      continue;
    }

    predicates.push({ field, operator: operator as '=' | '!=', value });
  }

  return { predicates, unsupportedTerms };
};

const matches = (workflow: SandboxWorkflow, predicate: Predicate): boolean => {
  const actual = FIELD_ACCESSORS[predicate.field](workflow);
  return predicate.operator === '='
    ? actual === predicate.value
    : actual !== predicate.value;
};

export const filterByQuery = (
  workflows: SandboxWorkflow[],
  query: string,
): SandboxWorkflow[] => {
  const { predicates } = parseQuery(query);
  if (!predicates.length) return workflows;
  return workflows.filter((workflow) =>
    predicates.every((predicate) => matches(workflow, predicate)),
  );
};

const STATUS_SHARE: Record<string, number> = {
  Running: 0.34,
  Completed: 0.29,
  Failed: 0.14,
  TimedOut: 0.08,
  Canceled: 0.06,
  Terminated: 0.05,
  ContinuedAsNew: 0.04,
};

/**
 * What a CountWorkflowExecutions call would return, derived from the known
 * distribution. The prepare stage needs a count before loading anything —
 * counting is cheap, loading is not.
 */
export const estimateMatching = (query: string, total: number): number => {
  const { predicates } = parseQuery(query);
  let share = 1;
  for (const predicate of predicates) {
    let fraction = 1;
    if (predicate.field === 'ExecutionStatus') {
      fraction = STATUS_SHARE[predicate.value] ?? 0;
    } else if (predicate.field === 'WorkflowType') {
      fraction = 1 / 8;
    } else if (predicate.field === 'TaskQueue') {
      fraction = 1 / 3;
    } else {
      continue;
    }
    share *= predicate.operator === '=' ? fraction : 1 - fraction;
  }
  return Math.round(total * share);
};

/** Predicates the columnar worker can apply while generating rows. */
export const workerPredicates = (query: string) =>
  parseQuery(query).predicates.filter(
    (predicate) =>
      predicate.field === 'ExecutionStatus' ||
      predicate.field === 'WorkflowType' ||
      predicate.field === 'TaskQueue',
  ) as {
    field: 'ExecutionStatus' | 'WorkflowType' | 'TaskQueue';
    operator: '=' | '!=';
    value: string;
  }[];

/** Plain-language rendering of the filter, for people who don't read query syntax. */
export const describeQuery = (query: string): string => {
  const { predicates } = parseQuery(query);
  if (!predicates.length) return 'all workflows in this namespace';

  const labels: Record<string, string> = {
    ExecutionStatus: 'status',
    WorkflowType: 'type',
    TaskQueue: 'task queue',
    WorkflowId: 'workflow ID',
    RunId: 'run ID',
  };

  return predicates
    .map(
      (predicate) =>
        `${labels[predicate.field] ?? predicate.field} ${
          predicate.operator === '=' ? 'is' : 'is not'
        } ${predicate.value}`,
    )
    .join(', and ');
};
