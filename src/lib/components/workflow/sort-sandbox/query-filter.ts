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
